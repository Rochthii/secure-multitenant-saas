-- Migration: Make Hero Slide CTAs optional and add enabled toggles
-- Created: 2026-04-11

-- 1. Make existing CTA fields nullable (though they might already be, let's be sure)
ALTER TABLE hero_slides 
  ALTER COLUMN cta1_text_key DROP NOT NULL,
  ALTER COLUMN cta1_link DROP NOT NULL,
  ALTER COLUMN cta2_text_key DROP NOT NULL,
  ALTER COLUMN cta2_link DROP NOT NULL;

-- 2. Add enabled status columns
ALTER TABLE hero_slides
  ADD COLUMN IF NOT EXISTS cta1_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS cta2_enabled BOOLEAN DEFAULT TRUE;

-- 3. Update existing records to ensure data integrity if needed
-- (Since we added defaults, existing records will have TRUE)

COMMENT ON COLUMN hero_slides.cta1_enabled IS 'Whether to show the first call-to-action button';
COMMENT ON COLUMN hero_slides.cta2_enabled IS 'Whether to show the second call-to-action button';
