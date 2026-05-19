-- Migration: Enable search extensions for full-text and fuzzy search
-- Enables unaccent (removes Vietnamese diacritics) and pg_trgm (trigram similarity)
-- NOTE: On Supabase, extensions are installed in the 'extensions' schema by default.

-- 1. Bật unaccent extension (tìm kiếm không dấu tiếng Việt)
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;

-- 2. Bật pg_trgm extension (trigram similarity - tìm kiếm gần giống)
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;