-- ==============================================================================
-- MIGRATION: Nạp dữ liệu mồi Chính sách Doanh nghiệp SaaS (Seed Data)
-- Ngày: 2026-05-23
-- Mục đích: Nạp các quy chế bảo mật, quy trình ISO 27001 và chính sách vận hành 
--          doanh nghiệp vào dharma_documents làm ngữ liệu RAG cho AI Security Copilot.
-- ==============================================================================

BEGIN;

-- 1. NẠP DANH MỤC PHÒNG BAN CHUYÊN ĐỀ (Dharma Categories)
INSERT INTO public.dharma_categories (name, description) VALUES
('An ninh & Bảo mật IT', 'Chính sách bảo mật hệ thống, quy trình quản lý truy cập và tiêu chuẩn ISO 27001'),
('Quy chế Nhân sự & NDA', 'Nội quy lao động, quy trình làm việc từ xa và thỏa thuận bảo mật thông tin'),
('Kiểm toán & Tài chính', 'Quy trình tạm ứng, phê duyệt chi tiêu dự án và hoàn chứng từ tài chính'),
('Vận hành & DR', 'Quy trình sao lưu dự phòng, khôi phục thảm họa hệ thống (Disaster Recovery)')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- 2. NẠP CÁC CHÍNH SÁCH DOANH NGHIỆP CHI TIẾT
-- Tài liệu 1: Chính sách bảo mật mật khẩu và xác thực (ISO 27001 Sec 9)
INSERT INTO public.dharma_documents (
    tenant_id, category_name, document_title, content, source_tier, publisher, publish_year, pali_ref
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    'An ninh & Bảo mật IT',
    'Quy chế An toàn Thông tin & Mật khẩu Doanh nghiệp',
    'Chính sách này quy định độ phức tạp mật khẩu bắt buộc đối với toàn bộ cán bộ nhân sự hệ thống SaaS: ' ||
    '1. Mật khẩu phải có độ dài tối thiểu 12 ký tự, bao gồm nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt.\n' ||
    '2. Bắt buộc thay đổi mật khẩu định kỳ mỗi 90 ngày. Hệ thống sẽ gửi email nhắc nhở trước 5 ngày.\n' ||
    '3. Tuyệt đối không tái sử dụng 5 mật khẩu gần nhất.\n' ||
    '4. Xác thực hai yếu tố (2FA) là bắt buộc đối với tất cả các tài khoản có quyền truy cập quản trị (Admin) hoặc tài chính (Accountant).\n' ||
    '5. Tài khoản sẽ tự động bị khóa trong 15 phút nếu nhập sai mật khẩu liên tiếp quá 5 lần.',
    'PRIMARY',
    'Phòng An ninh Thông tin SaaS',
    2026,
    'SEC-PW-2026'
);

-- Tài liệu 2: Quy trình ứng phó sự cố rò rỉ dữ liệu (Incident Response Plan)
INSERT INTO public.dharma_documents (
    tenant_id, category_name, document_title, content, source_tier, publisher, publish_year, pali_ref
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    'An ninh & Bảo mật IT',
    'Quy trình Ứng phó và Cô lập Sự cố Rò rỉ Dữ liệu',
    'Quy trình phản ứng nhanh khi phát hiện hành vi truy cập chéo tenant hoặc tấn công SQL Injection:\n' ||
    'Bước 1 - Phát hiện & Ghi nhận: Hệ thống SOAR tự động phát cảnh báo đỏ qua Telegram gửi tới Admin khi phát hiện hành vi vi phạm.\n' ||
    'Bước 2 - Cô lập khẩn cấp (Containment): Hệ thống tự động kích hoạt Force Logout thu hồi toàn bộ token JWT của tài khoản vi phạm. Nếu tấn công diện rộng, tiến hành khóa tạm thời (Suspend) toàn bộ Tenant mục tiêu thông qua Tenant Lifecycle Management.\n' ||
    'Bước 3 - Điều tra (Investigation): Trích xuất tệp nhật ký kiểm toán bất biến từ WORM Audit Vault để phân tích đường đi của cuộc tấn công (Attack Path).\n' ||
    'Bước 4 - Khắc phục & Khôi phục: Thực hiện khôi phục dữ liệu cô lập cấp Tenant (Tenant-level Disaster Recovery) sử dụng cơ chế UPSERT chống ảnh hưởng chéo.\n' ||
    'Bước 5 - Báo cáo: Lập biên bản sự cố gửi Ban Giám đốc trong vòng 24 giờ kể từ thời điểm khắc phục.',
    'PRIMARY',
    'Ban Vận hành Hệ thống & SOC',
    2026,
    'SEC-IRP-2026'
);

