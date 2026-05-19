import { redirect } from 'next/navigation';
import { getUserContext } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/tenant';

/**
 * /admin — Smart Router
 *
 * Đây là trang HUB trung tâm của toàn bộ hệ thống admin.
 * Không có nội dung — chỉ đọc role và redirect về đúng trang:
 *
 * 1. Nếu domain hiện tại khớp với một chi nhánh và user có quyền -> vào luôn chi nhánh đó.
 * 2. super_admin / admin / company_editor → /admin/select-tenant
 * 3. tenant_admin / tenant_editor / ... → /admin/t/[tenantId]/dashboard (trang chi nhánh của họ)
 * 4. volunteer → /collaborator/news-manager
 * 5. Chưa đăng nhập → /login
 */
export default async function AdminRootPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Chưa đăng nhập
    if (!user) {
        redirect('/login');
    }

    const ctx = await getUserContext();
    const role = ctx?.role ?? 'viewer';

    // --- NEW: Domain-aware routing ---
    const headerList = await headers();
    const host = headerList.get('host') || '';
    const currentTenant = await getTenantConfig(host);

    if (currentTenant) {
        // Nếu là super_admin hoặc tenant_admin của đúng chi nhánh này
        const isGlobal = role === 'super_admin' || role === 'admin' || role === 'company_editor';
        const isThisTenantAdmin = ctx?.tenantId === currentTenant.id;

        if (isGlobal || isThisTenantAdmin) {
            redirect(`/admin/t/${currentTenant.id}/dashboard`);
        }
    }

    // Global admins → trang dashboard hệ thống
    if (role === 'super_admin' || role === 'company_editor' || role === 'admin') {
        redirect('/admin/dashboard');
    }

    // Tenant staff → vào thẳng trang chi nhánh của họ
    const tenantRoles = ['tenant_admin', 'tenant_editor', 'tenant_accountant', 'editor', 'moderator'];
    if (tenantRoles.includes(role) && ctx?.tenantId) {
        redirect(`/admin/t/${ctx.tenantId}/dashboard`);
    }

    // Volunteer (Thực tập sinh/CTV) hoặc Viewer (Nhân viên) → Không được vào Admin
    // Đẩy họ về trang Web nội bộ (Public site) để họ xem tài liệu/tin tức
    if (role === 'volunteer' || role === 'viewer') {
        if (currentTenant) {
            redirect('/');
        } else if (ctx?.tenantId) {
            redirect(`/?tenant_id=${ctx.tenantId}`);
        } else {
            redirect('/');
        }
    }

    // Fallback: chưa có tenant được gán → về trang chọn hoặc báo lỗi
    redirect('/admin/select-tenant');
}
