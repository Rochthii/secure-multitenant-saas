-- ==============================================================================
-- MIGRATION: Bổ sung cấu trúc dữ liệu cho Sổ cái kiểm toán phi tập trung IPFS (WORM V2)
-- Ngày tạo: 2026-07-06
-- ==============================================================================

BEGIN;

-- 1. Thêm cột lưu trữ CID và prev_block_hash cho liên kết chuỗi
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS decentralized_cid TEXT,
ADD COLUMN IF NOT EXISTS prev_block_hash TEXT;

-- 2. Đánh chỉ mục tối ưu hóa tốc độ truy xuất cho bộ thẩm định
CREATE INDEX IF NOT EXISTS idx_audit_logs_blockchain_validation 
ON public.audit_logs (created_at DESC) 
WHERE decentralized_cid IS NOT NULL;

COMMIT;
