-- ==============================================================================
-- MIGRATION: Cập nhật hàm get_tenant_routing_config để trả về thêm tenant_type và name
-- Ngày: 2026-06-26
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_tenant_routing_config(p_hostname text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant RECORD;
BEGIN
  -- Tìm kiếm tenant theo domain hoặc ID
  SELECT id, domain, name, lifecycle_status, tenant_type, modules_config->'security_settings'->>'ip_whitelist' as ip_whitelist
  INTO v_tenant
  FROM public.tenants
  WHERE domain = p_hostname OR id::text = p_hostname;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  RETURN jsonb_build_object(
    'id', v_tenant.id,
    'domain', v_tenant.domain,
    'name', v_tenant.name,
    'lifecycle_status', v_tenant.lifecycle_status,
    'tenant_type', v_tenant.tenant_type,
    'ip_whitelist', v_tenant.ip_whitelist
  );
END;
$$;

COMMENT ON FUNCTION public.get_tenant_routing_config IS 
'Cập nhật hàm RPC get_tenant_routing_config để trả về thêm tenant_type và name phục vụ cho việc tính toán hạn mức kết nối của Supavisor Pooler ở Edge/Middleware.';

-- Đảm bảo anon và authenticated được phép thực thi
GRANT EXECUTE ON FUNCTION public.get_tenant_routing_config(text) TO anon, authenticated, postgres, service_role;
