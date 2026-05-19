-- ==============================================================================
-- MIGRATION: Database Security Hardening (Supabase Linter Fixes)
-- Ngày: 2026-03-13
-- Mục đích:
--   1. Fix "Function Search Path Mutable" (Cố định search_path cho SQL functions).
--   2. Fix "Extension in Public" (Di chuyển extensions sang schema riêng).
--   3. Fix "RLS Policy Always True" (Thắt chặt chính sách chèn dữ liệu công cộng).
-- ==============================================================================

-- 1. DI CHUYỂN EXTENSIONS SANG SCHEMA RIÊNG
CREATE SCHEMA IF NOT EXISTS extensions;

-- Lưu ý: Một số hàm có thể phụ thuộc vào unaccent/pg_trgm. 
-- Việc di chuyển này được thực hiện trước khi fix search_path của functions.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'unaccent') THEN
        ALTER EXTENSION unaccent SET SCHEMA extensions;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
        ALTER EXTENSION pg_trgm SET SCHEMA extensions;
    END IF;
END $$;


-- 2. FIX SEARCH PATH CHO CÁC FUNCTIONS (BẢO VỆ CHỐNG SEARCH PATH HIJACKING)
-- Thiết lập search_path = public, extensions cho toàn bộ các hàm cốt lõi.

DO $$
DECLARE
    fn_sig TEXT;
    fn_sigs TEXT[] := ARRAY[
        'public.get_current_tenant_id()',
        'public.is_global_admin()',
        'public.get_current_user_role()',
        'public.has_admin_role()',
        'public.is_authorized_admin(target_tenant_id uuid)',
        'public.is_authorized_finance_admin(target_tenant_id uuid)',
        'public.auto_set_tenant_id()',
        'public.check_rate_limit(p_ip text, p_action text, p_max_hits integer, p_window_seconds integer, p_tenant_id uuid)',
        'public.cleanup_old_rate_limits()',
        'public.cleanup_inactive_visitors()',
        'public.update_updated_at_column()'
    ];
BEGIN
    FOREACH fn_sig IN ARRAY fn_sigs LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION %s SET search_path = public, extensions', fn_sig);
            RAISE NOTICE 'Set search_path for %', fn_sig;
        EXCEPTION WHEN undefined_function OR undefined_object THEN
            RAISE NOTICE 'Function % does not exist, skipping.', fn_sig;
        END;
    END LOOP;
END;
$$;


-- 3. THẮT CHẶT RLS POLICIES (BỎ CHỈ THỊ "CHECK (true)")
-- Thay thế CHECK (true) bằng những kiểm tra thực tế (ví dụ: tenant_id phải tồn tại).

-- [contact_messages]
DROP POLICY IF EXISTS "Anon_Insert_Contact_Messages" ON public.contact_messages;
CREATE POLICY "Anon_Insert_Contact_Messages" ON public.contact_messages FOR INSERT 
WITH CHECK (
    tenant_id IS NOT NULL AND length(email) > 5 AND length(message) > 0
);

-- [transactions]
DROP POLICY IF EXISTS "Anon_Insert_Transactions" ON public.transactions;
CREATE POLICY "Anon_Insert_Transactions" ON public.transactions FOR INSERT 
WITH CHECK (
    tenant_id IS NOT NULL AND amount > 0
);

-- [event_registrations]
DROP POLICY IF EXISTS "Anon_Insert_Event_Registrations" ON public.event_registrations;
CREATE POLICY "Anon_Insert_Event_Registrations" ON public.event_registrations FOR INSERT 
WITH CHECK (
    tenant_id IS NOT NULL AND event_id IS NOT NULL
);

-- [newsletter_subscribers]
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT 
WITH CHECK (
    tenant_id IS NOT NULL AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- HOÀN TẤT BẢN VÁ BẢO MẬT.
