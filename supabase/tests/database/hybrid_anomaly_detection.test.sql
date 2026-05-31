-- e:\PTIT_THESIS_SAAS\supabase\tests\database\hybrid_anomaly_detection.test.sql
-- ==============================================================================
-- BỘ KIỂM THỬ ĐỘNG CƠ PHÁT HIỆN BẤT THƯỜNG LAI (HBCAD ENGINE SUITE)
-- Đề tài: Secure Multi-tenant SaaS Platform
-- Ngày: 2026-05-31
-- Mục tiêu: Kiểm thử độ chuẩn xác khoa học của thuật toán tính điểm rủi ro lai (CRS)
--   giữa điểm ngữ cảnh (ABAC), Z-Score hành vi và chuỗi dấu hiệu phá hoại (Sequential).
-- ==============================================================================

BEGIN;
SELECT plan(5);

-- ==============================================================================
-- PHẦN 1: KIỂM CHỨNG CẤU TRÚC BẢNG VÀ CỘT DỮ LIỆU
-- ==============================================================================
SELECT has_table('public', 'user_activity_baselines', 'user_activity_baselines table should exist');
SELECT has_column('public', 'audit_logs', 'risk_score', 'audit_logs table should have risk_score column');

-- ==============================================================================
-- PHẦN 2: KIỂM CHỨNG TÍNH TOÁN ĐIỂM RỦI RO NGỮ CẢNH CƠ BẢN (BCR)
-- ==============================================================================
-- Tạo Tenant ảo phục vụ kiểm thử
INSERT INTO public.tenants (id, name, slug)
VALUES ('77777777-7777-7777-7777-777777777777', 'Doanh Nghiệp Kiểm Thử', 'doanh-nghiep-kiem-thu');

-- Tạo baseline hoạt động mặc định cho test user (mu = 5.0, sigma = 2.0)
INSERT INTO public.user_activity_baselines (user_email, avg_hourly_actions, stddev_hourly_actions)
VALUES ('tester@enterprise.security', 5.0, 2.0);

-- Kịch bản A: Thao tác bình thường (hành động 'select' đọc tin tức công khai)
-- Kỳ vọng: Điểm rủi ro CRS cực kỳ thấp (khoảng 1 - 5 điểm), mức độ là INFO
INSERT INTO public.audit_logs (
    tenant_id,
    user_email,
    action,
    table_name,
    record_id,
    ip_address,
    user_agent,
    severity
) VALUES (
    '77777777-7777-7777-7777-777777777777',
    'tester@enterprise.security',
    'select',
    'news',
    '123',
    '127.0.0.1',
    'Tester Browser',
    'INFO'
);

SELECT results_eq(
    'SELECT risk_score, severity FROM public.audit_logs WHERE user_email = ''tester@enterprise.security'' AND action = ''select'' LIMIT 1',
    $$VALUES (1, 'INFO')$$,
    'Normal select action inside whitelist IP should calculate low risk score (1 CRS) and INFO severity'
);

-- ==============================================================================
-- PHẦN 3: KIỂM CHỨNG TÍNH TOÁN KHI BỊ CẢNH BÁO TẤN CÔNG (BCR NÂNG CAO)
-- ==============================================================================
-- Kịch bản B: Kẻ tấn công thực hiện hành vi vi phạm RLS (cross_tenant_violation) từ IP lạ ngoài whitelist
-- Kỳ vọng: Hệ số mạng (Multiplier Network = 3.5), hệ số hành động vi phạm (Action Weight = 25.0) 
--   khiến điểm rủi ro CRS vọt lên rất cao, tự động đặt mức độ CRITICAL
INSERT INTO public.audit_logs (
    tenant_id,
    user_email,
    action,
    table_name,
    record_id,
    ip_address,
    user_agent,
    severity
) VALUES (
    '77777777-7777-7777-7777-777777777777',
    'hacker@anonymous.threat',
    'cross_tenant_violation',
    'news',
    '999',
    '192.168.1.99', -- IP lạ ngoài whitelist
    'Hacker Script Engine',
    'HIGH'
);

SELECT results_eq(
    'SELECT risk_score >= 75, severity FROM public.audit_logs WHERE user_email = ''hacker@anonymous.threat'' LIMIT 1',
    $$VALUES (true, 'CRITICAL')$$,
    'RLS Violation from non-whitelisted IP should automatically trigger Critical severity and CRS >= 75'
);

-- ==============================================================================
-- PHẦN 4: KIỂM CHỨNG CHUỖI PHẠT HÀNH VI TẤN CÔNG LIÊN TIẾP (SEQUENTIAL PATTERN PENALTY)
-- ==============================================================================
-- Kịch bản C: Một user thực hiện liên tiếp 3 hành động 'delete' trong 10 giây (Tấn công phá hủy dữ liệu)
-- Kỳ vọng: Khi chèn dòng delete thứ 3, trigger phát hiện chuỗi và cộng thêm điểm phạt SPP (+60),
--   làm tăng điểm rủi ro CRS vọt lên cao hơn hẳn so với log delete đơn lẻ thông thường
INSERT INTO public.audit_logs (tenant_id, user_email, action, table_name, record_id, ip_address)
VALUES 
  ('77777777-7777-7777-7777-777777777777', 'destructive-user@enterprise.com', 'delete', 'news', '1', '127.0.0.1'),
  ('77777777-7777-7777-7777-777777777777', 'destructive-user@enterprise.com', 'delete', 'news', '2', '127.0.0.1'),
  ('77777777-7777-7777-7777-777777777777', 'destructive-user@enterprise.com', 'delete', 'news', '3', '127.0.0.1');

SELECT results_eq(
    'SELECT risk_score >= 70 FROM public.audit_logs WHERE user_email = ''destructive-user@enterprise.com'' ORDER BY created_at DESC LIMIT 1',
    $$VALUES (true)$$,
    'Sequential delete actions within 10 seconds should incur severe SPP penalty (+60) making final CRS >= 70'
);

-- ==============================================================================
-- HOÀN TẤT & ROLLBACK
-- ==============================================================================
SELECT * FROM finish();
ROLLBACK;
