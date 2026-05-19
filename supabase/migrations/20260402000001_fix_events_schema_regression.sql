-- Migration: Add missing is_major_festival and approval_status to events
-- Target: Fix the calendar display for Major Festivals

-- 1. Ensure `is_major_festival` exists
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS is_major_festival BOOLEAN DEFAULT false;

-- 2. Ensure `approval_status` exists (in case it fell victim to the same regression)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'approval_status') THEN
        ALTER TABLE public.events
        ADD COLUMN approval_status VARCHAR(20) DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
        
        -- Default existing events to approved
        UPDATE public.events SET approval_status = 'approved';
    END IF;
END $$;

-- 3. Ensure `tenant_id` and `published_to` exist (if not already there)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id),
ADD COLUMN IF NOT EXISTS published_to UUID[] DEFAULT '{}';

-- 4. Create an index for faster filtering by approval status and major festival
CREATE INDEX IF NOT EXISTS idx_events_approval_status ON public.events(approval_status);
CREATE INDEX IF NOT EXISTS idx_events_is_major_festival ON public.events(is_major_festival);
