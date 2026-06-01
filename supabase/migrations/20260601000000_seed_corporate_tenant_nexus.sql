-- ==============================================================================
-- MIGRATION: Seed Tenant Doanh nghiệp Nexus Corp (Kịch bản Multi-tenant Demo)
-- Ngày: 2026-06-01
-- Mục tiêu: Thêm tenant loại "company" (Tập đoàn công nghệ) để chứng minh
--   nền tảng SaaS phục vụ NHIỀU LOẠI hình doanh nghiệp khác nhau trên CÙNG
--   một hạ tầng — đây là điểm cốt lõi của kiến trúc Secure Multi-tenant SaaS.
--
-- Tenant này sẽ accessible tại: nexus-corp.vercel.app
-- Layout: corp_navy (Corporate/Enterprise theme)
-- Tenant type: company (phân biệt với 'tenant' là chùa)
-- ==============================================================================

-- Thêm tenant doanh nghiệp mới (idempotent — chạy nhiều lần không gây lỗi)
INSERT INTO public.tenants (
    id,
    domain,
    name,
    layout_style,
    tenant_type,
    logo_url,
    theme_colors,
    contact_info,
    lifecycle_status,
    modules_config,
    layout_blocks
)
VALUES (
    '66666666-6666-6666-6666-666666666666',
    'nexus-corp.vercel.app',
    'Nexus Corp Vietnam',
    'corp_navy',
    'company',
    NULL,
    '{
        "primary": "#4f8fff",
        "secondary": "#7b5cfa",
        "accent": "#e8c97e",
        "bgStart": "#07080d",
        "bgEnd": "#0e1017",
        "mode": "dark"
    }',
    '{
        "address": "Tầng 18, Mipec Tower, 229 Tây Sơn, Đống Đa, Hà Nội",
        "phone": "1800 6868",
        "email": "contact@nexuscorp.vn",
        "website": "https://nexus-corp.vercel.app"
    }',
    'active',
    '{
        "security_settings": {
            "ip_whitelist": null,
            "intranet_only": false
        },
        "features": {
            "news": true,
            "events": true,
            "donations": false,
            "documents": true,
            "ai_portal": false
        }
    }',
    '[
        {"id": "corp-hero",     "type": "enterprise_hero",     "visible": true},
        {"id": "corp-features", "type": "enterprise_features",  "visible": true},
        {"id": "corp-stats",    "type": "enterprise_stats",     "visible": true},
        {"id": "corp-news",     "type": "enterprise_news",      "visible": true},
        {"id": "corp-cta",      "type": "enterprise_cta",       "visible": true}
    ]'
)
ON CONFLICT (id) DO UPDATE SET
    domain            = EXCLUDED.domain,
    name              = EXCLUDED.name,
    layout_style      = EXCLUDED.layout_style,
    tenant_type       = EXCLUDED.tenant_type,
    theme_colors      = EXCLUDED.theme_colors,
    contact_info      = EXCLUDED.contact_info,
    lifecycle_status  = EXCLUDED.lifecycle_status,
    modules_config    = EXCLUDED.modules_config,
    layout_blocks     = EXCLUDED.layout_blocks;


-- Seed dữ liệu Site Settings cho Nexus Corp (key-value pairs)
INSERT INTO public.site_settings (tenant_id, key, value)
VALUES
    ('66666666-6666-6666-6666-666666666666', 'site_name_vi',         'Nexus Corp Vietnam'),
    ('66666666-6666-6666-6666-666666666666', 'site_name_en',         'Nexus Corp Vietnam'),
    ('66666666-6666-6666-6666-666666666666', 'site_description_vi',  'Giải pháp công nghệ doanh nghiệp — bảo mật, hiệu suất và tin cậy từ năm 2012'),
    ('66666666-6666-6666-6666-666666666666', 'site_description_en',  'Enterprise technology solutions — secure, performant, and trusted since 2012'),
    ('66666666-6666-6666-6666-666666666666', 'facebook_url',         'https://facebook.com'),
    ('66666666-6666-6666-6666-666666666666', 'contact_email',        'contact@nexuscorp.vn'),
    ('66666666-6666-6666-6666-666666666666', 'contact_phone',        '1800 6868'),
    ('66666666-6666-6666-6666-666666666666', 'contact_address',      'Tầng 18, Mipec Tower, 229 Tây Sơn, Đống Đa, Hà Nội')
ON CONFLICT (tenant_id, key) DO UPDATE SET value = EXCLUDED.value;

