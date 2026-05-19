-- ==============================================================================
-- KỊCH BẢN MIGRATION: BẢO MẬT PHÂN MẢNH CSDL ĐA TẦNG (MULTI-TENANT RLS ISOLATION)
-- Mục đích: Đảm bảo dữ liệu của Chi nhánh nào chỉ Admin/Người dùng Chi nhánh đó được phép truy cập.
-- Ngăn chặn triệt để lỗi rò rỉ dữ liệu do sai sót ở tầng Code (Next.js).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PHẦN 1: HÀM TIỆN ÍCH LẤY TENANT ID VÀ ROLE TỪ HIỆN TẠI (POSTGRESQL FUNCTIONS)
-- ------------------------------------------------------------------------------
-- Hàm này sẽ được gọi đính kèm tự động mỗi khi một truy vấn (Query) đi vào CSDL.
-- Nó truy xuất thông tin người dùng đang login thông qua Claims JWT do Supabase Auth cấp.

CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  -- Giả định auth.uid() trả về ID của người dùng đăng nhập hiện tại.
  -- Ta sẽ look up user_roles để xem user này đang thuộc tenant_id nào.
  SELECT tenant_id 
  FROM public.user_roles 
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_global_admin()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  -- Kiểm tra xem user hiện tại có mang role 'super_admin' hoặc 'company_editor' trên hệ thống không
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'company_editor')
  );
$$;

-- ------------------------------------------------------------------------------
-- PHẦN 2: THIẾT LẬP RLS (ROW LEVEL SECURITY) CHO BẢNG NEWS (TIN TỨC)
-- ------------------------------------------------------------------------------

-- Bước 1: Bật RLS cho bảng
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Bước 2: Xóa các Policy cũ (Nếu có) để tránh xung đột
DROP POLICY IF EXISTS "News are viewable by everyone if published" ON public.news;

DROP POLICY IF EXISTS "News can be managed by tenant admins" ON public.news;

-- Bước 3: Tạo Policy mới KHẮT KHE (Hard-Isolation)

-- A. Quyền ĐỌC (SELECT)
CREATE POLICY "Public can read published news for specific tenant" ON public.news FOR
SELECT USING (
        -- Ai cũng xem được nếu là bài đã xuất bản
        status = 'published'
        -- NẾU User đăng nhập:
        OR (
            auth.uid () IS NOT NULL
            AND (
                -- Super Admin được xem hết bản nháp
                public.is_global_admin ()
                -- Hoặc là người nội bộ của chi nhánh (tenant_id khớp nhau)
                OR public.get_current_tenant_id () = tenant_id
            )
        )
    );

-- B. Quyền GHI, SỬA, XÓA (INSERT, UPDATE, DELETE)
CREATE POLICY "Tenant Admins / Editors can manage their own news" ON public.news FOR ALL USING (
    auth.uid () IS NOT NULL
    AND (
        public.is_global_admin ()
        OR public.get_current_tenant_id () = tenant_id
    )
)
WITH
    CHECK (
        auth.uid () IS NOT NULL
        AND (
            public.is_global_admin ()
            OR public.get_current_tenant_id () = tenant_id
        )
    );

-- ==============================================================================
-- GHI CHÚ QUAN TRỌNG:
-- Bạn CẦN CHẠY tương tự đoạn script (PHẦN 2) cho TẤT CẢ các bảng còn lại chứa cột "tenant_id".
-- Bao gồm: events, media, categories, transactions, transaction_projects, ...
-- ==============================================================================