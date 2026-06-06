-- ==============================================================================
-- MIGRATION: Gia cố bảo mật Tenants & Củng cố SOAR chống Reverse DoS
-- Ngày: 2026-06-05
-- Học viên: Chăm Rốch Thi - PTIT Đồ án tốt nghiệp
-- ==============================================================================

-- Đảm bảo cột lifecycle_status tồn tại để tránh lỗi lệch schema khi chạy
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS lifecycle_status TEXT NOT NULL DEFAULT 'active';

-- ------------------------------------------------------------------------------
-- 1. HÀM RPC BẢO MẬT: LẤY CẤU HÌNH ROUTING & WHITELIST CỦA TENANT
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_tenant_routing_config(p_hostname text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant RECORD;
BEGIN
  -- Tìm kiếm tenant theo domain hoặc ID
  SELECT id, domain, lifecycle_status, modules_config->'security_settings'->>'ip_whitelist' as ip_whitelist
  INTO v_tenant
  FROM public.tenants
  WHERE domain = p_hostname OR id::text = p_hostname;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  RETURN jsonb_build_object(
    'id', v_tenant.id,
    'domain', v_tenant.domain,
    'lifecycle_status', v_tenant.lifecycle_status,
    'ip_whitelist', v_tenant.ip_whitelist
  );
END;
$$;

COMMENT ON FUNCTION public.get_tenant_routing_config IS 
'Hàm RPC bảo mật chạy dưới quyền SECURITY DEFINER giúp Middleware truy vấn cấu hình an ninh của Tenant mà không cần mở quyền SELECT cột modules_config nhạy cảm cho Anon.';

-- Cấp quyền thực thi cho các vai trò công khai và nặc danh
GRANT EXECUTE ON FUNCTION public.get_tenant_routing_config(text) TO anon, authenticated, postgres, service_role;

-- ------------------------------------------------------------------------------
-- 2. THU HỒI QUYỀN TRUY VẤN TRỰC TIẾP CỘT NHẠY CẢM modules_config CỦA ANON/AUTHENTICATED
-- ------------------------------------------------------------------------------
REVOKE SELECT (modules_config) ON public.tenants FROM anon, authenticated;
-- Đảm bảo chỉ cấp quyền đọc các cột thông tin không nhạy cảm cho các truy vấn trực tiếp qua REST API
GRANT SELECT (id, name, domain, lifecycle_status, created_at) ON public.tenants TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 3. GIA CỐ SOAR TRIGGER CHỐNG REVERSE DoS (ACCOUNT LOCKOUT THAY VÌ EDGE IP BLOCK CHO ADMIN)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.soc_active_alert_trigger()
RETURNS TRIGGER AS $$
DECLARE
  recent_attack_count INT;
  is_already_suspended BOOLEAN := false;
  v_whitelist_ip TEXT;
  v_is_whitelisted BOOLEAN := false;
  v_attacker_role TEXT;
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

    -- Kiểm tra xem IP hiện tại có thuộc whitelist của Tenant không
    SELECT modules_config->'security_settings'->>'ip_whitelist'
    INTO v_whitelist_ip
    FROM public.tenants
    WHERE id = NEW.tenant_id;

    IF v_whitelist_ip IS NOT NULL AND v_whitelist_ip <> '' AND v_whitelist_ip <> '127.0.0.1' THEN
      IF NEW.ip_address::text = v_whitelist_ip THEN
        v_is_whitelisted := TRUE;
      END IF;
    END IF;

    -- Chỉ kiểm tra khi log mới là một vi phạm an ninh nghiêm trọng
    -- hoặc có điểm rủi ro CRS cao (risk_score >= 75)
    IF NEW.action IN ('cross_tenant_violation', 'sql_injection_attempt', 'cache_pollution_attempt') 
       OR NEW.severity = 'CRITICAL' 
       OR COALESCE(NEW.risk_score, 0) >= 75 THEN
      
      -- Đếm số lượng hành vi vi phạm tương tự của cùng một IP/Tenant trong vòng 1 phút qua
      SELECT COUNT(*)
      INTO recent_attack_count
      FROM public.audit_logs
      WHERE tenant_id = NEW.tenant_id
        AND ip_address = NEW.ip_address
        AND created_at >= NOW() - INTERVAL '1 minute'
        AND (action IN ('cross_tenant_violation', 'sql_injection_attempt', 'cache_pollution_attempt') 
             OR severity = 'CRITICAL' 
             OR COALESCE(risk_score, 0) >= 75);

      -- Ngưỡng kích hoạt SOAR tự động khóa (từ 3 vi phạm trở lên của cùng 1 IP trong 1 phút)
      IF recent_attack_count >= 3 THEN
        
        -- Xác định vai trò (role) của tài khoản thực hiện hành vi vi phạm từ bảng user_roles
        SELECT role INTO v_attacker_role
        FROM public.user_roles
        WHERE user_id = (
          SELECT id FROM auth.users WHERE email = NEW.user_email LIMIT 1
        )
        LIMIT 1;

        -- BIỆN PHÁP CHỐNG REVERSE DoS: 
        -- Nếu kẻ tấn công giả mạo hoặc sử dụng tài khoản có quyền Admin, ta khóa tài khoản đó chứ không chặn IP diện rộng
        IF v_attacker_role IN ('super_admin', 'admin', 'tenant_admin') THEN
          -- Thực hiện khóa tài khoản tạm thời trong 1 giờ
          UPDATE auth.users 
          SET banned_until = clock_timestamp() + INTERVAL '1 hour'
          WHERE email = NEW.user_email;

          -- Ghi nhận log sự kiện khóa tài khoản kiểm soát
          INSERT INTO public.audit_logs (
            tenant_id,
            user_email,
            action,
            table_name,
            record_id,
            severity,
            details,
            ip_address,
            user_agent,
            risk_score
          ) VALUES (
            NEW.tenant_id,
            'soar@system.security',
            'user_account_locked_by_soar',
            'users',
            NEW.user_email,
            'CRITICAL',
            jsonb_build_object(
              'reason', 'SOAR kích hoạt cơ chế khóa tài khoản Admin tạm thời do phát hiện ' || recent_attack_count || ' hành vi vi phạm an ninh liên tiếp từ email này.',
              'locked_email', NEW.user_email,
              'trigger_by_ip', NEW.ip_address,
              'attack_scenario', NEW.action
            ),
            NEW.ip_address,
            'SOAR Active Defense Engine',
            100
          );

        ELSE
          -- Nếu là IP của người dùng bình thường hoặc nặc danh
          IF v_is_whitelisted THEN
            -- Tránh khóa nhầm IP whitelist, chỉ cảnh báo CRITICAL
            INSERT INTO public.audit_logs (
              tenant_id, user_email, action, table_name, record_id, severity, details, ip_address, user_agent, risk_score
            ) VALUES (
              NEW.tenant_id, 'soar@system.security', 'whitelist_ip_abuse_warning', 'tenants', NEW.tenant_id::text, 'CRITICAL',
              jsonb_build_object(
                'reason', 'CẢNH BÁO: Phát hiện ' || recent_attack_count || ' vi phạm liên tiếp từ IP Whitelist. Có nguy cơ giả mạo IP.',
                'trigger_by_ip', NEW.ip_address, 'attack_scenario', NEW.action
              ),
              NEW.ip_address, 'SOAR Active Defense Engine', 100
            );
          ELSE
            -- Chặn IP lạ ngoài whitelist tại Edge trong 24 giờ
            INSERT INTO public.blocked_ips (
              ip, tenant_id, blocked_until, reason
            ) VALUES (
              NEW.ip_address::text, NEW.tenant_id, clock_timestamp() + INTERVAL '24 hours',
              'Tự động chặn bởi SOAR do phát hiện ' || recent_attack_count || ' vi phạm an ninh liên tiếp trong 1 phút.'
            )
            ON CONFLICT (ip, tenant_id) 
            DO UPDATE SET 
              blocked_until = clock_timestamp() + INTERVAL '24 hours',
              reason = 'SOAR gia hạn chặn do tiếp tục phát hiện vi phạm.';

            -- Ghi nhận log sự kiện khóa IP tự động
            INSERT INTO public.audit_logs (
              tenant_id, user_email, action, table_name, record_id, severity, details, ip_address, user_agent, risk_score
            ) VALUES (
              NEW.tenant_id, 'soar@system.security', 'ip_blocked', 'blocked_ips', NEW.ip_address::text, 'HIGH',
              jsonb_build_object(
                'reason', 'SOAR kích hoạt cơ chế Edge-block chặn IP nguồn ' || NEW.ip_address || ' trong 24 giờ do phát hiện ' || recent_attack_count || ' vi phạm an ninh liên tiếp.',
                'blocked_ip', NEW.ip_address, 'attack_scenario', NEW.action
              ),
              NEW.ip_address, 'SOAR Active Defense Engine', 85
            );
          END IF;
        END IF;

      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
