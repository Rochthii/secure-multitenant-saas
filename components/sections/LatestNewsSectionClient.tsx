'use client';

/**
 * LatestNewsSectionClient
 * - Dùng Intersection Observer: chỉ fetch khi section xuất hiện trong viewport
 * - Cache kết quả trong sessionStorage: lần sau không gọi API lại
 * - Nếu user quay lại trang, data vẫn còn trong sessionStorage → 0 request
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/routing';
import { KhmerHeading } from '@/components/ui/khmer-heading';
import { GoldButton } from '@/components/ui/gold-button';
import { NewsCarousel } from '@/components/news/news-carousel';

const SESSION_KEY = 'cache_news_events_v1';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút

interface CachedData {
    news: any[];
    events: any[];
    fetchedAt: number;
}

function loadFromSession(): CachedData | null {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const parsed: CachedData = JSON.parse(raw);
        // Kiểm tra TTL
        if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) {
            sessionStorage.removeItem(SESSION_KEY);
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

function saveToSession(news: any[], events: any[]) {
    try {
        const data: CachedData = { news, events, fetchedAt: Date.now() };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
    } catch {
        // sessionStorage có thể bị block (private mode, quota exceeded)
    }
}

export function LatestNewsSectionClient({
    locale,
    customTitle,
    customSubtitle,
    limit,
    news: prefetchedNews,
    upcomingEvents: prefetchedEvents,
    isCompany,
}: {
    locale: string;
    customTitle?: string;
    customSubtitle?: string;
    limit?: number;
    news?: any[];
    upcomingEvents?: any[];
    isCompany?: boolean;
}) {
    const sectionRef = useRef<HTMLDivElement>(null);
    // If we already have server-side data, initialize from props directly
    const [data, setData] = useState<{ news: any[]; events: any[] } | null>(() => {
        if (prefetchedNews !== undefined) {
            return { news: prefetchedNews, events: prefetchedEvents ?? [] };
        }
        // Try to load from client-side session cache to save CPU
        const cached = loadFromSession();
        if (cached) return { news: cached.news, events: cached.events };
        return null;
    });

    const [loading, setLoading] = useState(false);
    const fetchedRef = useRef(prefetchedNews !== undefined || loadFromSession() !== null);

    useEffect(() => {
        // Skip API call if server already provided data
        if (prefetchedNews !== undefined) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && !fetchedRef.current) {
                    fetchedRef.current = true;
                    observer.disconnect();

                    setLoading(true);
                    fetch('/api/sections/news-events')
                        .then((res) => res.json())
                        .then((json) => {
                            const news = json.news ?? [];
                            const events = json.events ?? [];
                            setData({ news, events });
                            saveToSession(news, events);
                        })
                        .catch(() => {
                            setData({ news: [], events: [] });
                        })
                        .finally(() => setLoading(false));
                }
            },
            { rootMargin: '200px' }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, [prefetchedNews]);


    // Skeleton khi đang load
    if (loading || (!data && !fetchedRef.current)) {
        return (
            <div ref={sectionRef} className="py-12 sm:py-16 lg:py-24 bg-page-surface">
                <div className="container mx-auto px-4">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 rounded w-64 mx-auto" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.1)' }} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="rounded-xl h-64 shadow-sm" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.05)' }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const news = (data?.news ?? []).slice(0, limit && limit > 0 ? limit : undefined);
    const events = data?.events ?? [];

    if (news.length === 0 && events.length === 0) {
        return <div ref={sectionRef} />;
    }

    return (
        <section ref={sectionRef} className="py-12 sm:py-16 lg:py-24 bg-page-surface relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 bg-[url('/patterns/khmer-pattern-light.png')] opacity-5 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 lg:mb-12 gap-4 sm:gap-8">
                    {/* Header */}
                    <div className="text-center md:text-left md:max-w-xl">
                        <KhmerHeading level={2} className="mb-4">
                            {customTitle ||
                                (isCompany ? 'Bản tin & Sự kiện Nội bộ' : (locale === 'vi' ? 'Tin Tức & Sự Kiện' : locale === 'km' ? 'ព័ត៌មាន & ព្រឹត្តិការណ៍' : 'News & Events'))}
                        </KhmerHeading>
                        <p className="text-secondary opacity-80 mb-10">
                            {customSubtitle ||
                                (isCompany 
                                    ? 'Cập nhật thông tin hoạt động, thông báo quan trọng và sự kiện nội bộ của tổ chức'
                                    : (locale === 'vi'
                                        ? 'Cập nhật tin tức Phật sự và các sự kiện sắp diễn ra tại bổn tự'
                                        : locale === 'km'
                                            ? 'ធ្វើបច្ចុប្បន្នភាពព័ត៌មានពុទ្ធសាសនា និងព្រឹត្តិការណ៍ដែលនឹងធ្វើឡើងនៅវត្ត'
                                            : 'Updates on Buddhist news and upcoming events at the tenant'))}
                        </p>
                    </div>

                    {/* View All Button */}
                    <div className="hidden md:block">
                        <GoldButton asChild variant="outline">
                            <Link href="/tin-tuc">
                                {locale === 'vi' ? 'Xem tất cả' : locale === 'km' ? 'មើលទាំងអស់' : 'View all'}
                            </Link>
                        </GoldButton>
                    </div>
                </div>

                <div className="w-full">
                    {/* Full Width News Carousel */}
                    <div className="w-full">
                        {news.length > 0 ? (
                            <NewsCarousel news={news} locale={locale} />
                        ) : (
                            <p className="text-center py-10 opacity-50 italic" style={{ color: 'rgb(var(--theme-text))' }}>
                                {locale === 'vi' ? 'Chưa có tin tức nào.' : locale === 'km' ? 'មិនទាន់មានព័ត៌មានទេ' : 'No news available'}
                            </p>
                        )}
                    </div>
                </div>

                <div className="md:hidden text-center mt-8">
                    <GoldButton asChild variant="outline" className="w-full">
                        <Link href="/tin-tuc">
                            {locale === 'vi' ? 'Xem tất cả' : locale === 'km' ? 'មើលទាំងអស់' : 'View all'}
                        </Link>
                    </GoldButton>
                </div>
            </div>
        </section>
    );
}
