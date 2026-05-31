-- ==============================================================================
-- BỘ KIỂM THỬ PHẢN ỨNG PHÂN TẦNG SOAR (SOAR TIERED RESPONSE TEST SUITE)
-- Đề tài: Secure Multi-tenant SaaS Platform
-- Ngày: 2026-05-31
-- Mục tiêu: Xác thực cơ chế tự động chặn IP động ngoài whitelist khi có tấn công dồn dập
--   và ngăn chặn việc chặn nhầm địa chỉ IP hợp pháp nằm trong Whitelist (chống Self-lockdown).
-- ==============================================================================

BEGIN;
SELECT plan(4);

-- ==============================================================================
-- PHẦN 1: KIỂM CHỨNG CẤU TRÚC BẢNG BLOCK
-- ==============================================================================
SELECT has_table('public', 'blocked_ips', 'blocked_ips table should exist');
SELECT has_column('public', 'blocked_ips', 'ip', 'blocked_ips table should have ip column');

-- ==============================================================================
-- PHẦN 2: THIẾT LẬP BỐI CẢNH KIỂM THỬ (MOCK DATA)
-- ==============================================================================
-- Tạo Tenant ảo phục vụ kiểm thử
INSERT INTO public.tenants (id, name, slug, modules_config)
VALUES (
    '88888888-8888-8888-8888-888888888888', 
    'Tenant Test SOAR', 
    'tenant-test-soar',
    '{"security_settings": {"ip_whitelist": "10.0.0.1", "telegram_chat_id": "8617200830"}}'::jsonb
);

-- ==============================================================================
-- PHẦN 3: KỊCH BẢN IP LẠ (NGOÀI WHITELIST) TẤN CÔNG
-- Kỳ vọng: IP lạ "192.168.99.9" tự động bị block bởi SOAR sau 3 vi phạm liên tục
-- ==============================================================================
INSERT INTO public.audit_logs (tenant_id, user_email, action, table_name, record_id, ip_address, severity, risk_score)
VALUES 
  ('88888888-8888-8888-8888-888888888888', 'anonymous-hacker@threat.net', 'sql_injection_attempt', 'news', '1', '192.168.99.9', 'CRITICAL', 90),
  ('88888888-8888-8888-8888-888888888888', 'anonymous-hacker@threat.net', 'sql_injection_attempt', 'news', '2', '192.168.99.9', 'CRITICAL', 90),
  ('88888888-8888-8888-8888-888888888888', 'anonymous-hacker@threat.net', 'sql_injection_attempt', 'news', '3', '192.168.99.9', 'CRITICAL', 90);

SELECT results_eq(
    'SELECT COUNT(*)::INTEGER FROM public.blocked_ips WHERE ip = ''192.168.99.9'' AND tenant_id = ''88888888-8888-8888-8888-888888888888''',
    $$VALUES (1)$$,
    'SOAR should automatically block the non-whitelisted IP after 3 consecutive critical violations'
);

-- ==============================================================================
-- PHẦN 4: KỊCH BẢN IP WHITELIST BỊ TẤN CÔNG HOẶC CÓ THAO TÁC VI PHẠM
-- Kỳ vọng: IP Whitelist "10.0.0.1" KHÔNG bị block để bảo vệ người quản trị
-- ==============================================================================
INSERT INTO public.audit_logs (tenant_id, user_email, action, table_name, record_id, ip_address, severity, risk_score)
VALUES 
  ('88888888-8888-8888-8888-888888888888', 'admin@tenant.com', 'sql_injection_attempt', 'news', '4', '10.0.0.1', 'CRITICAL', 90),
  ('88888888-8888-8888-8888-888888888888', 'admin@tenant.com', 'sql_injection_attempt', 'news', '5', '10.0.0.1', 'CRITICAL', 90),
  ('88888888-8888-8888-8888-888888888888', 'admin@tenant.com', 'sql_injection_attempt', 'news', '6', '10.0.0.1', 'CRITICAL', 90);

SELECT results_eq(
    'SELECT COUNT(*)::INTEGER FROM public.blocked_ips WHERE ip = ''10.0.0.1'' AND tenant_id = ''88888888-8888-8888-8888-888888888888''',
    $$VALUES (0)$$,
    'SOAR should NEVER block whitelisted IP to prevent accidental admin lockdown'
);

SELECT * FROM finish();
ROLLBACK;
