-- Add is_visible column to categories table
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;

-- Update all existing categories to be visible by default
UPDATE public.categories
SET
    is_visible = true
WHERE
    is_visible IS NULL;