import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { isGlobalAdmin, getUserContext } from '@/lib/permissions';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
    const globalAccess = await isGlobalAdmin();
    const ctx = await getUserContext();
    
    if (!ctx) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, tenantId } = ctx;

    // Chỉ cho phép Global Admin hoặc Tenant Admin thực hiện hành động này
    if (!globalAccess && role !== 'tenant_admin') {
        return NextResponse.json({ error: 'Unauthorized: Bạn không có quyền thực hiện hành động này' }, { status: 401 });
    }
    
    try {
        const { userId, userEmail } = await req.json();
        
        if (!userId && !userEmail) {
            return NextResponse.json({ error: 'Missing userId or userEmail' }, { status: 400 });
        }

        const supabase = await createAdminClient();
        let targetUserId = userId;

        // Nếu không có userId nhưng có email, tìm userId từ bảng users
        if (!targetUserId && userEmail) {
            const { data: roleData } = await (supabase as any)
                .from('user_roles')
                .select('user_id')
                .eq('user_email', userEmail)
                .maybeSingle();
            
            if (roleData?.user_id) {
                targetUserId = roleData.user_id;
            } else {
                // Thử query auth.users qua Admin API
                const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
                if (!usersError && usersData?.users) {
                    const user = usersData.users.find((u: any) => u.email === userEmail);
                    if (user) targetUserId = user.id;
                }
            }
        }

        if (!targetUserId) {
            return NextResponse.json({ error: 'Không thể xác định user_id để logout' }, { status: 404 });
        }

        // Kiểm tra an toàn bảo mật (Tenant Isolation & RBAC) cho Tenant Admin
        if (!globalAccess) {
            if (!tenantId) {
                return NextResponse.json({ error: 'Không tìm thấy chi nhánh của bạn' }, { status: 400 });
            }

            // Kiểm tra xem targetUserId có dòng vai trò thuộc cùng chi nhánh (tenantId) không
            const { data: userBelongs, error: checkError } = await (supabase as any)
                .from('user_roles')
                .select('role')
                .eq('user_id', targetUserId)
                .eq('tenant_id', tenantId)
                .maybeSingle();

            if (checkError || !userBelongs) {
                // Trả về 403 Forbidden nếu user không thuộc chi nhánh này
                return NextResponse.json({ 
                    error: 'Forbidden: Bạn không có quyền ép đăng xuất nhân viên thuộc chi nhánh khác' 
                }, { status: 403 });
            }

            // Ngăn chặn việc Tenant Admin cố tình logout các tài khoản quản trị hệ thống
            if (['super_admin', 'company_editor', 'admin'].includes(userBelongs.role)) {
                return NextResponse.json({ 
                    error: 'Forbidden: Bạn không thể ép đăng xuất quản trị viên cấp cao hơn' 
                }, { status: 403 });
            }
        }

        // Force logout bằng cách signOut Admin (revoke sessions)
        const { error } = await supabase.auth.admin.signOut(targetUserId);
        
        if (error) {
            throw error;
        }

        // Ghi log audit an ninh
        await (supabase as any).from('audit_logs').insert({
            user_id: ctx.userId,
            user_email: ctx.email || 'system@soc',
            tenant_id: tenantId, // Ghi nhận log thuộc tenant nào
            action: 'security:force_logout',
            resource: 'auth.users',
            table_name: 'auth.users',
            new_data: { targetUserId, userEmail, timestamp: new Date().toISOString(), forced_by: ctx.email }
        });

        try {
            revalidatePath('/admin/security-center');
            revalidatePath('/admin/audit-logs');
            if (tenantId) {
                revalidatePath(`/admin/t/${tenantId}/security`);
                revalidatePath(`/admin/t/${tenantId}/audit-logs`);
                revalidatePath(`/admin/t/${tenantId}/dashboard`);
            }
        } catch (e) {
            console.error('[Revalidate Error]:', e);
        }

        return NextResponse.json({ success: true, message: `Đã buộc đăng xuất tài khoản ${userEmail || targetUserId}` });
    } catch (err: any) {
        console.error('[Force Logout Error]:', err);
        return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
    }
}
