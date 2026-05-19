-- Bật extension cho updated_at trigger
CREATE EXTENSION IF NOT EXISTS moddatetime schema extensions;

-- Tạo bảng transaction_projects
CREATE TABLE transaction_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    title_vi TEXT NOT NULL,
    title_km TEXT,
    description_vi TEXT,
    description_km TEXT,
    content_vi TEXT,
    content_km TEXT,
    thumbnail_url TEXT,
    target_amount NUMERIC NOT NULL DEFAULT 0,
    current_amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ongoing' CHECK (
        status IN (
            'ongoing',
            'completed',
            'cancelled'
        )
    ),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW (),
    updated_at TIMESTAMPTZ DEFAULT NOW (),
    created_by UUID REFERENCES auth.users (id)
);

-- Bật RLS
ALTER TABLE transaction_projects ENABLE ROW LEVEL SECURITY;

-- Ai cũng có thể xem dự án public
CREATE POLICY "Public profiles are viewable by everyone." ON transaction_projects FOR
SELECT USING (is_active = true);

-- Admin và Moderator có thể toàn quyền
CREATE POLICY "Admin and Moderator can manage projects" ON transaction_projects FOR ALL USING (
    (
        auth.jwt () -> 'user_metadata' ->> 'role'
    ) IN (
        'admin',
        'super_admin',
        'moderator'
    )
);

-- Thêm trigger cập nhật updated_at
CREATE TRIGGER handle_updated_at_transaction_projects 
BEFORE UPDATE ON transaction_projects 
FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);