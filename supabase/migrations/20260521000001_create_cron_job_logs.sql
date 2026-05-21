-- Migration: Create cron_job_logs table
-- Purpose: Track execution status of all scheduled cron jobs (backup, reminders, publish)
-- Referenced in: TASK-4.1 (Admin Gap Analysis)

CREATE TABLE IF NOT EXISTS public.cron_job_logs (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    job_name    text NOT NULL,
    status      text NOT NULL CHECK (status IN ('success', 'failed', 'running')),
    message     text,
    metadata    jsonb DEFAULT '{}',
    duration_ms integer,
    executed_at timestamptz DEFAULT now() NOT NULL
);

-- Index để query nhanh log theo job và thời gian
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_job_name    ON public.cron_job_logs (job_name, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_executed_at ON public.cron_job_logs (executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_status      ON public.cron_job_logs (status);

-- Chỉ super_admin và service_role được đọc/ghi
ALTER TABLE public.cron_job_logs ENABLE ROW LEVEL SECURITY;

-- Service role (cron handlers) có full access
CREATE POLICY "service_role_full_access_cron_logs"
    ON public.cron_job_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Super admin và global admins có thể đọc
CREATE POLICY "global_admin_read_cron_logs"
    ON public.cron_job_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
              AND ur.role IN ('super_admin', 'admin', 'company_editor', 'agency_admin')
        )
    );

-- Tự động xóa logs cũ hơn 90 ngày (giữ log sạch)
-- Chạy thủ công hoặc qua pg_cron nếu có
COMMENT ON TABLE public.cron_job_logs IS
    'Lưu trạng thái thực thi của các cron jobs: backup, event-reminders, publish-scheduled. Retention: 90 days.';
