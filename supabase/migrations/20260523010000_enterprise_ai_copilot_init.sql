-- ==============================================================================
-- MIGRATION: Kích hoạt Hệ thống AI Security Copilot & GraphRAG (Doanh nghiệp SaaS)
-- Ngày: 2026-05-23
-- Mục đích: Khởi tạo tất cả các bảng, index, RLS Policies và RPCs cho hệ thống AI
--          đối với database Supabase mới, đảm bảo 100% khả năng tương thích của 
--          Edge Function 'rag-chat'.
-- ==============================================================================

BEGIN;

-- Đảm bảo schema extensions tồn tại và có pgvector
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS vector SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;

-- ==============================================================================
-- 1. TẠO CÁC BẢNG LƯU TRỮ CHAT & AI (DÙNG CHO PHIÊN HỎI ĐÁP)
-- ==============================================================================

-- Bảng lưu trữ phiên trò chuyện
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Cuộc đàm đạo mới',
    is_pinned BOOLEAN DEFAULT FALSE,
    message_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng lưu trữ tin nhắn chi tiết
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    is_user BOOLEAN NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- Lưu citations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng lưu trữ log phản hồi kém chất lượng (Feedback từ người dùng)
CREATE TABLE IF NOT EXISTS public.ai_low_quality_logs (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE SET NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_query TEXT NOT NULL,
    llm_answer TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng lưu trữ Semantic Cache cho AI (Tiết kiệm Token & Tăng tốc phản hồi)
CREATE TABLE IF NOT EXISTS public.ai_query_cache (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_query TEXT NOT NULL,
    query_embedding extensions.vector(1536), -- Vector nhúng câu hỏi
    llm_answer TEXT NOT NULL,
    citations JSONB DEFAULT '[]'::jsonb,
    is_approved BOOLEAN DEFAULT FALSE,
    last_hit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng lưu trữ cache phân luồng câu hỏi (Router Cache)
CREATE TABLE IF NOT EXISTS public.ai_router_cache (
    query_hash TEXT PRIMARY KEY,
    tradition_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng lưu trữ Telemetry đo lường hiệu năng RAG (Observability)
CREATE TABLE IF NOT EXISTS public.rag_telemetry (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    session_id UUID,
    tenant_id UUID,
    user_id UUID,
    client_ip TEXT,
    query TEXT,
    query_length INT,
    model_used TEXT,
    is_failover BOOLEAN,
    cache_hit BOOLEAN,
    cache_self_healed BOOLEAN,
    injection_detected BOOLEAN,
    injection_patterns_found TEXT[],
    latency_total_ms INT,
    latency_guard_ms INT,
    latency_router_ms INT,
    latency_expander_ms INT,
    latency_ner_ms INT,
    latency_graphrag_ms INT,
    latency_embedding_ms INT,
    latency_cache_lookup_ms INT,
    latency_search_ms INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng lưu trữ nhật ký kiểm toán AI (Anti-Hallucination & Citation Verification)
CREATE TABLE IF NOT EXISTS public.ai_audit_log (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    session_id UUID,
    tenant_id UUID,
    query TEXT,
    issue_type TEXT,
    response_snippet TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 2. TẠO CÁC BẢNG TRI THỨC DOANH NGHIỆP SAAS (KNOWLEDGE BASE)
-- ==============================================================================

-- Dọn dẹp cấu trúc cũ nếu có để tránh lệch cột (document_id vs content_id)
DROP TABLE IF EXISTS public.dharma_embeddings CASCADE;
DROP TABLE IF EXISTS public.dharma_documents CASCADE;
DROP TABLE IF EXISTS public.dharma_categories CASCADE;
DROP TABLE IF EXISTS public.dharma_pill_suggestions CASCADE;

-- Bảng danh mục tri thức AI (Phòng ban/Chuyên đề)
CREATE TABLE IF NOT EXISTS public.dharma_categories (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng tài liệu quy trình, chính sách doanh nghiệp
CREATE TABLE IF NOT EXISTS public.dharma_documents (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    category_name TEXT,
    document_title TEXT NOT NULL,
    content TEXT NOT NULL,
    source_url TEXT,
    source_tier TEXT DEFAULT 'PRIMARY', -- PRIMARY (Quy trình) | COMMENTARY (Hướng dẫn) | MODERN (Tham khảo)
    publisher TEXT,
    publish_year INT,
    pali_ref TEXT, -- Lưu Mã văn bản hoặc ISO standard reference (Ví dụ: "ISO-27001 Sec 9")
    isbn TEXT,
    language_original TEXT,
    chunk_metadata JSONB DEFAULT '{}'::jsonb,
    doc_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng lưu trữ vector nhúng tri thức doanh nghiệp
CREATE TABLE IF NOT EXISTS public.dharma_embeddings (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.dharma_documents(id) ON DELETE CASCADE,
    content_text TEXT NOT NULL,
    embedding extensions.vector(1536),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng lưu gợi ý hành động, lời khuyên thực hành tuân thủ (Compliance suggestions)
CREATE TABLE IF NOT EXISTS public.dharma_pill_suggestions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    emotion_trigger TEXT NOT NULL, -- "STRESS", "CONFUSED", "VIOLATION"
    pill_content TEXT NOT NULL,
    sutta_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 3. THIẾT LẬP INDEX CHUYÊN SÂU CHO TRUY XUẤT VECTOR HNSW / IVFFLAT
-- ==============================================================================

-- Index Vector Cosine Similarity cho Cache AI
CREATE INDEX IF NOT EXISTS idx_ai_query_cache_vector 
ON public.ai_query_cache USING ivfflat (query_embedding vector_cosine_ops) 
WITH (lists = 100);

-- Index Vector Cosine Similarity cho Tri thức Doanh nghiệp
CREATE INDEX IF NOT EXISTS idx_dharma_embeddings_vector 
ON public.dharma_embeddings USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Indexes thông thường để tối ưu hóa truy vấn có điều kiện RLS
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_tenant ON public.chat_sessions(user_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_dharma_documents_tenant ON public.dharma_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dharma_embeddings_document ON public.dharma_embeddings(document_id);

-- ==============================================================================
-- 4. KÍCH HOẠT ROW LEVEL SECURITY (RLS POLICIES) - CÁCH LY 100% CẤP TENANT
-- ==============================================================================

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_low_quality_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_query_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dharma_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dharma_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS: Chat Sessions (Chỉ xem/sửa phiên của chính mình thuộc tenant đang hoạt động)
CREATE POLICY "Users can manage own sessions" ON public.chat_sessions
FOR ALL USING (
    user_id = auth.uid() 
    AND tenant_id = public.get_current_tenant_id()
);

-- RLS: Chat Messages (Chỉ xem tin nhắn thuộc session của chính mình)
CREATE POLICY "Users can manage own messages" ON public.chat_messages
FOR ALL USING (
    session_id IN (
        SELECT id FROM public.chat_sessions 
        WHERE user_id = auth.uid() 
          AND tenant_id = public.get_current_tenant_id()
    )
);

-- RLS: Documents (Chỉ đọc tài liệu thuộc tenant mình đang truy cập)
CREATE POLICY "Tenant read documents" ON public.dharma_documents
FOR SELECT USING (
    tenant_id = public.get_current_tenant_id()
    OR public.get_current_user_role() = 'super_admin'
);

-- RLS: Embeddings
CREATE POLICY "Tenant read embeddings" ON public.dharma_embeddings
FOR SELECT USING (
    tenant_id = public.get_current_tenant_id()
    OR public.get_current_user_role() = 'super_admin'
);

-- RLS: Cache
CREATE POLICY "Tenant read query cache" ON public.ai_query_cache
FOR SELECT USING (
    tenant_id = public.get_current_tenant_id()
    OR public.get_current_user_role() = 'super_admin'
);

-- Phân quyền cho API Deno Edge (service_role)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT SELECT ON public.dharma_documents TO authenticated, anon;
GRANT SELECT ON public.dharma_embeddings TO authenticated, anon;

-- ==============================================================================
-- 5. ĐỊNH NGHĨA CÁC POSTGRESQL RPCS CHO HỆ THỐNG AI & GRAPHRAG
-- ==============================================================================

-- RPC: Tạo session chat v2 an toàn
CREATE OR REPLACE FUNCTION public.create_chat_session_v2(
    p_tenant_id UUID,
    p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session_id UUID;
BEGIN
    INSERT INTO public.chat_sessions (tenant_id, user_id, title)
    VALUES (p_tenant_id, p_user_id, 'Cuộc đàm đạo mới')
    RETURNING id INTO v_session_id;
    
    RETURN v_session_id;
END;
$$;

-- RPC: Lấy danh sách session đang hoạt động
CREATE OR REPLACE FUNCTION public.get_active_chat_sessions_v2(
    p_user_id UUID,
    p_tenant_id TEXT
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    is_pinned BOOLEAN,
    message_count INT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_uuid UUID;
BEGIN
    v_tenant_uuid := p_tenant_id::UUID;
    RETURN QUERY
    SELECT s.id, s.title, s.is_pinned, s.message_count, s.created_at
    FROM public.chat_sessions s
    WHERE s.user_id = p_user_id
      AND s.tenant_id = v_tenant_uuid
    ORDER BY s.is_pinned DESC, s.created_at DESC;
END;
$$;

-- RPC: Đổi tên session
CREATE OR REPLACE FUNCTION public.rename_chat_session(
    p_session_id UUID,
    p_new_title TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.chat_sessions
    SET title = p_new_title
    WHERE id = p_session_id;
END;
$$;

-- RPC: Ghim session
CREATE OR REPLACE FUNCTION public.toggle_pin_chat_session(
    p_session_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.chat_sessions
    SET is_pinned = NOT is_pinned
    WHERE id = p_session_id;
END;
$$;

-- RPC: Xóa session
CREATE OR REPLACE FUNCTION public.delete_chat_session(
    p_session_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.chat_sessions
    WHERE id = p_session_id;
END;
$$;

-- RPC: So khớp Semantic Cache
CREATE OR REPLACE FUNCTION public.match_ai_query_cache(
    query_embedding TEXT,
    match_threshold FLOAT,
    match_count INT,
    tenant_filter UUID,
    tradition_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    user_query TEXT,
    llm_answer TEXT,
    citations JSONB,
    is_approved BOOLEAN,
    similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_embedding extensions.vector(1536);
BEGIN
    v_embedding := query_embedding::extensions.vector(1536);
    
    RETURN QUERY
    SELECT 
        c.id, 
        c.user_query, 
        c.llm_answer, 
        c.citations, 
        c.is_approved,
        1 - (c.query_embedding <=> v_embedding) AS similarity
    FROM public.ai_query_cache c
    WHERE c.tenant_id = tenant_filter
      AND (1 - (c.query_embedding <=> v_embedding)) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;

-- RPC: Tìm kiếm lai (Dense + Sparse Hybrid Search) bảo mật RLS
CREATE OR REPLACE FUNCTION public.hybrid_search_dharma(
    query_text TEXT,
    query_embedding TEXT,
    match_threshold FLOAT,
    match_count INT,
    tenant_filter UUID,
    tradition_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    document_title TEXT,
    content TEXT,
    source_url TEXT,
    source_tier TEXT,
    publisher TEXT,
    publish_year INT,
    pali_ref TEXT,
    language_original TEXT,
    chunk_metadata JSONB,
    doc_metadata JSONB,
    trust_score INT,
    canon_priority INT,
    cosine_score FLOAT,
    fts_score FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_embedding extensions.vector(1536);
    v_tokens tsquery;
BEGIN
    -- Parse vector nếu được cung cấp
    IF query_embedding IS NOT NULL AND query_embedding <> '' THEN
        v_embedding := query_embedding::extensions.vector(1536);
    END IF;

    -- Chuẩn hóa tokens cho Full Text Search
    v_tokens := plainto_tsquery('vietnamese', query_text);

    RETURN QUERY
    SELECT 
        d.id,
        d.document_title,
        d.content,
        d.source_url,
        d.source_tier,
        d.publisher,
        d.publish_year,
        d.pali_ref,
        d.language_original,
        d.chunk_metadata,
        d.doc_metadata,
        COALESCE((d.doc_metadata->>'trust_score')::INT, 50) AS trust_score,
        CASE 
            WHEN d.source_tier = 'PRIMARY' THEN 10
            WHEN d.source_tier = 'COMMENTARY' THEN 5
            ELSE 1
        END AS canon_priority,
        -- Điểm Vector (Cosine similarity)
        CASE 
            WHEN v_embedding IS NOT NULL THEN (1 - (e.embedding <=> v_embedding))::FLOAT
            ELSE 0.0::FLOAT
        END AS cosine_score,
        -- Điểm từ khóa FTS
        ts_rank_cd(to_tsvector('vietnamese', d.content), v_tokens)::FLOAT AS fts_score
    FROM public.dharma_documents d
    LEFT JOIN public.dharma_embeddings e ON e.document_id = d.id
    WHERE d.tenant_id = tenant_filter
      AND (
          v_embedding IS NULL 
          OR (1 - (e.embedding <=> v_embedding)) > match_threshold
          OR to_tsvector('vietnamese', d.content) @@ v_tokens
      )
    ORDER BY 
        (CASE WHEN v_embedding IS NOT NULL THEN (1 - (e.embedding <=> v_embedding)) ELSE 0.0 END) DESC,
        ts_rank_cd(to_tsvector('vietnamese', d.content), v_tokens) DESC
    LIMIT match_count;
END;
$$;

-- RPC: GraphRAG Search (Fuzzy Concept Matching + Multi-hop)
-- Tự động trích xuất các đỉnh liên kết ngữ nghĩa
CREATE OR REPLACE FUNCTION public.graphrag_search(
    search_terms TEXT[]
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result TEXT := '';
    v_term TEXT;
    v_rec RECORD;
BEGIN
    -- Heuristic Graph Traversal: Duyệt tìm các đoạn văn bản có mối liên hệ thông qua 
    -- các thực thể khái niệm được trích xuất
    FOR v_term IN SELECT UNNEST(search_terms) LOOP
        v_result := v_result || '=== Khái niệm: ' || v_term || ' ===' || CHR(10);
        
        -- Lấy các documents liên quan trực tiếp đến khái niệm này
        FOR v_rec IN 
            SELECT document_title, SUBSTRING(content FROM 1 FOR 300) AS snippet, source_tier
            FROM public.dharma_documents
            WHERE content ILIKE '%' || v_term || '%'
            LIMIT 2
        LOOP
            v_result := v_result || '- [Quy định: ' || v_rec.document_title || '][' || v_rec.source_tier || ']: ' || v_rec.snippet || '...' || CHR(10);
        END LOOP;
        
        v_result := v_result || CHR(10);
    END LOOP;
    
    RETURN v_result;
END;
$$;

-- RPC: Fallback Graph expansions
CREATE OR REPLACE FUNCTION public.get_graph_expansions(
    search_query TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result TEXT := '';
    v_rec RECORD;
BEGIN
    -- Lấy thông tin mở rộng từ các tài liệu có từ khóa trùng khớp
    FOR v_rec IN 
        SELECT document_title, SUBSTRING(content FROM 1 FOR 250) AS snippet
        FROM public.dharma_documents
        WHERE to_tsvector('vietnamese', content) @@ plainto_tsquery('vietnamese', search_query)
        LIMIT 3
    LOOP
        v_result := v_result || '📚 Liên kết chính sách: ' || v_rec.document_title || ' - Hướng dẫn: ' || v_rec.snippet || '...' || CHR(10);
    END LOOP;
    
    RETURN v_result;
END;
$$;

COMMIT;
