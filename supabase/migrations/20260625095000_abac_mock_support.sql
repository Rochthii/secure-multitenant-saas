-- ==============================================================================
-- MIGRATION: Hỗ trợ giả lập giờ hành chính cho các kịch bản kiểm thử ABAC
-- Ngày: 2026-06-25
-- ==============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.is_within_business_hours()
RETURNS BOOLEAN AS $$
DECLARE
    mock_hour INT;
BEGIN
    -- Hỗ trợ mock giờ để phục vụ simulator/testing trong đồ án
    mock_hour := NULLIF(current_setting('app.mock_current_hour', true), '')::INT;
    IF mock_hour IS NOT NULL THEN
        RETURN mock_hour BETWEEN 7 AND 21;
    END IF;

    -- Mặc định lấy giờ hiện tại theo múi giờ Asia/Ho_Chi_Minh (ICT, UTC+7)
    RETURN EXTRACT(HOUR FROM NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')
        BETWEEN 7 AND 21; -- 07:00 đến 21:59
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, extensions;

REVOKE EXECUTE ON FUNCTION public.is_within_business_hours() FROM anon;

COMMENT ON FUNCTION public.is_within_business_hours() IS
'ABAC Policy: Kiểm tra thời gian hiện tại có nằm trong giờ hành chính (07:00-22:00 ICT). 
Hỗ trợ session parameter "app.mock_current_hour" để phục vụ giả lập tấn công ABAC học thuật.
Tham chiếu: ISO 27017 §CLD.9.5.1 — Kiểm soát truy cập đặc quyền.';

COMMIT;
