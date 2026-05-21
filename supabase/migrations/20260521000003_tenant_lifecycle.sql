-- ==============================================================================
-- MIGRATION: Tenant Lifecycle & Plan Type Support
-- Mục đích: Thêm cột is_active, plan_type, lifecycle_status vào bảng tenants
--           để hỗ trợ Suspend/Reactivate và gói dịch vụ SaaS
-- Chạy script này trên Supabase SQL Editor
-- ==============================================================================

-- 1. Thêm cột plan_type (Free/Pro/Enterprise)
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS plan_type TEXT NOT NULL DEFAULT 'free'
CHECK (plan_type IN ('free', 'pro', 'enterprise'));

-- 2. Thêm cột lifecycle_status (trạng thái vòng đời của tenant)
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS lifecycle_status TEXT NOT NULL DEFAULT 'active'
CHECK (lifecycle_status IN ('active', 'suspended', 'offboarding', 'terminated'));

-- 3. Comment mô tả ý nghĩa các cột
COMMENT ON COLUMN public.tenants.plan_type IS 
    'Gói dịch vụ SaaS: free | pro | enterprise. Dùng để kiểm soát module truy cập.';

COMMENT ON COLUMN public.tenants.lifecycle_status IS 
    'Trạng thái vòng đời: active (đang dùng) | suspended (tạm đình chỉ) | offboarding (đang rời nền tảng) | terminated (đã xoá)';

-- 4. Index để query nhanh theo lifecycle_status (giám sát tenant suspended)
CREATE INDEX IF NOT EXISTS idx_tenants_lifecycle_status 
ON public.tenants(lifecycle_status);

CREATE INDEX IF NOT EXISTS idx_tenants_plan_type 
ON public.tenants(plan_type);

-- 5. Đảm bảo RLS vẫn bật
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Xác nhận
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'tenants'
AND column_name IN ('plan_type', 'lifecycle_status')
ORDER BY column_name;
