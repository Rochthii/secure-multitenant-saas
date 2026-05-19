-- Migration: Tạo bảng user_profiles để lưu thông tin mở rộng của người dùng Mobile
-- preferred_tenant_id: chi nhánh ưa thích (preference), KHÔNG phải tenant cố định

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  preferred_tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Mỗi user chỉ đọc/sửa profile của chính mình
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger: tự động tạo profile khi user đăng ký mới
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, preferred_tenant_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'preferred_tenant_id' IS NOT NULL 
      THEN (NEW.raw_user_meta_data ->> 'preferred_tenant_id')::UUID
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Cho phép authenticated users đọc danh sách chi nhánh (tenants) để hiển thị trong form chọn chi nhánh
-- (Chính sách này cần kiểm tra xem đã có chưa trong migration cũ)
GRANT SELECT ON public.tenants TO authenticated;
GRANT SELECT ON public.tenants TO anon;
