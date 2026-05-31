-- e:\PTIT_THESIS_SAAS\supabase\tests\database\security_features.test.sql
-- ==============================================================================
-- BỘ KIỂM THỬ AN NINH CỐT LÕI (SECURITY FEATURES SUITE)
-- Đề tài: Secure Multi-tenant SaaS Platform (Sacred Spaces)
-- Ngày: 2026-05-31
-- Mục tiêu: Bảo chứng chất lượng khoa học bằng kiểm thử tự động (Unit Testing)
--   cho lớp RLS Tenant Isolation và Sổ cái WORM Vault bất biến.
-- ==============================================================================

BEGIN;
SELECT plan(6);

-- ==============================================================================
-- PHẦN 1: KIỂM CHỨNG MÔI TRƯỜNG KIỂM THỬ (pgTAP)
-- ==============================================================================
SELECT has_extension('pgtap', 'pgtap extension should be installed');

-- ==============================================================================
-- PHẦN 2: KIỂM CHỨNG TRẠNG THÁI ROW-LEVEL SECURITY (RLS)
-- ==============================================================================
SELECT rls_enabled('public', 'audit_logs', 'Row-Level Security must be enabled on public.audit_logs');
SELECT rls_enabled('public', 'news', 'Row-Level Security must be enabled on public.news');

-- ==============================================================================
-- PHẦN 3: KIỂM CHỨNG TÍNH BẤT BIẾN CỦA WORM AUDIT LOGS (Chống can thiệp vật lý)
-- ==============================================================================
-- Kịch bản A: Cố gắng DELETE dòng trong audit_logs -> Phải bị chặn và ném exception
SELECT throws_ok(
    'DELETE FROM public.audit_logs WHERE id = ''00000000-0000-0000-0000-000000000000''',
    'insufficient_privilege',
    'SECURITY VIOLATION [CLD.12.4.1]: Bản ghi Audit Log là BẤT BIẾN - Thao tác DELETE trên bảng audit_logs bị từ chối hoàn toàn. Mọi hành vi can thiệp nhật ký kiểm toán là vi phạm nghiêm trọng chính sách bảo mật hệ thống.',
    'Tampering audit_logs via DELETE should raise security violation'
);

-- Kịch bản B: Cố gắng UPDATE dòng trong audit_logs -> Phải bị chặn và ném exception
SELECT throws_ok(
    'UPDATE public.audit_logs SET message = ''Tampered'' WHERE id = ''00000000-0000-0000-0000-000000000000''',
    'insufficient_privilege',
    'SECURITY VIOLATION [CLD.12.4.1]: Bản ghi Audit Log là BẤT BIẾN - Thao tác UPDATE trên bảng audit_logs bị từ chối hoàn toàn. Mọi hành vi can thiệp nhật ký kiểm toán là vi phạm nghiêm trọng chính sách bảo mật hệ thống.',
    'Tampering audit_logs via UPDATE should raise security violation'
);

-- ==============================================================================
-- PHẦN 4: KIỂM CHỨNG TÍNH CÔ LẬP TENANT (Cross-Tenant Data Isolation)
-- ==============================================================================
-- Tạo 2 tenant ảo phục vụ test (Tự động Rollback hoàn toàn sau khi chạy test)
INSERT INTO public.tenants (id, name, slug)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Chùa Thử Nghiệm A', 'chua-thu-nghiem-a'),
  ('22222222-2222-2222-2222-222222222222', 'Chùa Thử Nghiệm B', 'chua-thu-nghiem-b');

-- Chèn dữ liệu tin tức riêng tư dạng nháp (Draft) cho Tenant A
INSERT INTO public.news (id, title, content, status, tenant_id)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'Tin Tức Nội Bộ Chùa A', 'Nội dung tin tức nhạy cảm', 'draft', '11111111-1111-1111-1111-111111111111');

-- Giả lập Đăng nhập là User thuộc Tenant B (auth.jwt() trích xuất claims trực tiếp từ in-memory session)
SELECT set_config('request.jwt.claims', '{"sub": "44444444-4444-4444-4444-444444444444", "role": "authenticated", "tenant_id": "22222222-2222-2222-2222-222222222222"}', true);

-- Kiểm tra: Tenant B cố gắng đọc dữ liệu của Tenant A
-- Kỳ vọng: SELECT trả về 0 dòng nhờ chính sách Row-Level Security
SELECT results_eq(
    'SELECT count(*) FROM public.news WHERE id = ''33333333-3333-3333-3333-333333333333''',
    ARRAY[0::bigint],
    'Tenant B must NOT be able to view draft news of Tenant A'
);

-- ==============================================================================
-- HOÀN TẤT & ROLLBACK (Đảm bảo tuyệt đối không ảnh hưởng đến dữ liệu thật)
-- ==============================================================================
SELECT * FROM finish();
ROLLBACK;
