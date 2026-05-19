-- Migration: Add Multi-tenant Unique Constraints for Events and About Sections
-- Created: 2026-03-04

-- 1. Events Table
-- Đảm bảo slug là duy nhất trong cùng một tenant_id
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_slug_key;

-- Thêm cột slug nếu chưa có
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Cập nhật slug từ title_vi
UPDATE public.events
SET slug = lower(regexp_replace(title_vi, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

ALTER TABLE public.events
ADD CONSTRAINT events_tenant_slug_unique UNIQUE (tenant_id, slug);

-- 2. About Sections Table
-- Đảm bảo key (ví dụ: 'history', 'architecture') là duy nhất trong cùng một tenant_id
ALTER TABLE public.about_sections
DROP CONSTRAINT IF EXISTS about_sections_key_key;

ALTER TABLE public.about_sections
ADD CONSTRAINT about_sections_tenant_key_unique UNIQUE (tenant_id, key);