-- ==============================================================================
-- MIGRATION: Fix RLS Security for Provinces Table
-- Ngày: 2026-04-11
-- Mục đích: Bật Row Level Security cho bảng provinces và thiết lập quyền truy cập.
-- ==============================================================================

-- 1. Bật RLS
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;

-- 2. Dọn dẹp Policy cũ (nếu có)
DROP POLICY IF EXISTS "Allow public read access to provinces" ON public.provinces;
DROP POLICY IF EXISTS "Allow super_admin to manage provinces" ON public.provinces;

-- 3. Cấu hình Policy mới

-- Mọi người (Public/Anon/Authenticated) đều có quyền xem danh sách tỉnh thành
-- Điều này cần thiết cho các bộ lọc Tìm kiếm chi nhánh và Form đăng ký.
CREATE POLICY "Allow public read access to provinces" ON public.provinces
    FOR SELECT USING (true);

-- Chỉ Super Admin mới có quyền thực hiện các thao tác thay đổi dữ liệu (INSERT/UPDATE/DELETE)
CREATE POLICY "Allow super_admin to manage provinces" ON public.provinces
    FOR ALL USING (
        public.get_current_user_role() = 'super_admin'
    );

-- Ghi chú: Quyền SELECT vẫn được duy trì qua lệnh GRANT SELECT đã có trong migration trước đó.
-- RLS Policy này đóng vai trò là chốt chặn cuối cùng ở mức bản ghi.
