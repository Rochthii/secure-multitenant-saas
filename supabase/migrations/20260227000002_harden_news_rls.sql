-- Migration: Củng cố và vá lỗi bảo mật RLS cho bảng News
-- Ngày: 2026-02-27
-- Mục đích: Đảm bảo CTV (Volunteer) KHÔNG THỂ xem bài nháp của người khác. Chỉ được xem bài nháp của chính mình.
-- Đảm bảo Hacker ẩn danh không thể xem bất kỳ bản nháp nào.
-- Đảm bảo Admin có toàn quyền.

-- 1. Xoá TOÀN BỘ Policy cũ trên bảng news để làm lại từ đầu cho sạch
DROP POLICY IF EXISTS "Published news are viewable by everyone" ON news;

DROP POLICY IF EXISTS "Admins can manage all news" ON news;

DROP POLICY IF EXISTS "Admin roles can manage all news" ON news;

DROP POLICY IF EXISTS "Authors can view their own news" ON news;

DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."news";

-- 2. Bật cứng RLS (đề phòng ai đó tắt)
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- 3. Tạo Policy số 1: Công khai - Chỉ được phép XEM (SELECT) các bài đã Đăng (Published)
CREATE POLICY "Public_Select_Published" ON news FOR
SELECT USING (status = 'published');

-- 4. Tạo Policy số 2: Tác giả (Authors) được phép XEM bài viết của chính họ (Bất kể trạng thái là Draft hay Pending)
-- CHỈ ÁP DỤNG cho thao tác XEM (SELECT). Không cho phép Insert hay Update trực tiếp qua API client.
CREATE POLICY "Author_Select_OwnNews" ON news FOR
SELECT USING (
        auth.uid () IS NOT NULL
        AND auth.uid () = author_id
    );

-- 5. Tạo Policy số 3: Quyền Quản trị viên (Admin/Editor/Moderator) có toàn quyền thao tác trên news
-- Tạo hàm bằng 'public' thay vì 'auth' để tránh lỗi permission denied của Supabase
CREATE OR REPLACE FUNCTION public.has_admin_role()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' IN ('super_admin', 'admin', 'editor', 'moderator')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "Admin_ALL_News" ON news FOR ALL USING (public.has_admin_role ());

-- 6. GHI CHÚ: Mọi thao tác Insert/Update của Tác giả (CTV) ĐỀU PHẢI ĐI QUA Server Actions của Next.js (Dùng Service Key).
-- Dưới CSDL RLS, Volunteer bị cấm hoàn toàn quyền GHI. Điều này chống Hacker tấn công qua API một cách hoàn hảo.