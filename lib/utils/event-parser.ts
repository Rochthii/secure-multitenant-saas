/**
 * Helper hỗ trợ trích xuất dữ liệu sự kiện từ FormData.
 * Dùng chung cho cả createEvent và updateEvent Server Actions để loại bỏ lặp code.
 */
export function parseEventFormData(formData: FormData) {
    return {
        title_vi: formData.get('title_vi') as string,
        title_en: formData.get('title_en') as string || null,
        title_km: formData.get('title_km') as string || null,
        slug: formData.get('slug') as string || null,
        description_vi: formData.get('description_vi') as string || null,
        description_en: formData.get('description_en') as string || null,
        description_km: formData.get('description_km') as string || null,
        excerpt_vi: formData.get('excerpt_vi') as string || null,
        excerpt_en: formData.get('excerpt_en') as string || null,
        excerpt_km: formData.get('excerpt_km') as string || null,
        start_date: formData.get('start_date') as string,
        end_date: formData.get('end_date') as string || null,
        start_time: formData.get('start_time') as string || null,
        end_time: formData.get('end_time') as string || null,
        location: formData.get('location') as string || null,
        thumbnail_url: formData.get('thumbnail_url') as string || null,
        status: (formData.get('status') as string) || 'upcoming',
        category: formData.get('category') as string || null,
        registration_required: formData.get('registration_required') === 'true',
        max_participants: formData.get('max_participants')
            ? parseInt(formData.get('max_participants') as string)
            : null,
        is_recurring: formData.get('is_recurring') === 'true',
        tenant_id: (() => {
            const tid = formData.get('tenant_id');
            if (!tid || tid === 'null' || tid === '') return null;
            return tid as string;
        })(),
        published_to: (() => {
            const val = formData.get('published_to');
            if (!val || val === 'null' || val === '') return null;
            try {
                const parsed = JSON.parse(val as string);
                return Array.isArray(parsed) 
                    ? parsed.filter((id) => id && id !== 'null' && id !== '') 
                    : null;
            } catch { 
                return null; 
            }
        })(),
    };
}
