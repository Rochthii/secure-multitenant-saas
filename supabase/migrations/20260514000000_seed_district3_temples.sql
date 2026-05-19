-- Update coordinates for existing tenants and add Chi nhánh Pháp Hoa & Chi nhánh Vĩnh Nghiêm

DO $$
DECLARE
    hcm_id UUID;
BEGIN
    SELECT id INTO hcm_id FROM provinces WHERE code = 'HCM';

    -- Update Chi nhánh Chantarangsay
    UPDATE tenants 
    SET 
        latitude = 10.787676, 
        longitude = 106.684824, 
        address_vi = '164/235 Trần Quốc Thảo, Phường 14, Quận 3, TP Hồ Chí Minh',
        province_id = hcm_id,
        geog = ST_SetSRID(ST_MakePoint(106.684824, 10.787676), 4326)::geography
    WHERE domain IN ('localhost:3000', 'chua-chantarangsay-new.vercel.app');

    -- Insert Chi nhánh Pháp Hoa
    INSERT INTO tenants (id, domain, name, latitude, longitude, address_vi, province_id, geog, theme_colors)
    VALUES (
        uuid_generate_v4(),
        'chuaphaphoa.com',
        'Chi nhánh Pháp Hoa',
        10.788548,
        106.678917,
        '220A Lê Văn Sỹ, Phường 14, Quận 3, TP Hồ Chí Minh',
        hcm_id,
        ST_SetSRID(ST_MakePoint(106.678917, 10.788548), 4326)::geography,
        '{"primary":"#D4AF37", "secondary":"#8B1E1E", "bgStart":"#F5F0E6"}'
    ) ON CONFLICT (domain) DO UPDATE SET 
        latitude = 10.788548, 
        longitude = 106.678917,
        address_vi = '220A Lê Văn Sỹ, Phường 14, Quận 3, TP Hồ Chí Minh',
        province_id = hcm_id,
        geog = ST_SetSRID(ST_MakePoint(106.678917, 10.788548), 4326)::geography;

    -- Insert Chi nhánh Vĩnh Nghiêm
    INSERT INTO tenants (id, domain, name, latitude, longitude, address_vi, province_id, geog, theme_colors)
    VALUES (
        uuid_generate_v4(),
        'chuavinhnghiem.com',
        'Chi nhánh Vĩnh Nghiêm',
        10.789230,
        106.685324,
        '339 Nam Kỳ Khởi Nghĩa, Phường 7, Quận 3, TP Hồ Chí Minh',
        hcm_id,
        ST_SetSRID(ST_MakePoint(106.685324, 10.789230), 4326)::geography,
        '{"primary":"#2F6F4E", "secondary":"#E8C547", "bgStart":"#FFFFFF"}'
    ) ON CONFLICT (domain) DO UPDATE SET 
        latitude = 10.789230, 
        longitude = 106.685324,
        address_vi = '339 Nam Kỳ Khởi Nghĩa, Phường 7, Quận 3, TP Hồ Chí Minh',
        province_id = hcm_id,
        geog = ST_SetSRID(ST_MakePoint(106.685324, 10.789230), 4326)::geography;

END $$;
