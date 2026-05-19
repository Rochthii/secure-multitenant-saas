-- ==============================================================================
-- CẬP NHẬT RÀNG BUỘC KHÓA NGOẠI (FOREIGN KEY) THÀNH ON DELETE CASCADE (PHẦN 2)
-- GIẢI QUYẾT: Bổ sung các bảng như transaction_projects, pages, faqs... bị miss ở version trước
-- ==============================================================================

DO $$ 
DECLARE
    r RECORD;
    con_name text;
BEGIN
    -- Vòng lặp tìm TẤT CẢ các khóa ngoại trong public schema
    FOR r IN (
        SELECT 
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            tc.constraint_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
          -- Bổ sung danh sách quét toàn bộ Parent Tables hệ thống có khả năng bị Delete
          AND ccu.table_name IN ('tenants', 'categories', 'news', 'events', 'dharma_talks', 'media', 'tags', 'transaction_projects', 'transactions', 'pages', 'faqs', 'about_sections')
    ) LOOP
        -- Kiểm tra xem constraint này đã có CASCADE chưa (bằng cách check pg_constraint confdeltype)
        -- confdeltype = 'c' là CASCADE
        IF EXISTS (
            SELECT 1 FROM pg_constraint c 
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE c.conname = r.constraint_name AND n.nspname = 'public' AND confdeltype != 'c'
        ) THEN
            -- In thông báo
            RAISE NOTICE 'Updating FK % on table % to ON DELETE CASCADE...', r.constraint_name, r.table_name;
            
            -- Xóa constraint cũ
            EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', r.table_name, r.constraint_name);
            
            -- Thêm constraint mới với ON DELETE CASCADE
            EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES public.%I(id) ON DELETE CASCADE', 
                r.table_name, r.constraint_name, r.column_name, r.foreign_table_name);
        END IF;

    END LOOP;
END $$;