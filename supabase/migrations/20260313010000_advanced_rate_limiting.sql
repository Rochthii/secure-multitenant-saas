-- Migration: Advanced Rate Limiting Infrastructure
-- Description: DB-backed rate limiting to prevent spam on public forms.

-- 1. Create the rate limit hits table
CREATE TABLE IF NOT EXISTS public.rate_limit_hits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT NOT NULL,
    action_type TEXT NOT NULL,
    hit_count INTEGER DEFAULT 1,
    last_hit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by IP and Action
CREATE INDEX IF NOT EXISTS idx_rate_limit_ip_action ON public.rate_limit_hits(ip_address, action_type);

-- 2. Stored Procedure to check and increment rate limit
-- Returns TRUE if the hit is ALLOWED (not limited)
-- Returns FALSE if the hit is BLOCKED (rate limited)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_ip TEXT,
    p_action TEXT,
    p_max_hits INTEGER,
    p_window_seconds INTEGER,
    p_tenant_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to update rate_limit_hits
AS $$
DECLARE
    v_current_count INTEGER;
    v_last_hit TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current stats for this IP and Action
    SELECT hit_count, last_hit INTO v_current_count, v_last_hit
    FROM public.rate_limit_hits
    WHERE ip_address = p_ip AND action_type = p_action AND (p_tenant_id IS NULL OR tenant_id = p_tenant_id)
    FOR UPDATE; -- Lock the row for consistency

    IF NOT FOUND THEN
        -- First hit ever for this IP/Action
        INSERT INTO public.rate_limit_hits (ip_address, action_type, hit_count, last_hit, tenant_id)
        VALUES (p_ip, p_action, 1, NOW(), p_tenant_id);
        RETURN TRUE;
    END IF;

    -- Check if we are outside the window
    IF v_last_hit < (NOW() - (p_window_seconds || ' seconds')::INTERVAL) THEN
        -- Reset count for New Window
        UPDATE public.rate_limit_hits
        SET hit_count = 1, last_hit = NOW()
        WHERE ip_address = p_ip AND action_type = p_action AND (p_tenant_id IS NULL OR tenant_id = p_tenant_id);
        RETURN TRUE;
    END IF;

    -- Inside window, check limit
    IF v_current_count >= p_max_hits THEN
        -- Rate Limited!
        RETURN FALSE;
    ELSE
        -- Increment hit
        UPDATE public.rate_limit_hits
        SET hit_count = v_current_count + 1, last_hit = NOW()
        WHERE ip_address = p_ip AND action_type = p_action AND (p_tenant_id IS NULL OR tenant_id = p_tenant_id);
        RETURN TRUE;
    END IF;
END;
$$;

-- 3. Security: RLS for rate_limit_hits
-- Usually, only the system (service_role/admin) should access this table.
ALTER TABLE public.rate_limit_hits ENABLE ROW LEVEL SECURITY;

-- Deny all public access, allow service_role and postgres
CREATE POLICY "System only access" ON public.rate_limit_hits
    FOR ALL TO service_role USING (true);

-- 4. Cleanup Trigger: Automatically remove old rate limit records (e.g., older than 24h)
-- This keeps the table size small.
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS VOID
LANGUAGE sql
AS $$
    DELETE FROM public.rate_limit_hits WHERE last_hit < NOW() - INTERVAL '24 hours';
$$;

-- Note: In a real production system, you'd call cleanup_old_rate_limits via pg_cron 
-- or a scheduled background worker.
