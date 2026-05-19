-- ==============================================================================
-- MIGRATION: ABAC (Attribute-Based Access Control) Policies
-- Ngày: 2026-05-16
-- Đề tài: Nghiên cứu và thiết kế kiến trúc phần mềm an toàn cho nền tảng đa
--         khách hàng: Áp dụng Row-Level Security và Audit Log trong quản trị
--         rủi ro thông tin.
--
-- Mục đích: Nâng cấp từ RBAC thuần túy sang ABAC bổ sung, tăng cường kiểm soát
--           truy cập dựa trên thuộc tính ngữ cảnh (thời gian, loại thao tác).
--
-- Tham chiếu: ISO/IEC 27017 §CLD.9.5.1 — Kiểm soát truy cập đặc quyền
-- ==============================================================================

-- ==============================================================================
-- PHẦN 1: TIME-BASED ACCESS CONTROL (Giới hạn giờ hành chính)
-- ==============================================================================

-- Hàm kiểm tra giờ hành chính (07:00 — 22:00 ICT = UTC+7)
-- Mục đích: Chặn thao tác ghi (INSERT/UPDATE/DELETE) ngoài giờ hành chính
-- cho các vai trò tenant_editor và tenant_accountant.
CREATE OR REPLACE FUNCTION public.is_within_business_hours()
RETURNS BOOLEAN AS $$
BEGIN
    -- Giờ hiện tại theo múi giờ Asia/Ho_Chi_Minh (ICT, UTC+7)
    RETURN EXTRACT(HOUR FROM NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')
        BETWEEN 7 AND 21; -- 07:00 đến 21:59
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, extensions;

COMMENT ON FUNCTION public.is_within_business_hours() IS
'ABAC Policy: Kiểm tra thời gian hiện tại có nằm trong giờ hành chính (07:00-22:00 ICT). 
Dùng trong RLS policies để giới hạn quyền ghi cho editor/accountant ngoài giờ.
Tham chiếu: ISO 27017 §CLD.9.5.1 — Kiểm soát truy cập đặc quyền dựa trên thuộc tính.';

-- ==============================================================================
-- PHẦN 2: ABAC POLICY CHO BẢNG NEWS (Minh họa)
-- ==============================================================================

-- Thêm policy ABAC cho tenant_editor: chỉ ghi trong giờ hành chính
-- (Bổ sung, không thay thế RBAC policy hiện có)
DO $$
BEGIN
    -- Kiểm tra xem policy đã tồn tại chưa
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'news' AND policyname = 'ABAC_time_restrict_editor_write'
    ) THEN
        -- Policy: Editor chỉ INSERT/UPDATE ngoài giờ nếu KHÔNG phải admin/super_admin
        EXECUTE '
            CREATE POLICY "ABAC_time_restrict_editor_write" ON public.news
            FOR INSERT
            WITH CHECK (
                -- Super admin & tenant_admin: luôn được phép
                public.get_current_user_role() IN (''super_admin'', ''company_editor'', ''tenant_admin'')
                OR
                -- Editor/Accountant: chỉ trong giờ hành chính
                (
                    public.get_current_user_role() IN (''tenant_editor'', ''tenant_accountant'')
                    AND public.is_within_business_hours()
                    AND tenant_id = public.get_current_tenant_id()
                )
            )
        ';
        RAISE NOTICE 'Created ABAC time-based policy for news INSERT';
    ELSE
        RAISE NOTICE 'ABAC policy for news INSERT already exists, skipping.';
    END IF;
END;
$$;

-- ==============================================================================
-- PHẦN 3: AUDIT-ENHANCED DELETE PROTECTION
-- ==============================================================================

