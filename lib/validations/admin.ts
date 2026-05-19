/**
 * lib/validations/admin.ts
 * Zod schemas cho các admin Server Actions.
 */
import { z } from 'zod';

// UUID pattern linh hoạt: chấp nhận cả UUID chuẩn RFC 4122 lẫn custom format (11111111-...)
const FLEX_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const flexUuid = z.string().regex(FLEX_UUID_REGEX, 'Invalid UUID');

const UUID_OR_EMPTY = z.union([
    flexUuid,
    z.literal(''),
]).optional().nullable();

// ─── NEWS ────────────────────────────────────────────────────────────────────

export const NewsSchema = z.object({
    title_vi: z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự').max(255),
    title_en: z.string().max(255).optional().nullable(),
    title_km: z.string().max(255).optional().nullable(),
    content_vi: z.string().min(10, 'Nội dung phải có ít nhất 10 ký tự'),
    content_en: z.string().optional().nullable(),
    content_km: z.string().optional().nullable(),
    excerpt_vi: z.string().max(500).optional().nullable(),
    excerpt_en: z.string().max(500).optional().nullable(),
    excerpt_km: z.string().max(500).optional().nullable(),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang').optional().nullable(),
    // thumbnail_url: cho phép chuỗi rỗng (không bắt buộc có ảnh)
    thumbnail_url: z.union([z.string().url('URL ảnh không hợp lệ'), z.literal('')]).optional().nullable(),
    category_id: UUID_OR_EMPTY,
    tenant_id: UUID_OR_EMPTY,
    status: z.enum(['draft', 'pending_review', 'published', 'scheduled', 'rejected', 'archived']).default('draft'),
    published_at: z.string().datetime().optional().nullable(),
    published_to: z.array(flexUuid).optional().nullable(),
}).strip();

export type NewsInput = z.infer<typeof NewsSchema>;

// ─── EVENTS ──────────────────────────────────────────────────────────────────

export const EventSchema = z.object({
    title_vi: z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự').max(255),
    title_en: z.string().max(255).optional().nullable(),
    title_km: z.string().max(255).optional().nullable(),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang').optional().nullable(),
    description_vi: z.string().optional().nullable(),
    description_en: z.string().optional().nullable(),
    description_km: z.string().optional().nullable(),
    excerpt_vi: z.string().max(500, 'Mô tả ngắn không quá 500 ký tự').optional().nullable(),
    excerpt_en: z.string().max(500).optional().nullable(),
    excerpt_km: z.string().max(500).optional().nullable(),
    start_date: z.string().min(1, 'Ngày bắt đầu là bắt buộc'),
    end_date: z.string().optional().nullable(),
    start_time: z.string().optional().nullable(),
    end_time: z.string().optional().nullable(),
    location: z.string().max(255).optional().nullable(),
    thumbnail_url: z.string().url('URL ảnh không hợp lệ').optional().nullable(),
    status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).default('upcoming'),
    category: z.string().optional().nullable(),
    registration_required: z.boolean().default(false),
    max_participants: z.number().int().positive().optional().nullable(),
    is_recurring: z.boolean().default(false),
    tenant_id: UUID_OR_EMPTY,
    published_to: z.array(flexUuid).optional().nullable(),
}).refine(
    // FIXED: Validate end_date >= start_date nếu end_date có giá trị
    (data) => {
        if (!data.end_date || !data.start_date) return true;
        return new Date(data.end_date) >= new Date(data.start_date);
    },
    {
        message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu',
        path: ['end_date'],
    }
).strip();


export type EventInput = z.infer<typeof EventSchema>;

// ─── DONATIONS ───────────────────────────────────────────────────────────────

export const TransactionUpdateSchema = z.object({
    // 'confirmed' = admin đã xác nhận, 'cancelled' = admin từ chối/hủy
    status: z.enum(['pending', 'confirmed', 'cancelled', 'failed', 'refunded']),
    note: z.string().max(500).optional().nullable(),
    transaction_id: z.string().max(255).optional().nullable(),
    completed_at: z.string().datetime().optional().nullable(),
}).strip();

