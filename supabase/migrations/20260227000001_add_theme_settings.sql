-- Migration: Add dynamic theme settings to site_settings table
-- Sets the original Chantarangsay colors as the default fallback themes.

INSERT INTO
    "public"."site_settings" ("key", "value", "description")
VALUES (
        'theme_color_primary',
        '#F59E0B',
        'Màu chủ đo 1 (VD: Vàng nút bấm, mảng sáng)'
    ),
    (
        'theme_color_secondary',
        '#5C4033',
        'Màu chủ đo 2 (VD: Nâu viền, header)'
    ),
    (
        'theme_color_text',
        '#2C1810',
        'Màu chữ chính (Typography)'
    ),
    (
        'theme_color_accent',
        '#FF8C00',
        'Màu điểm nhấn (Hover, thông báo)'
    ),
    (
        'theme_background_start',
        '#FEF9F3',
        'Màu nền gradient trên (Header)'
    ),
    (
        'theme_background_end',
        '#FDF5EB',
        'Màu nền gradient dưới (Footer)'
    ),
    (
        'theme_pattern_opacity',
        '0.05',
        'Độ đậm nhạt (opacity) của hoa văn nền'
    ),
    (
        'site_logo_url',
        '/images/logo/logo-chantarangsay.webp',
        'Đường dẫn/URL Logo chính trang web'
    ),
    (
        'site_favicon_url',
        '/favicon.ico',
        'Đường dẫn/URL Favicon'
    )
ON CONFLICT ("key") DO
UPDATE
SET
    "description" = EXCLUDED."description";