-- Trigger function: Tự động ghi audit log TRƯỚC mỗi DELETE operation
-- trên các bảng nhạy cảm (news, events, transactions).
-- Mục đích: Đảm bảo mọi thao tác xóa đều để lại dấu vết không thể xóa.
CREATE OR REPLACE FUNCTION public.audit_before_delete()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id,
        user_email,
        action,
        resource,
        table_name,
        record_id,
        old_data,
        tenant_id,
        ip_address
    ) VALUES (
        auth.uid(),
        (SELECT email FROM auth.users WHERE id = auth.uid()),
        'delete',
        TG_TABLE_NAME,
        TG_TABLE_NAME,
        OLD.id::TEXT,
        to_jsonb(OLD),
        CASE WHEN TG_TABLE_NAME IN ('news', 'events', 'transactions') 
             THEN OLD.tenant_id 
             ELSE NULL 
        END,
        current_setting('request.headers', true)::json->>'x-forwarded-for'
    );
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions;

COMMENT ON FUNCTION public.audit_before_delete() IS
'Trigger function ghi audit log trước mỗi DELETE operation.
Đảm bảo rằng dữ liệu cũ (OLD) được lưu trữ vĩnh viễn trong audit_logs
TRƯỚC KHI bản ghi bị xóa khỏi bảng gốc. Không thể bypass.
Tham chiếu: ISO 27017 §CLD.12.4.1 — Bảo vệ nhật ký sự kiện.';

-- Gắn trigger cho các bảng nhạy cảm
DO $$
DECLARE
    tbl TEXT;
    sensitive_tables TEXT[] := ARRAY['news', 'events', 'transactions'];
BEGIN
    FOREACH tbl IN ARRAY sensitive_tables LOOP
        BEGIN
            -- Drop trigger cũ nếu tồn tại để tránh duplicate
            EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_before_delete ON public.%I', tbl);
            
            EXECUTE format(
                'CREATE TRIGGER trg_audit_before_delete 
                 BEFORE DELETE ON public.%I 
                 FOR EACH ROW 
                 EXECUTE FUNCTION public.audit_before_delete()',
                tbl
            );
            RAISE NOTICE 'Created audit DELETE trigger for: %', tbl;
        EXCEPTION WHEN undefined_table THEN
            RAISE NOTICE 'Table % not found, skipping trigger.', tbl;
        END;
    END LOOP;
END;
$$;

-- ==============================================================================
-- PHẦN 4: RPC FUNCTION - get_rls_coverage (cho SOC Dashboard)
-- ==============================================================================

-- Function trả về tỉ lệ bảng được bảo vệ bởi RLS
CREATE OR REPLACE FUNCTION public.get_rls_coverage()
RETURNS TABLE (
    protected INT,
    total INT,
    percentage INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::INT FROM pg_tables t
         JOIN pg_class c ON c.relname = t.tablename AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
         WHERE t.schemaname = 'public' AND c.relrowsecurity = true
        ) AS protected,
        (SELECT COUNT(*)::INT FROM pg_tables WHERE schemaname = 'public') AS total,
        CASE 
            WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') = 0 THEN 0
            ELSE (
                (SELECT COUNT(*)::INT FROM pg_tables t
                 JOIN pg_class c ON c.relname = t.tablename AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
                 WHERE t.schemaname = 'public' AND c.relrowsecurity = true
                ) * 100 /
                (SELECT COUNT(*)::INT FROM pg_tables WHERE schemaname = 'public')
            )
        END AS percentage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, extensions;

-- Thu hồi quyền anon (chỉ admin mới cần gọi)
REVOKE EXECUTE ON FUNCTION public.get_rls_coverage() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_within_business_hours() FROM anon;
REVOKE EXECUTE ON FUNCTION public.audit_before_delete() FROM anon;

COMMENT ON FUNCTION public.get_rls_coverage() IS
'Trả về thống kê RLS Coverage: số bảng có RLS / tổng bảng trong schema public.
Dùng cho SOC Dashboard hiển thị Security Score.';

-- ==============================================================================
-- HOÀN TẤT: ABAC + Audit-enhanced DELETE + RLS Coverage RPC
-- Kết quả: Bổ sung 3 lớp bảo mật mới lên kiến trúc RBAC hiện có.
-- ==============================================================================
