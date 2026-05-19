-- Create extension for UUID if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Khởi tạo Bảng Chúa Tể (Tenants Table)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    domain VARCHAR NOT NULL UNIQUE, -- Ví dụ: chua-chantarangsay-new.vercel.app
    name VARCHAR NOT NULL, -- Ví dụ: Chi nhánh Chantarangsay
    subdomain VARCHAR UNIQUE,
    layout_style VARCHAR DEFAULT 'traditional',
    theme_colors JSONB, -- Mã màu cấu hình
    logo_url TEXT,
    contact_info JSONB,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW ()
);

-- Index bắt buộc để Middleware quét Domain cực nhanh
CREATE INDEX idx_tenants_domain ON tenants (domain);

-- 2. Nhập liệu 4 ngôi chi nhánh đầu tiên (Migration)
INSERT INTO
    tenants (
        id,
        domain,
        name,
        theme_colors
    )
VALUES (
        '11111111-1111-1111-1111-111111111111',
        'localhost:3000',
        'Chi nhánh Chantarangsay (Local)',
        '{"primary":"#F59E0B", "secondary":"#5C4033", "bgStart":"#FEF9F3"}'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'chuaphuly.com',
        'Chi nhánh Phù Ly',
        '{"primary":"#D4AF37", "secondary":"#8B1E1E", "bgStart":"#F5F0E6"}'
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'chuakhleang.com',
        'Chi nhánh Kh''leang',
        '{"primary":"#2F6F4E", "secondary":"#E8C547", "bgStart":"#FFFFFF"}'
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        'chuahophongcu.com',
        'Chi nhánh Hộ Phòng Cũ',
        '{"primary":"#5A3E8E", "secondary":"#F2D16B", "bgStart":"#F5F0E6"}'
    ),
    (
        '55555555-5555-5555-5555-555555555555',
        'chua-chantarangsay-new.vercel.app',
        'Chi nhánh Chantarangsay',
        '{"primary":"#F59E0B", "secondary":"#5C4033", "bgStart":"#FEF9F3"}'
    );

-- 3. Sửa Đổi Các Bảng Dữ Liệu Tồn Tại (Attach Foreign Keys)
ALTER TABLE news
ADD COLUMN tenant_id UUID REFERENCES tenants (id) DEFAULT '55555555-5555-5555-5555-555555555555';

ALTER TABLE events
ADD COLUMN tenant_id UUID REFERENCES tenants (id) DEFAULT '55555555-5555-5555-5555-555555555555';

ALTER TABLE transactions
ADD COLUMN tenant_id UUID REFERENCES tenants (id) DEFAULT '55555555-5555-5555-5555-555555555555';

ALTER TABLE site_settings
ADD COLUMN tenant_id UUID REFERENCES tenants (id) DEFAULT '55555555-5555-5555-5555-555555555555';