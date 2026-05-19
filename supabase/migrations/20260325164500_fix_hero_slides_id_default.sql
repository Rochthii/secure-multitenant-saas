-- Fix Hero Slides ID Default
-- Ensures the 'id' column has a default value of gen_random_uuid() 
-- to prevent NOT NULL constraint violations when inserting records.

ALTER TABLE IF EXISTS public.hero_slides 
ALTER COLUMN id SET DEFAULT gen_random_uuid();
