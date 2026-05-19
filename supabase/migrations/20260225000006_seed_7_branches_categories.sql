-- =========================================================================
-- Kịch Bản Khởi Tạo (Seed) Cấu Trúc Toàn Diện Danh Mục Đa Tầng (7 Nhánh)
-- Phân cấp thông tin theo cấu trúc logic chuẩn Phật giáo Nam Tông
-- Dựa trên bản thảo của sinh viên Thi.
-- =========================================================================

-- Lưu ý: Chỉ áp dụng cho các module phân cấp động: 'news', 'dharma', 'documents'
-- Gỡ bỏ liên kết khóa ngoại (Foreign Key) ở các bài viết cũ trước khi xóa danh mục
UPDATE public.news
SET
    category_id = NULL
WHERE
    category_id IN (
        SELECT id
        FROM public.categories
        WHERE
            module IN ('news', 'dharma', 'documents')
    );

UPDATE public.dharma_talks
SET
    category_id = NULL
WHERE
    category_id IN (
        SELECT id
        FROM public.categories
        WHERE
            module IN ('news', 'dharma', 'documents')
    );

UPDATE public.media
SET
    category_id = NULL
WHERE
    category_id IN (
        SELECT id
        FROM public.categories
        WHERE
            module IN ('news', 'dharma', 'documents')
    );

-- Xóa dữ liệu danh mục cũ để tránh trùng lặp
DELETE FROM public.categories
WHERE
    module IN ('news', 'dharma', 'documents');

-- =========================================================================
-- MỤC 3: CHI TIẾT MỤC TIN TỨC (module: news)
-- =========================================================================

-- --- 3.1 Nhánh "Phật Sự & Hoằng Pháp" (Cấp 1) ---
INSERT INTO
    public.categories (
        id,
        module,
        type,
        parent_id,
        name_vi,
        name_en,
        name_km,
        slug
    )
VALUES (
        'a0000000-0000-0000-0000-000000000010',
        'news',
        'news',
        NULL,
        'Phật Sự & Hoằng Pháp',
        'Dharma Propagation & Affairs',
        'ពុទ្ធសាសនា និង ការផ្សព្វផ្សាយ',
        'phat-su-hoang-phap'
    );

-- Cấp 2: Phật Sự Đối Ngoại
INSERT INTO
    public.categories (
        id,
        module,
        type,
        parent_id,
        name_vi,
        name_en,
        name_km,
        slug
    )
VALUES (
        'a0000000-0000-0000-0000-000000000110',
        'news',
        'news',
        'a0000000-0000-0000-0000-000000000010',
        'Phật Sự Đối Ngoại',
        'Foreign Buddhist Affairs',
        'កិច្ចការព្រះពុទ្ធសាសនាបរទេស',
        'phat-su-doi-ngoai'
    );

-- Cấp 3 của Phật Sự Đối Ngoại
INSERT INTO
    public.categories (
        id,
        module,
        type,
        parent_id,
        name_vi,
        slug
    )
VALUES (
        'a0000000-0000-0000-0000-000000000111',
        'news',
        'news',
        'a0000000-0000-0000-0000-000000000110',
        'Quan hệ quốc tế',
        'quan-he-quoc-te'
    ),
    (
        'a0000000-0000-0000-0000-000000000112',
        'news',
        'news',
        'a0000000-0000-0000-0000-000000000110',
        'Đạo Pháp & Dân Tộc',
        'dao-phap-dan-toc'
    ),
    (
        'a0000000-0000-0000-0000-000000000113',
        'news',
        'news',
        'a0000000-0000-0000-0000-000000000110',
        'Giáo Hội & Hệ Phái',
        'giao-hoi-he-phai'
    ),
    (
        'a0000000-0000-0000-0000-000000000114',
        'news',
        'news',
        'a0000000-0000-0000-0000-000000000110',
        'Giao Lưu Văn Hóa - Học Thuật',
        'giao-luu-van-hoa-hoc-thuat'
    );

-- Cấp 2: Tăng Sự Thường Nhật
INSERT INTO
    public.categories (
        id,
        module,
        type,
        parent_id,
        name_vi,
        name_en,
        name_km,
        slug
    )
VALUES (
        'a0000000-0000-0000-0000-000000000120',
        'news',
        'news',
        'a0000000-0000-0000-0000-000000000010',
        'Tăng Sự Thường Nhật',
        'Daily Sangha Activities',
        'សកម្មភាពព្រះសង្ឃប្រចាំថ្ងៃ',
        'tang-su-thuong-nhat'
    );

-- Cấp 3 của Tăng Sự Thường Nhật
INSERT INTO
    public.categories (
        id,
        module,
        type,
        parent_id,
        name_vi,
        slug
    )
