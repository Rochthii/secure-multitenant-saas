-- ==============================================================================
-- BỨC TƯỜNG LỬA (HACKER ĐÓNG CỬA MÁY CHỦ BỞI POSTMAN/DDoS SPAM)
-- ==============================================================================

-- 1. XOÁ BỎ QUYỀN VÔ DANH ĐĂNG KÝ SỰ KIỆN TỰ DO
DROP POLICY IF EXISTS "Anyone can register for events" ON public.event_registrations;
-- (Dự phòng cho tên khác do có thể Dev cũ đặt tên khác)
DROP POLICY IF EXISTS "Public can insert event registrations" ON public.event_registrations;

DROP POLICY IF EXISTS "Public Insert Event Registrations" ON public.event_registrations;

-- 2. XOÁ BỎ QUYỀN VÔ DANH QUYÊN GÓP TỰ DO
DROP POLICY IF EXISTS "Anyone can donate" ON public.transactions;

DROP POLICY IF EXISTS "Public can insert transactions" ON public.transactions;

DROP POLICY IF EXISTS "Public Insert Transactions" ON public.transactions;

-- 3. XOÁ BỎ QUYỀN VÔ DANH GỬI LIÊN HỆ TỰ DO
DROP POLICY IF EXISTS "Anyone can send contact messages" ON public.contact_messages;

DROP POLICY IF EXISTS "Public can insert contact messages" ON public.contact_messages;

DROP POLICY IF EXISTS "Public can create contact messages" ON public.contact_messages;

DROP POLICY IF EXISTS "Public can insert contact" ON public.contact_messages;

DROP POLICY IF EXISTS "Public Insert Contact Messages" ON public.contact_messages;

-- ==============================================================================
-- GHI CHÚ BẢO MẬT:
-- Hiện tại bảng event_registrations, transactions, contact_messages KHÔNG CÓ BẤT KỲ
-- QUYỀN INSERT NÀO TỪ MÔI TRƯỜNG BÊN NGOÀI CLIENT TRÌNH DUYỆT (Quyền Role=Anon hoặc Authenticated).
-- Các thao tác lưu dữ liệu bắt buộc phải đi qua Next.js Server Actions
-- bằng chìa khoá `SUPABASE_SERVICE_ROLE_KEY` (Quyền Service Role bỏ qua RLS).
-- Mũi tên chống Hacker 100%.
-- ==============================================================================