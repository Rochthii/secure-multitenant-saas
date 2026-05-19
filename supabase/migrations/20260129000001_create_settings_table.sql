-- Settings Table Migration
-- Purpose: Store site configuration as key-value pairs
-- Created: 2026-01-29

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW ()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings (key);

-- Seed initial settings
INSERT INTO
    settings (key, value)
VALUES (
        'site_name_vi',
        'Chi nhánh Chantarangsay'
    ),
    (
        'site_name_en',
        'Chantarangsay Tenant'
    ),
    (
        'site_description',
        'Ngôi chi nhánh Khmer uy tín tại Việt Nam'
    ),
    (
        'contact_email',
        'contact@chantarangsay.org'
    ),
    (
        'contact_phone',
        '+84 xxx xxx xxx'
    ),
    (
        'address',
        'Địa chỉ chi nhánh Chantarangsay'
    ),
    (
        'facebook_url',
        'https://facebook.com/'
    ),
    (
        'youtube_url',
        'https://youtube.com/'
    )
ON CONFLICT (key) DO NOTHING;

-- Add comment
COMMENT ON TABLE settings IS 'Site configuration stored as key-value pairs';