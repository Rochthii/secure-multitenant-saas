-- Seed script nạp dữ liệu cây phân cấp cho bảng Categories (Cập nhật Hỗ trợ UPSERT)
-- Module: Tin Tức ('news'), Pháp Thoại ('dharma')

DO $$ 
DECLARE
    -- IDs gốc Tin Tức
    news_foreign_id uuid;
    news_sangha_id uuid;
    news_culture_id uuid;
    news_edu_id uuid;

    -- IDs gốc Pháp Thoại
    dharma_media_id uuid;
    dharma_teaching_id uuid;
BEGIN
    ---------- KHỐI 1: TIN TỨC ----------

    -- Nhánh 1: Phật Sự & Hoằng Pháp
    INSERT INTO public.categories (id, name_vi, name_en, name_km, slug, type, module) 
    VALUES (gen_random_uuid(), 'Phật Sự & Hoằng Pháp', 'Dharma & Propagation', 'កិច្ចការពុទ្ធសាសនា និងផ្សព្វផ្សាយធម៌', 'phat-su-hoang-phap', 'news', 'news')
    ON CONFLICT (slug) DO UPDATE SET name_vi = EXCLUDED.name_vi, name_en = EXCLUDED.name_en, name_km = EXCLUDED.name_km, type = EXCLUDED.type, module = EXCLUDED.module;

    -- Nhánh 2: Phật Sự Đối Ngoại (Có con)
    INSERT INTO public.categories (id, name_vi, name_en, name_km, slug, type, module) 
    VALUES (gen_random_uuid(), 'Phật Sự Đối Ngoại', 'Foreign Buddhist Affairs', 'កិច្ចការពុទ្ធសាសនាផ្នែកក្រៅ', 'phat-su-doi-ngoai', 'news', 'news')
    ON CONFLICT (slug) DO UPDATE SET name_vi = EXCLUDED.name_vi, name_en = EXCLUDED.name_en, name_km = EXCLUDED.name_km, type = EXCLUDED.type, module = EXCLUDED.module
    RETURNING id INTO news_foreign_id;
        
        -- Con của Nhánh 2
        INSERT INTO public.categories (id, name_vi, name_en, name_km, slug, type, module, parent_id) VALUES 
        (gen_random_uuid(), 'Quan hệ quốc tế', 'International Relations', 'ទំនាក់ទំនងអន្តរជាតិ', 'quan-he-quoc-te', 'news', 'news', news_foreign_id),
        (gen_random_uuid(), 'Đạo Pháp & Dân Tộc', 'Dharma & Nation', 'ព្រះធម៌ និងជាតិ', 'dao-phap-dan-toc', 'news', 'news', news_foreign_id),
        (gen_random_uuid(), 'Giáo Hội & Hệ Phái', 'Sangha & Sects', 'សាសនាចក្រ និងនិកាយ', 'giao-hoi-he-phai', 'news', 'news', news_foreign_id),
        (gen_random_uuid(), 'Giao Lưu Văn Hóa - Học Thuật', 'Cultural Exchange', 'ការផ្លាស់ប្តូរវប្បធម៌', 'giao-luu-van-hoa', 'news', 'news', news_foreign_id)
        ON CONFLICT (slug) DO UPDATE SET name_vi = EXCLUDED.name_vi, name_en = EXCLUDED.name_en, name_km = EXCLUDED.name_km, type = EXCLUDED.type, module = EXCLUDED.module, parent_id = EXCLUDED.parent_id;

    -- Nhánh 3: Tăng Sự Thường Nhật (Có con)
    INSERT INTO public.categories (id, name_vi, name_en, name_km, slug, type, module) 
    VALUES (gen_random_uuid(), 'Tăng Sự Thường Nhật', 'Daily Sangha Life', 'សកម្មភាពសង្ឃប្រចាំថ្ងៃ', 'tang-su-thuong-nhat', 'news', 'news')
    ON CONFLICT (slug) DO UPDATE SET name_vi = EXCLUDED.name_vi, name_en = EXCLUDED.name_en, name_km = EXCLUDED.name_km, type = EXCLUDED.type, module = EXCLUDED.module
    RETURNING id INTO news_sangha_id;

        -- Con của Nhánh 3
        INSERT INTO public.categories (id, name_vi, name_en, name_km, slug, type, module, parent_id) VALUES 
        (gen_random_uuid(), 'Thời Khóa Tụng Kinh', 'Chanting Schedule', 'កាលវិភាគសូត្រធម៌', 'thoi-khoa-tung-kinh', 'news', 'news', news_sangha_id),
        (gen_random_uuid(), 'Nghi Lễ Định Kỳ', 'Regular Rituals', 'ពិធីសាសនាប្រចាំខែ', 'nghi-le-dinh-ky', 'news', 'news', news_sangha_id),
        (gen_random_uuid(), 'Tăng Sự Nội Viện', 'Internal Sangha Affairs', 'កិច្ចការផ្ទៃក្នុងសង្ឃ', 'tang-su-noi-vien', 'news', 'news', news_sangha_id),
        (gen_random_uuid(), 'Tiếp Đón & Tư Vấn Tâm Linh', 'Spiritual Counseling', 'ការប្រឹក្សាផ្លូវចិត្ត', 'tu-van-tam-linh', 'news', 'news', news_sangha_id)
        ON CONFLICT (slug) DO UPDATE SET name_vi = EXCLUDED.name_vi, name_en = EXCLUDED.name_en, name_km = EXCLUDED.name_km, type = EXCLUDED.type, module = EXCLUDED.module, parent_id = EXCLUDED.parent_id;

    -- Nhánh 4: Văn hóa Truyền thống Khmer (Có con)
    INSERT INTO public.categories (id, name_vi, name_en, name_km, slug, type, module) 
    VALUES (gen_random_uuid(), 'Văn Hóa Truyền Thống Khmer', 'Khmer Traditional Culture', 'វប្បធម៌ប្រពៃណីខ្មែរ', 'van-hoa-truyen-thong', 'news', 'news')
    ON CONFLICT (slug) DO UPDATE SET name_vi = EXCLUDED.name_vi, name_en = EXCLUDED.name_en, name_km = EXCLUDED.name_km, type = EXCLUDED.type, module = EXCLUDED.module
    RETURNING id INTO news_culture_id;

        -- Con của Nhánh 4
        INSERT INTO public.categories (id, name_vi, name_en, name_km, slug, type, module, parent_id) VALUES 
        (gen_random_uuid(), 'Tin Tức Lễ Hội', 'Festival News', 'ព័ត៌មានពីធីបុណ្យ', 'tin-tuc-le-hoi', 'news', 'news', news_culture_id),
        (gen_random_uuid(), 'Hoạt Động Nghệ Thuật & Ngôn Ngữ', 'Arts & Languages', 'សកម្មភាពសិល្បៈ និងភាសា', 'hoat-dong-nghe-thuat', 'news', 'news', news_culture_id),
        (gen_random_uuid(), 'Đời Sống Cộng Đồng', 'Community Life', 'ជីវិតសហគមន៍', 'doi-song-cong-dong', 'news', 'news', news_culture_id),
        (gen_random_uuid(), 'Người Giữ Hồn Văn Hóa', 'Culture Keepers', 'អ្នករក្សាវប្បធម៌', 'nguoi-giu-hon-van-hoa', 'news', 'news', news_culture_id)
        ON CONFLICT (slug) DO UPDATE SET name_vi = EXCLUDED.name_vi, name_en = EXCLUDED.name_en, name_km = EXCLUDED.name_km, type = EXCLUDED.type, module = EXCLUDED.module, parent_id = EXCLUDED.parent_id;

    -- Nhánh 5: An Sinh Xã Hội
    INSERT INTO public.categories (id, name_vi, name_en, name_km, slug, type, module) 
    VALUES (gen_random_uuid(), 'An Sinh Xã Hội', 'Social Welfare Options', 'សុខុមាលភាពសង្គម', 'an-sinh-xa-hoi', 'news', 'news')
    ON CONFLICT (slug) DO UPDATE SET name_vi = EXCLUDED.name_vi, name_en = EXCLUDED.name_en, name_km = EXCLUDED.name_km, type = EXCLUDED.type, module = EXCLUDED.module;

    -- Nhánh 6: Giáo Dục & Học Thuật (Có con)
    INSERT INTO public.categories (id, name_vi, name_en, name_km, slug, type, module) 
    VALUES (gen_random_uuid(), 'Giáo Dục & Học Thuật', 'Education & Scholarship', 'ការអប់រំ និងការសិក្សា', 'giao-duc-hoc-thuat', 'news', 'news')
    ON CONFLICT (slug) DO UPDATE SET name_vi = EXCLUDED.name_vi, name_en = EXCLUDED.name_en, name_km = EXCLUDED.name_km, type = EXCLUDED.type, module = EXCLUDED.module
    RETURNING id INTO news_edu_id;

        -- Con của Nhánh 6
        INSERT INTO public.categories (id, name_vi, name_en, name_km, slug, type, module, parent_id) VALUES 
        (gen_random_uuid(), 'Giáo Dục Tự Viện', 'Monastery Education', 'ការអប់រំនៅវត្តពុទ្ធសាសនា', 'giao-duc-tu-vien', 'news', 'news', news_edu_id),
        (gen_random_uuid(), 'Hội Nghị & Tham Luận', 'Conferences & Papers', 'សន្និសីទ និងបទបង្ហាញ', 'hoi-nghi-tham-luan', 'news', 'news', news_edu_id),
        (gen_random_uuid(), 'Sách & Ấn Phẩm', 'Books & Publications', 'សៀវភៅ និងឯកសារបោះពុម្ព', 'sach-an-pham', 'news', 'news', news_edu_id)
        ON CONFLICT (slug) DO UPDATE SET name_vi = EXCLUDED.name_vi, name_en = EXCLUDED.name_en, name_km = EXCLUDED.name_km, type = EXCLUDED.type, module = EXCLUDED.module, parent_id = EXCLUDED.parent_id;

    -- Nhánh 7: Thông Báo & Chỉ Dẫn
    INSERT INTO public.categories (id, name_vi, name_en, name_km, slug, type, module) 
    VALUES (gen_random_uuid(), 'Thông Báo & Chỉ Dẫn', 'Notices & Guidelines', 'សេចក្តីជូនដំណឹង និងការណែនាំ', 'thong-bao-chi-dan', 'news', 'news')
    ON CONFLICT (slug) DO UPDATE SET name_vi = EXCLUDED.name_vi, name_en = EXCLUDED.name_en, name_km = EXCLUDED.name_km, type = EXCLUDED.type, module = EXCLUDED.module;


    ---------- KHỐI 2: PHÁP THOẠI ----------
    -- Nhánh 1: Ký Sự Truyền Hình (Có con)
    INSERT INTO public.categories (id, name_vi, name_en, name_km, slug, type, module) 
    VALUES (gen_random_uuid(), 'Ký Sự Truyền Hình', 'TV Documentaries', 'ឯកសារទូរទស្សន៍', 'ky-su-truyen-hinh', 'dharma', 'dharma')
    ON CONFLICT (slug) DO UPDATE SET name_vi = EXCLUDED.name_vi, name_en = EXCLUDED.name_en, name_km = EXCLUDED.name_km, type = EXCLUDED.type, module = EXCLUDED.module
    RETURNING id INTO dharma_media_id;

        -- Con của Nhánh 1
        INSERT INTO public.categories (id, name_vi, name_en, name_km, slug, type, module, parent_id) VALUES 
        (gen_random_uuid(), 'Hành Trình Hoằng Pháp', 'Dharma Propagation Journey', 'ដំណើរផ្សព្វផ្សាយធម៌', 'hanh-trinh-hoang-phap', 'dharma', 'dharma', dharma_media_id),
        (gen_random_uuid(), 'Đời Sống Thiền Môn', 'Zen Monastery Life', 'ជីវិតទីលានសមាធិ', 'doi-song-thien-mon', 'dharma', 'dharma', dharma_media_id),
        (gen_random_uuid(), 'Phóng Sự Văn Hóa Khmer', 'Khmer Culture Reportage', 'សេចក្តីរាយការណ៍វប្បធម៌ខ្មែរ', 'phong-su-van-hoa-khmer', 'dharma', 'dharma', dharma_media_id),
        (gen_random_uuid(), 'Talkshow & Tọa Đàm', 'Talkshows', 'កម្មវិធីសន្ទនា', 'talkshow-toa-dam', 'dharma', 'dharma', dharma_media_id)
        ON CONFLICT (slug) DO UPDATE SET name_vi = EXCLUDED.name_vi, name_en = EXCLUDED.name_en, name_km = EXCLUDED.name_km, type = EXCLUDED.type, module = EXCLUDED.module, parent_id = EXCLUDED.parent_id;

    -- Nhánh 2: Phật Giáo & Đời Sống 
    INSERT INTO public.categories (id, name_vi, name_en, name_km, slug, type, module) 
    VALUES (gen_random_uuid(), 'Phật Giáo & Đời Sống', 'Buddhism & Life', 'ព្រះពុទ្ធសាសនា និងជីវិតប្រចាំថ្ងៃ', 'phat-giao-doi-song', 'dharma', 'dharma')
    ON CONFLICT (slug) DO UPDATE SET name_vi = EXCLUDED.name_vi, name_en = EXCLUDED.name_en, name_km = EXCLUDED.name_km, type = EXCLUDED.type, module = EXCLUDED.module;

    -- Nhánh 3: Kinh Nhật Tụng
    INSERT INTO public.categories (id, name_vi, name_en, name_km, slug, type, module) 
    VALUES (gen_random_uuid(), 'Kinh Nhật Tụng', 'Daily Chanting', 'បទសូត្រប្រចាំថ្ងៃ', 'kinh-nhat-tung', 'dharma', 'dharma')
    ON CONFLICT (slug) DO UPDATE SET name_vi = EXCLUDED.name_vi, name_en = EXCLUDED.name_en, name_km = EXCLUDED.name_km, type = EXCLUDED.type, module = EXCLUDED.module;

    -- Nhánh 4: Giảng Giải Phật Học (Có con)
    INSERT INTO public.categories (id, name_vi, name_en, name_km, slug, type, module) 
    VALUES (gen_random_uuid(), 'Giảng Giải Phật Học', 'Dharma Teachings Explanation', 'ការពន្យល់ធម៌', 'giang-giai-phat-hoc', 'dharma', 'dharma')
    ON CONFLICT (slug) DO UPDATE SET name_vi = EXCLUDED.name_vi, name_en = EXCLUDED.name_en, name_km = EXCLUDED.name_km, type = EXCLUDED.type, module = EXCLUDED.module
    RETURNING id INTO dharma_teaching_id;

        -- Con của Nhánh 4
        INSERT INTO public.categories (id, name_vi, name_en, name_km, slug, type, module, parent_id) VALUES 
        (gen_random_uuid(), 'Khám Phá Tam Tạng Kinh', 'Exploring the Tipitaka', 'រុករកបិដកបី', 'kham-pha-tam-tang-kinh', 'dharma', 'dharma', dharma_teaching_id),
        (gen_random_uuid(), 'Ý Nghĩa Kinh Nhật Tụng', 'Meaning of Daily Chanting', 'អត្ថន័យនៃការសូត្រធម៌ប្រចាំថ្ងៃ', 'y-nghia-kinh-nhat-tung', 'dharma', 'dharma', dharma_teaching_id),
        (gen_random_uuid(), 'Thiền Vipassana', 'Vipassana Meditation', 'សមាធិវិបស្សនា', 'thien-vipassana', 'dharma', 'dharma', dharma_teaching_id),
        (gen_random_uuid(), 'Từ Điển Phật Học', 'Buddhist Dictionary', 'វចនានុក្រមពុទ្ធសាសនា', 'tu-dien-phat-hoc', 'dharma', 'dharma', dharma_teaching_id)
        ON CONFLICT (slug) DO UPDATE SET name_vi = EXCLUDED.name_vi, name_en = EXCLUDED.name_en, name_km = EXCLUDED.name_km, type = EXCLUDED.type, module = EXCLUDED.module, parent_id = EXCLUDED.parent_id;

END $$;