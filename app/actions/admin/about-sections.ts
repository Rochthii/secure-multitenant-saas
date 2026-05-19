'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { AboutSectionSchema } from '@/lib/validations/admin';
import { requireAdmin, requireEditor } from '@/lib/auth/require-admin';
import { requirePermission, getUserContext } from '@/lib/permissions';
import { createAuditLog } from '@/lib/audit';
import { saveRevision } from './revisions';
import { CACHE_TAGS } from '@/lib/cache/tags';

export async function revalidateAboutCache(tenantId?: string | null) {
    if (tenantId) {
        // @ts-ignore
        revalidateTag(CACHE_TAGS.pages.aboutSections(tenantId));
        // @ts-ignore
        revalidateTag(CACHE_TAGS.pages.about(tenantId));
        // @ts-ignore
        revalidateTag(CACHE_TAGS.system.dashboardStats(tenantId));
    } else {
        // @ts-ignore
        revalidateTag(CACHE_TAGS.pages.aboutSections('all')); // Fallback for all
        // @ts-ignore
        revalidateTag(CACHE_TAGS.system.dashboardStatsGlobal);
    }
    // @ts-ignore
    revalidateTag(CACHE_TAGS.pages.aboutSectionsV2);
    // @ts-ignore
    revalidateTag(CACHE_TAGS.pages.aboutGlobal);
}

/**
 * Get all about sections
 */
export async function getAboutSections(tenantId?: string) {
    const supabase = await createClient();
    let query = supabase.from('about_sections').select('*');
    if (tenantId) query = query.eq('tenant_id', tenantId);

    const { data, error } = await query.order('display_order', { ascending: true });

    if (error) {
        console.error('Get about sections error:', error);
        return [];
    }

    return data;
}

/**
 * Get a specific about section by key
 */
export async function getAboutSectionByKey(key: string, tenantId?: string) {
    const supabase = await createClient();
    let query = supabase.from('about_sections').select('*').eq('key', key);
    if (tenantId) query = query.eq('tenant_id', tenantId);

    const { data, error } = await query.single();

    if (error) {
        console.error(`Get about section ${key} error:`, error);
        return null;
    }

    return data;
}

/**
 * Update an about section
 */
