-- ==============================================================================
-- MIGRATION: Động cơ Phát hiện Bất thường Lai (HBCAD Engine) - Đồ án tốt nghiệp PTIT
-- ==============================================================================

-- 1. Bổ sung cột risk_score vào bảng audit_logs
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0;

COMMENT ON COLUMN public.audit_logs.risk_score IS 'Điểm số Rủi ro Tích lũy (0-100) tính toán bởi HBCAD Engine';

-- 2. Tạo bảng lưu trữ baselines tần suất hoạt động của User
CREATE TABLE IF NOT EXISTS public.user_activity_baselines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT UNIQUE NOT NULL,
    avg_hourly_actions DOUBLE PRECISION DEFAULT 5.0,
    stddev_hourly_actions DOUBLE PRECISION DEFAULT 2.0,
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

COMMENT ON TABLE public.user_activity_baselines IS 'Baseline tần suất hoạt động trung bình hàng giờ của từng User phục vụ tính toán Z-Score';

-- 3. Hàm tính toán Điểm Rủi ro Lai thời gian thực (HBCAD scoring)
CREATE OR REPLACE FUNCTION public.calculate_event_risk_score()
RETURNS TRIGGER AS $$
DECLARE
    v_bcr DOUBLE PRECISION := 0.0;
    v_severity_weight DOUBLE PRECISION := 1.0;
    v_temporal_multiplier DOUBLE PRECISION := 1.0;
    v_network_multiplier DOUBLE PRECISION := 1.0;
    
    v_z_score DOUBLE PRECISION := 0.0;
    v_avg DOUBLE PRECISION := 5.0;
    v_stddev DOUBLE PRECISION := 2.0;
    v_hourly_count INT := 0;
    
    v_spp INT := 0;
    v_recent_rls_violations INT := 0;
    v_recent_deletes INT := 0;
    v_recent_selects INT := 0;
    
    v_final_risk INT := 0;
    v_is_whitelisted BOOLEAN := FALSE;
    v_whitelist_ip TEXT;
