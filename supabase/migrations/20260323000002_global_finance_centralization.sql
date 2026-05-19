-- Migration: Global Finance Centralization
-- Description: Adds multi-account bank management and centralizes transaction tracking.

-- 1. Create bank_accounts table
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    bank_code TEXT NOT NULL, -- e.g., '970416' for ACB
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    qr_template TEXT DEFAULT 'compact2',
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add bank_account_id to transaction_purposes
ALTER TABLE public.transaction_purposes 
ADD COLUMN IF NOT EXISTS bank_account_id UUID REFERENCES public.bank_accounts(id);

-- 3. Add bank_account_id to transaction_projects
ALTER TABLE public.transaction_projects 
ADD COLUMN IF NOT EXISTS bank_account_id UUID REFERENCES public.bank_accounts(id);

-- 4. Add centralized_finance flag to tenants
-- This allows toggling whether a tenant manages its own money or not
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS centralized_finance BOOLEAN DEFAULT false;

-- 5. Enable RLS on bank_accounts
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for bank_accounts
-- Only global admins can manage bank accounts
CREATE POLICY "Global admins can manage bank accounts" ON public.bank_accounts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('super_admin', 'company_editor')
        )
    );

-- Everyone can view (needed for payment pages)
CREATE POLICY "Everyone can view active bank accounts" ON public.bank_accounts
    FOR SELECT
    USING (is_active = true);

-- 7. Indexing
CREATE INDEX IF NOT EXISTS idx_bank_accounts_tenant ON public.bank_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transaction_purposes_bank_account ON public.transaction_purposes(bank_account_id);

-- 8. Add bank_account_id to transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS bank_account_id UUID REFERENCES public.bank_accounts(id);
