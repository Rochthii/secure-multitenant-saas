-- ==============================================================================
-- MIGRATION: Chú thích học thuật hóa Cơ sở dữ liệu (Database Aliasing & Comments)
-- Ngày: 2026-06-05
-- Học viên: Chăm Rốch Thi - PTIT Đồ án tốt nghiệp
-- Mục đích: Chuyển đổi ngữ nghĩa các bảng từ tôn giáo sang doanh nghiệp đa chi nhánh
-- ==============================================================================

-- 0. CHUYỂN ĐỔI SCHEMA TỪ TÔN GIÁO SANG DOANH NGHIỆP ĐA CHI NHÁNH
-- Đổi tên bảng donation_campaigns -> transaction_projects
ALTER TABLE IF EXISTS public.donation_campaigns RENAME TO transaction_projects;

-- Đổi tên bảng donations -> transactions
ALTER TABLE IF EXISTS public.donations RENAME TO transactions;

-- Đổi tên cột campaign_id -> project_id trong bảng transactions
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'transactions' 
          AND column_name = 'campaign_id'
    ) THEN
        ALTER TABLE public.transactions RENAME COLUMN campaign_id TO project_id;
    END IF;
END $$;

-- 1. BẢNG TENANTS (CHI NHÁNH DOANH NGHIỆP)
COMMENT ON TABLE public.tenants IS '[Doanh nghiệp Đa chi nhánh] Bảng cấu hình danh sách các chi nhánh độc lập của tổng công ty (Multi-branch SaaS Isolation).';
COMMENT ON COLUMN public.tenants.id IS 'Mã định danh duy nhất của chi nhánh (UUID)';
COMMENT ON COLUMN public.tenants.domain IS 'Tên miền ánh xạ của chi nhánh (ví dụ: hanoi.nexus.com)';
COMMENT ON COLUMN public.tenants.name IS 'Tên đầy đủ của chi nhánh (ví dụ: Chi nhánh Nexus Hà Nội)';
COMMENT ON COLUMN public.tenants.subdomain IS 'Subdomain phục vụ định tuyến động tại Edge';
COMMENT ON COLUMN public.tenants.lifecycle_status IS 'Trạng thái hoạt động của chi nhánh: active (đang chạy), suspended (bị SOAR phong tỏa), offboarding (đang dọn dẹp)';

-- 2. BẢNG DHARMA_TALKS (HỆ TRI THỨC / TÀI LIỆU ĐÀO TẠO NỘI BỘ)
COMMENT ON TABLE public.dharma_talks IS '[Doanh nghiệp Đa chi nhánh] Bảng lưu trữ hệ thống tri thức đào tạo nội bộ, quy trình vận hành SOP và tài liệu hướng dẫn nhân viên của từng chi nhánh (Internal Knowledge Base / Employee Training).';
COMMENT ON COLUMN public.dharma_talks.title_vi IS 'Tiêu đề quy trình đào tạo / tài liệu hướng dẫn (Tiếng Việt)';
COMMENT ON COLUMN public.dharma_talks.title_km IS 'Tiêu đề quy trình đào tạo / tài liệu hướng dẫn (Tiếng Khmer)';
COMMENT ON COLUMN public.dharma_talks.title_en IS 'Tiêu đề quy trình đào tạo / tài liệu hướng dẫn (Tiếng Anh)';
COMMENT ON COLUMN public.dharma_talks.description_vi IS 'Mô tả chi tiết nội dung quy trình đào tạo (Tiếng Việt)';
COMMENT ON COLUMN public.dharma_talks.description_km IS 'Mô tả chi tiết nội dung quy trình đào tạo (Tiếng Khmer)';
COMMENT ON COLUMN public.dharma_talks.description_en IS 'Mô tả chi tiết nội dung quy trình đào tạo (Tiếng Anh)';
COMMENT ON COLUMN public.dharma_talks.media_type IS 'Định dạng tài liệu hướng dẫn đa phương tiện (audio/video)';
COMMENT ON COLUMN public.dharma_talks.media_url IS 'Đường dẫn lưu trữ file âm thanh hoặc video hướng dẫn thực tế';
COMMENT ON COLUMN public.dharma_talks.thumbnail_url IS 'Ảnh thu nhỏ (thumbnail) đại diện cho tài liệu';
COMMENT ON COLUMN public.dharma_talks.is_active IS 'Trạng thái hiệu lực của quy trình đào tạo';

