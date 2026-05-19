# Đề xuất Migration: Mở rộng tính năng Mobile & AI

Dưới đây là mã SQL dự kiến để nâng cấp hệ thống hiện tại, sẵn sàng cho việc tích hợp Mobile App và AI Dharma Bot.

---

## 1. Kích hoạt PostGIS và Vector Search
```sql
-- Kích hoạt tiện ích địa lý và vector (Hỗ trợ AI)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector; -- Yêu cầu Supabase có hỗ trợ pgvector
```

---

## 2. Nâng cấp bảng Tenants (Tọa độ chi nhánh)
```sql
-- Bổ sung thông tin địa lý vào bảng tenants
ALTER TABLE tenants 
ADD COLUMN latitude FLOAT8,
ADD COLUMN longitude FLOAT8,
ADD COLUMN address_vi TEXT,
ADD COLUMN geog GEOGRAPHY(POINT);

-- Index GIST để tìm kiếm "Chi nhánh gần đây" với tốc độ cực nhanh
CREATE INDEX idx_tenants_geog ON tenants USING GIST (geog);

-- Trigger tự động cập nhật geog khi nhập latitude/longitude
CREATE OR REPLACE FUNCTION update_tenants_geog()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geog := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4324)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_tenants_geog
BEFORE INSERT OR UPDATE ON tenants
FOR EACH ROW EXECUTE FUNCTION update_tenants_geog();
```

---

## 3. Bảng Embedding hỗ trợ AI
| Bảng | Loại | Mô tả | Ghi chú |
| :--- | :--- | :--- | :--- |
| `dharma_categories` | Table | Quản lý danh mục/chủ đề Phật học. | `UUID, name` |
| `dharma_documents` | Table | Lưu thông tin sách, kinh tạng, tác giả. | `UUID, title, category_id` |
| `dharma_embeddings` | Table | Lưu trữ vector embedding 1536 chiều. | `vector(1536)` |
| `match_dharma_embeddings` | Function | Tìm kiếm RAG theo tenant_id. | Cosine Similarity |
| `ai_query_cache` | Table | Bộ nhớ đệm ngữ nghĩa (Semantic Caching). | Có `tenant_filter` |
| `ai_low_quality_logs` | Table | **[NEW]** Lưu feedback 👎 từ người dùng. | Dành cho hiệu đính |

```sql
-- 1. Lưu trữ các vector đặc trưng (1536 chiều - Gemini Embedding 2)
CREATE TABLE dharma_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES dharma_documents(id) ON DELETE CASCADE,
  content TEXT, 
  embedding vector(1536), -- Đã nâng cấp lên Gemini Embedding 2 (MRL)
  metadata JSONB
);

-- 2. Bộ nhớ đệm thông minh (Semantic Cache) hỗ trợ Đa chi nhánh
CREATE TABLE ai_query_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text TEXT NOT NULL,
    answer_text TEXT NOT NULL,
    embedding vector(1536),
    citations JSONB,
    tenant_filter VARCHAR(50) DEFAULT 'GLOBAL', -- Lọc theo từng chi nhánh
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng Vòng lặp phản hồi (Feedback Loop)
CREATE TABLE ai_low_quality_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(50),
  query_text TEXT,
  ai_answer TEXT,
  correction_text TEXT, -- Admin sẽ điền vào đây để huấn luyện lại
  status TEXT DEFAULT 'pending', -- pending, corrected, rejected
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Bảng Geofencing Log (Vận hành tự động)
```sql
-- Lưu vết khi người dùng bước vào khu vực chi nhánh để phân tích hành vi
CREATE TABLE geofencing_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  tenant_id UUID REFERENCES tenants(id),
  action_type TEXT, -- 'enter', 'exit'
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