export async function updateAboutSection(key: string, formData: FormData) {
    try {
        const user = await requireAdmin();
        await requirePermission('settings', 'update');
        const supabase = await createClient();
        const context = await getUserContext();

        // Parse and validate data
        const rawData = {
            title_vi: formData.get('title_vi'),
            title_en: formData.get('title_en'),
            title_km: formData.get('title_km'),
            summary_vi: (formData.get('summary_vi') as string) || null,
            summary_km: (formData.get('summary_km') as string) || null,
            summary_en: (formData.get('summary_en') as string) || null,
            content_vi: formData.get('content_vi'),
            content_en: formData.get('content_en'),
            content_km: formData.get('content_km'),
            image_url: formData.get('image_url'),
            is_active: formData.get('is_active') === 'true',
            tenant_id: (!formData.get('tenant_id') || formData.get('tenant_id') === 'null' || formData.get('tenant_id') === '') ? null : formData.get('tenant_id') as string,
            images: formData.get('images') ? JSON.parse(formData.get('images') as string) : undefined,
        };

        // FIXED: .parse() → .safeParse() để trả error message rõ ràng thay vì throw exception
        const parsed = AboutSectionSchema.safeParse(rawData);
        if (!parsed.success) {
            const issues = parsed.error.issues;
            return { success: false, error: issues[0]?.message ?? 'Dữ liệu không hợp lệ' };
        }

        // Fetch oldData trước khi update để audit log đầy đủ
        // SECURITY: Chặn Admin chi nhánh sửa About của chi nhánh khác
        let finalTenantId = parsed.data.tenant_id;
        if (context && !['super_admin', 'company_editor'].includes(context.role) && context.tenantId) {
            finalTenantId = context.tenantId; // Ép buộc sử dụng tenant của chính họ
        }

        const tenantId = finalTenantId ?? null;
        let oldDataQuery = (supabase.from('about_sections') as any)
            .select('*')
            .eq('key', key);
        oldDataQuery = tenantId ? oldDataQuery.eq('tenant_id', tenantId) : oldDataQuery.is('tenant_id', null);
        const { data: oldData } = await oldDataQuery.single();

        // Update in database
        let updateQuery = (supabase.from('about_sections') as any)
            .update({
                ...parsed.data,
                tenant_id: tenantId, // Lưu ý: Ép tenantId đã được bảo mật
                updated_at: new Date().toISOString(),
            })
            .eq('key', key);
        updateQuery = tenantId ? updateQuery.eq('tenant_id', tenantId) : updateQuery.is('tenant_id', null);
        const { error } = await updateQuery;

        if (error) return { success: false, error: 'Có lỗi khi cập nhật: ' + error.message };

        // Audit log
        await createAuditLog({
            user,
            action: 'update',
            tableName: 'about_sections',
            recordId: key,
            oldData: oldData ?? null,
            newData: parsed.data,
            tenantId: parsed.data.tenant_id || oldData?.tenant_id,
        });

        // Ghi lại phiên bản nội dung
        if (oldData) {
            await saveRevision({
                tableName: 'about_sections',
                recordId: oldData.id,
                changedBy: user.id,
                oldData,
                newData: parsed.data,
                changeSummary: `Cập nhật giới thiệu: ${parsed.data.title_vi}`
            });
        }

        // Xóa cache để ảnh mới hiện ngay trên frontend
        revalidateAboutCache(parsed.data.tenant_id);
        revalidatePath(`/admin/t/${parsed.data.tenant_id}/about`);
        revalidatePath(`/admin/t/${parsed.data.tenant_id}/about/${key}`);

        // Chỉ revalidate chính xác Từng "Page" (không dùng layout) để tiết kiệm CPU Vercel
        if (parsed.data.tenant_id) {
            const { data: t } = await (supabase as any)
                .from('tenants')
                .select('domain')
                .eq('id', parsed.data.tenant_id)
                .single();

            if (t?.domain) {
                const locales = ['vi', 'km', 'en'];
                locales.forEach(locale => {
                    // Chỉ clear cache tĩnh của 2 trang: Trang tổng Giới thiệu và Trang chi tiết đang sửa
                    revalidatePath(`/${t.domain}/${locale}/gioi-thieu`, 'page');
                    revalidatePath(`/${t.domain}/${locale}/gioi-thieu/${key}`, 'page');
                });
            }
        }

        return { success: true };
    } catch (error: any) {
        console.error('Update about section error:', error);
        return { success: false, error: error.issues ? error.issues[0].message : error.message };
    }
}

/**
 * Initialize default sections if they don't exist
 */
