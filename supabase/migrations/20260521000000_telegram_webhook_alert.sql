-- 1. Kích hoạt extension pg_net (nếu chưa có) để gọi HTTP request ra ngoài DB
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Hàm xử lý gửi tin nhắn Telegram khi có sự kiện
CREATE OR REPLACE FUNCTION notify_telegram_on_attack()
RETURNS TRIGGER AS $$
DECLARE
  -- 🔴 Đã điền Token, bạn chỉ cần thay YOUR_CHAT_ID bằng số Chat ID lấy được 🔴
  telegram_bot_token TEXT := '8715974217:AAEKQFkHrpSDD5yTJqBFod5ca2fXEWtDBuk'; 
  telegram_chat_id TEXT := 'YOUR_CHAT_ID'; 
  
  payload JSONB;
  message_text TEXT;
BEGIN
  -- Chỉ kích hoạt gửi Webhook khi hành động là tấn công (cross_tenant_violation)
  -- hoặc mức độ nghiêm trọng được dán nhãn CRITICAL
  IF NEW.action = 'cross_tenant_violation' OR NEW.severity = 'CRITICAL' THEN
    
    -- Soạn nội dung tin nhắn định dạng Markdown
    message_text := format(
        '🚨 *CRITICAL ALERT: Cross-tenant Attack Detected!*%%0A' ||
        '👤 *Target Tenant:* %s%%0A' ||
        '🥷 *Attacker IP:* %s%%0A' ||
        '🛡️ *Action Taken:* User suspended & JWT Revoked by RLS Trigger.%%0A' ||
        '📝 *Details:* %s',
        COALESCE(NEW.tenant_id::text, 'Unknown/System'),
        COALESCE(NEW.ip_address, 'Unknown IP'),
        COALESCE(NEW.details->>'reason', 'Brute force or RLS bypass attempt')
    );

    -- Đóng gói payload JSON theo chuẩn API của Telegram
    payload := jsonb_build_object(
        'chat_id', telegram_chat_id,
        'text', message_text,
        'parse_mode', 'Markdown'
    );

    -- Bắn Webhook qua pg_net (Bất đồng bộ - Không làm chậm DB)
    PERFORM net.http_post(
        url := 'https://api.telegram.org/bot' || telegram_bot_token || '/sendMessage',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := payload
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Gắn Trigger vào bảng audit_logs
DROP TRIGGER IF EXISTS trigger_notify_telegram_on_attack ON audit_logs;
CREATE TRIGGER trigger_notify_telegram_on_attack
AFTER INSERT ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION notify_telegram_on_attack();
