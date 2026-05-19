# PROMPT 01: SETUP PROJECT

**Task:** Khởi tạo dự án Next.js 14 với TypeScript, Tailwind CSS, Supabase

**Thời gian ước tính:** 30-45 phút

---

## 📋 CONTEXT

Đây là dự án website cho Chi nhánh Chantarangsay (chi nhánh Khmer Nam tông).

**Tech stack:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL)
- next-intl (i18n: Việt, Khmer, English)

**Reference docs:**
- `docs/_legacy_archive/2026-03/04_KIEN_TRUC_KY_THUAT.md` (kiến trúc kỹ thuật - legacy)
- `docs/_legacy_archive/2026-03/06_LO_TRINH_TRIEN_KHAI.md` (cấu trúc folder - legacy)
- `docs/_index.md` (nguồn chuẩn hiện tại)

---

## 🎯 YÊU CẦU

### 1. Tạo Next.js project

```bash
# Sử dụng lệnh:
npx create-next-app@latest chantarangsay-website

# Options:
✔ Would you like to use TypeScript? → Yes
✔ Would you like to use ESLint? → Yes
✔ Would you like to use Tailwind CSS? → Yes
✔ Would you like to use `src/` directory? → Yes
✔ Would you like to use App Router? → Yes
✔ Would you like to customize the default import alias? → No
```

### 2. Cài dependencies cần thiết

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install next-intl
npm install zod react-hook-form @hookform/resolvers
npm install lucide-react
npm install date-fns
npm install class-variance-authority clsx tailwind-merge
```

### 3. Cài dev dependencies

```bash
npm install -D @types/node
npm install -D prettier prettier-plugin-tailwindcss
```

### 4. Tạo cấu trúc folder theo spec

```
src/
├── app/
│   ├── [locale]/           # i18n routing
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── api/
├── components/
│   ├── ui/                 # Placeholder for shadcn/ui
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   └── common/
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser client
│   │   ├── server.ts       # Server client
│   │   └── types.ts        # Database types
│   ├── utils.ts
│   └── constants.ts
├── hooks/
├── types/
└── i18n/
    ├── request.ts
    └── routing.ts

public/
├── fonts/                  # Khmer fonts
└── images/
    └── icons/

messages/                   # i18n translations
├── vi.json
├── km.json
└── en.json
```

### 5. Cấu hình files

#### `tailwind.config.ts`
```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Khmer tenant colors
        gold: {
          primary: "#FFD700",
          dark: "#DAA520",
        },
        saffron: {
          DEFAULT: "#FF8C00",
        },
        sacred: {
          red: "#8B0000",
        },
        teal: {
          accent: "#20B2AA",
        },
        ivory: {
          DEFAULT: "#FFFFF0",
        },
      },
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        inter: ["Inter", "sans-serif"],
        khmer: ["Kantumruy Pro", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
```

#### `.env.local`
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### `next.config.js`
```js
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
```

#### `tsconfig.json` (update paths)
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 6. Setup next-intl

#### `src/i18n/routing.ts`
```ts
import { defineRouting } from 'next-intl/routing';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['vi', 'km', 'en'],
  defaultLocale: 'vi',
});

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation(routing);
```

#### `src/i18n/request.ts`
```ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../../messages/${locale}.json`)).default,
}));
```

#### Create translation files

`messages/vi.json`:
```json
{
  "common": {
    "home": "Trang chủ",
    "about": "Giới thiệu",
    "news": "Tin tức",
    "events": "Lịch lễ",
    "gallery": "Thư viện",
    "donate": "Thanh toán",
    "contact": "Liên hệ"
  },
  "home": {
    "title": "Chi nhánh Chantarangsay",
    "subtitle": "Ánh Trăng Giữa Lòng Sài Gòn"
  }
}
```

`messages/km.json`:
```json
{
  "common": {
    "home": "ទំព័រដើម",
    "about": "អំពីយើង",
    "news": "ព័ត៌មាន",
    "events": "កាលវិភាគ",
    "gallery": "វិចិត្រសាល",
    "donate": "បរិច្ចាគ",
    "contact": "ទំនាក់ទំនង"
  },
  "home": {
    "title": "វត្តចន្ទរង្សី",
    "subtitle": "ពន្លឺព្រះច័ន្ទនៅកណ្តាលទីក្រុង"
  }
}
```

`messages/en.json`:
```json
{
  "common": {
    "home": "Home",
    "about": "About",
    "news": "News",
    "events": "Events",
    "gallery": "Gallery",
    "donate": "Donate",
    "contact": "Contact"
  },
  "home": {
    "title": "Chantarangsay Tenant",
    "subtitle": "Moonlight in the Heart of Saigon"
  }
}
```

### 7. Create utility functions

#### `src/lib/utils.ts`
```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### `src/lib/constants.ts`
```ts
export const SITE_NAME = "Chi nhánh Chantarangsay";
export const SITE_DESCRIPTION = "Ngôi chi nhánh Khmer Nam tông giữa lòng Sài Gòn";

export const LOCALES = {
  vi: "Tiếng Việt",
  km: "ភាសាខ្មែរ",
  en: "English",
} as const;

export const DEFAULT_LOCALE = "vi";
```

### 8. Setup Supabase clients

#### `src/lib/supabase/client.ts`
```ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

#### `src/lib/supabase/server.ts`
```ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Server Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Server Component
          }
        },
      },
    }
  );
}
```

### 9. Create basic layout

#### `src/app/[locale]/layout.tsx`
```tsx
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair" 
});

export const metadata: Metadata = {
  title: "Chi nhánh Chantarangsay",
  description: "Ngôi chi nhánh Khmer Nam tông giữa lòng Sài Gòn",
};

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${playfair.variable} font-inter`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

#### `src/app/[locale]/page.tsx`
```tsx
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-playfair font-bold text-gold-primary mb-4">
          {t('title')}
        </h1>
        <p className="text-xl text-gray-600">
          {t('subtitle')}
        </p>
      </div>
    </main>
  );
}
```

### 10. Test chạy

```bash
npm run dev
```

Truy cập:
- http://localhost:3000/vi
- http://localhost:3000/km
- http://localhost:3000/en

---

## ✅ ACCEPTANCE CRITERIA

- [ ] Project runs without errors
- [ ] i18n routing works (vi, km, en)
- [ ] Tailwind CSS applied (gold color shows)
- [ ] Fonts loaded correctly
- [ ] Folder structure matches spec
- [ ] Supabase clients created
- [ ] Environment variables setup
- [ ] Git initialized and first commit

---

## 📦 OUTPUT FILES

Sau khi hoàn thành, bạn sẽ có:
- ✅ Full Next.js project setup
- ✅ ~30+ files created
- ✅ Ready to code features

---

--- START PROMPT ---

Bạn là senior Next.js developer. Hãy setup dự án Next.js 14 cho website Chi nhánh Chantarangsay theo yêu cầu trên.

Tạo đầy đủ:
1. Next.js project với TypeScript, Tailwind
2. Cài tất cả dependencies
3. Tạo folder structure theo spec
4. Config files: tailwind.config.ts, next.config.js, tsconfig.json
5. Setup next-intl với 3 ngôn ngữ
6. Tạo Supabase clients (browser & server)
7. Translation files (vi.json, km.json, en.json)
8. Basic layout & homepage
9. Utility functions

Test chạy `npm run dev` và confirm 3 routes hoạt động: /vi, /km, /en

Báo cáo lại khi hoàn thành!
