import React from 'react';
import { getCachedNews, getCachedDharmaTalks, getCachedUpcomingEvents, getCachedAboutSections, getCachedHeroSlides } from '@/lib/cache/queries';
import { getTenantConfig } from '@/lib/tenant';
import { generateOrganizationSchema } from '@/lib/seo/json-ld';
import { StitchHero } from '@/components/sections/stitch/StitchHero';
import { StitchNodes } from '@/components/sections/stitch/StitchNodes';
import { StitchStats } from '@/components/sections/stitch/StitchStats';
import { StitchEvents } from '@/components/sections/stitch/StitchEvents';
import { StitchFooterStrip } from '@/components/sections/stitch/StitchFooterStrip';
import { StitchIntro } from '@/components/sections/stitch/StitchIntro';
import { getSiteSettings } from '@/lib/site-settings';

export default async function StitchHome({ domain, locale, tenantId: propTenantId }: any) {
  const tenant = propTenantId ? null : await getTenantConfig(domain);
  const tenantId = propTenantId || tenant?.id;
  
  // Parallel Data Fetching
  const [news, dharmaTalksRaw, upcomingEvents, settings, heroSlides, allAboutSections] = await Promise.all([
    getCachedNews(6, tenantId),
    getCachedDharmaTalks(6, tenantId),
    getCachedUpcomingEvents(4, tenantId),
    getSiteSettings(tenantId),
    getCachedHeroSlides(tenantId),
    getCachedAboutSections(tenantId)
  ]);

  // Smart Selection for Intro Section
  const introKey = settings['about_intro_key'] || 'dong-chay-lich-su';
  const introSection = allAboutSections.find(s => s.key === introKey) || 
                   allAboutSections.find(s => s.key === 'home/intro') ||
                   allAboutSections.find(s => !s.key.includes('/') && s.image_url) ||
                   allAboutSections[0];

  // Mapping raw dharma talks to component interface
  const dharmaTalks = dharmaTalksRaw.map((talk: any) => ({
    id: talk.id,
    title: talk.title_vi || talk.title_en || 'Dharma Talk',
    slug: talk.slug,
    category: talk.category_name,
    thumbnail: talk.thumbnail_url
  }));

  // SEO Schema
  const organizationSchema = generateOrganizationSchema({
    name: settings['site_name_vi'] || 'Digital Zenith',
    alternateName: settings['site_name_en'] || 'MCP Stitch Protocol',
    url: `https://${domain}`,
    logo: settings['site_logo'] || `https://${domain}/logo.png`,
    description: settings['site_description_vi'] || 'Connecting mindfulness through digital protocols.',
    address: {
        '@type': 'PostalAddress',
        streetAddress: settings['address'] || '',
        addressLocality: 'TP. Hồ Chí Minh',
        addressRegion: 'TP. Hồ Chí Minh',
        addressCountry: 'VN',
    },
    contactPoint: {
        '@type': 'ContactPoint',
        telephone: settings['contact_phone'] || '',
        contactType: 'Ops',
        email: settings['contact_email'] || '',
    },
  });

  return (
    <main className="bg-[#0A0F14]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: organizationSchema }}
      />

      {/* 1. Hero - Technical Introduction */}
      <StitchHero 
        title={settings['site_name_vi'] || "Hệ Thống Quản Trị SaaS Đa Khách Hàng (Multi-tenant)"}
        description={settings['site_description_vi'] || "Xây dựng hệ thống quản trị trung ương tập trung cho hàng chục chi nhánh và đơn vị thành viên doanh nghiệp. Tích hợp website động, CMS đa ngôn ngữ, hệ thống kiểm toán tài chính minh bạch và dashboard phân tích thời gian thực."}
        backgroundImage={heroSlides?.[0]?.image_url}
      />

      {/* 2. Stats - Transparency & Data */}
      <StitchStats />

      {/* 2.5. Intro - Digital Identity */}
      <StitchIntro introSection={introSection} />

      {/* 3. Dharma Nodes - The Knowledge Network */}
      <StitchNodes 
        dharmaTalks={dharmaTalks} 
        title="Các Phân Hệ & Tư Liệu Số"
      />

      {/* 4. Events - Synchronized Activities */}
      <StitchEvents 
        upcomingEvents={upcomingEvents} 
        title="Lịch Lãm & Sự Kiện Vận Hành"
      />

      {/* 5. Footer Strip - Terminal Contact */}
      <StitchFooterStrip settings={settings} />

    </main>
  );
}