-- Seed 3 bài viết mẫu (News) cho Nexus Corp — an toàn idempotent
INSERT INTO public.news (
    tenant_id, title, slug, excerpt, content, status, published_at, category
)
SELECT
    '66666666-6666-6666-6666-666666666666',
    'Nexus Corp ra mắt nền tảng Cloud Security 2026',
    'nexus-corp-cloud-security-2026',
    'Nexus Corp chính thức công bố nền tảng bảo mật đám mây thế hệ mới, tích hợp AI phát hiện mối đe dọa theo thời gian thực.',
    '<p>Nexus Corp hôm nay chính thức ra mắt <strong>CloudShield 2026</strong> — nền tảng bảo mật đám mây toàn diện tích hợp AI...</p>',
    'published',
    NOW() - INTERVAL '2 days',
    'Công nghệ'
WHERE NOT EXISTS (
    SELECT 1 FROM public.news WHERE tenant_id = '66666666-6666-6666-6666-666666666666' AND slug = 'nexus-corp-cloud-security-2026'
);

INSERT INTO public.news (
    tenant_id, title, slug, excerpt, content, status, published_at, category
)
SELECT
    '66666666-6666-6666-6666-666666666666',
    'Nexus Corp đạt chứng nhận ISO 27001:2022',
    'nexus-corp-iso-27001-2022',
    'Sau 6 tháng kiểm toán nghiêm ngặt, Nexus Corp chính thức được cấp chứng nhận ISO 27001:2022 — tiêu chuẩn bảo mật thông tin quốc tế cao nhất.',
    '<p>Đây là cột mốc quan trọng khẳng định cam kết của Nexus Corp về an toàn thông tin...</p>',
    'published',
    NOW() - INTERVAL '7 days',
    'Thành tựu'
WHERE NOT EXISTS (
    SELECT 1 FROM public.news WHERE tenant_id = '66666666-6666-6666-6666-666666666666' AND slug = 'nexus-corp-iso-27001-2022'
);

INSERT INTO public.news (
    tenant_id, title, slug, excerpt, content, status, published_at, category
)
SELECT
    '66666666-6666-6666-6666-666666666666',
    'Nexus Corp mở rộng sang thị trường Đông Nam Á',
    'nexus-corp-mo-rong-dong-nam-a',
    'Với văn phòng mới tại Singapore và Bangkok, Nexus Corp đặt mục tiêu phục vụ 1000+ doanh nghiệp khu vực vào năm 2027.',
    '<p>Chiến lược mở rộng khu vực là bước đi chiến lược tiếp theo của Nexus Corp...</p>',
    'published',
    NOW() - INTERVAL '14 days',
    'Chiến lược'
WHERE NOT EXISTS (
    SELECT 1 FROM public.news WHERE tenant_id = '66666666-6666-6666-6666-666666666666' AND slug = 'nexus-corp-mo-rong-dong-nam-a'
);

-- Seed 2 sự kiện mẫu cho Nexus Corp
INSERT INTO public.events (
    tenant_id, title, slug, description, start_date, end_date, location, status
)
SELECT
    '66666666-6666-6666-6666-666666666666',
    'Nexus Tech Summit 2026',
    'nexus-tech-summit-2026',
    'Hội thảo công nghệ thường niên quy tụ 500+ chuyên gia IT và lãnh đạo doanh nghiệp toàn khu vực.',
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '31 days',
    'GEM Center, TP. Hồ Chí Minh',
    'upcoming'
WHERE NOT EXISTS (
    SELECT 1 FROM public.events WHERE tenant_id = '66666666-6666-6666-6666-666666666666' AND slug = 'nexus-tech-summit-2026'
);

INSERT INTO public.events (
    tenant_id, title, slug, description, start_date, end_date, location, status
)
SELECT
    '66666666-6666-6666-6666-666666666666',
    'Workshop: Zero Trust Architecture cho Doanh nghiệp',
    'workshop-zero-trust-2026',
    'Workshop thực hành triển khai kiến trúc Zero Trust cho đội ngũ kỹ thuật doanh nghiệp vừa và lớn.',
    NOW() + INTERVAL '15 days',
    NOW() + INTERVAL '15 days',
    'Nexus Corp HQ — Hà Nội',
    'upcoming'
WHERE NOT EXISTS (
    SELECT 1 FROM public.events WHERE tenant_id = '66666666-6666-6666-6666-666666666666' AND slug = 'workshop-zero-trust-2026'
);


-- Ghi chú cho hội đồng:
-- Tenant 66666666-6666-6666-6666-666666666666 = Nexus Corp (corporate)
-- Tenant 55555555-5555-5555-5555-555555555555 = Chantarangsay (chùa)
-- → Cùng DB, cùng RLS, cùng middleware, nhưng hoàn toàn cô lập dữ liệu nhau.
-- → Đây là bằng chứng kỹ thuật của Secure Multi-tenant SaaS Architecture.
