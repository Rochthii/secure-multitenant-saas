-- Migration: Add missing columns to transaction_projects for project support
-- Created on: 2026-04-02

-- 1. Add columns to public.transaction_projects
ALTER TABLE "public"."transaction_projects" 
ADD COLUMN IF NOT EXISTS "is_project" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "start_date" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "end_date" TIMESTAMPTZ;

-- 2. Update existing records
-- Projects from the legacy 'transaction_projects' table were merged with type 'specific_project'
UPDATE "public"."transaction_projects"
SET "is_project" = true
WHERE "type" = 'specific_project';

-- 3. Optimization: Add indexes for sorting and filtering
CREATE INDEX IF NOT EXISTS idx_transaction_projects_is_project ON "public"."transaction_projects" (is_project) WHERE is_project = true;
CREATE INDEX IF NOT EXISTS idx_transaction_projects_start_date ON "public"."transaction_projects" (start_date DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_projects_status ON "public"."transaction_projects" (status);
