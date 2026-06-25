-- ==============================================================================
-- MIGRATION: Đổi tên bảng dharma_talks -> learning_resources
-- Ngày: 2026-06-16
-- Học viên: Chăm Rốch Thi - PTIT Đồ án tốt nghiệp
-- Mục đích: Chuyển đổi hoàn toàn cấu trúc CSDL từ Phật giáo sang doanh nghiệp
-- ==============================================================================

BEGIN;

-- 1. ĐỔI TÊN BẢNG VÀ CỘT CHÍNH
ALTER TABLE IF EXISTS public.dharma_talks RENAME TO learning_resources;

ALTER TABLE public.learning_resources RENAME COLUMN speaker_name_vi TO instructor_name_vi;
ALTER TABLE public.learning_resources RENAME COLUMN speaker_name_km TO instructor_name_km;
ALTER TABLE public.learning_resources RENAME COLUMN speaker_name_en TO instructor_name_en;

-- 2. ĐỔI TÊN BẢNG VÀ CỘT LIÊN KẾT TAGS (CÓ KIỂM TRA TỒN TẠI)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dharma_talk_tags') THEN
        ALTER TABLE public.dharma_talk_tags RENAME TO learning_resource_tags;
        ALTER TABLE public.learning_resource_tags RENAME COLUMN dharma_talk_id TO learning_resource_id;
    END IF;
END $$;

-- 3. ĐỔI TÊN CHỈ MỤC (INDEXES) BẢNG CHÍNH
ALTER INDEX IF EXISTS public.idx_dharma_talks_published_to_gin RENAME TO idx_learning_resources_published_to_gin;
ALTER INDEX IF EXISTS public.idx_dharma_talks_tenant_id RENAME TO idx_learning_resources_tenant_id;
ALTER INDEX IF EXISTS public.idx_dharma_talks_slug RENAME TO idx_learning_resources_slug;

-- 4. CẬP NHẬT RLS POLICIES CHO BẢNG CHÍNH
DROP POLICY IF EXISTS "Public can read dharma talks including broadcast" ON public.learning_resources;
DROP POLICY IF EXISTS "Authenticated users read own tenant dharma talks" ON public.learning_resources;
DROP POLICY IF EXISTS "Tenant admins can manage dharma talks" ON public.learning_resources;
DROP POLICY IF EXISTS "Public can read dharma talks" ON public.learning_resources;
DROP POLICY IF EXISTS "Public_Read_Dharma_Talks" ON public.learning_resources;
DROP POLICY IF EXISTS "Public can read learning resources including broadcast" ON public.learning_resources;
DROP POLICY IF EXISTS "Authenticated users read own tenant learning resources" ON public.learning_resources;
DROP POLICY IF EXISTS "Tenant admins can manage learning resources" ON public.learning_resources;

CREATE POLICY "Authenticated users read own tenant learning resources" ON public.learning_resources 
    FOR SELECT 
    USING (
        auth.uid() IS NOT NULL
        AND is_active = true
        AND (
            public.is_global_admin()
            OR tenant_id = public.get_current_tenant_id()
            OR public.get_current_tenant_id() = ANY(published_to)
        )
    );

CREATE POLICY "Tenant admins can manage learning resources" ON public.learning_resources 
    FOR ALL 
    USING (
        (auth.jwt() ->> 'role') = 'super_admin'
        OR
        (
            (auth.jwt() ->> 'tenant_id')::UUID = tenant_id
            AND
            (auth.jwt() ->> 'role') IN ('admin', 'editor')
        )
    );

-- 5. CẬP NHẬT RLS POLICIES CHO BẢNG TAGS LIÊN KẾT (CÓ KIỂM TRA TỒN TẠI)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'learning_resource_tags') THEN
        ALTER TABLE public.learning_resource_tags ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Public can read dharma talk tags" ON public.learning_resource_tags;
        DROP POLICY IF EXISTS "Tenant admins can manage dharma talk tags" ON public.learning_resource_tags;
        
        CREATE POLICY "Public can read learning resource tags" ON public.learning_resource_tags
            FOR SELECT USING (true);
        
        CREATE POLICY "Tenant admins can manage learning resource tags" ON public.learning_resource_tags
            FOR ALL USING (
                (auth.jwt() ->> 'role') = 'super_admin'
                OR
                (
                    (auth.jwt() ->> 'tenant_id')::UUID = tenant_id
                    AND
                    (auth.jwt() ->> 'role') IN ('admin', 'editor')
                )
            );
            
        GRANT SELECT ON public.learning_resource_tags TO anon;
        GRANT ALL ON public.learning_resource_tags TO authenticated;
        GRANT ALL ON public.learning_resource_tags TO service_role;
        
        COMMENT ON TABLE public.learning_resource_tags IS '[Doanh nghiệp Đa chi nhánh] Bảng liên kết thẻ nhãn (tags) của tài liệu học tập/đào tạo nội bộ.';
    END IF;
END $$;

-- 6. GÁN QUYỀN CHO BẢNG CHÍNH
GRANT SELECT ON public.learning_resources TO anon;
GRANT ALL ON public.learning_resources TO authenticated;
GRANT ALL ON public.learning_resources TO service_role;

-- 7. CHÚ THÍCH HỌC THUẬT DOANH NGHIỆP CHO BẢNG CHÍNH
COMMENT ON TABLE public.learning_resources IS '[Doanh nghiệp Đa chi nhánh] Bảng lưu trữ hệ thống tri thức đào tạo nội bộ, quy trình vận hành SOP và tài liệu hướng dẫn nhân viên (E-Learning & Training Materials).';
COMMENT ON COLUMN public.learning_resources.instructor_name_vi IS 'Tên giảng viên / người hướng dẫn quy trình đào tạo (Tiếng Việt)';
COMMENT ON COLUMN public.learning_resources.instructor_name_km IS 'Tên giảng viên / người hướng dẫn quy trình đào tạo (Tiếng Khmer)';
COMMENT ON COLUMN public.learning_resources.instructor_name_en IS 'Tên giảng viên / người hướng dẫn quy trình đào tạo (Tiếng Anh)';

COMMIT;
