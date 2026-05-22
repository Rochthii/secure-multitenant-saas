-- ==============================================================================
-- MIGRATION: Benchmark RPCs cho đo lường hiệu năng RLS (Chương 5 Đồ án)
-- Ngày: 2026-05-22
-- Mục đích: Tạo 2 hàm RPC so sánh hiệu năng giữa:
--   (1) Legacy RLS - Buộc JOIN với bảng roles/tenants → O(N) complexity
--   (2) JWT Custom Claims RLS - Đọc trực tiếp từ session → O(1) complexity
-- Phục vụ thực nghiệm Benchmark tại giao diện /admin/performance
-- ==============================================================================

-- ==============================================================================
-- PHẦN 1: BENCHMARK_RLS_JOIN — Mô phỏng Legacy RLS (O(N) - Phải JOIN bảng)
-- Hàm này giả lập truy vấn RLS truyền thống: buộc phải lookup vai trò từ bảng
-- user_roles rồi JOIN với tenants để xác định quyền truy cập → gây O(N) trên
-- mỗi dòng dữ liệu được kiểm tra. Đây là cách nhiều hệ thống legacy hoạt động.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.benchmark_rls_join(limit_count int DEFAULT 1000)
RETURNS TABLE (
    id uuid,
    name text,
    tenant_id uuid,
    created_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_tenant_id uuid;
    current_user_role text;
BEGIN
    -- Step 1: Tra cứu tenant_id của user hiện tại từ bảng user_roles (JOIN-like lookup)
    SELECT ur.tenant_id, ur.role
    INTO current_user_tenant_id, current_user_role
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    LIMIT 1;

    -- Step 2: Thực hiện JOIN tường minh với bảng tenants để xác minh tenant đang hoạt động
    -- Đây là nguồn gốc của overhead O(N): mỗi dòng phải kiểm tra điều kiện JOIN
    RETURN QUERY
    SELECT bl.id, bl.name, bl.tenant_id, bl.created_at
    FROM public.benchmark_legacy bl
    INNER JOIN public.tenants t ON bl.tenant_id = t.id
    WHERE (
        current_user_role IN ('super_admin', 'company_editor', 'admin')
        OR (
            t.status = 'active'
            AND bl.tenant_id = current_user_tenant_id
        )
    )
    LIMIT limit_count;
END;
$$;

COMMENT ON FUNCTION public.benchmark_rls_join IS
'[Benchmark Chương 5] Mô phỏng Legacy RLS: Mỗi truy vấn phải JOIN bảng user_roles + tenants để xác định quyền. Complexity: O(N). So sánh với benchmark_rls_claims để thấy sự chênh lệch hiệu năng.';


-- ==============================================================================
-- PHẦN 2: BENCHMARK_RLS_CLAIMS — Mô phỏng Optimized RLS (O(1) - Custom Claims)
-- Hàm này giả lập truy vấn RLS tối ưu: đọc tenant_id và role trực tiếp từ
-- JWT session hiện tại (không cần JOIN bảng nào). Đây là kiến trúc tối ưu hóa
-- của hệ thống đề xuất, đạt O(1) complexity cho phần kiểm tra quyền.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.benchmark_rls_claims(limit_count int DEFAULT 1000)
RETURNS TABLE (
    id uuid,
    name text,
    tenant_id uuid,
    created_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    jwt_tenant_id text;
    jwt_role text;
BEGIN
    -- Step 1: Đọc trực tiếp từ JWT Custom Claims - KHÔNG CẦN QUERY DATABASE
    -- Đây là O(1): luôn constant time bất kể có bao nhiêu tenant hay users
    jwt_tenant_id := auth.jwt() ->> 'tenant_id';
    jwt_role      := auth.jwt() ->> 'role';

    -- Step 2: Filter dựa trên Claims đã có sẵn trong session
    RETURN QUERY
    SELECT bj.id, bj.name, bj.tenant_id, bj.created_at
    FROM public.benchmark_jwt bj
    WHERE (
        jwt_role IN ('super_admin', 'company_editor', 'admin')
        OR bj.tenant_id::text = jwt_tenant_id
    )
    LIMIT limit_count;
END;
$$;

COMMENT ON FUNCTION public.benchmark_rls_claims IS
'[Benchmark Chương 5] Mô phỏng Optimized RLS: Đọc tenant_id + role từ JWT Claims sẵn có trong session, không cần JOIN bảng nào. Complexity: O(1). Đây là kiến trúc đề xuất của đồ án.';


-- ==============================================================================
-- PHẦN 3: SEED DỮ LIỆU ĐA MỨC (Multi-scale Dataset Seeding)
-- Đảm bảo có đủ 3 mức dữ liệu để vẽ đường cong hiệu năng scaling:
--   Mức 1:   1,000 rows → Baseline
--   Mức 2:  10,000 rows → Đã có sẵn từ migration trước
--   Mức 3: 100,000 rows → Đỉnh điểm để thấy sự phân kỳ O(N) vs O(1)
-- ==============================================================================
DO $$
DECLARE
    dummy_tenant uuid := '55555555-5555-5555-5555-555555555555';
    current_count_legacy int;
    current_count_jwt    int;
BEGIN
    SELECT COUNT(*) INTO current_count_legacy FROM public.benchmark_legacy;
    SELECT COUNT(*) INTO current_count_jwt    FROM public.benchmark_jwt;

    -- Nâng lên 100,000 nếu chưa đạt
    IF current_count_legacy < 100000 THEN
        INSERT INTO public.benchmark_legacy (name, tenant_id)
        SELECT 'Legacy Record ' || (current_count_legacy + i), dummy_tenant
        FROM generate_series(1, (100000 - current_count_legacy)) AS s(i);
        
        RAISE NOTICE 'Đã seed % dòng thêm vào benchmark_legacy (tổng: 100000)',
            (100000 - current_count_legacy);
    ELSE
        RAISE NOTICE 'benchmark_legacy đã có % dòng, không cần seed thêm.', current_count_legacy;
    END IF;

    IF current_count_jwt < 100000 THEN
        INSERT INTO public.benchmark_jwt (name, tenant_id)
        SELECT 'JWT Record ' || (current_count_jwt + i), dummy_tenant
        FROM generate_series(1, (100000 - current_count_jwt)) AS s(i);

        RAISE NOTICE 'Đã seed % dòng thêm vào benchmark_jwt (tổng: 100000)',
            (100000 - current_count_jwt);
    ELSE
        RAISE NOTICE 'benchmark_jwt đã có % dòng, không cần seed thêm.', current_count_jwt;
    END IF;
END $$;


-- ==============================================================================
-- PHẦN 4: GRANT QUYỀN THỰC THI CHO AUTHENTICATED USER
-- ==============================================================================
GRANT EXECUTE ON FUNCTION public.benchmark_rls_join(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.benchmark_rls_claims(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.benchmark_rls_join(int) TO service_role;
GRANT EXECUTE ON FUNCTION public.benchmark_rls_claims(int) TO service_role;
