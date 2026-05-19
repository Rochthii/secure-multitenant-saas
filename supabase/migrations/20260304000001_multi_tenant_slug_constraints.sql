-- Migration: Optimize Slug Unique Constraints for Multi-tenancy
-- Created: 2026-03-04
-- This migration changes global UNIQUE constraints on 'slug' columns to per-tenant constraints.

-- 1. Categories Table
ALTER TABLE public.categories
DROP CONSTRAINT IF EXISTS categories_slug_key;

ALTER TABLE public.categories
ADD CONSTRAINT categories_tenant_slug_unique UNIQUE (tenant_id, slug);

-- 2. News Table
ALTER TABLE public.news DROP CONSTRAINT IF EXISTS news_slug_key;

ALTER TABLE public.news
ADD CONSTRAINT news_tenant_slug_unique UNIQUE (tenant_id, slug);

-- 3. Transaction Projects Table
-- Thêm cột slug nếu chưa có
ALTER TABLE public.transaction_projects
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
-- Cập nhật slug từ title_vi (phòng hờ dữ liệu cũ)
UPDATE public.transaction_projects
SET
    slug = lower(
        regexp_replace (
            title_vi,
            '[^a-zA-Z0-9]+',
            '-',
            'g'
        )
    )
WHERE
    slug IS NULL;
-- Đảm bảo không trùng trong cùng tenant
ALTER TABLE public.transaction_projects
ADD CONSTRAINT transaction_projects_tenant_slug_unique UNIQUE (tenant_id, slug);

-- 4. Dharma Talks Table
-- Thêm cột slug nếu chưa có
ALTER TABLE public.dharma_talks
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
-- Cập nhật slug từ title_vi
UPDATE public.dharma_talks
SET
    slug = lower(
        regexp_replace (
            title_vi,
            '[^a-zA-Z0-9]+',
            '-',
            'g'
        )
    )
WHERE
    slug IS NULL;
-- Đảm bảo không trùng trong cùng tenant
ALTER TABLE public.dharma_talks
ADD CONSTRAINT dharma_talks_tenant_slug_unique UNIQUE (tenant_id, slug);

-- 5. Pages Table (Xác nhận lại ràng buộc)
ALTER TABLE public.pages DROP CONSTRAINT IF EXISTS pages_slug_key;

ALTER TABLE public.pages
DROP CONSTRAINT IF EXISTS pages_tenant_id_slug_key;

ALTER TABLE public.pages
ADD CONSTRAINT pages_tenant_slug_unique UNIQUE (tenant_id, slug);
