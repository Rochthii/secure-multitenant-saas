-- Add tenant_type column to tenants table
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS tenant_type TEXT DEFAULT 'company' CHECK (tenant_type IN ('tenant', 'company', 'ngo'));

-- Update existing tenants to be of type 'tenant'
UPDATE public.tenants SET tenant_type = 'tenant' WHERE tenant_type IS NULL;

-- Enable RLS for tenant_type (if needed, but usually it's fine)
COMMENT ON COLUMN public.tenants.tenant_type IS 'Loại hình tổ chức: tenant (mặc định - chùa), company (tập đoàn/công ty), ngo (tổ chức phi chính phủ)';
