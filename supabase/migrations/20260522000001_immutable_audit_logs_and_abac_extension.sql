-- ==============================================================================
-- MIGRATION: Tăng cường tính bất biến của Audit Log (Immutable Audit Logs)
-- Ngày: 2026-05-22
-- Mục đích: Ngăn chặn tuyệt đối mọi thao tác UPDATE hoặc DELETE trên bảng
--   audit_logs nhằm đảm bảo tính chống chối bỏ (Non-repudiation) và tuân thủ
--   tiêu chuẩn ISO/IEC 27017 CLD.12.4.1 (Monitoring of cloud services)
-- ==============================================================================

-- ==============================================================================
-- PHẦN 1: HÀM TRIGGER CHẶN MỌI THAO TÁC XÓA VÀ SỬA TRÊN AUDIT_LOGS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.prevent_audit_log_tampering()
RETURNS TRIGGER AS $$
BEGIN
    -- Ghi lại sự kiện cố gắng can thiệp log (meta-audit)
    -- Lưu ý: Không gọi INSERT vào audit_logs ở đây để tránh đệ quy vô hạn
    -- Thay vào đó, raise exception ngay lập tức với thông báo rõ ràng
    RAISE EXCEPTION
        'SECURITY VIOLATION [CLD.12.4.1]: Bản ghi Audit Log là BẤT BIẾN - Thao tác % trên bảng audit_logs bị từ chối hoàn toàn. Mọi hành vi can thiệp nhật ký kiểm toán là vi phạm nghiêm trọng chính sách bảo mật hệ thống.',
        TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

COMMENT ON FUNCTION public.prevent_audit_log_tampering() IS
'[ISO 27017 CLD.12.4.1] Trigger bảo vệ tính bất biến của bảng audit_logs. '
'Chặn tuyệt đối mọi thao tác UPDATE hoặc DELETE bởi bất kỳ role nào kể cả super_admin. '
'Điều này đảm bảo Non-repudiation - Không ai có thể xóa dấu vết hành động của mình.';


-- ==============================================================================
-- PHẦN 2: GẮN TRIGGER VÀO BẢNG AUDIT_LOGS
-- ==============================================================================

-- Xóa trigger cũ nếu có (idempotent)
DROP TRIGGER IF EXISTS trg_prevent_audit_log_update ON public.audit_logs;
DROP TRIGGER IF EXISTS trg_prevent_audit_log_delete ON public.audit_logs;

-- Trigger chặn UPDATE
CREATE TRIGGER trg_prevent_audit_log_update
    BEFORE UPDATE ON public.audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_audit_log_tampering();

-- Trigger chặn DELETE
CREATE TRIGGER trg_prevent_audit_log_delete
    BEFORE DELETE ON public.audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_audit_log_tampering();


-- ==============================================================================
-- PHẦN 3: KIỂM CHỨNG TRIGGER ĐÃ ĐƯỢC GẮN (Verification Query)
-- Chạy query này sau khi apply migration để xác nhận trigger đang hoạt động
-- ==============================================================================

-- Uncomment để kiểm tra:
-- DO $$
-- BEGIN
--   -- Thử xóa 1 dòng (kỳ vọng: RAISE EXCEPTION)
--   DELETE FROM public.audit_logs WHERE id = '00000000-0000-0000-0000-000000000000';
-- EXCEPTION
--   WHEN insufficient_privilege THEN
--     RAISE NOTICE '✅ PASS: Trigger immutability hoạt động đúng - DELETE bị chặn.';
-- END $$;


-- ==============================================================================
-- PHẦN 4: ABAC MỞ RỘNG — Thêm chính sách giới hạn giờ làm việc cho bảng EVENTS
-- Mục đích: Tăng coverage ABAC từ 1 bảng (news) lên 2 bảng (news + events)
-- Chứng minh tính khả dụng của ABAC time-based cho Chương 3/4 đồ án
-- ==============================================================================

-- Cần đảm bảo hàm is_within_business_hours() đã tồn tại (từ migration 20260516100000)
-- Nếu chưa có, tạo lại ở đây như fallback
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'is_within_business_hours'
    ) THEN
        EXECUTE $func$
            CREATE OR REPLACE FUNCTION public.is_within_business_hours()
            RETURNS boolean
            LANGUAGE sql STABLE SECURITY DEFINER
            AS $inner$
                SELECT EXTRACT(DOW FROM NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh') BETWEEN 1 AND 5
                   AND EXTRACT(HOUR FROM NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh') BETWEEN 8 AND 17;
            $inner$;
        $func$;
        RAISE NOTICE 'Đã tạo hàm is_within_business_hours()';
    ELSE
        RAISE NOTICE 'Hàm is_within_business_hours() đã tồn tại, bỏ qua.';
    END IF;
END $$;

-- Thêm ABAC policy cho bảng events: Editor chỉ INSERT trong giờ hành chính
DROP POLICY IF EXISTS "ABAC_time_restrict_editor_insert_events" ON public.events;

CREATE POLICY "ABAC_time_restrict_editor_insert_events" ON public.events
FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
        -- Super admin và Tenant Admin được phép mọi lúc
        public.get_current_user_role() IN ('super_admin', 'company_editor', 'tenant_admin')
        OR (
            -- Tenant Editor và các role thấp hơn chỉ được tạo bài trong giờ hành chính
            public.get_current_user_role() IN ('tenant_editor', 'editor', 'moderator')
            AND public.is_within_business_hours()
            AND tenant_id = public.get_current_tenant_id()
        )
    )
);

COMMENT ON POLICY "ABAC_time_restrict_editor_insert_events" ON public.events IS
'[ABAC Time-based] Giới hạn Tenant Editor chỉ tạo sự kiện mới trong khung giờ hành chính '
'(08:00-17:00, Thứ 2-6, GMT+7). Super Admin và Tenant Admin được miễn trừ. '
'Điều này triển khai thuộc tính thời gian trong mô hình ABAC của đồ án.';

-- Thêm ABAC policy cho bảng donation_campaigns: Editor chỉ INSERT trong giờ hành chính
DO $$
BEGIN
    -- Kiểm tra bảng donation_campaigns có tồn tại không
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'donation_campaigns'
    ) THEN
        EXECUTE $dyn$
            DROP POLICY IF EXISTS "ABAC_time_restrict_editor_insert_campaigns" ON public.donation_campaigns;
            CREATE POLICY "ABAC_time_restrict_editor_insert_campaigns" ON public.donation_campaigns
            FOR INSERT
            WITH CHECK (
                auth.uid() IS NOT NULL
                AND (
                    public.get_current_user_role() IN ('super_admin', 'company_editor', 'tenant_admin')
                    OR (
                        public.get_current_user_role() IN ('tenant_editor', 'editor', 'tenant_accountant', 'moderator')
                        AND public.is_within_business_hours()
                        AND tenant_id = public.get_current_tenant_id()
                    )
                )
            );
        $dyn$;
        RAISE NOTICE 'Đã tạo ABAC policy cho bảng donation_campaigns';
    ELSE
        RAISE NOTICE 'Bảng donation_campaigns chưa tồn tại, bỏ qua ABAC policy.';
    END IF;
END $$;
