-- ==============================================================================
-- MIGRATION: Bổ sung cột cho hệ thống SOC Cảnh báo tự động (ISO 27017)
-- ==============================================================================

ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'INFO',
ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.audit_logs.severity IS 'Mức độ nghiêm trọng của log: INFO, WARNING, CRITICAL';