-- ==============================================================================
-- RUNBOOK: Tenant Offboarding & Data Portability (Chuẩn ISO/IEC 27017)
-- Ngày: 2026-05-17
-- Mô tả: Cung cấp quy trình gỡ bỏ (Offboarding) một khách hàng (Tenant) ra khỏi
--        hệ thống SaaS an toàn, đảm bảo dữ liệu được xóa sạch (Wipe) mà không để
--        lại tàn dư, đồng thời giải quyết bài toán Data Portability.
-- ==============================================================================

/*
PHẦN 1: BÀI TOÁN PHÂN MẢNH TRONG SHARED SCHEMA (DATABASE FRAGMENTATION)
Trong mô hình Shared DB, dữ liệu của khách hàng A nằm xen kẽ với khách hàng B trên 
cùng một bảng đĩa vật lý (Table/Heap). 
Khi ta thực hiện thao tác xóa dữ liệu của khách hàng A (DELETE WHERE tenant_id = 'A'),
PostgreSQL không lập tức thu hồi lại ổ cứng mà chỉ đánh dấu các dòng đó là "dead tuples".

Hậu quả: 
1. Database Fragmentation: Gây phân mảnh ổ đĩa, làm giảm hiệu năng hệ thống chung.
2. Index Bloat: Cây chỉ mục (B-Tree) bị phình to do chứa nhiều tham chiếu rác.

Giải pháp: 
Sau khi chạy thủ tục Wipe Data, hệ thống bắt buộc phải lên lịch chạy `VACUUM ANALYZE` 
hoặc `VACUUM FULL` (trong thời gian bảo trì định kỳ) để dọn dẹp các dead tuples.
*/

-- ==============================================================================
-- PHẦN 2: THỦ TỤC XÓA SACH DỮ LIỆU CỦA 1 TENANT (HARD WIPE RUNBOOK)
-- Cảnh báo: Thủ tục này không thể đảo ngược (Irreversible)!
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.tenant_offboarding_wipe(target_tenant_id UUID)
RETURNS VOID AS $$
DECLARE
    tenant_exists BOOLEAN;
BEGIN
    -- 1. Xác thực quyền Global Admin
    IF public.get_current_user_role() != 'super_admin' THEN
        RAISE EXCEPTION 'Chỉ Global Admin mới có quyền thực thi Tenant Offboarding.';
    END IF;

    -- 2. Kiểm tra tenant có tồn tại không
    SELECT EXISTS (SELECT 1 FROM public.tenants WHERE id = target_tenant_id) INTO tenant_exists;
    IF NOT tenant_exists THEN
        RAISE EXCEPTION 'Tenant ID % không tồn tại.', target_tenant_id;
    END IF;

    -- 3. Bắt đầu quá trình xóa (Cascading Delete)
    -- Vì ta đã cấu hình ON DELETE CASCADE ở các foreign key trỏ đến tenant_id trong thiết kế,
    -- việc xóa dòng root trong bảng tenants sẽ tự động kích hoạt hiệu ứng domino
    -- xóa sạch sành sanh dữ liệu tại các bảng con (news, events, donations, users).
    
    DELETE FROM public.tenants WHERE id = target_tenant_id;
    
    -- Lưu ý: Các bảng Audit Logs thường không có ràng buộc ON DELETE CASCADE để giữ lại lịch sử.
    -- Theo chuẩn ISO 27017, dữ liệu log cần được giữ thêm 90 ngày sau khi Offboard.
    -- Ta có thể cập nhật trạng thái tenant_id trong audit logs thành "DELETED_TENANT" hoặc giữ nguyên.

    RAISE NOTICE 'Đã xóa hoàn toàn dữ liệu của Tenant ID % khỏi hệ thống.', target_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- PHẦN 3: ĐỀ XUẤT QUY TRÌNH (RUNBOOK) CỤ THỂ TRONG THỰC TẾ
-- 
-- Bước 1: Data Portability (Xuất dữ liệu)
-- Cung cấp nút [Export Data] cho Tenant Admin tải về toàn bộ dữ liệu (JSON/CSV) 
-- trước khi hết hạn hợp đồng. Đảm bảo tuân thủ quyền chuyển đổi dữ liệu (GDPR).
--
-- Bước 2: Soft Lock (Khóa tài khoản)
-- Gắn cờ is_active = false ở bảng tenants. Dữ liệu vẫn còn nhưng không ai truy cập được.
-- Giữ trạng thái này trong 30 ngày (Grace Period).
--
-- Bước 3: Hard Wipe (Xóa vĩnh viễn)
-- Chạy hàm `admin.tenant_offboarding_wipe` ở trên để kích hoạt Cascade Delete.
--
-- Bước 4: Chống phân mảnh (Defragmentation)
-- Hệ thống tự động đặt lịch chạy `VACUUM ANALYZE` vào 3h sáng cuối tuần để dọn 
-- dẹp các "dead tuples" tạo ra từ Bước 3.
-- ==============================================================================