VALUES (
        'a0000000-0000-0000-0000-000000000121',
        'news',
        'news',
        'a0000000-0000-0000-0000-000000000120',
        'Thời Khóa Tụng Kinh',
        'thoi-khoa-tung-kinh'
    ),
    (
        'a0000000-0000-0000-0000-000000000122',
        'news',
        'news',
        'a0000000-0000-0000-0000-000000000120',
        'Nghi Lễ Định Kỳ',
        'nghi-le-dinh-ky'
    ),
    (
        'a0000000-0000-0000-0000-000000000123',
        'news',
        'news',
        'a0000000-0000-0000-0000-000000000120',
        'Tăng Sự Nội Viện',
        'tang-su-noi-vien'
    ),
    (
        'a0000000-0000-0000-0000-000000000124',
        'news',
        'news',
        'a0000000-0000-0000-0000-000000000120',
        'Tiếp Đón & Tư Vấn Tâm Linh',
        'tiep-don-tu-van-tam-linh'
    );

-- --- 3.2 Nhánh "Văn Hóa Truyền Thống Khmer" (Cấp 1) ---
INSERT INTO
    public.categories (
        id,
        module,
        type,
        parent_id,
        name_vi,
        name_en,
        name_km,
        slug
    )
VALUES (
        'a0000000-0000-0000-0000-000000000020',
        'news',
        'news',
        NULL,
        'Văn Hóa Truyền Thống Khmer',
        'Khmer Traditional Culture',
        'វប្បធម៌ប្រពៃណីខ្មែរ',
        'van-hoa-truyen-thong-khmer'
    );

-- Cấp 2 của Nhánh 2
INSERT INTO
    public.categories (
        id,
        module,
        type,
        parent_id,
        name_vi,
        slug
    )
VALUES (
        'a0000000-0000-0000-0000-000000000210',
        'news',
        'news',
        'a0000000-0000-0000-0000-000000000020',
        'Tin Tức Lễ Hội',
        'tin-tuc-le-hoi'
    ),
    (
        'a0000000-0000-0000-0000-000000000220',
        'news',
        'news',
        'a0000000-0000-0000-0000-000000000020',
        'Hoạt Động Nghệ Thuật & Ngôn Ngữ',
        'hoat-dong-nghe-thuat-ngon-ngu'
    ),
    (
        'a0000000-0000-0000-0000-000000000230',
        'news',
        'news',
        'a0000000-0000-0000-0000-000000000020',
        'Đời Sống Cộng Đồng',
        'doi-song-cong-dong'
    ),
    (
        'a0000000-0000-0000-0000-000000000240',
        'news',
        'news',
        'a0000000-0000-0000-0000-000000000020',
        'Người Giữ Hồn Văn Hóa',
        'nguoi-giu-hon-van-hoa'
    );

-- --- 3.3 Nhánh "An Sinh Xã Hội" (Cấp 1) ---
INSERT INTO
    public.categories (
        id,
        module,
        type,
        parent_id,
        name_vi,
        name_en,
        name_km,
        slug
    )
VALUES (
        'a0000000-0000-0000-0000-000000000030',
        'news',
        'news',
        NULL,
        'An Sinh Xã Hội',
        'Social Welfare',
        'សុខុមាលភាពសង្គម',
        'an-sinh-xa-hoi'
    );

-- --- 3.4 Nhánh "Giáo Dục & Học Thuật" (Cấp 1) ---
INSERT INTO
    public.categories (
        id,
        module,
        type,
        parent_id,
        name_vi,
        name_en,
        name_km,
        slug
    )
VALUES (
        'a0000000-0000-0000-0000-000000000040',
        'news',
        'news',
        NULL,
        'Giáo Dục & Học Thuật',
        'Education & Academics',
        'ការអប់រំ និងការសិក្សា',
        'giao-duc-hoc-thuat'
    );

-- Cấp 2 của Nhánh 4
INSERT INTO
    public.categories (
        id,
        module,
        type,
        parent_id,
        name_vi,
        slug
    )
VALUES (
        'a0000000-0000-0000-0000-000000000410',
        'news',
        'news',
        'a0000000-0000-0000-0000-000000000040',
        'Giáo Dục Tự Viện',
        'giao-duc-tu-vien'
    ),
    (
        'a0000000-0000-0000-0000-000000000420',
        'news',
        'news',
        'a0000000-0000-0000-0000-000000000040',
        'Hội Nghị & Tham Luận',
        'hoi-nghi-tham-luan'
    ),
    (
        'a0000000-0000-0000-0000-000000000430',
        'news',
        'news',
        'a0000000-0000-0000-0000-000000000040',
        'Sách & Ấn Phẩm',
        'sach-an-pham'
    );

-- --- 3.5 Nhánh "Thông Báo & Chỉ Dẫn" (Cấp 1) ---
INSERT INTO
    public.categories (
        id,
        module,
        type,
        parent_id,
        name_vi,
        name_en,
        name_km,
        slug
    )
