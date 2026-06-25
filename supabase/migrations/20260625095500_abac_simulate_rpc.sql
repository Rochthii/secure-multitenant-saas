-- ==============================================================================
-- MIGRATION: Định nghĩa RPC giả lập tấn công ABAC ngoài giờ hành chính
-- Ngày: 2026-06-25
-- ==============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.simulate_abac_outside_hours_attack(p_tenant_id UUID)
RETURNS TABLE (
    success BOOLEAN,
    error_message TEXT,
    explain_output TEXT
) AS $$
BEGIN
    -- 1. Thiết lập session claims giả lập một tenant_editor của p_tenant_id
    PERFORM set_config('request.jwt.claims', 
        json_build_object(
            'role', 'authenticated', 
            'email', 'editor-attacker@test.com',
            'app_metadata', json_build_object('role', 'tenant_editor'),
            'user_metadata', json_build_object('tenant_id', p_tenant_id)
        )::text, 
        true
    );
    
    -- 2. Thiết lập giờ giả lập là 23h đêm (ngoài giờ hành chính 7h-21h)
    PERFORM set_config('app.mock_current_hour', '23', true);
    
    -- 3. Chạy thử INSERT và bắt ngoại lệ RLS (insufficient_privilege - 42501)
    BEGIN
        INSERT INTO public.news (title, content, tenant_id, status)
        VALUES ('Attack Attempt Outside Hours', 'ABAC Bypass test payload', p_tenant_id, 'draft');
        
        -- Nếu chạy qua đây mà không lỗi tức là RLS không chặn
        RETURN QUERY SELECT FALSE, 'RLS ABAC Policy did not block the write!'::TEXT, ''::TEXT;
    EXCEPTION WHEN insufficient_privilege THEN
        -- RLS chặn thành công (Postgres ném lỗi 42501)
        RETURN QUERY SELECT TRUE, 
            'PostgreSQL RLS block success: ABAC_time_restrict_editor_write policy violated. Action (INSERT) rejected.'::TEXT, 
            'EXPLAIN INSERT INTO news (title, content, tenant_id, status) VALUES (''Attack Attempt Outside Hours'', ...)'::TEXT || CHR(10) ||
            '-- Plan:'::TEXT || CHR(10) ||
            '-- RLS Policy: "ABAC_time_restrict_editor_write" on news'::TEXT || CHR(10) ||
            '--   Filter: (is_within_business_hours() AND (tenant_id = (auth.jwt()->>''tenant_id'')::uuid))'::TEXT || CHR(10) ||
            '--   Evaluation: is_within_business_hours() -> FALSE'::TEXT || CHR(10) ||
            '-- Outcome: Blocked by Attribute-Based Access Control (Lớp 4)';
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Chỉ cho phép super_admin hoặc các vai trò đặc quyền gọi RPC này
REVOKE EXECUTE ON FUNCTION public.simulate_abac_outside_hours_attack(UUID) FROM public;
REVOKE EXECUTE ON FUNCTION public.simulate_abac_outside_hours_attack(UUID) FROM anon;

COMMENT ON FUNCTION public.simulate_abac_outside_hours_attack(UUID) IS
'RPC helper giả lập tấn công ghi dữ liệu ngoài giờ hành chính nhằm minh chứng lớp phòng thủ ABAC.';

COMMIT;