-- Tài liệu 3: Chính sách làm việc từ xa an toàn (Remote Work NDA)
INSERT INTO public.dharma_documents (
    tenant_id, category_name, document_title, content, source_tier, publisher, publish_year, pali_ref
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    'Quy chế Nhân sự & NDA',
    'Hướng dẫn Làm việc Từ xa & Bảo mật Thiết bị',
    'Quy định an toàn lao động khi nhân sự làm việc ngoài văn phòng (WFH):\n' ||
    '1. Bắt buộc kết nối qua mạng riêng ảo Enterprise VPN của công ty trước khi truy cập vào hệ thống SaaS quản trị.\n' ||
    '2. Không bao giờ sử dụng mạng Wifi công cộng không có mật khẩu (như tại quán cafe) để xử lý các giao dịch tài chính hoặc thông tin khách hàng.\n' ||
    '3. Thiết bị làm việc cá nhân (Laptop, Điện thoại) phải được cài đặt phần mềm Antivirus đã được phòng IT phê duyệt và kích hoạt tính năng mã hóa ổ đĩa (BitLocker/FileVault).\n' ||
    '4. Khóa màn hình lập tức (Windows+L hoặc Cmd+Ctrl+Q) khi rời khỏi thiết bị làm việc.',
    'COMMENTARY',
    'Ban Nhân sự & Pháp chế',
    2026,
    'HR-WFH-2026'
);

-- Tài liệu 4: Quy trình hoàn ứng tài chính và phê duyệt ngân sách
INSERT INTO public.dharma_documents (
    tenant_id, category_name, document_title, content, source_tier, publisher, publish_year, pali_ref
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    'Kiểm toán & Tài chính',
    'Quy trình Hạn mức Chi tiêu & Phê duyệt Hoàn ứng',
    'Quy trình quản lý dòng tiền tài chính dành cho các dự án chi nhánh (Tenants):\n' ||
    '1. Hạn mức chi tiêu tự quyết của quản trị viên chi nhánh (Tenant Admin) là tối đa 10,000,000 VND cho mỗi giao dịch đơn lẻ.\n' ||
    '2. Các giao dịch vượt quá 10,000,000 VND bắt buộc phải tạo Đề xuất phê duyệt ngân sách gửi Ban Giám đốc Tổng công ty (Super Admin) phê duyệt trực tuyến trên hệ thống.\n' ||
    '3. Chứng từ hoàn ứng hợp lệ phải là Hóa đơn điện tử VAT (hóa đơn đỏ) có mã của cơ quan Thuế. Thời hạn nộp chứng từ hoàn ứng là tối đa 7 ngày làm việc kể từ khi kết thúc chi tiêu.\n' ||
    '4. Mọi hành vi xác nhận khống giao dịch tài chính sẽ bị hệ thống ghi log kiểm toán mức độ nghiêm trọng SEV1 (High Severity) và tự động chuyển hồ sơ đến ban kiểm soát nội bộ.',
    'PRIMARY',
    'Phòng Kiểm toán Nội bộ',
    2026,
    'FIN-AUDIT-2026'
);

-- 3. NẠP GỢI Ý HÀNH ĐỘNG TUÂN THỦ (Compliance suggestions)
INSERT INTO public.dharma_pill_suggestions (emotion_trigger, pill_content, sutta_reference) VALUES
('STRESS', 'Khi gặp áp lực công việc hoặc quá tải thông tin, hãy áp dụng nguyên tắc 20-20-20: Cứ sau 20 phút làm việc, hãy dành 20 giây để nhìn vào một vật cách xa 20 feet (khoảng 6 mét) để thư giãn mắt và tâm trí.', 'ISO-27001 Sức khỏe Nhân sự'),
('CONFUSED', 'Nếu quý nhân sự gặp bối rối hoặc nghi ngờ về một email lạ (nghi vấn Phishing), tuyệt đối không bấm vào link. Hãy chuyển tiếp ngay email đó tới địa chỉ security@company.com và đợi phản hồi xác thực từ Sĩ quan an ninh.', 'Phòng chống Phishing'),
('VIOLATION', 'Hệ thống phát hiện tài khoản của bạn đang có thao tác vượt quyền hạn quy định. Hãy dừng ngay lập tức và liên hệ với quản trị viên hệ thống để cập nhật phân quyền phù hợp.', 'Quy chế Phân quyền RBAC')
ON CONFLICT DO NOTHING;

COMMIT;