BEGIN
    -- Tránh tính điểm cho log do SOAR tự tạo để không bị méo số liệu
    IF NEW.user_email = 'soar@system.security' THEN
        NEW.risk_score := 100; -- SOAR suspend event luôn là High Alert
        NEW.severity := 'CRITICAL';
        RETURN NEW;
    END IF;

    -- ==============================================================================
    -- PHA 1: TÍNH TOÁN BASE CONTEXT RISK (BCR) - Dựa trên Luật Ngữ cảnh ABAC
    -- ==============================================================================
    
    -- A. Trọng số mức độ của hành động (Severity Weight)
    IF NEW.action = 'delete' THEN
        v_severity_weight := 10.0;
    ELSIF NEW.action IN ('insert', 'update') THEN
        v_severity_weight := 3.0;
    ELSIF NEW.action IN ('cross_tenant_violation', 'sql_injection_attempt', 'cache_pollution_attempt') THEN
        v_severity_weight := 25.0;
    ELSE
        v_severity_weight := 1.0; -- Mặc định 'select' hoặc các hành động đọc khác
    END IF;
    
    -- B. Hệ số thời gian giao dịch (Temporal Multiplier)
    -- Ngoài giờ hành chính (từ 18h00 tối đến 8h00 sáng hôm sau) nhân hệ số phạt x2.5
    IF EXTRACT(HOUR FROM clock_timestamp()) >= 18 OR EXTRACT(HOUR FROM clock_timestamp()) < 8 THEN
        v_temporal_multiplier := 2.5;
    ELSE
        v_temporal_multiplier := 1.0;
    END IF;
    
    -- C. Hệ số ranh giới mạng (Network Multiplier)
    -- Phạt hệ số x3.5 nếu truy cập từ IP lạ không cấu hình trong whitelist của Tenant
    IF NEW.tenant_id IS NOT NULL AND NEW.ip_address IS NOT NULL THEN
        SELECT modules_config->'security_settings'->>'ip_whitelist'
        INTO v_whitelist_ip
        FROM public.tenants
        WHERE id = NEW.tenant_id;
        
        IF v_whitelist_ip IS NOT NULL AND v_whitelist_ip <> '' AND v_whitelist_ip <> '127.0.0.1' THEN
            IF NEW.ip_address::text = v_whitelist_ip THEN
                v_is_whitelisted := TRUE;
            END IF;
        ELSE
            v_is_whitelisted := TRUE; -- Bypass nếu tenant không bật cấu hình whitelist hoặc đang chạy local loopback
        END IF;
    ELSE
        v_is_whitelisted := TRUE; -- Mặc định bỏ qua nếu không có Tenant ID
    END IF;
    
    IF NOT v_is_whitelisted THEN
        v_network_multiplier := 3.5;
    ELSE
        v_network_multiplier := 1.0;
    END IF;
    
    v_bcr := v_severity_weight * v_temporal_multiplier * v_network_multiplier;
    
    -- ==============================================================================
    -- PHA 2: TÍNH TOÁN BEHAVIORAL DEVIATION (Z-SCORE) - Độ lệch chuẩn tần suất lịch sử
    -- ==============================================================================
    IF NEW.user_email IS NOT NULL AND NEW.user_email <> 'system' THEN
        -- Truy xuất baseline cá nhân của User
        SELECT avg_hourly_actions, stddev_hourly_actions
        INTO v_avg, v_stddev
        FROM public.user_activity_baselines
        WHERE user_email = NEW.user_email;
        
        -- Nếu là User mới chưa có baseline hành vi, tự tạo baseline mặc định khởi tạo
        IF NOT FOUND THEN
            INSERT INTO public.user_activity_baselines (user_email, avg_hourly_actions, stddev_hourly_actions)
            VALUES (NEW.user_email, 5.0, 2.0)
            ON CONFLICT (user_email) DO NOTHING;
            v_avg := 5.0;
            v_stddev := 2.0;
        END IF;
        
        -- Đếm số lượng hành động thực tế của User trong 1 giờ qua
        SELECT COUNT(*)
        INTO v_hourly_count
        FROM public.audit_logs
        WHERE user_email = NEW.user_email
          AND created_at >= clock_timestamp() - INTERVAL '1 hour';
          
        -- Cộng thêm 1 cho hành động hiện tại sắp chèn
        v_hourly_count := v_hourly_count + 1;
        
        -- Tính toán Z-score để định lượng độ bất thường
        IF v_hourly_count > v_avg THEN
            IF v_stddev > 0.0 THEN
                v_z_score := (v_hourly_count - v_avg) / v_stddev;
            ELSE
                v_z_score := 1.0;
            END IF;
        END IF;
    END IF;
    
    -- Giới hạn hệ số nhân Z-Score tối đa x5.0 để tránh bùng nổ điểm số đột biến
    IF v_z_score > 5.0 THEN
        v_z_score := 5.0;
    END IF;
    
    -- ==============================================================================
    -- PHA 3: TÍNH TOÁN SEQUENTIAL PATTERN PENALTY (SPP) - Cộng phạt chuỗi nguy hiểm
    -- ==============================================================================
    IF NEW.user_email IS NOT NULL AND NEW.user_email <> 'system' THEN
        -- A. Phát hiện dò quét xâm nhập RLS (RLS Violations chuỗi 1 phút)
        SELECT COUNT(*)
        INTO v_recent_rls_violations
        FROM public.audit_logs
        WHERE user_email = NEW.user_email
          AND action IN ('cross_tenant_violation', 'sql_injection_attempt')
          AND created_at >= clock_timestamp() - INTERVAL '1 minute';
          
        IF v_recent_rls_violations >= 2 THEN -- tính cả log hiện tại sẽ là 3
            v_spp := v_spp + 50;
        END IF;
        
        -- B. Phát hiện chuỗi xoá phá hoại dữ liệu (DELETE chuỗi 10 giây)
        SELECT COUNT(*)
        INTO v_recent_deletes
        FROM public.audit_logs
        WHERE user_email = NEW.user_email
          AND action = 'delete'
          AND created_at >= clock_timestamp() - INTERVAL '10 seconds';
          
        IF v_recent_deletes >= 2 THEN
            v_spp := v_spp + 60;
        END IF;
        
        -- C. Phát hiện càn quét trích xuất thông tin (SELECT chuỗi 5 giây)
        SELECT COUNT(*)
        INTO v_recent_selects
        FROM public.audit_logs
        WHERE user_email = NEW.user_email
          AND action = 'select'
          AND created_at >= clock_timestamp() - INTERVAL '5 seconds';
          
        IF v_recent_selects >= 4 THEN
            v_spp := v_spp + 40;
        END IF;
    END IF;
    
    -- ==============================================================================
    -- PHA 4: TỔNG HỢP VÀ KIỂM SOÁT ĐẦU RA
    -- ==============================================================================
    v_final_risk := ROUND(v_bcr * (1.0 + v_z_score) + v_spp);
    
    -- Giới hạn trị số điểm rủi ro CRS trong khoảng [0, 100]
    IF v_final_risk > 100 THEN
        v_final_risk := 100;
    ELSIF v_final_risk < 0 THEN
        v_final_risk := 0;
    END IF;
    
    -- Ghi đè các cột thuộc tính của log
    NEW.risk_score := v_final_risk;
    
    -- Nâng cấp động mức độ cảnh báo (severity) dựa trên điểm số rủi ro CRS
    IF v_final_risk >= 75 THEN
        NEW.severity := 'CRITICAL';
    ELSIF v_final_risk >= 35 THEN
        NEW.severity := 'WARNING';
    ELSE
        IF NEW.severity IS NULL OR NEW.severity = 'INFO' THEN
            NEW.severity := 'INFO';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Gắn trigger chạy BEFORE INSERT trên audit_logs
DROP TRIGGER IF EXISTS trg_calculate_audit_log_risk ON public.audit_logs;
CREATE TRIGGER trg_calculate_audit_log_risk
BEFORE INSERT ON public.audit_logs
FOR EACH ROW
EXECUTE FUNCTION public.calculate_event_risk_score();

GRANT SELECT ON public.user_activity_baselines TO authenticated, anon;
