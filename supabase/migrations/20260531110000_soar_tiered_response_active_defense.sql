-- ==============================================================================
-- MIGRATION: Phản ứng Phân tầng SOAR (Tiered SOAR Response) - Đồ án tốt nghiệp PTIT
-- ==============================================================================

-- 1. Tạo bảng lưu trữ danh sách IP bị chặn
CREATE TABLE IF NOT EXISTS public.blocked_ips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip TEXT NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    blocked_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    blocked_until TIMESTAMPTZ NOT NULL,
    reason TEXT,
    created_by TEXT DEFAULT 'SOAR Active Defense Engine',
    CONSTRAINT unique_ip_per_tenant UNIQUE (ip, tenant_id)
);

COMMENT ON TABLE public.blocked_ips IS 'Danh sách các địa chỉ IP bị chặn truy cập theo từng chi nhánh (tenant)';

-- Index cho truy vấn nhanh
CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip ON public.blocked_ips(ip);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_lookup ON public.blocked_ips(ip, tenant_id);

-- 2. Thiết lập Row-Level Security (RLS) cho bảng blocked_ips
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cho phép đọc danh sách IP bị chặn theo tenant" ON public.blocked_ips;
CREATE POLICY "Cho phép đọc danh sách IP bị chặn theo tenant" ON public.blocked_ips
    FOR SELECT
    USING (
        (auth.uid() IS NOT NULL AND (
            (auth.jwt() ->> 'tenant_id')::UUID = tenant_id
            OR
            (auth.jwt() ->> 'role') = 'super_admin'
        ))
        OR
        (auth.role() = 'anon')
    );

DROP POLICY IF EXISTS "Cho phép Super Admin quản lý IP bị chặn" ON public.blocked_ips;
CREATE POLICY "Cho phép Super Admin quản lý IP bị chặn" ON public.blocked_ips
    FOR ALL
    USING (
        (auth.jwt() ->> 'role') = 'super_admin'
    );

GRANT ALL ON public.blocked_ips TO postgres, service_role;
GRANT SELECT ON public.blocked_ips TO authenticated, anon;

-- 3. Định nghĩa lại hàm SOAR Active Defense Engine để thực hiện Phản ứng Phân tầng
CREATE OR REPLACE FUNCTION public.soc_active_alert_trigger()
RETURNS TRIGGER AS $$
DECLARE
  recent_attack_count INT;
  is_already_suspended BOOLEAN := false;
  v_whitelist_ip TEXT;
  v_is_whitelisted BOOLEAN := false;
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
      
      -- Đếm số lượng hành vi vi phạm tương tự của cùng một IP trong vòng 1 phút qua
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
        -- Nếu IP thuộc whitelist, chúng ta KHÔNG khóa IP (tránh khóa nhầm admin)
        -- Thay vào đó, gửi cảnh báo mức độ CRITICAL và Telegram cảnh báo khẩn cấp
        IF v_is_whitelisted THEN
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
            'whitelist_ip_abuse_warning',
            'tenants',
            NEW.tenant_id::text,
            'CRITICAL',
            jsonb_build_object(
              'reason', 'CẢNH BÁO KHẨN CẤP: Phát hiện ' || recent_attack_count || ' vi phạm liên tiếp từ IP nằm trong WHITELIST của Tenant. Có nguy cơ tài khoản admin bị chiếm đoạt hoặc giả mạo IP.',
              'trigger_by_ip', NEW.ip_address,
              'attack_scenario', NEW.action
            ),
            NEW.ip_address,
            'SOAR Active Defense Engine',
            100
          );
        ELSE
          -- Nếu là IP lạ ngoài whitelist -> Tự động CHẶN IP tại Edge trong 24 giờ
          INSERT INTO public.blocked_ips (
            ip,
            tenant_id,
            blocked_until,
            reason
          ) VALUES (
            NEW.ip_address::text,
            NEW.tenant_id,
            clock_timestamp() + INTERVAL '24 hours',
            'Tự động chặn bởi SOAR do phát hiện ' || recent_attack_count || ' vi phạm an ninh liên tiếp trong 1 phút.'
          )
          ON CONFLICT (ip, tenant_id) 
          DO UPDATE SET 
            blocked_until = clock_timestamp() + INTERVAL '24 hours',
            reason = 'SOAR gia hạn chặn do tiếp tục phát hiện vi phạm.';

          -- Ghi nhận log sự kiện khóa IP tự động
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
            'ip_blocked',
            'blocked_ips',
            NEW.ip_address::text,
            'HIGH',
            jsonb_build_object(
              'reason', 'SOAR kích hoạt cơ chế Edge-block chặn IP nguồn ' || NEW.ip_address || ' trong 24 giờ do phát hiện ' || recent_attack_count || ' vi phạm an ninh liên tiếp.',
              'blocked_ip', NEW.ip_address,
              'attack_scenario', NEW.action
            ),
            NEW.ip_address,
            'SOAR Active Defense Engine',
            85
          );
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Hàm RPC để Admin block IP thủ công
CREATE OR REPLACE FUNCTION public.block_ip(
  p_ip TEXT,
  p_tenant_id UUID,
  p_duration_hours INT,
  p_reason TEXT,
  p_admin_email TEXT
)
RETURNS VOID AS $$
BEGIN
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
    p_admin_email
  )
  ON CONFLICT (ip, tenant_id)
  DO UPDATE SET
    blocked_until = clock_timestamp() + (p_duration_hours || ' hours')::INTERVAL,
    reason = p_reason,
    created_by = p_admin_email;

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
    p_admin_email,
    'manual_ip_blocked',
    'blocked_ips',
    p_ip,
    'HIGH',
    jsonb_build_object(
      'reason', 'Quản trị viên chặn thủ công IP ' || p_ip || ' trong ' || p_duration_hours || ' giờ.',
      'blocked_ip', p_ip,
      'details', p_reason
    ),
    '127.0.0.1',
    'SOC Cyber Center Console',
    80
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hàm RPC để Admin mở khóa IP thủ công (Unblock)
CREATE OR REPLACE FUNCTION public.unblock_ip(
  p_ip TEXT,
  p_tenant_id UUID,
  p_admin_email TEXT
)
RETURNS VOID AS $$
BEGIN
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
    p_admin_email,
    'manual_ip_unblocked',
    'blocked_ips',
    p_ip,
    'INFO',
    jsonb_build_object(
      'reason', 'Quản trị viên gỡ bỏ lệnh chặn IP ' || p_ip || '.',
      'unblocked_ip', p_ip
    ),
    '127.0.0.1',
    'SOC Cyber Center Console',
    10
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.block_ip(TEXT, UUID, INT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unblock_ip(TEXT, UUID, TEXT) TO authenticated;