VALUES (
        'a0000000-0000-0000-0000-000000000050',
        'news',
        'news',
        NULL,
        'Thông Báo & Chỉ Dẫn',
        'Announcements & Guidelines',
        'សេចក្តីជូនដំណឹង និងការណែនាំ',
        'thong-bao-chi-dan'
    );

-- =========================================================================
-- MỤC 4: CHI TIẾT MỤC PHÁP THOẠI (module: dharma)
-- =========================================================================

-- --- 4.1 Nhánh "Ký Sự Truyền Hình" (Cấp 1) ---
INSERT INTO
    public.categories (
        id,
        module,
        type,
        parent_id,
        name_vi,
        name_en,
        name_km,
        slug
    )
VALUES (
        'b0000000-0000-0000-0000-000000000010',
        'dharma',
        'media',
        NULL,
        'Ký Sự Truyền Hình',
        'Television Documentaries',
        'ឯកសារទូរទស្សន៍',
        'ky-su-truyen-hinh'
    );

-- Cấp 2 của Nhánh 1
INSERT INTO
    public.categories (
        id,
        module,
        type,
        parent_id,
        name_vi,
        slug
    )
VALUES (
        'b0000000-0000-0000-0000-000000000110',
        'dharma',
        'media',
        'b0000000-0000-0000-0000-000000000010',
        'Hành Trình Hoằng Pháp',
        'hanh-trinh-hoang-phap'
    ),
    (
        'b0000000-0000-0000-0000-000000000120',
        'dharma',
        'media',
        'b0000000-0000-0000-0000-000000000010',
        'Đời Sống Thiền Môn',
        'doi-song-thien-mon'
    ),
    (
        'b0000000-0000-0000-0000-000000000130',
        'dharma',
        'media',
        'b0000000-0000-0000-0000-000000000010',
        'Phóng Sự Văn Hóa Khmer',
        'phong-su-van-hoa-khmer'
    ),
    (
        'b0000000-0000-0000-0000-000000000140',
        'dharma',
        'media',
        'b0000000-0000-0000-0000-000000000010',
        'Talkshow & Tọa Đàm Truyền Hình',
        'talkshow-toa-dam-truyen-hinh'
    );

-- --- 4.2 Nhánh "Phật Giáo & Đời Sống" (Cấp 1) ---
INSERT INTO
    public.categories (
        id,
        module,
        type,
        parent_id,
        name_vi,
        name_en,
        name_km,
        slug
    )
VALUES (
        'b0000000-0000-0000-0000-000000000020',
        'dharma',
        'media',
        NULL,
        'Phật Giáo & Đời Sống',
        'Buddhism & Life',
        'ព្រះពុទ្ធសាសនា និងជីវិត',
        'phat-giao-doi-song'
    );

-- --- 4.3 Nhánh "Kinh Nhật Tụng" (Cấp 1) ---
INSERT INTO
    public.categories (
        id,
        module,
        type,
        parent_id,
        name_vi,
        name_en,
        name_km,
        slug
    )
VALUES (
        'b0000000-0000-0000-0000-000000000030',
        'dharma',
        'media',
        NULL,
        'Kinh Nhật Tụng',
        'Daily Chanting',
        'ការសូត្រធម៌ប្រចាំថ្ងៃ',
        'kinh-nhat-tung'
    );

-- --- 4.4 Nhánh "Giảng Giải Phật Học" (Cấp 1) ---
INSERT INTO
    public.categories (
        id,
        module,
        type,
        parent_id,
        name_vi,
        name_en,
        name_km,
        slug
    )
VALUES (
        'b0000000-0000-0000-0000-000000000040',
        'dharma',
        'media',
        NULL,
        'Giảng Giải Phật Học',
        'Dharma Teachings Explanation',
        'ការពន្យល់ធម៌',
        'giang-giai-phat-hoc'
    );

-- Cấp 2 của Nhánh 4
INSERT INTO
    public.categories (
        id,
        module,
        type,
        parent_id,
        name_vi,
        slug
    )
VALUES (
        'b0000000-0000-0000-0000-000000000410',
        'dharma',
        'media',
        'b0000000-0000-0000-0000-000000000040',
        'Khám Phá Tam Tạng Kinh',
        'kham-pha-tam-tang-kinh'
    ),
    (
        'b0000000-0000-0000-0000-000000000420',
        'dharma',
        'media',
        'b0000000-0000-0000-0000-000000000040',
        'Ý Nghĩa Kinh Nhật Tụng',
        'y-nghia-kinh-nhat-tung'
    ),
    (
        'b0000000-0000-0000-0000-000000000430',
        'dharma',
        'media',
        'b0000000-0000-0000-0000-000000000040',
        'Thiền Vipassana',
        'thien-vipassana'
    ),
    (
        'b0000000-0000-0000-0000-000000000440',
        'dharma',
        'media',
        'b0000000-0000-0000-0000-000000000040',
        'Từ Điển Phật Học',
        'tu-dien-phat-hoc'
    );

-- Đã Nạp Xong Cấu Trúc Khủng Thành Công!.