'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireEditor, requireAdmin } from '@/lib/auth/require-admin';
import { createAuditLog } from '@/lib/audit';

export type Tag = {
    id: string;
    name: string;
    slug: string;
    created_at: string;
};

/**
 * Lấy tất cả các tags
 */
export async function getTags(tenantId?: string) {
    const supabase = await createClient();
    let query = (supabase as any)
        .from('tags')
        .select('*');

    if (tenantId) {
        query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error) {
        console.error('getTags error:', error);
        return [];
    }
    return data as Tag[];
}

/**
 * Tạo tag mới
 */
export async function createTag(name: string, tenantId?: string) {
    try {
        const user = await requireEditor();
        const supabase = await createClient();

        // Tạo slug từ name
        const slug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        // Tự động gán tenant_id: Ưu tiên input > User Role
        let finalTenantId = tenantId;
        if (!finalTenantId) {
            const { data: roleData } = await (supabase as any)
                .from('user_roles')
                .select('tenant_id')
                .eq('user_id', user.id)
                .maybeSingle();
            finalTenantId = roleData?.tenant_id;
        }

        const payload = {
            name,
            slug,
            tenant_id: finalTenantId || null
        };

        const { data, error } = await (supabase as any)
            .from('tags')
            .insert(payload)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return { success: false, error: 'Tag này đã tồn tại.' };
            }
            console.error('createTag error:', error);
            return { success: false, error: error.message };
        }

        await createAuditLog({
            user,
            action: 'create',
            tableName: 'tags',
            recordId: (data as any).id,
            newData: payload,
        });

        revalidatePath('/admin/tags');
        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message || 'Có lỗi xảy ra' };
    }
}

/**
 * Xóa tag
 */
export async function deleteTag(tenantId: string, id: string) {
    try {
        const user = await requireAdmin();
        const supabase = await createClient();

        const { data: oldData } = await (supabase as any)
            .from('tags')
            .select('*')
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .single();

        const { error } = await (supabase as any)
            .from('tags')
            .delete()
            .eq('id', id)
            .eq('tenant_id', tenantId);

        if (error) {
            console.error('deleteTag error:', error);
            return { success: false, error: error.message };
        }

        await createAuditLog({
            user,
            action: 'delete',
            tableName: 'tags',
            recordId: id,
            oldData: oldData ?? null,
        });

        // @ts-ignore
        revalidateTag(`tags-${tenantId || 'global'}`);
        revalidatePath('/admin/tags');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Có lỗi xảy ra' };
    }
}

/**
 * Lấy tags của một bản ghi (news, media, dharma_talks)
 */
export async function getItemTags(table: 'news_tags' | 'media_tags' | 'dharma_talk_tags', itemId: string, tenantId?: string) {
    const supabase = await createClient();
    const idField = table.replace('_tags', '_id');

    let query = (supabase as any)
        .from(table)
        .select(`
            tag_id,
            tags (id, name, slug)
        `)
        .eq(idField, itemId);

    if (tenantId) {
        query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query;

    if (error) {
        console.error(`getItemTags (${table}) error:`, error);
        return [];
    }

    return (data as any[]).map(item => item.tags) as Tag[];
}

/**
 * Cập nhật tags cho một bản ghi
 */
export async function updateItemTags(
    table: 'news_tags' | 'media_tags' | 'dharma_talk_tags',
    itemId: string,
    tagIds: string[],
    tenantId?: string
) {
    try {
        const user = await requireEditor();
        const supabase = await createClient();
        const idField = table.replace('_tags', '_id');

        // 1. Xóa các tags cũ
        let deleteQuery = (supabase as any)
            .from(table)
            .delete()
            .eq(idField, itemId);

        if (tenantId) {
            deleteQuery = deleteQuery.eq('tenant_id', tenantId);
        }

        const { error: deleteError } = await deleteQuery;

        if (deleteError) throw deleteError;

        // 2. Thêm các tags mới
        if (tagIds.length > 0) {
            const inserts = tagIds.map(tagId => ({
                [idField]: itemId,
                tag_id: tagId,
                tenant_id: tenantId || undefined
            }));

            const { error: insertError } = await (supabase as any)
                .from(table)
                .insert(inserts);

            if (insertError) throw insertError;
        }

        await createAuditLog({
            user,
            action: 'update',
            tableName: table,
            recordId: itemId,
            newData: { tagIds },
        });

        return { success: true };
    } catch (err: any) {
        console.error('updateItemTags error:', err);
        return { success: false, error: err.message || 'Có lỗi khi cập nhật tags' };
    }
}

/**
 * Gợi ý Tags dựa trên nội dung
 */
export async function suggestTags(title: string, content: string, tenantId?: string) {
    try {
        await requireEditor();
        const supabase = await createClient();

        // 1. Lấy tất cả tag hiện có để so sánh
        const allTags = await getTags(tenantId);

        // 2. Chuẩn bị nội dung để phân tích (bỏ HTML tags, chuyển lowercase)
        const cleanContent = content.replace(/<[^>]*>/g, ' ').toLowerCase();
        const fullText = `${title.toLowerCase()} ${cleanContent}`;

        const suggestions: { name: string; isNew: boolean; id?: string }[] = [];

        // 3. Kiểm tra các tag hiện có trong nội dung
        allTags.forEach(tag => {
            const tagName = tag.name.toLowerCase();
            if (fullText.includes(tagName)) {
                suggestions.push({ name: tag.name, isNew: false, id: tag.id });
            }
        });

        // 4. Các từ khóa SEO "vàng" của Chi nhánh (Bộ từ khóa lõi)
        const coreKeywords = [
            'Chi nhánh Chantarangsay', 'Phật giáo Khmer', 'Văn hóa Khmer',
            'Quận 3', 'Nam tông', 'Lễ hội', 'Từ thiện', 'Sự kiện'
        ];

        coreKeywords.forEach(kw => {
            // Nếu chưa có trong danh sách gợi ý
            if (!suggestions.some(s => s.name.toLowerCase() === kw.toLowerCase())) {
                // Kiểm tra xem nó có trong nội dung không
                if (fullText.includes(kw.toLowerCase())) {
                    // Xem nó đã tồn tại trong DB chưa
                    const existing = allTags.find(t => t.name.toLowerCase() === kw.toLowerCase());
                    if (existing) {
                        suggestions.push({ name: existing.name, isNew: false, id: existing.id });
                    } else {
                        suggestions.push({ name: kw, isNew: true });
                    }
                }
            }
        });

        // 5. Tự động trích xuất các cụm từ quan trọng (Heuristic đơn giản)
        // Tìm các cụm từ viết hoa trong Title (thường là tên riêng, sự kiện quan trọng)
        const capPhrases = title.match(/[A-ZÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰĐ][a-zàáảãạâầấẩẫậăằắẳẵặcèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựđ]*/g);
        if (capPhrases && capPhrases.length > 0) {
            const filteredPhrases = capPhrases.filter(p => p.length > 3);
            // Lấy top 3 cụm từ viết hoa mới lạ
            const uniquePhrases = Array.from(new Set(filteredPhrases)).slice(0, 3);

            uniquePhrases.forEach(p => {
                if (!suggestions.some(s => s.name.toLowerCase() === p.toLowerCase())) {
                    const existing = allTags.find(t => t.name.toLowerCase() === p.toLowerCase());
                    if (existing) {
                        suggestions.push({ name: existing.name, isNew: false, id: existing.id });
                    } else {
                        suggestions.push({ name: p, isNew: true });
                    }
                }
            });
        }

        return { success: true, data: suggestions };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
