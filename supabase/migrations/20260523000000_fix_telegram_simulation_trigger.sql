-- ==============================================================================
-- MIGRATION: Fix Telegram Trigger for Simulation Events (SOAR & SOC) - Secure Dynamic Credentials
-- Ngày: 2026-05-23
-- ==============================================================================

-- 1. Hàm notify_telegram_on_attack() cập nhật hỗ trợ các hành động giả lập tấn công (simulate:*) và lấy cấu hình động
CREATE OR REPLACE FUNCTION notify_telegram_on_attack()
RETURNS TRIGGER AS $$
DECLARE
  telegram_bot_token TEXT;
  telegram_chat_id TEXT;
  dynamic_chat_id TEXT;
  dynamic_bot_token TEXT;
  payload JSONB;
  message_text TEXT;
  tenant_name TEXT := 'Unknown';
  is_simulation BOOLEAN := FALSE;
  formatted_title TEXT;
BEGIN
  -- A. Lấy Telegram Bot Token từ bảng public.settings
  SELECT value INTO dynamic_bot_token FROM public.settings WHERE key = 'telegram_bot_token';
  IF dynamic_bot_token IS NOT NULL AND dynamic_bot_token <> '' THEN
    telegram_bot_token := dynamic_bot_token;
  ELSE
    -- Fallback placeholder để tránh lộ credentials nhạy cảm trên Git repository
    telegram_bot_token := 'YOUR_TELEGRAM_BOT_TOKEN';
  END IF;

  -- B. Lấy động telegram_chat_id và tên của tenant từ bảng tenants
  IF NEW.tenant_id IS NOT NULL THEN
    SELECT name, modules_config->'security_settings'->>'telegram_chat_id'
    INTO tenant_name, dynamic_chat_id
    FROM public.tenants
    WHERE id = NEW.tenant_id;
  END IF;

  -- C. Xác định Chat ID nhận tin nhắn cảnh báo
  IF dynamic_chat_id IS NOT NULL AND dynamic_chat_id <> '' AND dynamic_chat_id <> 'YOUR_CHAT_ID' THEN
    telegram_chat_id := dynamic_chat_id;
  ELSE
    -- Lấy Chat ID mặc định của Super Admin từ settings
    SELECT value INTO telegram_chat_id FROM public.settings WHERE key = 'telegram_chat_id';
    IF telegram_chat_id IS NULL OR telegram_chat_id = '' THEN
      telegram_chat_id := '8617200830'; -- Fallback mặc định về ID Super Admin
    END IF;
  END IF;

  -- D. Kiểm tra xem có phải hành vi giả lập tấn công không
  IF NEW.action LIKE 'simulate:%' THEN
    is_simulation := TRUE;
  END IF;

  -- E. Kích hoạt gửi Webhook khi hành động là tấn công an ninh thực tế,
  -- hoặc khi tenant bị tự động khoá (tenant_auto_suspended), hoặc mức độ nghiêm trọng là CRITICAL,
  -- hoặc đây là hành động giả lập tấn công để demo
  IF NEW.action IN (
       'cross_tenant_violation', 
       'tenant_auto_suspended', 
       'sql_injection_attempt', 
       'cache_pollution_attempt'
     ) 
     OR is_simulation 
     OR NEW.severity = 'CRITICAL' THEN
     
    -- Chọn tiêu đề tương ứng
    IF is_simulation THEN
      formatted_title := '🚨 *[PTIT SAAS SOC THREAT SIMULATION]*';
    ELSE
      formatted_title := '🚨 *[PTIT SAAS SOC ALERTS]*';
    END IF;
     
    -- Soạn nội dung tin nhắn định dạng Markdown phong cách SOC Cyber Security Professional
    message_text := format(
        '%s' || CHR(10) ||
        '━━━━━━━━━━━━━━━━━━━━' || CHR(10) ||
        '🏢 *Tổ chức:* %s' || CHR(10) ||
        '🆔 *Tenant ID:* `%s`' || CHR(10) ||
        '🥷 *Đối tượng:* `%s`' || CHR(10) ||
        '🌐 *Địa chỉ IP:* `%s`' || CHR(10) ||
        '🔥 *Mức độ:* %s *%s*' || CHR(10) ||
        '🛡️ *Hành động:* `%s`' || CHR(10) ||
        '📝 *Thông tin:* _%s_',
        formatted_title,
        COALESCE(tenant_name, 'Hệ thống Trung tâm'),
        COALESCE(NEW.tenant_id::text, 'CENTRAL'),
        COALESCE(NEW.user_email, 'guest@anonymous'),
        COALESCE(NEW.ip_address::text, '127.0.0.1'),
        CASE 
          WHEN is_simulation THEN '🟡'
          WHEN COALESCE(NEW.severity, 'HIGH') = 'CRITICAL' THEN '🟥'
          WHEN COALESCE(NEW.severity, 'HIGH') = 'HIGH' THEN '🟧'
          ELSE '🟨'
        END,
        COALESCE(NEW.severity, 'HIGH'),
        COALESCE(NEW.action, 'Access Violation'),
        COALESCE(
          NEW.details->>'text', 
          COALESCE(
            NEW.details->>'reason', 
            COALESCE(
              NEW.details->>'message', 
              COALESCE(
                NEW.new_data->>'detail', 
                'Phát hiện hành vi xâm nhập trái phép'
              )
            )
          )
        )
    );

    -- Đóng gói payload JSON
    payload := jsonb_build_object(
        'chat_id', telegram_chat_id,
        'text', message_text,
        'parse_mode', 'Markdown'
    );

    -- Bắn Webhook bất đồng bộ qua extension net
    PERFORM net.http_post(
        url := 'https://api.telegram.org/bot' || telegram_bot_token || '/sendMessage',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := payload
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
