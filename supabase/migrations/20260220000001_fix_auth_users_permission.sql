-- ════════════════════════════════════════════════════════════════════════════
-- FINAL FIX: Xóa hết policies cũ + has_permission function
-- Chạy trong Supabase SQL Editor
-- ════════════════════════════════════════════════════════════════════════════

-- ── Bước 1: Xem định nghĩa của has_permission (để debug) ──────────────────
SELECT proname, prosrc FROM pg_proc WHERE proname = 'has_permission';

-- ── Bước 2: Xem triggers trên news ────────────────────────────────────────
SELECT
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE
    event_object_table = 'news';

-- ── Bước 3: Xóa TẤT CẢ policies cũ trên news ─────────────────────────────
DROP POLICY IF EXISTS "Published news are viewable by everyone" ON news;

DROP POLICY IF EXISTS "Staff can manage news" ON news;

DROP POLICY IF EXISTS "Public Read Access" ON news;

DROP POLICY IF EXISTS "Admin can do everything on news" ON news;

DROP POLICY IF EXISTS "Admins and Editors can manage all news" ON news;

DROP POLICY IF EXISTS "Staff can view all news" ON news;

DROP POLICY IF EXISTS "Public can view published news" ON news;

DROP POLICY IF EXISTS "Admin roles can manage all news" ON news;

DROP POLICY IF EXISTS "Admins can manage all news" ON news;

-- ── Bước 4: Tạo lại sạch với JWT check (không cần function) ──────────────
-- Public xem tin published
CREATE POLICY "Public can view published news"
  ON news FOR SELECT
  USING ((status)::text = 'published'::text);

-- Admin/editor/moderator/super_admin quản lý toàn bộ
CREATE POLICY "Admin roles can manage all news" ON news FOR ALL USING (
    (
        auth.jwt () -> 'user_metadata' ->> 'role'
    ) IN (
        'super_admin',
        'admin',
        'editor',
        'moderator'
    )
);

-- ── Bước 5: Verify lại ────────────────────────────────────────────────────
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'news';