export type TransactionUpdateInput = z.infer<typeof TransactionUpdateSchema>;

// ─── MEDIA ───────────────────────────────────────────────────────────────────

export const MediaSchema = z.object({
    title_vi: z.string().min(1, 'Tiêu đề là bắt buộc').max(255),
    title_en: z.string().max(255).optional().nullable(),
    description_vi: z.string().optional().nullable(),
    type: z.enum(['image', 'video', 'audio', 'document']),
    url: z.string().url('URL không hợp lệ'),
    thumbnail_url: z.string().url().optional().nullable(),
    category_id: z.union([z.string().uuid(), z.literal('')]).optional().nullable(),
    year: z.number().int().min(1900).max(2100).optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
    tenant_id: UUID_OR_EMPTY,
    published_to: z.array(flexUuid).optional().nullable(),
}).strip();

export type MediaInput = z.infer<typeof MediaSchema>;

// ─── FAQ ─────────────────────────────────────────────────────────────────────

export const FaqSchema = z.object({
    question_vi: z.string().min(5, 'Câu hỏi phải có ít nhất 5 ký tự'),
    question_en: z.string().optional().nullable(),
    answer_vi: z.string().min(5, 'Câu trả lời phải có ít nhất 5 ký tự'),
    answer_en: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    order_position: z.number().int().min(0).default(0),
    is_published: z.boolean().default(true),
    tenant_id: UUID_OR_EMPTY,
}).strip();

export type FaqInput = z.infer<typeof FaqSchema>;

// ─── PAGES ───────────────────────────────────────────────────────────────────

export const PageSchema = z.object({
    title_vi: z.string().min(1, 'Tiêu đề là bắt buộc').max(255),
    title_en: z.string().max(255).optional().nullable(),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug không hợp lệ'),
    content_vi: z.string().optional().nullable(),
    content_en: z.string().optional().nullable(),
    meta_description_vi: z.string().max(160).optional().nullable(),
    meta_description_en: z.string().max(160).optional().nullable(),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    tenant_id: UUID_OR_EMPTY,
    parent_id: UUID_OR_EMPTY,
    order_index: z.number().int().default(0).optional(),
    show_in_menu: z.boolean().default(true).optional(),
}).strip();

export type PageInput = z.infer<typeof PageSchema>;

// ─── USERS ───────────────────────────────────────────────────────────────────

export const UserRoleSchema = z.object({
    role: z.enum(['super_admin', 'admin', 'moderator', 'editor', 'viewer']),
}).strip();

export type UserRoleInput = z.infer<typeof UserRoleSchema>;

// ─── HERO SLIDES ─────────────────────────────────────────────────────────────

export const HeroSlideSchema = z.object({
    title_vi: z.string().optional().nullable(),
    title_en: z.string().optional().nullable(),
    title_km: z.string().optional().nullable(),
    subtitle_vi: z.string().optional().nullable(),
    subtitle_en: z.string().optional().nullable(),
    subtitle_km: z.string().optional().nullable(),
    image_url: z.string().min(1, 'Hình ảnh là bắt buộc'),
    cta1_enabled: z.boolean().default(true),
    cta1_text_key: z.union([z.string(), z.literal('')]).optional().nullable(),
    cta1_link: z.union([z.string(), z.literal('')]).optional().nullable(),
    cta2_enabled: z.boolean().default(true),
    cta2_text_key: z.union([z.string(), z.literal('')]).optional().nullable(),
    cta2_link: z.union([z.string(), z.literal('')]).optional().nullable(),
    is_active: z.boolean().default(true),
    order_position: z.number().default(0),
    tenant_id: UUID_OR_EMPTY,
}).strip();

export type HeroSlideFormValues = z.infer<typeof HeroSlideSchema>;

