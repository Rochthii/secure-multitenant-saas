-- ==============================================================================
-- MIGRATION: Kích hoạt extension pgsodium bảo mật mật mã học
-- Ngày: 2026-05-31
-- Mục tiêu: Cấu hình kích hoạt extension pgsodium trực tiếp trong database.
--   Phục vụ cho cơ chế băm mật mã học và bảo mật chữ ký số của WORM Vault.
-- ==============================================================================

-- Kích hoạt extension pgsodium (Thư viện mật mã học cho WORM Vault)
-- Lưu ý: pgSodium bắt buộc phải cài đặt trong schema pgsodium của riêng nó.
-- Extension này đã được tích hợp sẵn trên Supabase Cloud và local Docker.
CREATE EXTENSION IF NOT EXISTS pgsodium;

COMMENT ON EXTENSION pgsodium IS 'Thư viện mật mã học pgsodium (libsodium) phục vụ ký số và bảo vệ Audit Logs bất biến.';
