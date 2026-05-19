-- ==============================================================================
-- MIGRATION: Fix RLS cho transaction_purposes - thêm tenant_id và public read policy
-- Ngày: 2026-02-28
-- Vấn đề: Bảng transaction_purposes thiếu cột tenant_id và chưa có RLS policy
--         → getTransactionPurposes() trả về lỗi → trang transactions bị 500
-- ==============================================================================

-- Bước 1: Thêm cột tenant_id vào transaction_purposes (bảng này bị bỏ sót trong migration trước)
ALTER TABLE public.transaction_purposes
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants (id) DEFAULT '55555555-5555-5555-5555-555555555555';

-- Bước 2: Bật RLS
ALTER TABLE public.transaction_purposes ENABLE ROW LEVEL SECURITY;

-- Bước 3: Xóa policy cũ nếu đã có (tránh conflict)
DROP POLICY IF EXISTS "Public_Read_Transaction_Purposes" ON public.transaction_purposes;

DROP POLICY IF EXISTS "Admin_Manage_Transaction_Purposes" ON public.transaction_purposes;

-- Bước 4: Cho phép tất cả mọi người đọc (không yêu cầu đăng nhập)
CREATE POLICY "Public_Read_Transaction_Purposes" ON public.transaction_purposes FOR
SELECT USING (true);

-- Bước 5: Cho phép admin quản lý theo tenant
CREATE POLICY "Admin_Manage_Transaction_Purposes" ON public.transaction_purposes FOR ALL USING (
    public.is_authorized_admin (tenant_id)
);

-- Bước 6: Defensive - đảm bảo transaction_projects cũng có public read
DROP POLICY IF EXISTS "Public_Read_Transaction_Projects" ON public.transaction_projects;

CREATE POLICY "Public_Read_Transaction_Projects" ON public.transaction_projects FOR
SELECT USING (true);