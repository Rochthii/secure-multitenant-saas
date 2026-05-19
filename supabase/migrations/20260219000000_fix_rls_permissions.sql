-- Migration: Fix RLS policies to support all admin roles
-- Problem 1: Transaction RLS only allows 'admin' role, blocking 'moderator' who should also manage transactions
-- Problem 2: audit_logs has no INSERT policy (only SELECT), meaning even service role cannot insert
-- Problem 3: All admin policies only check role='admin', not 'super_admin'/'editor'/'moderator'
-- Created: 2026-02-19

-- ─── Helper function to check admin roles ────────────────────────────────────
-- Check if current user has ANY admin role (super_admin, admin, editor, moderator)
CREATE OR REPLACE FUNCTION public.has_admin_role_v1()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' IN ('super_admin', 'admin', 'editor', 'moderator')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user has 'admin' or 'super_admin' role
CREATE OR REPLACE FUNCTION public.has_full_admin_role()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' IN ('super_admin', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user can manage transactions (admin, super_admin, moderator)
CREATE OR REPLACE FUNCTION public.can_manage_transactions()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' IN ('super_admin', 'admin', 'moderator')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── Fix Transactions RLS ────────────────────────────────────────────────────────
-- Drop old restrictive policies
DROP POLICY IF EXISTS "Only admins can view transactions" ON transactions;

DROP POLICY IF EXISTS "Admins can update transactions" ON transactions;

DROP POLICY IF EXISTS "Admins can delete transactions" ON transactions;

-- Re-create with broader role support
CREATE POLICY "Admin roles can view transactions" ON transactions FOR
SELECT USING (public.can_manage_transactions ());

CREATE POLICY "Admin roles can update transactions" ON transactions FOR
UPDATE USING (public.can_manage_transactions ());

CREATE POLICY "Admin roles can delete transactions" ON transactions FOR DELETE USING (public.has_full_admin_role ());

-- ─── Fix Audit Logs RLS ───────────────────────────────────────────────────────
-- Add INSERT policy so service_role can write audit logs
DROP POLICY IF EXISTS "Only admins can view audit logs" ON audit_logs;

DROP POLICY IF EXISTS "Service role can insert audit logs" ON audit_logs;

CREATE POLICY "Admin roles can view audit logs" ON audit_logs FOR
SELECT USING (public.has_admin_role_v1 ());

-- Allow insert for authenticated users (the actual auth check is in Server Actions)
-- Service role bypasses RLS anyway, but adding this for safety
CREATE POLICY "Authenticated users can insert audit logs" ON audit_logs FOR INSERT
WITH
    CHECK (auth.uid () IS NOT NULL);

-- ─── Fix News/Events/Media/Pages RLS to support editor role ──────────────────
DROP POLICY IF EXISTS "Admins can manage all news" ON news;

CREATE POLICY "Admin roles can manage all news" ON news FOR ALL USING (public.has_admin_role_v1 ());

DROP POLICY IF EXISTS "Admins can manage all events" ON events;

CREATE POLICY "Admin roles can manage all events" ON events FOR ALL USING (public.has_admin_role_v1 ());

DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

CREATE POLICY "Admin roles can manage categories" ON categories FOR ALL USING (public.has_admin_role_v1 ());

DROP POLICY IF EXISTS "Admins can manage media" ON media;

CREATE POLICY "Admin roles can manage media" ON media FOR ALL USING (public.has_admin_role_v1 ());

DROP POLICY IF EXISTS "Admins can manage pages" ON pages;

CREATE POLICY "Admin roles can manage pages" ON pages FOR ALL USING (public.has_admin_role_v1 ());

-- ─── Fix Event Registrations ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can view event registrations" ON event_registrations;

DROP POLICY IF EXISTS "Admins can manage event registrations" ON event_registrations;

CREATE POLICY "Admin roles can view event registrations" ON event_registrations FOR
SELECT USING (public.has_admin_role_v1 ());

CREATE POLICY "Admin roles can manage event registrations" ON event_registrations FOR
UPDATE USING (public.has_admin_role_v1 ());

-- ─── Fix Contact Messages ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can view contact messages" ON contact_messages;

DROP POLICY IF EXISTS "Admins can update contact messages" ON contact_messages;

CREATE POLICY "Admin roles can view contact messages" ON contact_messages FOR
SELECT USING (public.has_admin_role_v1 ());

CREATE POLICY "Admin roles can update contact messages" ON contact_messages FOR
UPDATE USING (public.has_admin_role_v1 ());

-- ─── Also fix transactions status enum to include 'confirmed' ───────────────────
-- (In case it's not already there from previous migration)
DO $$
BEGIN
  -- Check if 'confirmed' is not already in the constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name LIKE '%transactions%status%'
    AND check_clause LIKE '%confirmed%'
  ) THEN
    ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;

ALTER TABLE transactions
ADD CONSTRAINT transactions_status_check CHECK (
    status IN (
        'pending',
        'completed',
        'failed',
        'refunded',
        'confirmed'
    )
);

END IF;

END $$;
