-- ISO 27017 Security Hardening
-- Creates an RPC function to dynamically calculate RLS coverage across public tables.
-- Returns: protected (number of tables with RLS enabled), total (total public tables), percentage (%).

DROP FUNCTION IF EXISTS get_rls_coverage();

CREATE OR REPLACE FUNCTION get_rls_coverage()
RETURNS TABLE (
    protected bigint,
    total bigint,
    percentage numeric
)
SECURITY DEFINER
AS $$
DECLARE
    v_total bigint;
    v_protected bigint;
BEGIN
    -- Đếm tổng số bảng trong schema public (bỏ qua các bảng hệ thống của Supabase nếu cần)
    SELECT count(*) INTO v_total
    FROM pg_tables
    WHERE schemaname = 'public';

    -- Đếm số bảng đã enable RLS trong schema public
    SELECT count(*) INTO v_protected
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relrowsecurity = true;

    -- Tính %
    IF v_total = 0 THEN
        RETURN QUERY SELECT 0::bigint, 0::bigint, 0.0::numeric;
    ELSE
        RETURN QUERY SELECT 
            v_protected, 
            v_total, 
            ROUND((v_protected::numeric / v_total::numeric) * 100, 2);
    END IF;
END;
$$ LANGUAGE plpgsql;
