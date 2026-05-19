-- ==============================================================================
-- MIGRATION: Fix Audit Logs Schema & Trigger
-- Ngày: 2026-05-17
-- ==============================================================================

-- 1. Bổ sung các cột bị thiếu (nếu môi trường chưa có)
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS user_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS resource VARCHAR(255),
ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- 2. Hàm Trigger an toàn, tương thích mọi bảng (không sợ crash do thiếu cột)
CREATE OR REPLACE FUNCTION public.audit_before_delete()
RETURNS TRIGGER AS $$
DECLARE
    client_ip TEXT;
    extracted_tenant_id UUID;
BEGIN
    -- Lấy IP an toàn
    BEGIN
        client_ip := split_part(current_setting('request.headers', true)::json->>'x-forwarded-for', ',', 1);
    EXCEPTION WHEN OTHERS THEN
        client_ip := NULL;
    END;

    -- Lấy tenant_id từ OLD một cách an toàn thông qua JSONB (nếu bảng không có tenant_id sẽ tự động ra NULL)
    BEGIN
        extracted_tenant_id := (to_jsonb(OLD)->>'tenant_id')::UUID;
    EXCEPTION WHEN OTHERS THEN
        extracted_tenant_id := NULL;
    END;

    INSERT INTO public.audit_logs (
        user_id,
        user_email,
        action,
        resource,
        table_name,
        record_id,
        old_data,
        tenant_id,
        ip_address
    ) VALUES (
        auth.uid(),
        (SELECT email FROM auth.users WHERE id = auth.uid()),
        'delete',
        TG_TABLE_NAME,
        TG_TABLE_NAME,
        (to_jsonb(OLD)->>'id')::TEXT, -- An toàn cho cả record_id dạng TEXT
        to_jsonb(OLD),
        extracted_tenant_id,
        NULLIF(client_ip, '')::INET
    );
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions;

-- 3. Gắn Trigger cho TOÀN BỘ các bảng chính (Vì ban nãy chỉ gắn cho 3 bảng nên xóa bảng khác không nhảy Log)
DO $$
DECLARE
    tbl TEXT;
    -- Danh sách mở rộng toàn bộ các bảng cần audit
    all_tables TEXT[] := ARRAY[
        'news', 'events', 'donations', 'categories', 'media', 'pages', 
        'testimonials', 'charity_posts', 'dharma_talks', 'donation_campaigns',
        'contact_messages', 'organizations', 'bank_accounts'
    ];
BEGIN
    FOREACH tbl IN ARRAY all_tables LOOP
        BEGIN
            EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_before_delete ON public.%I', tbl);
            EXECUTE format(
                'CREATE TRIGGER trg_audit_before_delete 
                 BEFORE DELETE ON public.%I 
                 FOR EACH ROW 
                 EXECUTE FUNCTION public.audit_before_delete()',
                tbl
            );
        EXCEPTION WHEN undefined_table THEN
            -- Bỏ qua nếu bảng không tồn tại
        END;
    END LOOP;
END;
$$;
