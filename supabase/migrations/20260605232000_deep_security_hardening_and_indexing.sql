-- ==============================================================================
-- MIGRATION: Khắc phục lỗ hổng an ninh tầng sâu & Tối ưu hóa chỉ mục cô lập
-- Ngày: 2026-06-05
-- Học viên: Chăm Rốch Thi - PTIT Đồ án tốt nghiệp
-- Mục đích:
--   1. Thu hồi quyền EXECUTE của các hàm SECURITY DEFINER nhạy cảm đối với anon và authenticated
--   2. Kích hoạt RLS & FORCE RLS cho bảng user_activity_baselines
--   3. Áp dụng FORCE ROW LEVEL SECURITY cho toàn bộ bảng thuộc schema public
--   4. Tạo chỉ mục B-Tree trên tenant_id cho 14 bảng còn thiếu để tối ưu hóa RLS
-- ==============================================================================

BEGIN;

-- ==========================================
-- PHẦN 1: THU HỒI QUYỀN EXECUTE TRÊN CÁC HÀM SECURITY DEFINER NHẠY CẢM
-- ==========================================
-- Thu hồi quyền thực thi trực tiếp từ các vai trò anon, authenticated và PUBLIC để tránh rò rỉ quyền
REVOKE EXECUTE ON FUNCTION public.block_ip(text, uuid, integer, text, text) FROM anon, authenticated, PUBLIC CASCADE;
REVOKE EXECUTE ON FUNCTION public.unblock_ip(text, uuid, text) FROM anon, authenticated, PUBLIC CASCADE;
REVOKE EXECUTE ON FUNCTION public.tenant_offboarding_wipe(uuid) FROM anon, authenticated, PUBLIC CASCADE;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer, text, text) FROM anon, authenticated, PUBLIC CASCADE;

-- Cấp quyền thực thi có kiểm soát:
-- - block_ip/unblock_ip: Chỉ cho phép authenticated users (đã đăng nhập) và service_role chạy.
GRANT EXECUTE ON FUNCTION public.block_ip(text, uuid, integer, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.unblock_ip(text, uuid, text) TO authenticated, service_role;

-- - tenant_offboarding_wipe: Chỉ cho phép service_role (hoặc super_admin thông qua backend) thực thi.
--   Tuyệt đối KHÔNG cho phép anon hoặc authenticated thông thường gọi trực tiếp qua REST API.
GRANT EXECUTE ON FUNCTION public.tenant_offboarding_wipe(uuid) TO service_role;

-- - check_rate_limit: Cho phép authenticated và service_role. 
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer, text, text) TO authenticated, service_role;


-- ==========================================
-- PHẦN 2: KÍCH HOẠT RLS CHO BẢNG USER_ACTIVITY_BASELINES
-- ==========================================
ALTER TABLE IF EXISTS public.user_activity_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_activity_baselines FORCE ROW LEVEL SECURITY;

-- Tạo RLS policies cho user_activity_baselines (Cô lập theo Email người dùng vì bảng không chứa tenant_id)
DROP POLICY IF EXISTS "Global admins can manage all baselines" ON public.user_activity_baselines;
DROP POLICY IF EXISTS "Tenant staff can view own baselines" ON public.user_activity_baselines;
DROP POLICY IF EXISTS "Users can view own baseline" ON public.user_activity_baselines;

CREATE POLICY "Global admins can manage all baselines" ON public.user_activity_baselines
    FOR ALL
    TO authenticated
    USING (is_global_admin());

CREATE POLICY "Users can view own baseline" ON public.user_activity_baselines
    FOR SELECT
    TO authenticated
    USING (user_email = (auth.jwt() ->> 'email'));


-- ==========================================
-- PHẦN 3: ÁP DỤNG FORCE ROW LEVEL SECURITY CHO TOÀN BỘ CÁC BẢNG PUBLIC
-- ==========================================
-- Vòng lặp động chạy FORCE ROW LEVEL SECURITY trên tất cả các bảng public
DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY;', tbl.tablename);
    END LOOP;
END $$;


-- ==========================================
-- PHẦN 4: TẠO CHỈ MỤC B-TREE TRÊN TENANT_ID CHO CÁC BẢNG CÒN THIẾU
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON public.audit_logs USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_jwt_tenant_id ON public.benchmark_jwt USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_legacy_tenant_id ON public.benchmark_legacy USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_hits_tenant_id ON public.rate_limit_hits USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_tenant_id ON public.testimonials USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_homepage_stats_tenant_id ON public.homepage_stats USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_quick_access_links_tenant_id ON public.quick_access_links USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_charity_posts_tenant_id ON public.charity_posts USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_faqs_tenant_id ON public.faqs USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_audit_log_tenant_id ON public.ai_audit_log USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_low_quality_logs_tenant_id ON public.ai_low_quality_logs USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_query_cache_tenant_id ON public.ai_query_cache USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_rag_telemetry_tenant_id ON public.rag_telemetry USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_dharma_embeddings_tenant_id ON public.dharma_embeddings USING btree (tenant_id);

COMMIT;
