-- Migration: Upgrade Library / Digital Documents Schema
-- This script adds necessary columns to the categories table for displaying rich categories
-- and updates the media table to allow more flexible library file types.

BEGIN;

-- 1. Add description and thumbnail columns to categories table
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS description_vi TEXT,
ADD COLUMN IF NOT EXISTS description_km TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- 2. Update media type check constraint to include more specific types like book, sutra, external_link
ALTER TABLE media DROP CONSTRAINT IF EXISTS media_type_check;

ALTER TABLE media
ADD CONSTRAINT media_type_check CHECK (
    type IN (
        'image',
        'video',
        'audio',
        'document',
        'book',
        'sutra',
        'external_link'
    )
);

COMMIT;