-- ==============================================================================
-- KỊCH BẢN MIGRATION: VÁ LỖ HỔNG DATABASE SCHEMA (MULTI-TENANT STANDARDIZATION)
-- Mục đích: Thêm cột tenant_id (bắt buộc) cho các bảng phụ trợ đang bị bỏ sót.
-- Đảm bảo dữ liệu 100% được gắn nhãn sở hữu của từng Chi nhánh, ngăn chặn rò rỉ.
-- ID Mặc định: '55555555-5555-5555-5555-555555555555' (Chi nhánh Gốc / Master Tenant)
-- ==============================================================================

-- 1. Bảng: audit_logs (Nhật ký hoạt động)
ALTER TABLE public.audit_logs 
  ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT '55555555-5555-5555-5555-555555555555'::uuid;

ALTER TABLE public.audit_logs
DROP CONSTRAINT IF EXISTS audit_logs_tenant_id_fkey,
ADD CONSTRAINT audit_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id);

-- 2. Bảng: charity_posts (Bài đăng từ thiện)
ALTER TABLE public.charity_posts 
  ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT '55555555-5555-5555-5555-555555555555'::uuid;

ALTER TABLE public.charity_posts
DROP CONSTRAINT IF EXISTS charity_posts_tenant_id_fkey,
ADD CONSTRAINT charity_posts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id);

-- 3. Bảng: faqs (Hỏi đáp)
ALTER TABLE public.faqs 
  ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT '55555555-5555-5555-5555-555555555555'::uuid;

ALTER TABLE public.faqs
DROP CONSTRAINT IF EXISTS faqs_tenant_id_fkey,
ADD CONSTRAINT faqs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id);

-- 4. Bảng: homepage_stats (Thống kê trang chủ)
ALTER TABLE public.homepage_stats 
  ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT '55555555-5555-5555-5555-555555555555'::uuid;

ALTER TABLE public.homepage_stats
DROP CONSTRAINT IF EXISTS homepage_stats_tenant_id_fkey,
ADD CONSTRAINT homepage_stats_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id);

-- 5. Bảng: testimonials (Lời nhận xét/cảm nhận)
ALTER TABLE public.testimonials 
  ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT '55555555-5555-5555-5555-555555555555'::uuid;

ALTER TABLE public.testimonials
DROP CONSTRAINT IF EXISTS testimonials_tenant_id_fkey,
ADD CONSTRAINT testimonials_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id);

-- 6. Bảng: newsletter_subscribers (Người đăng ký nhận bản tin)
ALTER TABLE public.newsletter_subscribers 
  ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT '55555555-5555-5555-5555-555555555555'::uuid;

ALTER TABLE public.newsletter_subscribers
DROP CONSTRAINT IF EXISTS newsletter_subscribers_tenant_id_fkey,
ADD CONSTRAINT newsletter_subscribers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id);

-- 7. Bảng: quick_access_links (Đường dẫn truy cập nhanh)
ALTER TABLE public.quick_access_links 
  ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT '55555555-5555-5555-5555-555555555555'::uuid;

ALTER TABLE public.quick_access_links
DROP CONSTRAINT IF EXISTS quick_access_links_tenant_id_fkey,
ADD CONSTRAINT quick_access_links_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id);

-- 8. Bảng: content_revisions (Lịch sử chỉnh sửa nội dung)
ALTER TABLE public.content_revisions 
  ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT '55555555-5555-5555-5555-555555555555'::uuid;

ALTER TABLE public.content_revisions
DROP CONSTRAINT IF EXISTS content_revisions_tenant_id_fkey,
ADD CONSTRAINT content_revisions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id);

-- ==============================================================================
-- Kết thúc script vá lỗi Database Schema.
-- Các bảng trên giờ đã có thể cài đặt Row Level Security (RLS) bình thường.
-- ==============================================================================