import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyFTSFix() {
  console.log("=== Applying FTS fix: phraseto_tsquery → plainto_tsquery ===\n");

  // Đọc nội dung migration SQL
  const sql = `
    DROP FUNCTION IF EXISTS public.hybrid_search_dharma(text, vector(1536), float, int, varchar, varchar);

    CREATE OR REPLACE FUNCTION public.hybrid_search_dharma(
        query_text text,
        query_embedding vector(1536),
        match_threshold float,
        match_count int,
        tenant_filter varchar DEFAULT NULL,
        tradition_filter varchar DEFAULT NULL
    )
    RETURNS TABLE (
        id                uuid,
        content           text,
        document_title    varchar,
        category_name     varchar,
        tradition_id      varchar,
        chunk_metadata    jsonb,
        doc_metadata      jsonb,
        source_tier       text,
        publisher         text,
        publish_year      integer,
        pali_ref          text,
        isbn              text,
        language_original text,
        source_url        text,
        similarity        float,
        fts_score         float,
        rrf_score         float
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
    PARALLEL SAFE
    AS $fn$
    BEGIN
        RETURN QUERY
        WITH semantic_search AS (
            SELECT
                e.id,
                e.content,
                e.embedding <=> query_embedding AS distance,
                d.title                                           AS document_title,
                COALESCE(c.name, 'Chưa phân loại'::varchar)      AS category_name,
                COALESCE(d.tradition_id, 'THERAVADA'::varchar)    AS l_tradition_id,
                COALESCE(e.metadata, '{}'::jsonb)                 AS l_chunk_metadata,
                COALESCE(d.source_metadata, '{}'::jsonb)          AS l_doc_metadata,
                d.source_tier::text                               AS l_source_tier,
                d.publisher                                       AS l_publisher,
                d.publish_year                                    AS l_publish_year,
                d.pali_ref                                        AS l_pali_ref,
                d.isbn                                            AS l_isbn,
                d.language_original                               AS l_language_original,
                d.source_url                                      AS l_source_url,
                ROW_NUMBER() OVER(ORDER BY e.embedding <=> query_embedding) AS rank_semantic
            FROM public.dharma_embeddings e
            JOIN public.dharma_documents d ON e.document_id = d.id
            LEFT JOIN public.dharma_categories c ON d.category_id = c.id
            WHERE (1 - (e.embedding <=> query_embedding)) > match_threshold
              AND (tenant_filter IS NULL OR d.tenant_id = tenant_filter OR d.tenant_id = 'GLOBAL')
              AND (
                  tradition_filter IS NULL
                  OR d.tradition_id IS NULL
                  OR d.tradition_id = tradition_filter
                  OR COALESCE(c.tradition_id, '') = tradition_filter
              )
            ORDER BY e.embedding <=> query_embedding
            LIMIT 50
        ),
        keyword_search AS (
            SELECT
                e.id,
                e.content,
                ts_rank(e.fts, plainto_tsquery('simple', query_text)) AS k_fts_score,
                d.title                                           AS document_title,
                COALESCE(c.name, 'Chưa phân loại'::varchar)      AS category_name,
                COALESCE(d.tradition_id, 'THERAVADA'::varchar)    AS l_tradition_id,
                COALESCE(e.metadata, '{}'::jsonb)                 AS l_chunk_metadata,
                COALESCE(d.source_metadata, '{}'::jsonb)          AS l_doc_metadata,
                d.source_tier::text                               AS l_source_tier,
                d.publisher                                       AS l_publisher,
                d.publish_year                                    AS l_publish_year,
                d.pali_ref                                        AS l_pali_ref,
                d.isbn                                            AS l_isbn,
                d.language_original                               AS l_language_original,
                d.source_url                                      AS l_source_url,
                ROW_NUMBER() OVER(ORDER BY ts_rank(e.fts, plainto_tsquery('simple', query_text)) DESC) AS rank_keyword
            FROM public.dharma_embeddings e
            JOIN public.dharma_documents d ON e.document_id = d.id
            LEFT JOIN public.dharma_categories c ON d.category_id = c.id
            WHERE e.fts @@ plainto_tsquery('simple', query_text)
              AND (tenant_filter IS NULL OR d.tenant_id = tenant_filter OR d.tenant_id = 'GLOBAL')
              AND (
                  tradition_filter IS NULL
                  OR d.tradition_id IS NULL
                  OR d.tradition_id = tradition_filter
                  OR COALESCE(c.tradition_id, '') = tradition_filter
              )
            ORDER BY ts_rank(e.fts, plainto_tsquery('simple', query_text)) DESC
            LIMIT 50
        ),
        rrf_comb AS (
            SELECT
                COALESCE(s.id, k.id)                             AS entity_id,
                COALESCE(s.content, k.content)                   AS text_content,
                COALESCE(s.document_title, k.document_title)     AS c_title,
                COALESCE(s.category_name, k.category_name)       AS c_category,
                COALESCE(s.l_tradition_id, k.l_tradition_id)     AS c_tradition,
                COALESCE(s.l_chunk_metadata, k.l_chunk_metadata) AS c_chunk_meta,
                COALESCE(s.l_doc_metadata, k.l_doc_metadata)     AS c_doc_meta,
                COALESCE(s.l_source_tier, k.l_source_tier)       AS c_source_tier,
                COALESCE(s.l_publisher, k.l_publisher)           AS c_publisher,
                COALESCE(s.l_publish_year, k.l_publish_year)     AS c_publish_year,
                COALESCE(s.l_pali_ref, k.l_pali_ref)             AS c_pali_ref,
                COALESCE(s.l_isbn, k.l_isbn)                     AS c_isbn,
                COALESCE(s.l_language_original, k.l_language_original) AS c_language_original,
                COALESCE(s.l_source_url, k.l_source_url)         AS c_source_url,
                COALESCE(1.0 / (60 + s.rank_semantic), 0.0)      AS semantic_rrf,
                COALESCE(1.0 / (60 + k.rank_keyword), 0.0)       AS keyword_rrf,
                COALESCE(1.0 - s.distance, 0.0)                  AS similarity_score,
                COALESCE(k.k_fts_score, 0.0)::float              AS final_fts_score
            FROM semantic_search s
            FULL OUTER JOIN keyword_search k ON s.id = k.id
        )
        SELECT
            entity_id,
            text_content,
            c_title,
            c_category,
            c_tradition,
            c_chunk_meta,
            c_doc_meta,
            c_source_tier,
            c_publisher,
            c_publish_year,
            c_pali_ref,
            c_isbn,
            c_language_original,
            c_source_url,
            similarity_score::float,
            final_fts_score,
            (semantic_rrf + keyword_rrf)::float AS rrf_score
        FROM rrf_comb
        ORDER BY rrf_score DESC
        LIMIT match_count;
    END;
    $fn$;
  `;

  // Chạy SQL trực tiếp qua Supabase REST API (management API)
  const dbUrl = process.env.SUPABASE_DB_URL || `${supabaseUrl}/rest/v1/rpc`;
  
  // Sử dụng pg direct connection qua supabase-js
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    // Fallback: Dùng fetch trực tiếp đến Supabase Management API
    console.log("RPC exec_sql not available, trying direct SQL via Management API...");
    
    const mgmtUrl = `https://api.supabase.com/v1/projects/yhwbbndnwvxlhbhnhnvj/database/query`;
    const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
    
    if (!accessToken) {
      console.error("SUPABASE_ACCESS_TOKEN not set. Running via psql instead...");
      console.log("\nPlease run this SQL manually in Supabase SQL Editor:");
      console.log("Migration file: supabase/migrations/20260509000001_fix_fts_plainto_tsquery.sql");
      return;
    }
    
    const res = await fetch(mgmtUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (!res.ok) {
      console.error("Management API Error:", res.status, await res.text());
      return;
    }
    
    console.log("✅ FTS fix applied successfully via Management API!");
  } else {
    console.log("✅ FTS fix applied successfully via RPC!");
  }
}

applyFTSFix().catch(console.error);
