-- ==============================================================================
-- MIGRATION: INTRANET LOCKDOWN — Khóa nội dung nội bộ cho người chưa đăng nhập
-- Ngày: 2026-05-16
-- Mục đích:
--   Chuyển đổi mô hình truy cập từ "Public Portal" sang "Intranet Portal":
--   - Tài liệu nội bộ (dharma_talks) chỉ hiển thị cho nhân viên đã đăng nhập
--     và thuộc đúng tenant.
--   - Tin tức nội bộ (news) chỉ hiển thị cho nhân viên đã đăng nhập
--     và thuộc đúng tenant.
--   - Sự kiện nội bộ (events) chỉ hiển thị cho nhân viên đã đăng nhập
--     và thuộc đúng tenant.
--   Đây là cơ chế bảo mật tầng Database (Defense-in-Depth Layer 4),
--   đảm bảo không có cách nào bypass qua API để đọc trộm dữ liệu.
-- ==============================================================================

-- 1. DHARMA_TALKS (Tài liệu / E-Learning nội bộ)
-- Xóa policy cũ cho phép Public đọc
DROP POLICY IF EXISTS "Public can read dharma talks including broadcast" ON public.dharma_talks;
DROP POLICY IF EXISTS "Public can read dharma talks" ON public.dharma_talks;
DROP POLICY IF EXISTS "Public_Read_Dharma_Talks" ON public.dharma_talks;

-- Tạo policy mới: CHỈ cho người đã đăng nhập + đúng tenant
CREATE POLICY "Authenticated users read own tenant dharma talks"
ON public.dharma_talks FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND is_active = true
    AND (
        -- Global admin thấy tất cả
        public.is_global_admin()
        -- Nhân viên chỉ thấy tài liệu của tenant mình
        OR tenant_id = public.get_current_tenant_id()
        -- Tài liệu được phát sóng (broadcast) đến tenant của mình
        OR public.get_current_tenant_id() = ANY(published_to)
    )
);

-- 2. NEWS (Tin tức nội bộ)
DROP POLICY IF EXISTS "Public can read news including broadcast" ON public.news;
DROP POLICY IF EXISTS "Public can read published news for specific tenant" ON public.news;

CREATE POLICY "Authenticated users read own tenant news"
ON public.news FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND status = 'published'
    AND (
        public.is_global_admin()
        OR tenant_id = public.get_current_tenant_id()
        OR public.get_current_tenant_id() = ANY(published_to)
    )
);

-- 3. EVENTS (Sự kiện nội bộ)
DROP POLICY IF EXISTS "Public can read events including broadcast" ON public.events;
DROP POLICY IF EXISTS "Public can read events" ON public.events;

CREATE POLICY "Authenticated users read own tenant events"
ON public.events FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND status IN ('upcoming', 'ongoing', 'completed')
    AND (
        public.is_global_admin()
        OR tenant_id = public.get_current_tenant_id()
        OR public.get_current_tenant_id() = ANY(published_to)
    )
);

-- GHI CHÚ KIẾN TRÚC:
-- ┌──────────────────────────────────────────────────────┐
-- │ TRƯỚC (Public Portal):                                │
-- │   Ai cũng đọc được nếu biết URL → Rò rỉ dữ liệu     │
-- │                                                        │
-- │ SAU (Intranet Lockdown):                               │
-- │   auth.uid() IS NOT NULL → Phải đăng nhập              │
-- │   tenant_id = get_current_tenant_id() → Đúng công ty   │
-- │   → Database-level enforcement, không bypass được       │
-- └──────────────────────────────────────────────────────┘
