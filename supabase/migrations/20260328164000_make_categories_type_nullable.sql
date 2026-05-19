-- Migration to make categories.type nullable and remove its check constraint
-- This is necessary because the application has migrated to using the 'module' column.

ALTER TABLE public.categories 
ALTER COLUMN type DROP NOT NULL;

-- Drop the check constraint if it exists. 
-- In the initial schema it was: type IN ('news', 'event', 'media')
ALTER TABLE public.categories 
DROP CONSTRAINT IF EXISTS categories_type_check;