-- 3. BẢNG TRANSACTION_PROJECTS (CHIẾN DỊCH NGÂN QUỸ CHI NHÁNH)
COMMENT ON TABLE public.transaction_projects IS '[Doanh nghiệp Đa chi nhánh] Bảng quản lý các chiến dịch ngân quỹ, quỹ dự án phát triển hoặc danh mục ngân sách hoạt động của từng chi nhánh (Branch Finance Campaigns).';
COMMENT ON COLUMN public.transaction_projects.title_vi IS 'Tên chiến dịch ngân sách hoặc danh mục quỹ của chi nhánh (Tiếng Việt)';
COMMENT ON COLUMN public.transaction_projects.title_km IS 'Tên chiến dịch ngân sách hoặc danh mục quỹ của chi nhánh (Tiếng Khmer)';
COMMENT ON COLUMN public.transaction_projects.description_vi IS 'Mô tả chi tiết mục tiêu sử dụng của quỹ ngân sách (Tiếng Việt)';
COMMENT ON COLUMN public.transaction_projects.description_km IS 'Mô tả chi tiết mục tiêu sử dụng của quỹ ngân sách (Tiếng Khmer)';
COMMENT ON COLUMN public.transaction_projects.status IS 'Trạng thái hoạt động của quỹ dự án chi nhánh';

-- 4. BẢNG TRANSACTIONS (NHẬT KÝ THU CHI CHI NHÁNH)
COMMENT ON TABLE public.transactions IS '[Doanh nghiệp Đa chi nhánh] Bảng ghi nhận chi tiết lịch sử các giao dịch thu chi tài chính, đóng góp ngân quỹ phát triển của từng chi nhánh (Branch Finance Transactions).';
COMMENT ON COLUMN public.transactions.amount IS 'Số tiền giao dịch thực tế';
COMMENT ON COLUMN public.transactions.status IS 'Trạng thái kiểm duyệt giao dịch (pending, confirmed, cancelled)';
COMMENT ON COLUMN public.transactions.donor_name IS 'Họ tên nhân viên / đối tác thực hiện giao dịch';

-- 5. BẢNG NEWS (TIN TỨC / THÔNG BÁO NỘI BỘ CHI NHÁNH)
COMMENT ON TABLE public.news IS '[Doanh nghiệp Đa chi nhánh] Bảng lưu trữ tin tức, thông báo nội bộ và truyền thông nội bộ của chi nhánh.';
COMMENT ON COLUMN public.news.title_vi IS 'Tiêu đề thông báo / tin tức (Tiếng Việt)';
COMMENT ON COLUMN public.news.title_km IS 'Tiêu đề thông báo / tin tức (Tiếng Khmer)';
COMMENT ON COLUMN public.news.title_en IS 'Tiêu đề thông báo / tin tức (Tiếng Anh)';
COMMENT ON COLUMN public.news.content_vi IS 'Nội dung chi tiết của thông báo (Tiếng Việt)';
COMMENT ON COLUMN public.news.content_km IS 'Nội dung chi tiết của thông báo (Tiếng Khmer)';
COMMENT ON COLUMN public.news.content_en IS 'Nội dung chi tiết của thông báo (Tiếng Anh)';
COMMENT ON COLUMN public.news.status IS 'Trạng thái phê duyệt tin tức: draft (nháp), published (đã duyệt ban hành)';

-- 6. BẢNG EVENTS (LỊCH CÔNG TÁC / SỰ KIỆN CHI NHÁNH)
COMMENT ON TABLE public.events IS '[Doanh nghiệp Đa chi nhánh] Bảng lưu trữ lịch họp ban giám đốc, sự kiện công tác hoặc lịch đào tạo nội bộ của chi nhánh.';
COMMENT ON COLUMN public.events.title_vi IS 'Tên sự kiện / lịch công tác (Tiếng Việt)';
COMMENT ON COLUMN public.events.title_km IS 'Tên sự kiện / lịch công tác (Tiếng Khmer)';
COMMENT ON COLUMN public.events.title_en IS 'Tên sự kiện / lịch công tác (Tiếng Anh)';
COMMENT ON COLUMN public.events.start_time IS 'Thời gian bắt đầu sự kiện';
COMMENT ON COLUMN public.events.end_time IS 'Thời gian kết thúc sự kiện';
COMMENT ON COLUMN public.events.status IS 'Trạng thái lịch sự kiện (upcoming, ongoing, completed)';

-- 7. BẢNG AUDIT_LOGS (SỔ CÁI KIỂM TOÁN AN NINH)
COMMENT ON TABLE public.audit_logs IS '[Doanh nghiệp Đa chi nhánh] Sổ cái ghi nhận lịch sử kiểm toán an ninh, các hành vi truy cập và thao tác nhạy cảm của người dùng (Immutable Audit Ledger).';
COMMENT ON COLUMN public.audit_logs.action IS 'Hành động thực thi (select, insert, update, delete, cross_tenant_violation)';
COMMENT ON COLUMN public.audit_logs.ip_address IS 'Địa chỉ IP nguồn của request';
COMMENT ON COLUMN public.audit_logs.risk_score IS 'Điểm rủi ro tích lũy CRS (0-100) tính toán bởi HBCAD Engine';
