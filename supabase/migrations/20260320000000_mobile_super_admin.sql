-- ==============================================================================
-- MIGRATION: Mobile & AI Super Admin Extension
-- Ngày: 2026-03-20
-- Mục đích: Hỗ trợ tọa độ GIS cho Mobile App và bảng Embedding cho AI Dharma Bot.
-- ==============================================================================

-- 1. Kích hoạt PostGIS và Vector Search (nếu chưa có)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector; 

-- 2. Nâng cấp bảng tenants
-- Đảm bảo has_web_frontend tồn tại (mặc định true)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tenants' AND column_name='has_web_frontend') THEN
        ALTER TABLE tenants ADD COLUMN has_web_frontend BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Thêm các cột tọa độ
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS latitude FLOAT8,
ADD COLUMN IF NOT EXISTS longitude FLOAT8,
ADD COLUMN IF NOT EXISTS address_vi TEXT,
ADD COLUMN IF NOT EXISTS geog GEOGRAPHY(POINT, 4326);

-- Index GIST để tìm kiếm "Chi nhánh gần đây"
CREATE INDEX IF NOT EXISTS idx_tenants_geog ON tenants USING GIST (geog);

-- Trigger tự động cập nhật geog khi nhập latitude/longitude
CREATE OR REPLACE FUNCTION update_tenants_geog()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geog := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  ELSE
    NEW.geog := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_tenants_geog ON tenants;
CREATE TRIGGER tr_update_tenants_geog
BEFORE INSERT OR UPDATE ON tenants
FOR EACH ROW EXECUTE FUNCTION update_tenants_geog();

-- 3. Bảng Embedding hỗ trợ AI Dharma Bot (RAG)
CREATE TABLE IF NOT EXISTS dharma_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  content_id UUID, -- Link tới pages.id hoặc dharma_talks.id hoặc news.id
  content_type TEXT, -- 'page', 'talk', 'news'
  content_text TEXT, -- Đoạn text được cắt nhỏ (Chunks)
  embedding vector(1536), -- 1536 cho OpenAI/Gemini
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index cho tìm kiếm vector (Cosine Similarity)
CREATE INDEX IF NOT EXISTS idx_dharma_embeddings_vector ON dharma_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 4. Phân quyền (Grant permissions)
GRANT ALL ON dharma_embeddings TO postgres;
GRANT ALL ON dharma_embeddings TO service_role;
GRANT SELECT ON dharma_embeddings TO authenticated;
GRANT SELECT ON dharma_embeddings TO anon;

-- Kích hoạt RLS cho dharma_embeddings
ALTER TABLE dharma_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read dharma_embeddings" ON dharma_embeddings
FOR SELECT USING (true);

CREATE POLICY "Super admins can manage dharma_embeddings" ON dharma_embeddings
FOR ALL USING (
    auth.uid() IS NOT NULL AND (
        public.get_current_user_role() = 'super_admin'
    )
);
