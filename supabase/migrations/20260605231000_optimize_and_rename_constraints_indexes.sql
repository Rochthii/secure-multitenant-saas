-- ==============================================================================
-- MIGRATION: Tối ưu hóa chỉ mục và đồng bộ hóa ràng buộc dữ liệu (Refactoring & Indexing)
-- Ngày: 2026-06-05
-- Học viên: Chăm Rốch Thi - PTIT Đồ án tốt nghiệp
-- Mục đích: Đổi tên chỉ mục, ràng buộc khóa chính/ngoại, và tái lập RLS policies
--          để đồng bộ 100% ngữ nghĩa doanh nghiệp, đồng thời tạo các chỉ mục B-Tree
--          mới trên cột tenant_id phục vụ cô lập dữ liệu O(log N) cho RLS.
-- ==============================================================================

BEGIN;

-- 1. ĐỔI TÊN RÀNG BUỘC (CONSTRAINTS) CHO BẢNG TRANSACTION_PROJECTS
ALTER TABLE public.transaction_projects RENAME CONSTRAINT donation_campaigns_pkey TO transaction_projects_pkey;
ALTER TABLE public.transaction_projects RENAME CONSTRAINT donation_campaigns_tenant_id_fkey TO transaction_projects_tenant_id_fkey;
ALTER TABLE public.transaction_projects RENAME CONSTRAINT donation_campaigns_bank_account_id_fkey TO transaction_projects_bank_account_id_fkey;
ALTER TABLE public.transaction_projects RENAME CONSTRAINT donation_campaigns_created_by_fkey TO transaction_projects_created_by_fkey;
ALTER TABLE public.transaction_projects RENAME CONSTRAINT donation_campaigns_status_check TO transaction_projects_status_check;

-- 2. ĐỔI TÊN RÀNG BUỘC (CONSTRAINTS) CHO BẢNG TRANSACTIONS
ALTER TABLE public.transactions RENAME CONSTRAINT donations_pkey TO transactions_pkey;
ALTER TABLE public.transactions RENAME CONSTRAINT donations_tenant_id_fkey TO transactions_tenant_id_fkey;
ALTER TABLE public.transactions RENAME CONSTRAINT donations_bank_account_id_fkey TO transactions_bank_account_id_fkey;
ALTER TABLE public.transactions RENAME CONSTRAINT donations_campaign_id_fkey TO transactions_project_id_fkey;
ALTER TABLE public.transactions RENAME CONSTRAINT donations_amount_check TO transactions_amount_check;
ALTER TABLE public.transactions RENAME CONSTRAINT donations_status_check TO transactions_status_check;

-- 3. ĐỔI TÊN CHỈ MỤC (INDEXES) HIỆN CÓ ĐỂ ĐỒNG BỘ
ALTER INDEX IF EXISTS public.idx_donation_campaigns_start_date RENAME TO idx_transaction_projects_start_date;
ALTER INDEX IF EXISTS public.idx_donation_campaigns_status RENAME TO idx_transaction_projects_status;
ALTER INDEX IF EXISTS public.idx_donations_created_at RENAME TO idx_transactions_created_at;
ALTER INDEX IF EXISTS public.idx_donations_status RENAME TO idx_transactions_status;

-- 4. TẠO CÁC CHỈ MỤC (INDEXES) B-TREE MỚI TỐI ƯU HÓA HIỆU NĂNG QUÉT RLS VÀ TRUY VẤN
-- Chỉ mục trên transactions(tenant_id) giúp RLS Engine quét O(log N) thay vì Sequential Scan O(N)
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_id ON public.transactions USING btree (tenant_id);

-- Chỉ mục trên transactions(project_id) để tối ưu hóa hiệu năng JOIN/lọc theo danh mục quỹ dự án
CREATE INDEX IF NOT EXISTS idx_transactions_project_id ON public.transactions USING btree (project_id);

-- Chỉ mục trên transaction_projects(tenant_id) giúp RLS Engine quét O(log N)
CREATE INDEX IF NOT EXISTS idx_transaction_projects_tenant_id ON public.transaction_projects USING btree (tenant_id);

