import React from 'react';
import type { Metadata } from 'next';
import type { Database } from '@/lib/supabase/database.types';
import { KhmerHeading } from '@/components/ui/khmer-heading';
import { EventCard } from '@/components/events/event-card';
import { Link } from '@/i18n/routing';
import { getLocalizedContent } from '@/lib/utils/localized-content';
import { getCachedEventsPage } from '@/lib/cache/queries';
import { getTenantConfig } from '@/lib/tenant';

type Event = Database['public']['Tables']['events']['Row'];

// Force dynamic vì trang đọc searchParams (page, filter) — dữ liệu sự kiện vẫn được cache qua getCachedEventsPage
export const revalidate = 3600;

const ITEMS_PER_PAGE = 12;

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }): Promise<Metadata> {
    const { domain } = await params;
    const tenant = await getTenantConfig(domain);
    const siteName = tenant?.name || "Multi-tenant Ecosystem";

    return {
        title: `Lịch lễ & Sự kiện | ${siteName}`,
        description: `Lịch các buổi lễ, pháp hội và sự kiện tại ${siteName}.`,
        openGraph: {
            title: `Lịch lễ & Sự kiện | ${siteName}`,
            description: `Lịch các buổi lễ, pháp hội và sự kiện tại ${siteName}.`,
            images: ['/og-image.jpg'],
        },
    };
}

export default async function EventsPage({
    params,
    searchParams,
}: {
    params: Promise<{ domain: string; locale: string }>;
    searchParams: Promise<{ page?: string; filter?: string }>;
}) {
    const { domain, locale } = await params;
    const search = await searchParams;
    const currentPage = Math.max(1, Number(search.page) || 1);
    const dateFilter = search.filter || 'upcoming';

    const tenant = await getTenantConfig(domain);
    const tenantId = tenant?.id;

    // Dùng cached query — không gọi Supabase trực tiếp
    // TTL 15 phút, cache warm → TTFB ~80ms thay vì 3-4s
    const { events, total } = await getCachedEventsPage(dateFilter, currentPage, ITEMS_PER_PAGE, tenantId);

    const totalPages = total ? Math.ceil(total / ITEMS_PER_PAGE) : 0;

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="text-center mb-8">
                <KhmerHeading level={1} withDivider>
                    Lịch lễ & Sự kiện
                </KhmerHeading>
                <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                    Lịch các buổi lễ, pháp hội và sự kiện sắp tới
                </p>
            </div>

            {/* Date Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
                {[
                    { label: 'Sắp diễn ra', value: 'upcoming', href: '/lich-le' },
                    { label: 'Tháng này', value: 'this-month', href: '/lich-le?filter=this-month' },
                    { label: 'Tháng sau', value: 'next-month', href: '/lich-le?filter=next-month' },
                    { label: 'Đã diễn ra', value: 'past', href: '/lich-le?filter=past' },
                ].map(tab => (
                    <Link
                        key={tab.value}
                        href={tab.href as any}
                        className={`px-6 py-2 rounded-full transition-all ${dateFilter === tab.value
                            ? 'bg-gold-primary text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>

            {/* Events Grid */}
            {events.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {events.map((event: Event) => (
                            <EventCard
                                key={event.id}
                                id={event.id}
                                slug={event.slug}
                                title={getLocalizedContent(event, locale, 'title')}
                                description={getLocalizedContent(event, locale, 'description')}
                                excerpt={getLocalizedContent(event, locale, 'excerpt')}
                                start_date={event.start_date}
                                start_time={event.start_time}
                                location={event.location}
                                thumbnail_url={event.thumbnail_url}
                                status={event.status}
                                registration_required={event.registration_required || false}
                                max_participants={event.max_participants}
                                current_participants={event.current_participants || 0}
                                locale={locale}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            {currentPage > 1 && (
                                <Link
                                    href={`/lich-le?${dateFilter !== 'upcoming' ? `filter=${dateFilter}&` : ''}page=${currentPage - 1}` as any}
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    ← Trước
                                </Link>
                            )}
                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                let pageNum: number;
                                if (totalPages <= 7) pageNum = i + 1;
                                else if (currentPage <= 4) pageNum = i + 1;
                                else if (currentPage >= totalPages - 3) pageNum = totalPages - 6 + i;
                                else pageNum = currentPage - 3 + i;
                                return (
                                    <Link
                                        key={pageNum}
                                        href={`/lich-le?${dateFilter !== 'upcoming' ? `filter=${dateFilter}&` : ''}page=${pageNum}` as any}
                                        className={`px-4 py-2 border rounded-md transition-colors ${currentPage === pageNum
                                            ? 'bg-gold-primary text-white border-gold-primary'
                                            : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </Link>
                                );
                            })}
                            {currentPage < totalPages && (
                                <Link
                                    href={`/lich-le?${dateFilter !== 'upcoming' ? `filter=${dateFilter}&` : ''}page=${currentPage + 1}` as any}
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Sau →
                                </Link>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20">
                    <p className="text-gray-500 text-lg">
                        {dateFilter === 'past' ? 'Chưa có sự kiện nào đã diễn ra'
                            : dateFilter === 'this-month' ? 'Chưa có sự kiện nào trong tháng này'
                                : dateFilter === 'next-month' ? 'Chưa có sự kiện nào trong tháng sau'
                                    : 'Chưa có sự kiện sắp diễn ra'}
                    </p>
                </div>
            )}
        </div>
    );
}
