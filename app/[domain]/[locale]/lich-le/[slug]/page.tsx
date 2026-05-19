import React from 'react';
import Image from 'next/image';
import { Link, redirect } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';
import { ShareButtons } from '@/components/news/share-buttons';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock, ChevronRight, UserPlus } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { vi, km as kmLocale } from 'date-fns/locale';
import { getLocalizedContent } from '@/lib/utils/localized-content';
import { EventCard } from '@/components/events/event-card';
import { getSiteSetting } from '@/lib/site-settings';
import { getTenantConfig } from '@/lib/tenant';
import { extractKeywords, generateTags, getTenantBaseUrl } from '@/lib/utils/seo';
import { SITE_URL } from '@/lib/constants';
import { getCachedEventDetail } from '@/lib/cache/queries';
import { cache } from 'react';

const safeFormat = (dateStr: string | null | undefined, formatStr: string, options?: any) => {
    if (!dateStr) return 'N/A';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'N/A';
        return format(d, formatStr, options);
    } catch (e) {
        return 'N/A';
    }
};

type Event = Database['public']['Tables']['events']['Row'];

type Props = {
    params: Promise<{ domain: string; slug: string; locale: string }>;
};

export const revalidate = 3600;

const statusConfig = {
    upcoming: { label: 'Sắp diễn ra', color: 'bg-gold-primary text-white' },
    ongoing: { label: 'Đang diễn ra', color: 'bg-green-500 text-white' },
    completed: { label: 'Đã kết thúc', color: 'bg-gray-500 text-white' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-500 text-white' },
};

// Deduplicated fetcher across generateMetadata and EventDetailSlugPage
const getEventItem = cache(async (slug: string, tenantId?: string) => {
    return await getCachedEventDetail(slug, tenantId);
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { domain, slug, locale } = await params;
    const tenant = await getTenantConfig(domain);
    const tenantId = tenant?.id;

    const bundle = await getEventItem(slug, tenantId);

    if (!bundle) return { title: 'Sự kiện không tìm thấy' };

    const event = bundle.event as Event;

    const title = getLocalizedContent(event, locale, 'title');
    const description = getLocalizedContent(event, locale, 'description');
    const keywords = extractKeywords(title || '', description || '', 12, tenant?.name, tenant?.tenant_type);
    const path = `/lich-le/${slug}`;
    const tenantBaseUrl = getTenantBaseUrl(domain);

    return {
        title: title,
        description: description,
        keywords: keywords,
        alternates: {
            canonical: `${tenantBaseUrl}/${locale}${path}`,
            languages: {
                'vi-VN': `${tenantBaseUrl}/vi${path}`,
                'km-KH': `${tenantBaseUrl}/km${path}`,
                'en-US': `${tenantBaseUrl}/en${path}`,
            },
        },
        openGraph: {
            title: title || undefined,
            description: description || '',
            images: event.thumbnail_url ? [event.thumbnail_url] : [],
            url: `${tenantBaseUrl}/${locale}${path}`,
        }
    };
}

export default async function EventDetailSlugPage({ params }: Props) {
    const { domain, slug, locale } = await params;
    const tenant = await getTenantConfig(domain);
    const tenantId = tenant?.id;

    // Ký tự UUID regex check (VD: c0889c15-46e3-4a16-9afc-0e86aa7fdd74)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    const bundle = await getEventItem(slug, tenantId);

    if (!bundle) notFound();
    
    const event = bundle.event as Event;
    const relatedEvents = bundle.relatedEvents as Event[];
    const registrationCount = bundle.registrationCount;

    // Nếu user truy cập bằng ID, tự động redirect sang slug cho chuẩn SEO
    if (isUUID && event.slug) {
        redirect(`/lich-le/${event.slug}` as any);
    }

    const statusInfo = statusConfig[event.status as keyof typeof statusConfig] || { label: 'Sự kiện', color: 'bg-gold-primary text-white' };
    const eventDate = event.start_date;
    const d = new Date(event.start_date);
    const isEventPast = isNaN(d.getTime()) ? false : isPast(d);
    const isFull = event.max_participants ? registrationCount >= event.max_participants : false;
    const canRegister = event.registration_required && !isEventPast && !isFull && event.status !== 'cancelled';

    const title = getLocalizedContent(event, locale, 'title');
    const description = getLocalizedContent(event, locale, 'description');
    const tenantName = tenant?.name || "Multi-tenant Ecosystem";
    const tenantAddress = tenant?.contact_info?.address || "";

    return (
        <div className="bg-gray-50">
            {/* Hero */}
            <div className="relative h-[400px] md:h-[500px] bg-coffee-dark overflow-hidden">
                {event.thumbnail_url && (
                    <>
                        <Image 
                            src={event.thumbnail_url} 
                            alt="Background" 
                            fill 
                            className="object-cover opacity-30 blur-2xl scale-125 pointer-events-none" 
                            aria-hidden="true"
                            sizes="100vw"
                        />
                        <Image 
                            src={event.thumbnail_url} 
                            alt={title || ''} 
                            fill 
                            className="object-contain drop-shadow-2xl z-10" 
                            priority 
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                        />
                    </>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                <div className="absolute top-6 left-0 right-0 container mx-auto px-4 pt-24">
                    <nav className="flex items-center gap-2 text-sm text-white/90">
                        <Link href="/" className="hover:text-gold-light transition-colors">Trang chủ</Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link href="/lich-le" className="hover:text-gold-light transition-colors">Lịch lễ</Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="line-clamp-1">{title}</span>
                    </nav>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                    <div className="container mx-auto">
                        <Badge className={(statusInfo?.color || 'bg-gold-primary') + ' mb-4'}>{statusInfo?.label || 'Sự kiện'}</Badge>
                        <h1 className="text-3xl md:text-5xl font-playfair font-bold text-white mb-4 max-w-4xl">
                            {title}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Content View */}
            <div className="container mx-auto px-4 py-12 max-w-5xl">
                <div className="space-y-8 mb-16">
                    {/* JSON-LD Event Schema */}
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "Event",
                                "name": title,
                                "description": description,
                                "image": event.thumbnail_url ? [event.thumbnail_url] : [],
                                "startDate": event.start_date + (event.start_time ? `T${event.start_time}` : ''),
                                "endDate": event.end_date ? (event.end_date + (event.end_time ? `T${event.end_time}` : '')) : undefined,
                                "eventStatus": event.status === 'cancelled' ? 'https://schema.org/EventCancelled' : (isEventPast ? 'https://schema.org/EventMovedOnline' : 'https://schema.org/EventScheduled'),
                                "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                                "location": {
                                    "@type": "Place",
                                    "name": tenantName,
                                    "address": {
                                        "@type": "PostalAddress",
                                        "streetAddress": tenantAddress,
                                        "addressCountry": "VN"
                                    }
                                },
                                "organizer": {
                                    "@type": "Organization",
                                    "name": tenantName,
                                    "url": getTenantBaseUrl(domain)
                                }
                            })
                        }}
                    />

                    <div className="grid sm:grid-cols-2 gap-4">
                        <Card><CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-gold-primary/10 rounded-full"><Calendar className="h-6 w-6 text-gold-primary" /></div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Thời gian</p>
                                    <p className="font-semibold text-gray-900 capitalize">
                                        {safeFormat(event.start_date, 'EEEE, dd MMMM yyyy', { locale: locale === 'km' ? kmLocale : vi })}
                                    </p>
                                    {event.start_time && <p className="text-sm text-gray-600 flex items-center gap-1 mt-1"><Clock className="h-3 w-3" />{event.start_time}{event.end_time && ` - ${event.end_time}`}</p>}
                                </div>
                            </div>
                        </CardContent></Card>
                        {event.location && (
                            <Card><CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-gold-primary/10 rounded-full"><MapPin className="h-6 w-6 text-gold-primary" /></div>
                                    <div><p className="text-sm text-gray-500 mb-1">Địa điểm</p><p className="font-semibold text-gray-900">{event.location}</p></div>
                                </div>
                            </CardContent></Card>
                        )}
                    </div>

                    <Card><CardContent className="p-6 md:p-8">
                        <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-4">Thông tin chi tiết</h2>
                        <div className="prose prose-lg max-w-none prose-headings:font-playfair prose-headings:text-gold-primary"
                            dangerouslySetInnerHTML={{ __html: getLocalizedContent(event, locale, 'description') || '<p>Thông tin sẽ cập nhật sau.</p>' }} />
                    </CardContent></Card>

                    {event.registration_required && (
                        <Card className="border-2 border-gold-primary/20"><CardContent className="p-6 text-center">
                            <h3 className="text-xl font-playfair font-bold mb-2">Đăng ký tham gia</h3>
                            <p className="text-gray-600 mb-6">{canRegister ? 'Vui lòng đăng ký tham gia sự kiện' : 'Đăng ký đã đóng'}</p>
                            <Link href={canRegister ? `/dang-ky-su-kien/${event.slug}` : '#'}>
                                <Button size="lg" disabled={!canRegister} className={canRegister ? 'bg-gold-primary hover:bg-gold-dark text-white' : 'bg-gray-400'}>
                                    <UserPlus className="mr-2 h-5 w-5" /> Đăng ký ngay
                                </Button>
                            </Link>
                        </CardContent></Card>
                    )}
                </div>
            </div>
        </div>
    );
}
