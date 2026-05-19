-- ==============================================================================
-- MIGRATION: Active SOC Webhook Alerts (Automated Incident Response)
-- Ngày: 2026-05-17
-- Đề tài: Nâng cấp SOC từ Thụ động (Passive) lên Chủ động (Active)
-- ==============================================================================

-- Bật extension pg_net (nếu chưa bật) để gọi Webhook HTTP bất đồng bộ
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Trigger Function: Active SOC Alert
-- Phát hiện nếu một IP hoặc User thực hiện quá 5 hành động nhạy cảm (VD: DELETE hoặc lỗi)
-- liên tiếp trong vòng 1 phút, hệ thống tự động bắn Webhook cảnh báo (Telegram/Slack/Email).
CREATE OR REPLACE FUNCTION public.soc_active_alert_trigger()
RETURNS TRIGGER AS $$
DECLARE
    recent_count INT;
    webhook_url TEXT := 'https://api.resend.com/emails'; -- URL Webhook (Resend/Slack/Telegram)
    payload JSONB;
BEGIN
    -- Chỉ theo dõi các hành động nhạy cảm (High-Risk action) hoặc Access Denied.
    -- Trong ví dụ này, ta theo dõi việc "delete" dữ liệu liên tục làm dấu hiệu tấn công.
    IF NEW.action = 'delete' THEN
        -- Đếm số lượng hành động tương tự của user hoặc IP này trong 1 phút qua
        SELECT COUNT(*)
        INTO recent_count
        FROM public.audit_logs
        WHERE (user_id = NEW.user_id OR ip_address = NEW.ip_address)
          AND action = 'delete'
          AND created_at >= (NOW() - INTERVAL '1 minute');

        -- Ngưỡng phát hiện: 5 lần / phút
        IF recent_count >= 5 THEN
            -- Xây dựng payload cảnh báo (SIEM Alert)
            payload := jsonb_build_object(
                'level', 'CRITICAL',
                'title', '🚨 SOC Alert: Hành vi bất thường / Noisy Neighbor được phát hiện',
                'user', NEW.user_email,
                'ip', NEW.ip_address,
                'details', format('Cảnh báo bảo mật: Đối tượng này đã thực hiện %s hành động DELETE liên tiếp trong 1 phút.', recent_count),
                'timestamp', NOW()
            );

            -- Bắn Webhook bất đồng bộ (Automated Incident Response) qua pg_net
            -- Hàm http_post của pg_net không block transaction hiện tại (Zero latency overhead)
            BEGIN
                PERFORM extensions.http_post(
                    url := webhook_url,
                    body := payload,
                    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_RESEND_OR_SLACK_KEY"}'::jsonb
                );
            EXCEPTION WHEN OTHERS THEN
                -- Bỏ qua lỗi nếu pg_net chưa cấu hình đúng để không làm sập luồng ghi audit
                RAISE NOTICE 'SOC Alert Webhook failed to send: %', SQLERRM;
            END;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.soc_active_alert_trigger() IS
'Active SOC: Tự động phát hiện hành vi bất thường (>5 mutations nhạy cảm/phút) và bắn Webhook cảnh báo ngay lập tức. Đóng vai trò Automated Incident Response.';

-- Gắn trigger vào bảng audit_logs
DROP TRIGGER IF EXISTS trg_soc_active_alert ON public.audit_logs;

CREATE TRIGGER trg_soc_active_alert
AFTER INSERT ON public.audit_logs
FOR EACH ROW
EXECUTE FUNCTION public.soc_active_alert_trigger();
