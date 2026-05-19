# PROMPT 02: DESIGN SYSTEM

**Task:** Tạo design system components với bản sắc Khmer

**Thời gian ước tính:** 2-3 giờ

---

## 📋 CONTEXT

Cần tạo design system với màu sắc, typography, components đặc trưng văn hóa Khmer.

**Reference:**
- `docs/_legacy_archive/2026-03/03_THIET_KE_UI_UX.md` (màu sắc, fonts, components - legacy)
- `docs/_index.md` (nguồn chuẩn hiện tại)

**Prerequisites:**
- Đã hoàn thành Prompt 01 (Project setup)

---

## 🎯 YÊU CẦU

### 1. Install shadcn/ui

```bash
npx shadcn-ui@latest init

# Configuration:
✔ Which style would you like to use? › Default
✔ Which color would you like to use as base color? › Slate
✔ Would you like to use CSS variables for colors? › yes
```

### 2. Install components

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add badge
```

### 3. Update `src/app/[locale]/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Import Khmer Font */
@import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700&display=swap');

@layer base {
  :root {
    /* Gold - Primary */
    --gold-primary: 51 100% 50%; /* #FFD700 */
    --gold-dark: 43 74% 49%; /* #DAA520 */
    
    /* Saffron - Orange */
    --saffron: 33 100% 50%; /* #FF8C00 */
    
    /* Sacred Red */
    --sacred-red: 0 100% 27%; /* #8B0000 */
    
    /* Teal Accent */
    --teal-accent: 177 51% 41%; /* #20B2AA */
    
    /* Neutral */
    --ivory: 60 100% 97%; /* #FFFFF0 */
    
    --background: 0 0% 100%;
    --foreground: 0 0% 20%;
    
    --card: 0 0% 100%;
    --card-foreground: 0 0% 20%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 20%;
    
    --primary: var(--gold-primary);
    --primary-foreground: 0 0% 20%;
    
    --secondary: var(--saffron);
    --secondary-foreground: 0 0% 100%;
    
    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 40%;
    
    --accent: var(--teal-accent);
    --accent-foreground: 0 0% 100%;
    
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    
    --border: 0 0% 90%;
    --input: 0 0% 90%;
    --ring: var(--gold-primary);
    
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Khmer Decorative Patterns */
@layer components {
  .khmer-divider {
    @apply relative my-8;
  }
  
  .khmer-divider::before {
    content: '';
    @apply absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold-primary to-transparent;
  }
  
  .lotus-pattern {
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 20 L35 30 L30 40 L25 30 Z' fill='%23FFD700' opacity='0.1'/%3E%3C/svg%3E");
  }
}
```

### 4. Tạo Khmer-specific components

#### `src/components/ui/khmer-heading.tsx`

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface KhmerHeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4;
  className?: string;
  withDivider?: boolean;
}

export function KhmerHeading({ 
  children, 
  level = 1, 
  className,
  withDivider = false 
}: KhmerHeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const baseStyles = "font-playfair font-bold text-gold-primary";
  const sizeStyles = {
    1: "text-4xl md:text-5xl",
    2: "text-3xl md:text-4xl",
    3: "text-2xl md:text-3xl",
    4: "text-xl md:text-2xl",
  };
  
  return (
    <div className={cn("mb-6", className)}>
      <Tag className={cn(baseStyles, sizeStyles[level])}>
        {children}
      </Tag>
      {withDivider && (
        <div className="khmer-divider mt-4" />
      )}
    </div>
  );
}
```

#### `src/components/ui/icon-card.tsx`

```tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';
import { cn } from '@/lib/utils';

interface IconCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  iconColor?: string;
}

export function IconCard({
  icon: Icon,
  title,
  description,
  children,
  className,
  iconColor = "text-gold-primary"
}: IconCardProps) {
  return (
    <Card className={cn(
      "border-t-4 border-t-gold-primary hover:shadow-lg transition-shadow",
      className
    )}>
      <CardHeader>
        <div className="mb-4">
          <Icon className={cn("h-12 w-12", iconColor)} />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}
```

#### `src/components/ui/gold-button.tsx`

```tsx
import React from 'react';
import { Button, ButtonProps } from './button';
import { cn } from '@/lib/utils';

export function GoldButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      className={cn(
        "bg-gold-primary hover:bg-gold-dark text-gray-900 font-semibold",
        "shadow-[0_4px_15px_rgba(255,215,0,0.3)]",
        "transition-all duration-300",
        className
      )}
      {...props}
    />
  );
}
```

### 5. Create layout components

#### `src/components/layout/Header.tsx`

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const t = useTranslations('common');
  const pathname = usePathname();

  const navigation = [
    { name: t('home'), href: '/' },
    { name: t('about'), href: '/gioi-thieu' },
    { name: t('news'), href: '/tin-tuc' },
    { name: t('events'), href: '/lich-le' },
    { name: t('gallery'), href: '/thu-vien' },
    { name: t('contact'), href: '/lien-he' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-gold-primary rounded-full flex items-center justify-center">
                <span className="text-2xl">☸️</span>
              </div>
              <span className="font-playfair font-bold text-xl hidden sm:block">
                Chantarangsay
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-gold-primary transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Button className="bg-gold-primary hover:bg-gold-dark hidden sm:inline-flex">
              {t('donate')}
            </Button>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-2 text-gray-700 hover:text-gold-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
```

#### `src/components/layout/LanguageSwitcher.tsx`

```tsx
'use client';

import React from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { LOCALES } from '@/lib/constants';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Globe className="h-4 w-4 mr-2" />
          {locale.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Object.entries(LOCALES).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLocaleChange(code)}
            className={locale === code ? 'bg-accent' : ''}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

#### `src/components/layout/Footer.tsx`

```tsx
import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const t = useTranslations('common');

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-gold-primary font-playfair font-bold text-xl mb-4">
              Chantarangsay
            </h3>
            <p className="text-sm">
              Ngôi chi nhánh Khmer Nam tông giữa lòng Sài Gòn
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                <span>Quận 3, TP.HCM</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>028 xxxx xxxx</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>info@chantarangsay.org</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên kết</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/gioi-thieu" className="hover:text-gold-primary">Giới thiệu</Link></li>
              <li><Link href="/tin-tuc" className="hover:text-gold-primary">Tin tức</Link></li>
              <li><Link href="/lich-le" className="hover:text-gold-primary">Lịch lễ</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-semibold mb-4">Mạng xã hội</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-gold-primary">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="hover:text-gold-primary">
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2026 Chi nhánh Chantarangsay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
```

### 6. Update layout to use components

#### Update `src/app/[locale]/layout.tsx`

```tsx
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

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
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

---

## ✅ ACCEPTANCE CRITERIA

- [ ] shadcn/ui installed & working
- [ ] Custom Khmer components created
- [ ] Header with navigation & language switcher
- [ ] Footer with info & links
- [ ] Gold/Saffron colors applied
- [ ] Responsive mobile menu
- [ ] Typography scales working

---

--- START PROMPT ---

Tạo design system cho website Chi nhánh Chantarangsay với:

1. Install shadcn/ui components (button, card, input, etc)
2. Update globals.css với Khmer color palette
3. Tạo custom components: KhmerHeading, IconCard, GoldButton
4. Tạo Header responsive với logo, navigation, language switcher
5. Tạo LanguageSwitcher component
6. Tạo Footer với thông tin liên hệ
7. Update layout.tsx để sử dụng Header/Footer

Màu sắc chính: Gold (#FFD700), Saffron (#FF8C00), Sacred Red (#8B0000)
Font: Playfair Display (headings), Inter (body), Kantumruy Pro (Khmer)

Test responsive trên mobile và desktop!
