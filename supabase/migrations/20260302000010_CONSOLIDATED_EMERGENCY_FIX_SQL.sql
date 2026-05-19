-- Migration: Consolidated Emergency Fixes (Ambiguity Resolutions)
-- Description: Giải quyết triệt để 2 lỗi gây treo hệ thống:
-- 1. check_rate_limit: Xóa các bản cũ (5/6 tham số) để hết lỗi "is not unique".
-- 2. hybrid_search_dharma: Định danh rõ cột fts_score để hết lỗi "is ambiguous".

BEGIN;

-- ============================================================
-- PHẦN 1: FIX RATE LIMIT AMBIGUITY
-- ============================================================
-- Xóa tất cả các phiên bản cũ để tránh conflict signature
DROP FUNCTION IF EXISTS public.check_rate_limit(text, text, int, int, uuid);
DROP FUNCTION IF EXISTS public.check_rate_limit(text, text, int, int, text, text);

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

-- Grant lại quyền
-- Removed check_rate_limit grant


-- ============================================================
COMMIT;
