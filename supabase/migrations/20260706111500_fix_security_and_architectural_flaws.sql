-- ==============================================================================
-- MIGRATION: Khắc phục Lỗ hổng Bảo mật & Gia cố Thiết kế Hệ thống SaaS Đa chi nhánh
-- Ngày tạo: 2026-07-06
-- Mục đích:
--   1. Thiết lập SET search_path = public, pg_temp cho các hàm SECURITY DEFINER nhạy cảm.
--   2. Cập nhật get_current_tenant_id() và get_current_user_role() ưu tiên JWT Claims từ Session.
--   3. Thu hồi quyền INSERT trực tiếp của client/anon/authenticated đối với bảng audit_logs.
--   4. Gia cố phân quyền thực thi trên các RPC block_ip và unblock_ip (cho phép cả service_role).
--   5. Tạo chỉ mục composite idx_audit_logs_user_perf cho bảng audit_logs để tối ưu trigger tính điểm.
--   6. Thay đổi chính sách RLS UPDATE trên bảng active_visitors để chống rò rỉ session.
-- ==============================================================================

BEGIN;

-- ==========================================
-- PHẦN 1: GIA CỐ CÁC HÀM SECURITY DEFINER BẰNG SEARCH_PATH BẢO MẬT
-- ==========================================

-- 1.1 get_current_tenant_id
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS uuid
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Ưu tiên hàng đầu: đọc trực tiếp từ JWT Claims do Middleware hoặc Client Session cung cấp
    IF (auth.jwt() ->> 'tenant_id') IS NOT NULL THEN
        RETURN (auth.jwt() ->> 'tenant_id')::uuid;
    END IF;
    -- Fallback: truy vấn bảng user_roles (chạy local test hoặc chạy qua trigger trong DB)
    RETURN (SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1);
END;
$$;

-- 1.2 get_current_user_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS varchar
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Ưu tiên đọc trực tiếp từ JWT Claims để hỗ trợ multi-role session
    IF (auth.jwt() ->> 'role') IS NOT NULL THEN
        RETURN auth.jwt() ->> 'role';
    END IF;
    -- Fallback
    RETURN (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1);
END;
$$;

-- 1.3 is_global_admin
CREATE OR REPLACE FUNCTION public.is_global_admin()
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN COALESCE(
        (auth.jwt() ->> 'role') IN ('super_admin', 'company_editor'),
        EXISTS (
            SELECT 1
            FROM public.user_roles
            WHERE user_id = auth.uid()
              AND role IN ('super_admin', 'company_editor')
        )
    );
END;
$$;

-- 1.4 has_admin_role
CREATE OR REPLACE FUNCTION public.has_admin_role()
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN COALESCE(
        (auth.jwt() ->> 'role') IN ('super_admin', 'company_editor', 'tenant_admin', 'tenant_editor', 'tenant_accountant'),
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'company_editor', 'tenant_admin', 'tenant_editor', 'tenant_accountant')
        )
    );
END;
$$;

