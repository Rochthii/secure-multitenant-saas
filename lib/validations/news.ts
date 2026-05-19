import { z } from 'zod';

export const newsSchema = z.object({
    title_vi: z.string().min(10, 'Tiêu đề tiếng Việt phải có ít nhất 10 ký tự').max(200),
    title_km: z.string().min(5, 'ចំណងជើងភាសាខ្មែរត្រូវមានយ៉ាងហោចណាស់ 5 តួអក្សរ').max(200).optional(),
    title_en: z.string().min(10, 'English title must have at least 10 characters').max(200).optional(),

    content_vi: z.string().min(100, 'Nội dung phải có ít nhất 100 ký tự'),
    content_km: z.string().optional(),
    content_en: z.string().optional(),

    excerpt_vi: z.string().max(300, 'Tóm tắt không được quá 300 ký tự').optional(),
    excerpt_km: z.string().max(300).optional(),
    excerpt_en: z.string().max(300).optional(),

    slug: z.string()
        .min(3)
        .max(200)
        .regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang'),

    category_id: z.string().uuid('Category ID không hợp lệ'),

    thumbnail_url: z.string().url('URL hình ảnh không hợp lệ').optional().or(z.literal('')),

    status: z.enum(['draft', 'published', 'archived']),

    published_at: z.string().datetime().optional(),

    is_featured: z.boolean().default(false),
});

export type NewsInput = z.infer<typeof newsSchema>;
