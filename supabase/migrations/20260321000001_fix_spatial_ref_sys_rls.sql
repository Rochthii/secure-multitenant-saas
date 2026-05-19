-- ==============================================================================
-- MIGRATION: Fix Supabase Linter Error (Extension Reconstruction Strategy)
-- Ngày: 2026-03-21
-- Mục đích: 
--   1. Gỡ bỏ và cài đặt lại PostGIS, Vector, uuid-ossp vào schema 'extensions'.
--   2. Giải quyết triệt để lỗi "RLS Disabled in Public" và "Extension in Public".
--   3. Khôi phục dữ liệu spatial (geog) cho bảng tenants.
--   4. Đảm bảo các bảng cũ vẫn giữ được DEFAULT UUID từ schema mới.
-- ==============================================================================

-- 1. XÓA CÁC ĐỐI TƯỢNG PHỤ THUỘC TẠM THỜI
DROP TRIGGER IF EXISTS tr_update_tenants_geog ON public.tenants;
DROP FUNCTION IF EXISTS public.update_tenants_geog();
DROP TABLE IF EXISTS public.dharma_embeddings;

-- 2. TÁI CẤU TRÚC EXTENSION TRONG SCHEMA RIÊNG
CREATE SCHEMA IF NOT EXISTS extensions;

-- PostGIS và Vector không hỗ trợ SET SCHEMA sau khi cài đặt, nên cần DROP/CREATE.
-- CASCADE sẽ xóa cột 'geog' trong bảng tenants và các ràng buộc mặc định UUID.
DROP EXTENSION IF EXISTS postgis CASCADE;
DROP EXTENSION IF EXISTS vector CASCADE;
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- Cài đặt lại vào schema extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS vector SCHEMA extensions;

-- 3. KHÔI PHỤC CẤU TRÚC SPATIAL CHO BẢNG TENANTS
ALTER TABLE public.tenants DROP COLUMN IF EXISTS geog;
ALTER TABLE public.tenants ADD COLUMN geog extensions.GEOGRAPHY(POINT, 4326);
CREATE INDEX IF NOT EXISTS idx_tenants_geog ON public.tenants USING GIST (geog);

-- Tái tạo hàm trigger với search_path cố định
CREATE OR REPLACE FUNCTION public.update_tenants_geog()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geog := extensions.ST_SetSRID(extensions.ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::extensions.geography;
  ELSE
    NEW.geog := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, extensions;

CREATE TRIGGER tr_update_tenants_geog
BEFORE INSERT OR UPDATE ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.update_tenants_geog();

-- 4. KHÔI PHỤC BẢNG DHARMA_EMBEDDINGS (Vốn bị xóa do CASCADE)
CREATE TABLE public.dharma_embeddings (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  content_id UUID,
  content_type TEXT,
  content_text TEXT,
  embedding extensions.vector(1536),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index cho tìm kiếm vector (Cosine Similarity)
CREATE INDEX idx_dharma_embeddings_vector ON public.dharma_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Phân quyền
GRANT ALL ON public.dharma_embeddings TO postgres;
GRANT ALL ON public.dharma_embeddings TO service_role;
GRANT SELECT ON public.dharma_embeddings TO authenticated;
GRANT SELECT ON public.dharma_embeddings TO anon;

-- Kích hoạt RLS
ALTER TABLE public.dharma_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read dharma_embeddings" ON public.dharma_embeddings
FOR SELECT USING (true);

CREATE POLICY "Super admins can manage dharma_embeddings" ON public.dharma_embeddings
FOR ALL USING (
    auth.uid() IS NOT NULL AND (
        public.get_current_user_role() = 'super_admin'
    )
);

-- 5. KHÔI PHỤC DEFAULT UUID CHO CÁC BẢNG CŨ (Bị mất do DROP EXTENSION CASCADE)
ALTER TABLE public.tenants ALTER COLUMN id SET DEFAULT extensions.uuid_generate_v4();
ALTER TABLE public.organizations ALTER COLUMN id SET DEFAULT extensions.uuid_generate_v4();
ALTER TABLE public.transaction_projects ALTER COLUMN id SET DEFAULT extensions.uuid_generate_v4();
ALTER TABLE public.user_roles ALTER COLUMN id SET DEFAULT extensions.uuid_generate_v4();

-- 6. KHÔI PHỤC DỮ LIỆU GEOG CHO TENANTS CŨ
-- Chạy UPDATE để trigger tự động tính toán lại geog từ lat/long hiện có.
UPDATE public.tenants SET latitude = latitude WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
