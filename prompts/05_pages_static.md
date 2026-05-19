# PROMPT 05: STATIC PAGES

**Task:** Tạo các trang tĩnh (Giới thiệu, Liên hệ, v.v.)

**Thời gian ước tính:** 2-3 giờ

---

## 📋 CONTEXT

Các trang tĩnh cung cấp thông tin về chi nhánh, kiến trúc, giáo lý, liên hệ.

**Reference:**
- `docs/_legacy_archive/2026-03/05_CAU_TRUC_NOI_DUNG.md` (sitemap section 1 - legacy)
- `docs/04_PUBLIC_FEATURES.md` (route/flow hiện tại)

---

## 🎯 YÊU CẦU

### 1. About Page (Giới thiệu)

`src/app/[locale]/gioi-thieu/page.tsx`:

```tsx
import React from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { KhmerHeading } from '@/components/ui/khmer-heading';
import { notFound } from 'next/navigation';

export default async function AboutPage() {
  const supabase = await createClient();
  
  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', 'gioi-thieu')
    .eq('status', 'published')
    .single();

  if (!page) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <KhmerHeading level={1} withDivider>
        {page.title_vi}
      </KhmerHeading>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: page.content_vi }} />
        </div>
        <div className="relative h-96 md:h-full rounded-lg overflow-hidden">
          <Image
            src="/images/chua-overview.jpg"
            alt="Chi nhánh Chantarangsay"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* History Timeline */}
      <section className="mb-12">
        <h2 className="text-3xl font-playfair font-bold text-gold-primary mb-8">
          Dòng thời gian
        </h2>
        <div className="space-y-8">
          <TimelineItem
            year="1946"
            title="Thành lập"
            description="Hòa thượng Lâm Em sáng lập chi nhánh"
          />
          <TimelineItem
            year="1975"
            title="Tái thiết"
            description="Tu sửa và mở rộng chánh điện"
          />
          <TimelineItem
            year="2020"
            title="Hiện đại hóa"
            description="Số hóa và phát triển hoạt động trực tuyến"
          />
        </div>
      </section>
    </div>
  );
}

function TimelineItem({ year, title, description }: { 
  year: string; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="w-16 h-16 rounded-full bg-gold-primary flex items-center justify-center">
          <span className="text-white font-bold">{year}</span>
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
```

### 2. Contact Page

`src/app/[locale]/lien-he/page.tsx`:

```tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { KhmerHeading } from '@/components/ui/khmer-heading';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const contactSchema = z.object({
  name: z.string().min(2, 'Vui lòng nhập tên'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Vui lòng nhập tiêu đề'),
  message: z.string().min(10, 'Nội dung quá ngắn'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('contact_messages')
        .insert(data);

      if (error) throw error;

      setSubmitted(true);
      reset();
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <KhmerHeading level={1} withDivider className="text-center">
        Liên hệ
      </KhmerHeading>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Contact Info */}
        <div>
          <Card className="p-6 h-full">
            <h2 className="text-2xl font-semibold mb-6">Thông tin liên hệ</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gold-primary mt-1" />
                <div>
                  <p className="font-semibold">Địa chỉ</p>
                  <p className="text-gray-600">
                    Quận 3, TP. Hồ Chí Minh
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gold-primary mt-1" />
                <div>
                  <p className="font-semibold">Điện thoại</p>
                  <p className="text-gray-600">028 xxxx xxxx</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gold-primary mt-1" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-gray-600">info@chantarangsay.org</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gold-primary mt-1" />
                <div>
                  <p className="font-semibold">Giờ mở cửa</p>
                  <p className="text-gray-600">
                    Hằng ngày: 5:00 - 18:00
                  </p>
                </div>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="mt-6 h-64 bg-gray-200 rounded-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.0!2d106.6!3d10.8!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ4JzAwLjAiTiAxMDbCsDM2JzAwLjAiRQ!5e0!3m2!1svi!2s!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                className="rounded-lg"
              />
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <div>
          <Card className="p-6 h-full">
            <h2 className="text-2xl font-semibold mb-6">Gửi tin nhắn</h2>
            
            {submitted && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
                Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Họ tên *</Label>
                <Input id="name" {...register('name')} />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register('email')} />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Điện thoại</Label>
                  <Input id="phone" {...register('phone')} />
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Tiêu đề *</Label>
                <Input id="subject" {...register('subject')} />
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="message">Nội dung *</Label>
                <Textarea id="message" {...register('message')} rows={5} />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gold-primary hover:bg-gold-dark"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

### 3. Architecture Page

`src/app/[locale]/kien-truc/page.tsx`:

```tsx
import React from 'react';
import Image from 'next/image';
import { KhmerHeading } from '@/components/ui/khmer-heading';
import { Card } from '@/components/ui/card';

const architectureFeatures = [
  {
    title: 'Chánh điện hai tầng',
    description: 'Kiến trúc độc đáo với hai tầng, tầng trên thờ Phật, tầng dưới là không gian lễ bái',
    image: '/images/chanh-dien.jpg',
  },
  {
    title: 'Rắn thần Naga',
    description: 'Biểu tượng của sự che chở, mưa thuận gió hòa, thịnh vượng trong văn hóa Khmer',
    image: '/images/naga.jpg',
  },
  {
    title: 'Chim thần Garuda',
    description: 'Tượng trưng cho sức mạnh, phương tiện của thần Vishnu trong thần thoại Hindu-Khmer',
    image: '/images/garuda.jpg',
  },
  {
    title: 'Hoa văn Pnhi-Phlerng',
    description: 'Họa tiết ngọn lửa đặc trưng trang trí mái chi nhánh và cột trụ',
    image: '/images/hoa-van.jpg',
  },
];

export default function ArchitecturePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <KhmerHeading level={1} withDivider className="text-center">
        Kiến trúc & Nghệ thuật Khmer
      </KhmerHeading>

      <p className="text-lg text-center text-gray-600 max-w-3xl mx-auto mb-12">
        Chi nhánh Chantarangsay là một kiệt tác kiến trúc Khmer Nam tông, lưu giữ 
        những nét đẹp tinh tế của nghệ thuật tạo hình dân tộc.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {architectureFeatures.map((feature, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="relative h-64">
              <Image
                src={feature.image}
                alt={feature.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-playfair font-bold text-gold-primary mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## ✅ ACCEPTANCE CRITERIA

- [ ] About page với timeline
- [ ] Contact page với form & map
- [ ] Architecture page với grid layout
- [ ] Forms validate & submit to Supabase
- [ ] Responsive design
- [ ] Images display correctly

---

--- START PROMPT ---

Tạo các trang tĩnh cho website Chi nhánh Chantarangsay:

1. About Page: Fetch content từ Supabase `pages` table, hiển thị lịch sử với timeline
2. Contact Page: Form liên hệ với validation, lưu vào Supabase, info cards, Google Maps embed
3. Architecture Page: Grid các đặc điểm kiến trúc Khmer với images

Form validation với Zod, submit to Supabase
Responsive design, màu vàng gold-primary

Test form submission và page layouts!