// ─── ABOUT SECTIONS ──────────────────────────────────────────────────────────

export const AboutSectionSchema = z.object({
    key: z.string().regex(/^[a-z0-9-\/]+$/, 'Key chỉ chứa chữ thường, số, dấu gạch ngang và dấu gạch chéo').optional(),
    title_vi: z.string().min(1, 'Tiêu đề tiếng Việt là bắt buộc'),
    title_km: z.string().optional().nullable(),
    title_en: z.string().optional().nullable(),
    summary_vi: z.string().max(500, 'Tóm tắt không quá 500 ký tự').optional().nullable(),
    summary_km: z.string().max(500).optional().nullable(),
    summary_en: z.string().max(500).optional().nullable(),
    content_vi: z.string().optional().nullable(),
    content_km: z.string().optional().nullable(),
    content_en: z.string().optional().nullable(),
    images: z.array(z.string()).optional(), // Array of image URLs
    image_url: z.string().optional().nullable(),
    is_active: z.boolean().default(true),
    tenant_id: UUID_OR_EMPTY,
}).strip();

export type AboutSectionFormValues = z.infer<typeof AboutSectionSchema>;
// ─── CATEGORIES ─────────────────────────────────────────────────────────────
export const CategorySchema = z.object({
    name_vi: z.string().min(1, 'Tên danh mục là bắt buộc').max(255),
    name_km: z.string().max(255).optional().nullable(),
    name_en: z.string().max(255).optional().nullable(),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug không hợp lệ'),
    module: z.string().min(1, 'Module là bắt buộc'),
    type: z.string().optional().nullable(),
    parent_id: UUID_OR_EMPTY,
    image_url: z.string().url('URL ảnh không hợp lệ').or(z.literal('')).optional().nullable(),
    description_vi: z.string().optional().nullable(),
    description_km: z.string().optional().nullable(),
    description_en: z.string().optional().nullable(),
    tenant_id: UUID_OR_EMPTY,
    order_position: z.number().int().default(0),
    is_visible: z.boolean().default(true),
    published_to: z.array(flexUuid).optional().nullable(),
}).strip();

export type CategoryInput = z.infer<typeof CategorySchema>;

