-- 1. Hàm notify_telegram_on_attack() cập nhật hỗ trợ Telegram Chat ID động từ cấu hình bảo mật chi nhánh
CREATE OR REPLACE FUNCTION notify_telegram_on_attack()
RETURNS TRIGGER AS $$
DECLARE
  telegram_bot_token TEXT := '8715974217:AAEKQFkHrpSDD5yTJqBFod5ca2fXEWtDBuk'; 
  telegram_chat_id TEXT;
  dynamic_chat_id TEXT;
  payload JSONB;
  message_text TEXT;
  tenant_name TEXT := 'Unknown';
BEGIN
  -- Lấy động telegram_chat_id và tên của tenant từ bảng tenants
  IF NEW.tenant_id IS NOT NULL THEN
    SELECT name, modules_config->'security_settings'->>'telegram_chat_id'
    INTO tenant_name, dynamic_chat_id
    FROM public.tenants
    WHERE id = NEW.tenant_id;
  END IF;

  -- Nếu tìm thấy Telegram Chat ID động từ cấu hình chi nhánh, sử dụng nó. Ngược lại fallback về Chat ID Super Admin mặc định
  IF dynamic_chat_id IS NOT NULL AND dynamic_chat_id <> '' AND dynamic_chat_id <> 'YOUR_CHAT_ID' THEN
    telegram_chat_id := dynamic_chat_id;
  ELSE
    telegram_chat_id := '8617200830';
  END IF;

  -- Chỉ kích hoạt gửi Webhook khi hành động là tấn công (cross_tenant_violation, sql_injection_attempt, cache_pollution_attempt),
  -- hoặc khi tenant bị tự động khoá (tenant_auto_suspended), hoặc mức độ nghiêm trọng là CRITICAL
  IF NEW.action IN ('cross_tenant_violation', 'tenant_auto_suspended', 'sql_injection_attempt', 'cache_pollution_attempt') 
     OR NEW.severity = 'CRITICAL' THEN
    
    -- Soạn nội dung tin nhắn định dạng Markdown phong cách SOC Cyber Security Professional
    message_text := format(
        '🚨 *[PTIT SAAS SOC ALERTS]*' || CHR(10) ||
        '━━━━━━━━━━━━━━━━━━━━' || CHR(10) ||
        '🏢 *Tổ chức:* %s' || CHR(10) ||
        '🆔 *Tenant ID:* `%s`' || CHR(10) ||
        '🥷 *Đối tượng:* `%s`' || CHR(10) ||
        '🌐 *Địa chỉ IP:* `%s`' || CHR(10) ||
        '🔥 *Mức độ:* %s *%s*' || CHR(10) ||
        '🛡️ *Hành động:* `%s`' || CHR(10) ||
        '📝 *Thông tin:* _%s_',
        COALESCE(tenant_name, 'Hệ thống Trung tâm'),
        COALESCE(NEW.tenant_id::text, 'CENTRAL'),
        COALESCE(NEW.user_email, 'guest@anonymous'),
        COALESCE(NEW.ip_address::text, '127.0.0.1'),
        CASE 
          WHEN COALESCE(NEW.severity, 'HIGH') = 'CRITICAL' THEN '🟥'
          WHEN COALESCE(NEW.severity, 'HIGH') = 'HIGH' THEN '🟧'
          ELSE '🟨'
        END,
        COALESCE(NEW.severity, 'HIGH'),
        COALESCE(NEW.action, 'Access Violation'),
        COALESCE(NEW.details->>'reason', COALESCE(NEW.details->>'message', 'Phát hiện hành vi xâm nhập trái phép'))
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

-- 2. Hàm SOAR Active Defense Engine để tự động khoá tenant khi bị tấn công dồn dập
CREATE OR REPLACE FUNCTION soc_active_alert_trigger()
RETURNS TRIGGER AS $$
DECLARE
  recent_attack_count INT;
  is_already_suspended BOOLEAN := false;
BEGIN
  -- Bỏ qua nếu là log của hệ thống SOAR tự tạo để tránh vòng lặp đệ quy vô hạn
  IF NEW.user_email = 'soar@system.security' THEN
    RETURN NEW;
  END IF;

  -- Kiểm tra trạng thái hiện tại của Tenant trước
  IF NEW.tenant_id IS NOT NULL THEN
    SELECT (lifecycle_status = 'suspended')
    INTO is_already_suspended
    FROM public.tenants
    WHERE id = NEW.tenant_id;

    -- Nếu tenant đã bị khóa từ trước, không cần xử lý tiếp
    IF is_already_suspended THEN
      RETURN NEW;
    END IF;

    -- Chỉ kiểm tra khi log mới là một vi phạm an ninh nghiêm trọng
    IF NEW.action IN ('cross_tenant_violation', 'sql_injection_attempt', 'cache_pollution_attempt') OR NEW.severity = 'HIGH' THEN
      
      -- Đếm số lượng hành vi vi phạm tương tự của cùng một Tenant trong vòng 1 phút qua
      SELECT COUNT(*)
      INTO recent_attack_count
      FROM public.audit_logs
      WHERE tenant_id = NEW.tenant_id
        AND created_at >= NOW() - INTERVAL '1 minute'
        AND (action IN ('cross_tenant_violation', 'sql_injection_attempt', 'cache_pollution_attempt') OR severity = 'HIGH');

      -- Ngưỡng kích hoạt SOAR tự động khóa (từ 3 cuộc tấn công trở lên trong 1 phút)
      IF recent_attack_count >= 3 THEN
        -- A. Khóa Tenant ngay lập tức bằng cách đổi trạng thái sang 'suspended'
        UPDATE public.tenants
        SET lifecycle_status = 'suspended'
        WHERE id = NEW.tenant_id;

        -- B. Ghi nhận log sự kiện khóa tự động mức độ CRITICAL
        INSERT INTO public.audit_logs (
          tenant_id,
          user_email,
          action,
          table_name,
          record_id,
          severity,
          details,
          ip_address,
          user_agent
        ) VALUES (
          NEW.tenant_id,
          'soar@system.security',
          'tenant_auto_suspended',
          'tenants',
          NEW.tenant_id::text,
          'CRITICAL',
          jsonb_build_object(
            'reason', 'Hệ thống SOAR kích hoạt cơ chế phong tỏa tự động khẩn cấp do phát hiện ' || recent_attack_count || ' hành vi tấn công mạng dồn dập chỉ trong 1 phút.',
            'trigger_by_ip', NEW.ip_address,
            'attack_scenario', NEW.action
          ),
          NEW.ip_address,
          'SOAR Active Defense Engine'
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Gắn Trigger kiểm soát phản ứng SOAR sau khi INSERT log mới
DROP TRIGGER IF EXISTS trigger_soc_active_alert ON audit_logs;
CREATE TRIGGER trigger_soc_active_alert
AFTER INSERT ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION soc_active_alert_trigger();
