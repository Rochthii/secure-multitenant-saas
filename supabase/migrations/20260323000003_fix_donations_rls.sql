-- Migration: Fix insecure RLS policies for transactions table
-- Replaces usage of user_metadata with user_roles table via helper functions
-- Added by Antigravity on 2026-03-23

-- 1. Drop insecure policies
DROP POLICY IF EXISTS "Global admins can manage all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Tenant admins can view own transactions" ON public.transactions;

-- 2. Create secure policies
-- Policy: Only global admins can manage (Super Admin / Company Admin)
CREATE POLICY "Global admins can manage all transactions" 
ON public.transactions 
FOR ALL 
USING (
  public.get_current_user_role() IN ('super_admin', 'company_editor')
);

-- Policy: Tenant admins/accountants can ONLY read their own tenant's transactions
CREATE POLICY "Tenant admins can view own transactions" 
ON public.transactions 
FOR SELECT 
USING (
  public.get_current_user_role() IN ('tenant_admin', 'tenant_accountant')
  AND 
  tenant_id = public.get_current_tenant_id()
);