export async function initializeDefaultSections(tenantId?: string) {
    try {
        const user = await requireAdmin();
        await requirePermission('settings', 'update');
        const context = await getUserContext();

        // SECURITY: Chặn Admin chi nhánh khởi tạo cho chi nhánh khác
        let secureTenantId = tenantId;
        if (context && !['super_admin', 'company_editor'].includes(context.role) && context.tenantId) {
            secureTenantId = context.tenantId;
        }

        const supabase = await createClient();

        const defaultSections = [
            // Nhóm 1: Lịch sử
            { key: 'dong-chay-lich-su', title_vi: 'DÒNG CHẢY LỊCH SỬ', content_vi: '<p>Nội dung về lịch sử hình thành và phát triển của chi nhánh...</p>', tenant_id: secureTenantId, display_order: 10, is_active: true },
            
            // Nhóm 2: Truyền thừa
            { key: 'truyen-thua-tiep-noi', title_vi: 'TRUYỀN THỪA & TIẾP NỐI', content_vi: '<p>Thông tin về các đời Tổ sư và sự nối truyền đạo mạch...</p>', tenant_id: secureTenantId, display_order: 20, is_active: true },
            { key: 'truyen-thua-tiep-noi/tru-tri-duong-nhiem', title_vi: 'Trụ trì Đương nhiệm', content_vi: '<p>Tiểu sử và các hoạt động của vị Trụ trì hiện nay...</p>', tenant_id: secureTenantId, display_order: 21, is_active: true },
            { key: 'truyen-thua-tiep-noi/to-chuc-tang-doan', title_vi: 'Tổ chức Tăng đoàn', content_vi: '<p>Cấu trúc và danh sách chư Tăng đang tu học tại bổn tự...</p>', tenant_id: secureTenantId, display_order: 22, is_active: true },
            { key: 'truyen-thua-tiep-noi/ban-thu-ky', title_vi: 'Ban Thư ký', content_vi: '<p>Thông tin về bộ phận văn phòng và quản lý hành chính của chi nhánh...</p>', tenant_id: secureTenantId, display_order: 23, is_active: true },

            // Nhóm 3: Di sản
            { key: 'di-san-nghe-thuat', title_vi: 'DI SẢN & NGHỆ THUẬT', content_vi: '<p>Giới thiệu về các giá trị văn hóa, kiến trúc đặc sắc...</p>', tenant_id: secureTenantId, display_order: 30, is_active: true },
            { key: 'di-san-nghe-thuat/kien-truc-dieu-khac', title_vi: 'Kiến trúc & Điêu khắc', content_vi: '<p>Mô tả chi tiết về các công trình, pho tượng và hoa văn trang trí...</p>', tenant_id: secureTenantId, display_order: 31, is_active: true },
            { key: 'di-san-nghe-thuat/co-vat-phap-bao', title_vi: 'Cố Vật & Pháp Bảo', content_vi: '<p>Danh sách các di vật cổ và pháp bảo quý giá đang được lưu giữ...</p>', tenant_id: secureTenantId, display_order: 32, is_active: true },
            { key: 'di-san-nghe-thuat/nghe-thuat-truyen-thong', title_vi: 'Nghệ thuật Truyền thống', content_vi: '<p>Các loại hình nghệ thuật đặc thù gắn liền với ngôi chi nhánh...</p>', tenant_id: secureTenantId, display_order: 33, is_active: true },
            { key: 'di-san-nghe-thuat/doi-song-van-hoa', title_vi: 'Đời Sống Văn Hóa', content_vi: '<p>Các hoạt động văn hóa, lễ hội thường niên tại tự viện...</p>', tenant_id: secureTenantId, display_order: 34, is_active: true },

            // Nhóm 4: Nội quy
            { key: 'noi-quy-tu-vien', title_vi: 'NỘI QUY TỰ VIỆN', content_vi: '<p>Các quy định dành cho Nhân sự và khách tham quan khi đến chi nhánh...</p>', tenant_id: secureTenantId, display_order: 40, is_active: true },
        ];

        let count = 0;
        const insertedKeys: string[] = [];

        for (const section of defaultSections) {
            let query = supabase.from('about_sections').select('id').eq('key', section.key);
            if (secureTenantId) query = query.eq('tenant_id', secureTenantId);
            else query = query.is('tenant_id', null);

            const { data } = await query.maybeSingle();
            if (!data) {
                const { error } = await supabase.from('about_sections').insert(section as any);
                if (!error) {
                    count++;
                    insertedKeys.push(section.key);
                }
            }
        }

        // LUÔN revalidate cache sau khi init — dù có insert mới hay không —
        // để đảm bảo header nhận đúng key mới sau khi script fix-key chạy.
        revalidateAboutCache(secureTenantId);
        // Xóa cả unified layout cache để header cập nhật ngay lập tức
        // @ts-ignore — Next.js spec-extension types yêu cầu 2 args, nhưng next/cache chỉ cần 1
        revalidateTag('about-sections-v2');
        revalidatePath(`/admin/t/${secureTenantId}/about`);

        if (count > 0) {
            // Audit log
            await createAuditLog({
                user,
                action: 'create',
                tableName: 'about_sections',
                recordId: `init_${secureTenantId}`,
                newData: { message: `Khởi tạo ${count} mục nội dung mẫu chuẩn Mega Menu`, keys: insertedKeys },
                tenantId: secureTenantId,
            });

            return { success: true, message: `Đã khởi tạo thành công ${count} mục nội dung mẫu chuẩn Mega Menu. Header đã được làm mới.` };
        }

        return { success: true, message: 'Dữ liệu mẫu đã tồn tại. Đã làm mới cache header.' };
    } catch (error: any) {
        console.error('Initialize default sections error:', error);
        return { success: false, error: error.message };
    }
}

