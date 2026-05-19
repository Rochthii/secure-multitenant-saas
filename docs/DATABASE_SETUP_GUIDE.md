# 🗄️ DATABASE SETUP GUIDE

## ✅ CHO BẠN LÀM

Tôi đã tạo sẵn:
- ✅ Migration SQL (9 tables + RLS + indexes + triggers)
- ✅ Seed data (categories + sample content)
- ✅ TypeScript types
- ✅ Supabase clients với types

**Giờ BẠN cần làm:**

> [!TIP]
> **BEST PRACTICE:** Nên tạo một Email mới riêng cho Chi nhánh (ví dụ: `chantarangsay.web@gmail.com`) và đăng ký Supabase bằng email này. 
> - ✅ Tách biệt tài khoản cá nhân
> - ✅ Có sẵn 2 Free Projects mới
> - ✅ Dễ dàng bàn giao quyền quản trị sau này

---

## 🚀 BƯỚC 1: LOGIN SUPABASE CLI

Nếu bạn đổi tài khoản, cần logout trước:
```bash
npx supabase logout
```

Sau đó login:
```bash
npx supabase login
```

Browser sẽ mở → Đăng nhập tài khoản Supabase (mới) của bạn → Xong!

---

## 🔗 BƯỚC 2: LINK VỚI PROJECT

### Option A: Tạo project MỚI trên Supabase Dashboard

1. Vào https://supabase.com/dashboard  
2. Tạo new project:
   - **Name:** `chantarangsay`
   - **Database Password:** (tạo password mạnh, lưu lại!)
   - **Region:** Southeast Asia (Singapore)
3. Đợi ~2 phút project khởi tạo
4. Copy **Project Ref** (ở Settings → General)

### Option B: Dùng project CÓ SẴN

Get project ref từ Settings → General

---

## 🔗 BƯỚC 3: LINK PROJECT

```bash
npx supabase link --project-ref YOUR_PROJECT_REF_HERE
```

Paste project ref bạn copy ở bước 2.

---

## 📤 BƯỚC 4: PUSH MIGRATION

```bash
npx supabase db push
```

Lệnh này sẽ:
- Tạo 9 tables
- Enable RLS policies
- Tạo indexes
- Tạo triggers

**Confirm khi được hỏi!**

---

## 🌱 BƯỚC 5: APPLY SEED DATA

```bash
npx supabase db reset
```

Lệnh này:
- Reset database
- Apply migration
- Apply seed data (10 categories, 4 pages, 1 news, 1 event)

---

## 🔑 BƯỚC 6: UPDATE .ENV.LOCAL

Get credentials từ Project Settings → API:

```env
# Update file: .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...long-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**QUAN TRỌNG:** Restart dev server sau khi update `.env.local`

---

## ✅ BƯỚC 7: TEST KẾT NỐI

Tạo file test: `lib/supabase/test-connection.ts`

```typescript
import { createClient } from './server';

export async function testSupabaseConnection() {
  const supabase = await createClient();
  
  // Test categories
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .limit(5);
  
  if (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
  
  console.log('✅ Supabase connected! Found categories:', data?.length);
  return true;
}
```

Gọi trong Server Component để test!

---

## 📊 9 TABLES ĐÃ TẠO

| Table | Mô tả | RLS |
|-------|-------|-----|
| `categories` | Danh mục (News/Event/Media) | Public read, Admin write |
| `news` | Tin tức (3 ngôn ngữ) | Public read published, Admin full |
| `events` | Sự kiện/Lễ | Public read, Admin full |
| `event_registrations` | Đăng ký sự kiện | Public insert, Admin view |
| `transactions` | Thanh toán | Public insert, Admin only view |
| `media` | Thư viện (ảnh/video/audio) | Public read, Admin full |
| `pages` | Trang tĩnh | Public read published, Admin full |
| `contact_messages` | Liên hệ | Public insert, Admin view |
| `audit_logs` | Nhật ký hệ thống | Admin only |

---

## 🔒 RLS POLICIES ĐÃ TẠO

### Public Actions:
- ✅ Đọc published content (news, events, pages, media)
- ✅ Insert event registrations
- ✅ Insert transactions
- ✅ Insert contact messages

### Admin Actions (requires `role='admin'` in user metadata):
- ✅ Full access tất cả tables
- ✅ View transactions, registrations, contacts
- ✅ View audit logs

---

## 📝 TYPESCRIPT TYPES

Đã tạo: `lib/supabase/database.types.ts`

Sử dụng:

```typescript
import type { Database } from '@/lib/supabase/database.types';

type News = Database['public']['Tables']['news']['Row'];
type NewsInsert = Database['public']['Tables']['news']['Insert'];
type NewsUpdate = Database['public']['Tables']['news']['Update'];
```

---

## 🧪 TEST QUERY EXAMPLE

```typescript
// Get published news
const { data: news } = await supabase
  .from('news')
  .select(`
    *,
    category:categories(*)
  `)
  .eq('status', 'published')
  .order('published_at', { ascending: false })
  .limit(10);

// Get upcoming events
const { data: events } = await supabase
  .from('events')
  .select('*')
  .eq('status', 'upcoming')
  .gte('start_date', new Date().toISOString())
  .order('start_date', { ascending: true });
```

---

## ⚠️ NẾU CÓ LỖI

### Lỗi: "Could not find project ref"
→ Chạy lại `npx supabase link --project-ref YOUR_REF`

### Lỗi: "Permission denied"
→ Check bạn đã login: `npx supabase login`

### Lỗi: "Migration failed"
→ Check SQL syntax trong migration file
→ Hoặc reset: `npx supabase db reset`

### Lỗi: "Cannot connect from Next.js"
→ Check `.env.local` có đúng URL và ANON_KEY
→ Restart dev server: `npm run dev`

---

## 🎯 SAU KHI XONG

Bạn có thể:
1. ✅ Query data từ Next.js app
2. ✅ Tạo admin user với role='admin'
3. ✅ Test trên Supabase Table Editor
4. ✅ Tiếp tục Prompt 04 (Build Homepage)

---

**CÓ THẮC MẮC?** Hỏi tôi nếu gặp lỗi khi chạy commands!
