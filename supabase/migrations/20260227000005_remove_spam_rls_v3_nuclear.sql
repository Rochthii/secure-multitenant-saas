-- ==============================================================================
-- BẢN V3: NUCLEAR CLEANUP - XOÁ SẠCH MỌI CHÍNH SÁCH RLS ĐANG TỒN TẠI
-- ==============================================================================

DO $$ 
DECLARE 
    tbl_name TEXT;
    pol_name RECORD;
BEGIN 
    -- Duyệt qua 3 bảng mục tiêu
    FOR tbl_name IN SELECT UNNEST(ARRAY['event_registrations', 'transactions', 'contact_messages', 'newsletter_subscribers']) LOOP
        
        -- Tìm và Xoá TOÀN BỘ Policy của bảng đó
        FOR pol_name IN (SELECT policyname FROM pg_policies WHERE tablename = tbl_name AND schemaname = 'public') LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol_name.policyname, tbl_name);
            RAISE NOTICE 'Đã xoá Policy: % trên bảng: %', pol_name.policyname, tbl_name;
        END LOOP;
        
    END LOOP;
END $$;

-- ==============================================================================
-- SAU KHI QUÉT SẠCH, CHỈ THIẾT LẬP LẠI QUYỀN CHO ADMIN (SELECT/MANAGE)
-- ==============================================================================

-- 1. Đăng ký Sự kiện
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin_Full_Registrations" ON public.event_registrations FOR ALL USING (public.has_admin_role ());

-- 2. Quyên góp
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin_Full_Transactions" ON public.transactions FOR ALL USING (public.has_admin_role ());

-- 3. Liên hệ
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin_Full_Contact" ON public.contact_messages FOR ALL USING (public.has_admin_role ());

-- 4. Newsletter
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin_Full_Newsletter" ON public.newsletter_subscribers FOR ALL USING (public.has_admin_role ());

-- ==============================================================================
-- KẾT LUẬN: BÂY GIỜ CHỈ CÓ ADMIN MỚI ĐƯỢC THAO TÁC TRỰC TIẾP QUA API.
-- CÁC FORM CÔNG KHAI BẮT BUỘC PHẢI QUA NEXT.JS SERVER ACTIONS (Root Access).
-- ==============================================================================