-- 5. CẬP NHẬT CHÍNH SÁCH BẢO MẬT ROW-LEVEL SECURITY (RLS POLICIES)
-- A. Bảng transaction_projects
DROP POLICY IF EXISTS "ABAC_time_restrict_editor_insert_campaigns" ON public.transaction_projects;
DROP POLICY IF EXISTS "Global admins can manage all campaigns" ON public.transaction_projects;
DROP POLICY IF EXISTS "Public can view active campaigns" ON public.transaction_projects;
DROP POLICY IF EXISTS "Staff can view hidden campaigns of their own tenant" ON public.transaction_projects;
DROP POLICY IF EXISTS "Tenant admins can manage own campaigns" ON public.transaction_projects;

CREATE POLICY "ABAC_time_restrict_editor_insert_projects" ON public.transaction_projects
    FOR INSERT
    TO public
    WITH CHECK (
        (auth.uid() IS NOT NULL) AND (
            ((get_current_user_role())::text = ANY ((ARRAY['super_admin'::character varying, 'company_editor'::character varying, 'tenant_admin'::character varying])::text[])) 
            OR 
            (((get_current_user_role())::text = ANY ((ARRAY['tenant_editor'::character varying, 'editor'::character varying, 'tenant_accountant'::character varying, 'moderator'::character varying])::text[])) 
             AND is_within_business_hours() 
             AND (tenant_id = get_current_tenant_id()))
        )
    );

CREATE POLICY "Global admins can manage all projects" ON public.transaction_projects
    FOR ALL
    TO authenticated
    USING (is_global_admin());

CREATE POLICY "Public can view active projects" ON public.transaction_projects
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

CREATE POLICY "Staff can view hidden projects of their own tenant" ON public.transaction_projects
    FOR SELECT
    TO authenticated
    USING (
        (is_active = false) AND (is_global_admin() OR (tenant_id = get_current_tenant_id()))
    );

CREATE POLICY "Tenant admins can manage own projects" ON public.transaction_projects
    FOR ALL
    TO authenticated
    USING (
        (NOT is_global_admin()) AND (tenant_id = get_current_tenant_id())
    )
    WITH CHECK (
        (NOT is_global_admin()) AND (tenant_id = get_current_tenant_id())
    );

-- B. Bảng transactions
DROP POLICY IF EXISTS "Anon_Insert_Donations" ON public.transactions;
DROP POLICY IF EXISTS "Anyone can view their own donation by ID" ON public.transactions;
DROP POLICY IF EXISTS "Finance_Manage_Donations" ON public.transactions;
DROP POLICY IF EXISTS "Global admins can manage all donations" ON public.transactions;
DROP POLICY IF EXISTS "Public_Insert_Donations_And_Read_Confirmed" ON public.transactions;
DROP POLICY IF EXISTS "Tenant admins can view own donations" ON public.transactions;

CREATE POLICY "Anon_Insert_Transactions" ON public.transactions
    FOR INSERT
    TO public
    WITH CHECK (
        (tenant_id IS NOT NULL) AND (amount > (0)::numeric)
    );

CREATE POLICY "Anyone can view their own transaction by ID" ON public.transactions
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Finance_Manage_Transactions" ON public.transactions
    FOR ALL
    TO public
    USING (is_authorized_finance_admin(tenant_id));

CREATE POLICY "Global admins can manage all transactions" ON public.transactions
    FOR ALL
    TO public
    USING (
        (get_current_user_role())::text = ANY ((ARRAY['super_admin'::character varying, 'company_editor'::character varying])::text[])
    );

CREATE POLICY "Public_Insert_Transactions_And_Read_Confirmed" ON public.transactions
    FOR SELECT
    TO public
    USING (
        (status)::text = 'confirmed'::text
    );

CREATE POLICY "Tenant admins can view own transactions" ON public.transactions
    FOR SELECT
    TO public
    USING (
        ((get_current_user_role())::text = ANY ((ARRAY['tenant_admin'::character varying, 'tenant_accountant'::character varying])::text[])) 
        AND 
        (tenant_id = get_current_tenant_id())
    );

COMMIT;
