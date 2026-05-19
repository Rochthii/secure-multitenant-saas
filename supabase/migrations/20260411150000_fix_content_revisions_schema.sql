-- ==============================================================================
-- MIGRATION: Fix content_revisions schema to align with detailed auditing
-- Ngày: 2026-04-11
-- Mục đích: 
--   1. Chuẩn hóa bảng content_revisions hỗ trợ lưu trữ diff (old_data/new_data).
--   2. Hỗ trợ Multi-tenant isolation (tenant_id).
--   3. Đồng bộ hóa với mã nguồn app/actions/admin/revisions.ts.
-- ==============================================================================

DROP TABLE IF EXISTS public.content_revisions CASCADE;

CREATE TABLE public.content_revisions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name text NOT NULL,
    record_id uuid NOT NULL,
    changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    old_data jsonb,
    new_data jsonb NOT NULL,
    change_summary text,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Bật RLS
ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;

-- Cấu hình Policy dựa trên helper có sẵn
CREATE POLICY "Admin_Manage_Content_Revisions" ON public.content_revisions
    FOR ALL USING (
        public.is_authorized_admin(tenant_id)
    );

-- Index tăng tốc truy vấn
CREATE INDEX IF NOT EXISTS idx_content_revisions_lookup ON public.content_revisions(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_content_revisions_tenant ON public.content_revisions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_content_revisions_created ON public.content_revisions(created_at DESC);

-- Chú thích bảng
COMMENT ON TABLE public.content_revisions IS 'Lưu trữ lịch sử phiên bản của các bảng nội dung (News, Events, Hero Slides, etc.)';
COMMENT ON COLUMN public.content_revisions.table_name IS 'Tên bảng của bản ghi được thay đổi';
COMMENT ON COLUMN public.content_revisions.record_id IS 'ID của bản ghi được thay đổi';
