ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Update existing records to have updated_at = created_at if null
/*
UPDATE public.transactions
SET
updated_at = created_at
WHERE
updated_at IS NULL;
*/