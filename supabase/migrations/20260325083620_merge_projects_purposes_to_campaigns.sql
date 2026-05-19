-- 1. Create Enum TYPE for Projects
CREATE TYPE project_type AS ENUM ('general_fund', 'specific_project');

-- 2. Create the unified table
CREATE TABLE IF NOT EXISTS "public"."transaction_projects" (
    "id" text NOT NULL, -- Changed from uuid to text to support both UUID projects and slug purposes
    "tenant_id" uuid REFERENCES "public"."tenants"("id") ON DELETE CASCADE,
    "bank_account_id" uuid REFERENCES "public"."bank_accounts"("id") ON DELETE SET NULL,
    "type" project_type NOT NULL DEFAULT 'specific_project',
    "title_vi" text NOT NULL,
    "title_km" text,
    "slug" text,
    "description_vi" text,
    "description_km" text,
    "content_vi" text,
    "content_km" text,
    "thumbnail_url" text,
    "target_amount" numeric,
    "current_amount" numeric DEFAULT 0,
    "status" text DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'cancelled')),
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    "created_by" uuid REFERENCES "auth"."users"("id"),
    CONSTRAINT "transaction_projects_pkey" PRIMARY KEY ("id")
);

-- 3. Copy data from transaction_purposes (Legacy)
INSERT INTO "public"."transaction_projects" (
    "id", 
    "tenant_id", 
    "bank_account_id", 
    "type", 
    "title_vi", 
    "description_vi", 
    "is_active", 
    "created_at", 
    "updated_at"
)
SELECT 
    "id", 
    "tenant_id", 
    "bank_account_id", 
    'general_fund'::project_type, 
    "title", -- Verified: purposes use 'title'
    "description", -- Verified: purposes use 'description'
    "is_active", 
    "created_at", 
    "updated_at"
FROM "public"."transaction_purposes"
ON CONFLICT DO NOTHING;

-- 4. Copy data from transaction_projects (Legacy)
INSERT INTO "public"."transaction_projects" (
    "id", 
    "tenant_id", 
    "bank_account_id", 
    "type", 
    "title_vi", 
    "title_km", 
    "slug",
    "description_vi", 
    "description_km", 
    "content_vi", 
    "content_km", 
    "thumbnail_url", 
    "target_amount", 
    "current_amount", 
    "status", 
    "is_active", 
    "created_at", 
    "updated_at"
)
SELECT 
    "id"::text, 
    "tenant_id", 
    "bank_account_id", 
    'specific_project'::project_type, 
    "title_vi", 
    "title_km", 
    "slug",
    "description_vi", 
    "description_km", 
    "content_vi", 
    "content_km", 
    "thumbnail_url", 
    "target_amount", 
    "current_amount", 
    "status", 
    "is_active", 
    "created_at", 
    "updated_at"
FROM "public"."transaction_projects"
ON CONFLICT DO NOTHING;

-- 5. Add project_id to transactions and update mapped relations
-- First add the column without the constraint to allow for data cleanup
ALTER TABLE "public"."transactions" ADD COLUMN IF NOT EXISTS "project_id" text;

-- Only map valid IDs that exist in the new projects table
UPDATE "public"."transactions" d
SET "project_id" = "purpose"
WHERE EXISTS (SELECT 1 FROM "public"."transaction_projects" c WHERE c.id = d.purpose);

-- Now safely add the foreign key constraint
ALTER TABLE "public"."transactions" 
ADD CONSTRAINT "transactions_project_id_fkey" 
FOREIGN KEY ("project_id") 
REFERENCES "public"."transaction_projects"("id") 
ON DELETE SET NULL;

-- 6. Safely remove old column from transactions table
-- Keeping "purpose" for now as a fallback for data that didn't map (like 'general')
-- ALTER TABLE "public"."transactions" DROP COLUMN IF EXISTS "purpose";

-- 7. Drop legacy tables
DROP TABLE IF EXISTS "public"."transaction_projects" CASCADE;
DROP TABLE IF EXISTS "public"."transaction_purposes" CASCADE;

-- 8. Enable Row Level Security (RLS) on new projects table
ALTER TABLE "public"."transaction_projects" ENABLE ROW LEVEL SECURITY;

-- 9. Setup Policies
CREATE POLICY "Campigns are viewable by everyone."
ON "public"."transaction_projects" FOR SELECT
USING (true);

CREATE POLICY "Projects can be created by authenticated users"
ON "public"."transaction_projects" FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Projects can be updated by authenticated users"
ON "public"."transaction_projects" FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Projects can be deleted by authenticated users"
ON "public"."transaction_projects" FOR DELETE
TO authenticated
USING (true);
