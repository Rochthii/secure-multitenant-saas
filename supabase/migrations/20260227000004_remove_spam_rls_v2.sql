-- ==============================================================================
-- BẢN NÂNG CẤP: ĐÓNG CỬA TOÀN BỘ LỖ HỔNG RLS TRÊN 3 BẢNG NHẠY CẢM
-- ==============================================================================

-- 1. BẢNG ĐĂNG KÝ SỰ KIỆN (event_registrations)
DROP POLICY IF EXISTS "Anyone can register for events" ON public.event_registrations;

DROP POLICY IF EXISTS "Public can insert event registrations" ON public.event_registrations;

DROP POLICY IF EXISTS "Public Insert Event Registrations" ON public.event_registrations;

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.event_registrations;

-- 2. BẢNG QUYÊN GÓP (transactions)
DROP POLICY IF EXISTS "Anyone can donate" ON public.transactions;

DROP POLICY IF EXISTS "Public can insert transactions" ON public.transactions;

DROP POLICY IF EXISTS "Public Insert Transactions" ON public.transactions;

-- 3. BẢNG LIÊN HỆ (contact_messages)
DROP POLICY IF EXISTS "Anyone can send contact messages" ON public.contact_messages;

DROP POLICY IF EXISTS "Public can insert contact messages" ON public.contact_messages;

DROP POLICY IF EXISTS "Public can create contact messages" ON public.contact_messages;

DROP POLICY IF EXISTS "Public can insert contact" ON public.contact_messages;

DROP POLICY IF EXISTS "Public Insert Contact Messages" ON public.contact_messages;

-- 4. BẢNG NEWSLETTER (Bổ sung luôn cho an toàn)
DROP POLICY IF EXISTS "Public Insert Newsletter Subscribers" ON public.newsletter_subscribers;

-- ==============================================================================
-- CƯỠNG CHẾ: KHÔNG CHO PHÉP BẤT KỲ ROLE NÀO (ANON/AUTHENTICATED) INSERT TỰ DO
-- CHỈ CHO PHÉP SERVICE_ROLE (BACKEND) THỰC HIỆN.
-- ==============================================================================
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Lưu ý: Không tạo thêm bất kỳ Policy INSERT nào cho 3 bảng này nữa.
-- Next.js sẽ dùng Admin Client để Bypass RLS.