export async function createAboutSection(formData: FormData) {
    try {
        const user = await requireAdmin();
        await requirePermission('settings', 'update');
        const supabase = await createClient();
        const context = await getUserContext();

        const rawData = {
            key: formData.get('key') as string,
            title_vi: formData.get('title_vi'),
            title_en: formData.get('title_en'),
            title_km: formData.get('title_km'),
            summary_vi: (formData.get('summary_vi') as string) || null,
            summary_km: (formData.get('summary_km') as string) || null,
            summary_en: (formData.get('summary_en') as string) || null,
            content_vi: formData.get('content_vi'),
            content_en: formData.get('content_en'),
            content_km: formData.get('content_km'),
            image_url: formData.get('image_url'),
            is_active: formData.get('is_active') === 'true',
            tenant_id: (!formData.get('tenant_id') || formData.get('tenant_id') === 'null' || formData.get('tenant_id') === '') ? null : formData.get('tenant_id') as string,
            images: formData.get('images') ? JSON.parse(formData.get('images') as string) : undefined,
        };

        const parsed = AboutSectionSchema.safeParse(rawData);
        if (!parsed.success) {
            const issues = parsed.error.issues;
            return { success: false, error: issues[0]?.message ?? 'Dữ liệu không hợp lệ' };
        }

        // Tự động gán tenant_id: Ưu tiên input > User Role
        // SECURITY: Chặn Admin chi nhánh tạo About cho chi nhánh khác
        let finalTenantId = parsed.data.tenant_id;
        if (context && !['super_admin', 'company_editor'].includes(context.role) && context.tenantId) {
            finalTenantId = context.tenantId;
        }

        // @ts-ignore
        const { error } = await supabase.from('about_sections').insert({
            ...parsed.data,
            tenant_id: finalTenantId || null,
            display_order: 0,
        });

        if (error) return { success: false, error: 'Có lỗi khi tạo mới: ' + error.message };

        await createAuditLog({
            user,
            action: 'create',
            tableName: 'about_sections',
            recordId: parsed.data.key || 'new_section',
            newData: parsed.data,
            tenantId: parsed.data.tenant_id,
        });

        revalidateAboutCache(parsed.data.tenant_id);
        revalidatePath(`/admin/t/${parsed.data.tenant_id}/about`);

        return { success: true };
    } catch (error: any) {
        console.error('Create about section error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteAboutSection(key: string, tenantId?: string) {
    try {
        const user = await requireAdmin();
        await requirePermission('settings', 'delete');
        const supabase = await createClient();
        const context = await getUserContext();

        // SECURITY: Chặn Admin chi nhánh xóa About của chi nhánh khác
        let secureTenantId = tenantId;
        if (context && !['super_admin', 'company_editor'].includes(context.role) && context.tenantId) {
            secureTenantId = context.tenantId;
        }

        let query = (supabase.from('about_sections') as any).delete().eq('key', key);
        if (secureTenantId) query = query.eq('tenant_id', secureTenantId);
        else query = query.is('tenant_id', null);

        const { error } = await query;

        if (error) return { success: false, error: 'Có lỗi khi xóa: ' + error.message };

        await createAuditLog({
            user,
            action: 'delete',
            tableName: 'about_sections',
            recordId: key,
            tenantId: tenantId,
        });

        revalidateAboutCache(tenantId);
        revalidatePath(`/admin/t/${tenantId}/about`);

        return { success: true };
    } catch (error: any) {
        console.error('Delete about section error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Reorder about sections
 */
export async function reorderAboutSections(
    items: { id: string; display_order: number }[],
    tenantId?: string
) {
    try {
        await requireAdmin();
        await requirePermission('settings', 'update');
        const supabase = await createClient();

        // Update each item's display_order
        // Using Promise.all for simplicity, though a single RPC call would be more efficient for very large lists
        const updates = items.map((item) => {
            let query = supabase
                .from('about_sections')
                .update({ display_order: item.display_order })
                .eq('id', item.id);
            
            if (tenantId) query = query.eq('tenant_id', tenantId);
            else query = query.is('tenant_id', null);
            
            return query;
        });

        const results = await Promise.all(updates);
        const firstError = results.find(r => r.error);
        if (firstError) {
            throw new Error('Lỗi khi cập nhật thứ tự: ' + firstError.error?.message);
        }

        revalidateAboutCache(tenantId);
        revalidatePath(`/admin/t/${tenantId}/about`);

        return { success: true };
    } catch (error: any) {
        console.error('Reorder about sections error:', error);
        return { success: false, error: error.message };
    }
}
