-- Migration: Hotfix Rate Limit for Logged-In Users
-- Description: Adds missing columns and updates check_rate_limit function

BEGIN;

-- 1. Bổ sung cột cho bảng rate_limit_hits (nếu chưa có)
ALTER TABLE public.rate_limit_hits 
ADD COLUMN IF NOT EXISTS identifier TEXT;

ALTER TABLE public.rate_limit_hits 
ADD COLUMN IF NOT EXISTS action TEXT;

-- Đồng bộ dữ liệu cũ (chỉ cập nhật các row có action_type)
UPDATE public.rate_limit_hits 
SET identifier = COALESCE(identifier, ip_address),
    action     = COALESCE(action, action_type)
WHERE identifier IS NULL OR action IS NULL;

-- Tạo index
CREATE INDEX IF NOT EXISTS idx_rate_limit_hits_identifier_action
    ON public.rate_limit_hits(identifier, action, created_at DESC);


-- 2. Xóa các hàm check_rate_limit cũ để tránh conflict
DROP FUNCTION IF EXISTS public.check_rate_limit(text, text, int, int, uuid);
DROP FUNCTION IF EXISTS public.check_rate_limit(text, text, int, int, text, text);

-- 3. Tạo lại hàm check_rate_limit mới hõ trợ User_ID
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_ip             TEXT,
    p_action         TEXT,
    p_max_hits       INT,
    p_window_seconds INT,
    p_tenant_id      TEXT    DEFAULT NULL,
    p_user_id        TEXT    DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count     INT;
    v_key       TEXT;
    v_window    INTERVAL;
    v_tenant_uuid UUID;
BEGIN
    v_window := (p_window_seconds || ' seconds')::INTERVAL;
    v_key := COALESCE(p_user_id, p_ip);
    
    -- Parse tenant_id sang UUID nếu hợp lệ
    IF p_tenant_id IS NOT NULL AND p_tenant_id <> '' THEN
        BEGIN
            v_tenant_uuid := p_tenant_id::UUID;
        EXCEPTION WHEN OTHERS THEN
            v_tenant_uuid := NULL;
        END;
    END IF;

    DELETE FROM public.rate_limit_hits
    WHERE action = p_action
      AND identifier = v_key
      AND created_at < NOW() - v_window;

    SELECT COUNT(*) INTO v_count
    FROM public.rate_limit_hits
    WHERE action     = p_action
      AND identifier = v_key
      AND created_at > NOW() - v_window;

    IF v_count >= p_max_hits THEN
        RETURN FALSE;
    END IF;

    INSERT INTO public.rate_limit_hits (
        identifier, action, tenant_id, created_at, ip_address, action_type
    ) VALUES (
        v_key, p_action, v_tenant_uuid, NOW(), COALESCE(p_ip, '0.0.0.0'), p_action
    );

    RETURN TRUE;
END;
$$;

-- GRANT removed: dharma_ai_role không tồn tại trong dự án này (đã tách riêng AI)
-- Function vẫn accessible qua service_role và authenticated role

COMMIT;
