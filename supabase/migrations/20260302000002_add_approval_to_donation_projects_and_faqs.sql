-- Migration: Thêm approval_status vào bảng transaction_projects
-- Mục đích: Cho phép Admin duyệt chiến dịch quyên góp trước khi hiển thị công khai

ALTER TABLE public.transaction_projects
ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'draft' CHECK (
    approval_status IN (
        'draft',
        'pending_review',
        'published',
        'rejected'
    )
);

-- Update các dự án đang is_active=true thành published
UPDATE public.transaction_projects
SET
    approval_status = 'published'
WHERE
    is_active = true;

-- Update các dự án đang is_active=false thành draft
UPDATE public.transaction_projects
SET
    approval_status = 'draft'
WHERE
    is_active = false;

-- Thêm approval_status vào bảng faqs
ALTER TABLE public.faqs
ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'published' CHECK (
    approval_status IN (
        'draft',
        'pending_review',
        'published',
        'rejected'
    )
);

-- Sync từ is_published sang approval_status
UPDATE public.faqs
SET
    approval_status = CASE
        WHEN is_published = true THEN 'published'
        ELSE 'draft'
    END;

-- Comment
COMMENT ON COLUMN public.transaction_projects.approval_status IS 'Trạng thái duyệt chiến dịch quyên góp: draft, pending_review, published, rejected';

COMMENT ON COLUMN public.faqs.approval_status IS 'Trạng thái duyệt câu hỏi: draft, pending_review, published, rejected';