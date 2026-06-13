/**
 * Helper hỗ trợ trích xuất dữ liệu tin tức từ FormData.
 * Dùng chung cho cả createNews và updateNews Server Actions để loại bỏ lặp code.
 */
export function parseNewsFormData(formData: FormData) {
    return {
        title_vi: formData.get('title_vi') as string,
        title_en: formData.get('title_en') as string || null,
        title_km: formData.get('title_km') as string || null,
        content_vi: formData.get('content_vi') as string,
        content_en: formData.get('content_en') as string || null,
        content_km: formData.get('content_km') as string || null,
        excerpt_vi: formData.get('excerpt_vi') as string || null,
        excerpt_en: formData.get('excerpt_en') as string || null,
        excerpt_km: formData.get('excerpt_km') as string || null,
        slug: formData.get('slug') as string || null,
        thumbnail_url: formData.get('thumbnail_url') as string || null,
        category_id: (!formData.get('category_id') || formData.get('category_id') === 'null' || formData.get('category_id') === '') 
            ? null 
            : formData.get('category_id') as string,
        tenant_id: (!formData.get('tenant_id') || formData.get('tenant_id') === 'null' || formData.get('tenant_id') === '') 
            ? null 
            : formData.get('tenant_id') as string,
        status: (formData.get('status') as string) || 'draft',
        published_at: formData.get('published_at') as string || null,
        published_to: (() => {
            const val = formData.get('published_to');
            if (!val || val === 'null' || val === '') return null;
            try {
                const parsed = JSON.parse(val as string);
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                return Array.isArray(parsed) 
                    ? parsed.filter((id) => id && typeof id === 'string' && uuidRegex.test(id)) 
                    : null;
            } catch { 
                return null; 
            }
        })(),
    };
}
