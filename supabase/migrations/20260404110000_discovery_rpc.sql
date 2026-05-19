-- ==============================================================================
-- MIGRATION: Discovery Feature Support (RPC & Provinces)
-- Ngày: 2026-04-04
-- Mục đích: Cung cấp API tìm kiếm chi nhánh quanh đây và lọc theo Tỉnh thành.
-- ==============================================================================

-- 1. Tạo bảng Provinces (Tỉnh/Thành)
CREATE TABLE IF NOT EXISTS public.provinces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    code TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Cập nhật bảng tenants để hỗ trợ lọc theo Tỉnh thành
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS province_id UUID REFERENCES public.provinces(id);

-- 3. Seed dữ liệu mẫu cho Provinces (Toàn bộ 34 đơn vị hành chính sau sáp nhập 2025/2026)
INSERT INTO public.provinces (name, code) VALUES 
('Thành phố Hà Nội', 'HN'),
('Thành phố Hồ Chí Minh', 'HCM'),
('Thành phố Hải Phòng', 'HP'),
('Thành phố Đà Nẵng', 'DN'),
('Thành phố Cần Thơ', 'CT'),
('Thành phố Huế', 'HUE'),
('Tỉnh Cao Bằng', 'CB'),
('Tỉnh Điện Biên', 'DB'),
('Tỉnh Hà Tĩnh', 'HT'),
('Tỉnh Lai Châu', 'LC'),
('Tỉnh Lạng Sơn', 'LS'),
('Tỉnh Nghệ An', 'NA'),
('Tỉnh Quảng Ninh', 'QN'),
('Tỉnh Thanh Hóa', 'TH'),
('Tỉnh Sơn La', 'SL'),
('Tỉnh Tuyên Quang', 'TQ'),
('Tỉnh Lào Cai', 'LCA'),
('Tỉnh Thái Nguyên', 'TN'),
('Tỉnh Phú Thọ', 'PT'),
('Tỉnh Bắc Ninh', 'BN'),
('Tỉnh Hưng Yên', 'HY'),
('Tỉnh Ninh Bình', 'NB'),
('Tỉnh Quảng Trị', 'QT'),
('Tỉnh Quảng Ngãi', 'QNG'),
('Tỉnh Gia Lai', 'GL'),
('Tỉnh Khánh Hòa', 'KH'),
('Tỉnh Lâm Đồng', 'LD'),
('Tỉnh Đắk Lắk', 'DL'),
('Tỉnh Đồng Nai', 'DNA'),
('Tỉnh Tây Ninh', 'TNIN'),
('Tỉnh Vĩnh Long', 'VL'),
('Tỉnh Đồng Tháp', 'DT'),
('Tỉnh An Giang', 'AG'),
('Tỉnh Cà Mau', 'CM')
ON CONFLICT (name) DO NOTHING;

-- 4. Hàm RPC: get_discovery_tenants
-- Hàm này thực hiện tìm kiếm Spatial (GIS) và tính khoảng cách
-- Ghi chú: Cần DROP trước vì REPLACE không cho phép thay đổi kiểu trả về (RETURNS TABLE)
DROP FUNCTION IF EXISTS get_discovery_tenants(FLOAT8, FLOAT8, TEXT, UUID);

CREATE OR REPLACE FUNCTION get_discovery_tenants(
    user_lat FLOAT8,
    user_long FLOAT8,
    search_query TEXT DEFAULT NULL,
    filter_province_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    domain TEXT,
    latitude FLOAT8,
    longitude FLOAT8,
    address_vi TEXT,
    logo_url TEXT,
    cover_url TEXT,
    distance_meters FLOAT8
) AS $$
DECLARE
    user_geog geography;
BEGIN
    user_geog := ST_SetSRID(ST_MakePoint(user_long, user_lat), 4326)::geography;

    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.domain,
        t.latitude,
        t.longitude,
        t.address_vi,
        t.logo_url,
        NULL::TEXT as cover_url, -- Placeholder nếu chưa có cột cover_url
        ST_Distance(t.geog, user_geog) as distance_meters
    FROM 
        public.tenants t
    WHERE 
        (search_query IS NULL OR t.name ILIKE '%' || search_query || '%' OR t.domain ILIKE '%' || search_query || '%')
        AND (filter_province_id IS NULL OR t.province_id = filter_province_id)
        AND t.latitude IS NOT NULL 
        AND t.longitude IS NOT NULL
    ORDER BY 
        distance_meters ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Cấp quyền
GRANT EXECUTE ON FUNCTION get_discovery_tenants(FLOAT8, FLOAT8, TEXT, UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_discovery_tenants(FLOAT8, FLOAT8, TEXT, UUID) TO authenticated;
GRANT SELECT ON public.provinces TO anon;
GRANT SELECT ON public.provinces TO authenticated;
