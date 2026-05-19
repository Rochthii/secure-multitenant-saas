-- Migration: Update for Centralized Transaction Model
-- Added by Antigravity on 2026-03-23

-- 1. Create Recipient Type Enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_recipient_type') THEN
        CREATE TYPE transaction_recipient_type AS ENUM ('tenant_fund', 'charity_fund');
    END IF;
END $$;

-- 2. Update tenants table
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.tenants(id);

-- 3. Update transaction_purposes table
ALTER TABLE public.transaction_purposes
ADD COLUMN IF NOT EXISTS recipient_type transaction_recipient_type DEFAULT 'tenant_fund';

-- 4. Update transaction_projects table
ALTER TABLE public.transaction_projects
ADD COLUMN IF NOT EXISTS recipient_type transaction_recipient_type DEFAULT 'charity_fund';

-- 5. Update transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS recipient_type transaction_recipient_type DEFAULT 'tenant_fund';

-- 6. Update RLS for transactions
-- Drop existing policies first
DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.transactions; -- Adjust if name differs
DROP POLICY IF EXISTS "Admins can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Only admins can view transactions" ON public.transactions;

-- Policy: Anyone can insert (Guest)
-- (Already exists in initial schema, keeping it)
-- CREATE POLICY "Anyone can donate" ON transactions FOR INSERT WITH CHECK (true);

-- Policy: Only global admins can manage (Super Admin / Company Admin)
CREATE POLICY "Global admins can manage all transactions" 
ON public.transactions 
FOR ALL 
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super_admin', 'company_editor', 'admin')
);

-- Policy: Tenant admins can ONLY read their own tenant's transactions (Reporting)
CREATE POLICY "Tenant admins can view own transactions" 
ON public.transactions 
FOR SELECT 
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('tenant_admin', 'tenant_accountant')
  AND 
  tenant_id = (SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid())
);
