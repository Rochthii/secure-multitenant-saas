-- Migration: News Workflow - Lịch đăng, tác giả, duyệt bài
-- Chạy trong Supabase SQL Editor

-- 1. Thêm cột author_name (lưu tên hiển thị, tránh JOIN auth.users)
ALTER TABLE news ADD COLUMN IF NOT EXISTS author_name TEXT;

-- 2. Thêm cột lên lịch đăng
ALTER TABLE news ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

-- 3. Thêm cột thông tin duyệt bài
ALTER TABLE news
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users (id) ON DELETE SET NULL;

ALTER TABLE news ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

ALTER TABLE news ADD COLUMN IF NOT EXISTS review_note TEXT;

ALTER TABLE news ADD COLUMN IF NOT EXISTS reviewer_name TEXT;

-- 4. Mở rộng enum status thêm pending_review, scheduled, rejected
-- (Supabase dùng CHECK constraint, không phải enum type)
ALTER TABLE news DROP CONSTRAINT IF EXISTS news_status_check;

ALTER TABLE news
ADD CONSTRAINT news_status_check CHECK (
    status IN (
        'draft',
        'pending_review',
        'scheduled',
        'published',
        'rejected',
        'archived'
    )
);

-- 5. Cập nhật RLS policy để phản ánh status mới (không thay đổi logic)
-- Policy "Public can view published news" vẫn đúng vì chỉ status='published' mới public