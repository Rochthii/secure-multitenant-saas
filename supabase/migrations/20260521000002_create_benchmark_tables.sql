-- ==============================================================================
-- MIGRATION: Thiết lập môi trường đo lường (Benchmark) cho RLS
-- Mục đích: Phục vụ đo lường hiệu năng của RLS cho Chương 5 của Đồ án
-- ==============================================================================

-- 1. Tạo 2 bảng chuyên dụng để không ảnh hưởng dữ liệu thật
CREATE TABLE IF NOT EXISTS public.benchmark_legacy (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    tenant_id uuid NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.benchmark_jwt (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    tenant_id uuid NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 2. Đổ 10,000 dòng dữ liệu vào mỗi bảng để đảm bảo có khối lượng (Volume) đo lường
-- Bảng sẽ dùng 1 tenant_id tĩnh (dummy)
DO $$
DECLARE
    dummy_tenant uuid := '55555555-5555-5555-5555-555555555555';
BEGIN
    -- Nếu bảng rỗng thì mới seed
    IF NOT EXISTS (SELECT 1 FROM public.benchmark_legacy LIMIT 1) THEN
        INSERT INTO public.benchmark_legacy (name, tenant_id)
        SELECT 'Legacy Record ' || i, dummy_tenant
        FROM generate_series(1, 10000) AS s(i);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.benchmark_jwt LIMIT 1) THEN
        INSERT INTO public.benchmark_jwt (name, tenant_id)
        SELECT 'JWT Record ' || i, dummy_tenant
        FROM generate_series(1, 10000) AS s(i);
    END IF;
END $$;

-- 3. Bật RLS
ALTER TABLE public.benchmark_legacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmark_jwt ENABLE ROW LEVEL SECURITY;

-- 4. Chính sách Legacy: JOIN với hàm user_roles O(N)
DROP POLICY IF EXISTS "Legacy RLS check" ON public.benchmark_legacy;
CREATE POLICY "Legacy RLS check" ON public.benchmark_legacy FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
        public.get_current_user_role() = 'super_admin' OR 
        tenant_id = public.get_current_tenant_id()
    )
);

-- 5. Chính sách JWT: Đọc trực tiếp từ JWT Custom Claims O(1)
DROP POLICY IF EXISTS "JWT RLS check" ON public.benchmark_jwt;
CREATE POLICY "JWT RLS check" ON public.benchmark_jwt FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
        (auth.jwt() ->> 'role')::text = 'super_admin' OR 
        tenant_id::text = (auth.jwt() ->> 'tenant_id')::text
    )
);

-- 6. Cấp quyền truy cập
GRANT SELECT ON public.benchmark_legacy TO authenticated;
GRANT SELECT ON public.benchmark_jwt TO authenticated;
GRANT SELECT ON public.benchmark_legacy TO service_role;
GRANT SELECT ON public.benchmark_jwt TO service_role;