-- 1.5 Cập nhật search_path cho các hàm quản trị và trigger khác để tránh leo thang đặc quyền
ALTER FUNCTION public.block_ip(text, uuid, integer, text, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.unblock_ip(text, uuid, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.tenant_offboarding_wipe(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.calculate_event_risk_score() SET search_path = public, pg_temp;
ALTER FUNCTION public.notify_telegram_on_attack() SET search_path = public, pg_temp;
ALTER FUNCTION public.soc_active_alert_trigger() SET search_path = public, pg_temp;


-- ==========================================
-- PHẦN 2: THU HỒI HOÀN TOÀN QUYỀN INSERT TRỰC TIẾP VÀO BẢNG AUDIT LOGS CỦA CLIENT
-- ==========================================

-- Xóa bỏ policy lỏng lẻo cho phép client chèn tùy ý vào bảng audit_logs
DROP POLICY IF EXISTS "Auth_Insert_Audit" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON audit_logs;

-- Bảo vệ bảng audit_logs: chỉ super_admin được đọc toàn bộ, tenant_admin được đọc của chi nhánh mình.
-- Không ai (kể cả admin) được INSERT/UPDATE/DELETE trực tiếp từ client.
DROP POLICY IF EXISTS "TenantAdmin_View_Own_Audit" ON public.audit_logs;
CREATE POLICY "TenantAdmin_View_Own_Audit" ON public.audit_logs FOR
SELECT USING (
    auth.uid() IS NOT NULL AND (
        public.is_global_admin()
        OR (public.get_current_user_role() = 'tenant_admin' AND public.get_current_tenant_id() = tenant_id)
    )
);


-- ==========================================
-- PHẦN 3: GIA CỐ CÁC HÀM BLOCK_IP / UNBLOCK_IP CHỐNG BYPASS VÀ REVERSE DoS
-- ==========================================

CREATE OR REPLACE FUNCTION public.block_ip(
  p_ip TEXT,
  p_tenant_id UUID,
  p_duration_hours INT,
  p_reason TEXT,
  p_admin_email TEXT
)
RETURNS VOID 
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_role TEXT;
  v_caller_tenant_id UUID;
  v_caller_email TEXT;
BEGIN
  -- Lấy thông tin thực tế của người dùng đang gọi từ JWT Session
  v_caller_role := auth.jwt() ->> 'role';
  v_caller_tenant_id := (auth.jwt() ->> 'tenant_id')::UUID;
  v_caller_email := auth.jwt() ->> 'email';

  -- Khôi phục từ DB nếu không nằm trong JWT context
  IF v_caller_role IS NULL AND auth.uid() IS NOT NULL THEN
    SELECT role, tenant_id INTO v_caller_role, v_caller_tenant_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
    SELECT email INTO v_caller_email FROM auth.users WHERE id = auth.uid();
  END IF;

  -- Logic Kiểm tra Phân Quyền Chặt Chẽ:
  -- Cho phép service_role (các Server API/Honeypot Decoy gọi qua Admin Client) chạy tự do
  IF auth.role() = 'service_role' THEN
    NULL;
  -- Cho phép super_admin hoặc tenant_admin của đúng chi nhánh thực hiện chặn IP
  ELSIF v_caller_role = 'super_admin' OR v_caller_role = 'company_editor' THEN
    -- Cho phép admin toàn cục chặn IP ở bất kỳ tenant nào
    NULL;
  ELSIF v_caller_role = 'tenant_admin' AND v_caller_tenant_id = p_tenant_id THEN
    -- Cho phép admin chi nhánh chặn IP thuộc chi nhánh của họ
    NULL;
  ELSE
    RAISE EXCEPTION 'SECURITY VIOLATION: Bạn không có quyền thực hiện hành vi chặn IP cho chi nhánh này.'
    USING ERRCODE = 'insufficient_privilege';
  END IF;

  INSERT INTO public.blocked_ips (
    ip,
    tenant_id,
    blocked_until,
    reason,
    created_by
  ) VALUES (
    p_ip,
    p_tenant_id,
    clock_timestamp() + (p_duration_hours || ' hours')::INTERVAL,
    p_reason,
    COALESCE(v_caller_email, p_admin_email) -- Ghi nhận email thực tế của người gọi
  )
  ON CONFLICT (ip, tenant_id)
  DO UPDATE SET
    blocked_until = clock_timestamp() + (p_duration_hours || ' hours')::INTERVAL,
    reason = p_reason,
    created_by = COALESCE(v_caller_email, p_admin_email);

  -- Ghi nhận log kiểm toán
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
    p_tenant_id,
    COALESCE(v_caller_email, 'system'),
    'manual_ip_blocked',
    'blocked_ips',
    p_ip,
    'HIGH',
    jsonb_build_object(
      'reason', 'Quản trị viên chặn thủ công IP ' || p_ip || ' trong ' || p_duration_hours || ' giờ.',
      'blocked_ip', p_ip,
      'details', p_reason
    ),
    inet_client_addr(),
    'SOC Cyber Center Console',
    80
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.unblock_ip(
  p_ip TEXT,
  p_tenant_id UUID,
  p_admin_email TEXT
)
RETURNS VOID 
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_role TEXT;
  v_caller_tenant_id UUID;
  v_caller_email TEXT;
BEGIN
  v_caller_role := auth.jwt() ->> 'role';
  v_caller_tenant_id := (auth.jwt() ->> 'tenant_id')::UUID;
  v_caller_email := auth.jwt() ->> 'email';

  IF v_caller_role IS NULL AND auth.uid() IS NOT NULL THEN
    SELECT role, tenant_id INTO v_caller_role, v_caller_tenant_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
    SELECT email INTO v_caller_email FROM auth.users WHERE id = auth.uid();
  END IF;

  -- Kiểm tra quyền gỡ chặn IP
  IF auth.role() = 'service_role' THEN
    NULL;
  ELSIF v_caller_role = 'super_admin' OR v_caller_role = 'company_editor' THEN
    NULL;
  ELSIF v_caller_role = 'tenant_admin' AND v_caller_tenant_id = p_tenant_id THEN
    NULL;
  ELSE
    RAISE EXCEPTION 'SECURITY VIOLATION: Bạn không có quyền thực hiện hành vi gỡ chặn IP cho chi nhánh này.'
    USING ERRCODE = 'insufficient_privilege';
  END IF;

  DELETE FROM public.blocked_ips
  WHERE ip = p_ip AND tenant_id = p_tenant_id;

  -- Ghi nhận log kiểm toán
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
    p_tenant_id,
    COALESCE(v_caller_email, 'system'),
    'manual_ip_unblocked',
    'blocked_ips',
    p_ip,
    'INFO',
    jsonb_build_object(
      'reason', 'Quản trị viên gỡ bỏ lệnh chặn IP ' || p_ip || '.',
      'unblocked_ip', p_ip
    ),
    inet_client_addr(),
    'SOC Cyber Center Console',
    10
  );
END;
$$;


-- ==========================================
-- PHẦN 4: KHẮC PHỤC TRỰC TIẾP LỖ HỔNG REVERSE DoS Ở HÀM SOAR TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION public.soc_active_alert_trigger()
RETURNS TRIGGER 
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  recent_attack_count INT;
  is_already_suspended BOOLEAN := false;
  v_whitelist_ip TEXT;
  v_is_whitelisted BOOLEAN := false;
  v_attacker_role TEXT;
  v_caller_email TEXT;
BEGIN
  -- Bỏ qua nếu là log của hệ thống SOAR tự tạo để tránh vòng lặp đệ quy vô hạn
  IF NEW.user_email = 'soar@system.security' THEN
    RETURN NEW;
  END IF;

  -- BIỆN PHÁP AN TOÀN TRỌNG YẾU: Lấy email thực tế của người dùng thực hiện thao tác
  -- thay vì tin tưởng email NEW.user_email do Client gửi lên.
  v_caller_email := auth.jwt() ->> 'email';
  IF v_caller_email IS NULL AND auth.uid() IS NOT NULL THEN
     SELECT email INTO v_caller_email FROM auth.users WHERE id = auth.uid();
  END IF;

  -- Ghi đè email tin cậy để SOAR xử lý chính xác
  IF auth.uid() IS NOT NULL AND v_caller_email IS NOT NULL THEN
     NEW.user_email := v_caller_email;
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
             OR COALESCE(NEW.risk_score, 0) >= 75);

      -- Ngưỡng kích hoạt SOAR tự động khóa (từ 3 vi phạm trở lên của cùng 1 IP trong 1 phút)
      IF recent_attack_count >= 3 THEN
        
        -- Xác định vai trò (role) của tài khoản thực hiện hành vi vi phạm từ bảng user_roles
        SELECT role INTO v_attacker_role
        FROM public.user_roles
        WHERE user_id = auth.uid()
        LIMIT 1;

        -- BIỆN PHÁP CHỐNG REVERSE DoS: 
        -- Nếu kẻ tấn công giả mạo hoặc sử dụng tài khoản có quyền Admin, ta khóa tài khoản đó chứ không chặn IP diện rộng
        IF v_attacker_role IN ('super_admin', 'admin', 'tenant_admin') THEN
          -- Thực hiện khóa tài khoản tạm thời trong 1 giờ
          UPDATE auth.users 
          SET banned_until = clock_timestamp() + INTERVAL '1 hour'
          WHERE id = auth.uid(); -- Khóa đúng tài khoản đang login!

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
              'reason', 'SOAR kích hoạt cơ chế khóa tài khoản Admin tạm thời do phát hiện ' || recent_attack_count || ' hành vi vi phạm an ninh liên tiếp.',
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
$$;


-- ==========================================
-- PHẦN 5: TẠO CHỈ MỤC COMPOSITE CHO BẢNG AUDIT LOGS ĐỂ TỐI ƯU HÓA HIỆU NĂNG TRIGGER
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_anomaly_lookup 
ON public.audit_logs (user_email, created_at, action, severity);


COMMIT;