// ─── TENANTS ─────────────────────────────────────────────────────────────────
export const TenantSchema = z.object({
    name: z.string().min(1, 'Tên chi nhánh là bắt buộc').max(255),
    domain: z.string().min(3, 'Tên miền không hợp lệ').max(255),
    subdomain: z.string().max(255).optional().nullable(),
    layout_style: z.string().default('traditional'),
    logo_url: z.string().url().or(z.literal('')).optional().nullable(),
    theme_colors: z.record(z.string(), z.string()).optional().nullable(),
    contact_info: z.record(z.string(), z.any()).optional().nullable(),
    tenant_type: z.enum(['tenant', 'company', 'ngo']).default('tenant').optional(),
    has_web_frontend: z.boolean().default(true).optional(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
}).strip();

export type TenantInput = z.infer<typeof TenantSchema>;

// ─── SETTINGS ────────────────────────────────────────────────────────────────
export const SiteSettingsSchema = z.object({
    site_name_vi: z.string().min(1, 'Tên trang web là bắt buộc'),
    site_name_en: z.string().optional().nullable(),
    contact_email: z.string().email('Email không hợp lệ').optional().nullable(),
    contact_phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    facebook_url: z.string().url('URL Facebook không hợp lệ').or(z.literal('')).optional().nullable(),
    youtube_url: z.string().url('URL YouTube không hợp lệ').or(z.literal('')).optional().nullable(),
    // Bank
    'bank.id': z.string().optional().nullable(),
    'bank.account_no': z.string().optional().nullable(),
    'bank.account_name': z.string().optional().nullable(),
    'bank.name': z.string().optional().nullable(),
    // Brand
    site_name_km: z.string().optional().nullable(),
    site_subtitle_vi: z.string().optional().nullable(),
    map_embed_url: z.string().optional().nullable(),
    map_direction_url: z.string().optional().nullable(),
}).strip();

export type SiteSettingsInput = z.infer<typeof SiteSettingsSchema>;
// ─── DHARMA TALKS ────────────────────────────────────────────────────────────
export const DharmaTalkSchema = z.object({
    title_vi: z.string().min(1, 'Tiêu đề tiếng Việt là bắt buộc').max(500),
    title_km: z.string().max(500).optional().nullable(),
    title_en: z.string().max(500).optional().nullable(),
    description_vi: z.string().max(5000).optional().nullable(),
    media_url: z.string().url('URL video không hợp lệ').min(1, 'URL video là bắt buộc'),
    thumbnail_url: z.union([z.string().url(), z.literal('')]).optional().nullable(),
    speaker_name_vi: z.string().max(255).optional().nullable(),
    topic_vi: z.string().max(255).optional().nullable(),
    duration_minutes: z.number().int().positive().optional().nullable(),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang').optional().nullable(),
    is_active: z.boolean().optional(),
    is_featured: z.boolean().optional(),
    order_position: z.number().int().min(0).optional(),
    category_id: UUID_OR_EMPTY,
    tenant_id: UUID_OR_EMPTY,
    approval_status: z.enum(['draft', 'pending_review', 'published', 'rejected']).optional(),
    published_to: z.array(flexUuid).optional().nullable(),
}).strip();

export type DharmaTalkInput = z.infer<typeof DharmaTalkSchema>;

// ─── DONATION PROJECTS ────────────────────────────────────────────────────────
export const TransactionProjectSchema = z.object({
    title_vi: z.string().min(1, 'Tiêu đề là bắt buộc'),
    title_km: z.string().optional().nullable(),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug không hợp lệ').optional().nullable(),
    description_vi: z.string().optional().nullable(),
    description_km: z.string().optional().nullable(),
    content_vi: z.string().optional().nullable(),
    content_km: z.string().optional().nullable(),
    thumbnail_url: z.string().url('URL ảnh không hợp lệ').or(z.literal('')).optional().nullable(),
    target_amount: z.number().min(0).default(0),
    current_amount: z.number().min(0).default(0),
    status: z.enum(['ongoing', 'completed', 'cancelled']).default('ongoing'),
    is_active: z.boolean().default(true),
    start_date: z.string().datetime().or(z.string().nullable()).optional(),
    end_date: z.string().datetime().or(z.string().nullable()).optional(),
    tenant_id: UUID_OR_EMPTY,
}).strip();

export type TransactionProjectInput = z.infer<typeof TransactionProjectSchema>;

// ─── BATCH OPERATIONS ─────────────────────────────────────────────────────────
export const BatchOrderSchema = z.array(z.object({
    id: z.string().uuid('ID không hợp lệ'),
    order_position: z.number().int().min(0)
})).min(1, 'Danh sách không được để trống');


// ─── UTILS: Format loi Zod sang tieng Viet ro rang ───────────────────────────
export function formatZodError(error: z.ZodError): string {
    const FIELD_LABELS: Record<string, string> = {
        title_vi: 'Tiêu đề (VI)',
        name_vi: 'Tên (VI)',
        slug: 'Đường dẫn (Slug)',
        media_url: 'Đường dẫn video/audio',
        thumbnail_url: 'Ảnh đại diện',
        content_vi: 'Nội dung (VI)',
        start_date: 'Ngày bắt đầu',
        domain: 'Tên miền',
        email: 'Email',
        // Brand
        site_name_km: 'Tên trang web (KM)',
        site_subtitle_vi: 'Phụ đề trang web (VI)',
    };
    return error.issues.map(i => {
        const field = i.path.length > 0 ? i.path[i.path.length - 1].toString() : 'Dữ liệu';
        const label = FIELD_LABELS[field] ?? field;
        return `${label}: ${i.message}`;
    }).join(' | ');
}
