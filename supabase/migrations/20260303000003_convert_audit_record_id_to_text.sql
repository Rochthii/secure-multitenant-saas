-- Chuyển đổi kiểu dữ liệu của record_id trong bảng audit_logs từ UUID sang TEXT
-- để hỗ trợ ghi nhận log các bản ghi có khóa chính là chuỗi (ví dụ about_sections).

ALTER TABLE public.audit_logs
ALTER COLUMN record_id TYPE TEXT USING record_id::TEXT;