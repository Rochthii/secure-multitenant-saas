import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import type { Database } from '@/lib/supabase/database.types';
import { KhmerHeading } from '@/components/ui/khmer-heading';
import { GoldButton } from '@/components/ui/gold-button';
import { LotusIcon } from '@/components/ui/khmer-icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronRight, Calendar, Clock } from 'lucide-react';
import { getLocalizedContent } from '@/lib/utils/localized-content';
import { getCachedNews, getCachedUpcomingEvents } from '@/lib/cache/queries';
import { NewsCarousel } from '@/components/news/news-carousel';

type News = Database['public']['Tables']['news']['Row'];

export async function LatestNewsSection() {
    const locale = await getLocale();

    // Dùng cached queries - chạy song song, cache 5 phút
    const [news, events] = await Promise.all([
        getCachedNews(9),
        getCachedUpcomingEvents(4),
    ]);

    if (news.length === 0 && events.length === 0) {
        return null;
    }

    return (
        <section className="py-24 bg-page-surface relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 bg-[url('/patterns/khmer-pattern-light.png')] opacity-5 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
                    {/* Header */}
                    <div className="text-center md:text-left md:max-w-xl">
                        <KhmerHeading level={2} className="mb-4">
                            {locale === 'vi' ? 'Tin Tức & Sự Kiện' : locale === 'km' ? 'ព័ត៌មាន & ព្រឹត្តិការណ៍' : 'News & Events'}
                        </KhmerHeading>
                        <p className="text-coffee/80 italic mt-2">
                            {locale === 'vi'
                                ? 'Cập nhật tin tức Phật sự và các sự kiện sắp diễn ra tại bổn tự'
                                : locale === 'km'
                                    ? 'ធ្វើបច្ចុប្បន្នភាពព័ត៌មានពុទ្ធសាសនា និងព្រឹត្តិការណ៍ដែលនឹងធ្វើឡើងនៅវត្ត'
                                    : 'Updates on Buddhist news and upcoming events at the tenant'}
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: News Carousel (2/3 width) */}
                    <div className="lg:col-span-2">
                        {news.length > 0 ? (
                            <NewsCarousel news={news as any[]} locale={locale} />
                        ) : (
                            <p className="text-center text-coffee/50 py-10">Chưa có tin tức nào.</p>
                        )}
                    </div>

                    {/* Right Column: Upcoming Events List (1/3 width) */}
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-white via-gold-primary/5 to-white rounded-2xl shadow-2xl border-2 border-gold-primary/40 overflow-hidden h-full hover:shadow-3xl transition-all duration-500 group/card">
                            {/* Decorative Header with Lotus Pattern */}
                            <div className="bg-gradient-to-r from-gold-dark via-gold-primary to-gold-dark text-white p-5 relative overflow-hidden">
                                {/* Background lotus decorations */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-0 left-0 w-20 h-20 -translate-x-4 -translate-y-4">
                                        <LotusIcon className="w-full h-full text-white" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-16 h-16 translate-x-4 translate-y-4">
                                        <LotusIcon className="w-full h-full text-white" />
                                    </div>
                                </div>

                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 text-gold-primary animate-pulse">
                                            <LotusIcon className="w-full h-full" />
                                        </div>
                                        <h3 className="font-playfair font-bold text-xl">
                                            {locale === 'vi' ? 'Sự Kiện Sắp Tới' : 'ព្រឹត្តិការណ៍ខាងមុខ'}
                                        </h3>
                                    </div>
                                    <Link
                                        href="/lich-le"
                                        className="text-xs text-gold-primary hover:text-gold-light transition-colors font-bold uppercase tracking-wider flex items-center gap-1 group/link"
                                    >
                                        <Calendar className="w-3.5 h-3.5" />
                                        Lịch
                                        <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                                    </Link>
                                </div>
                            </div>

                            <div className="p-4 md:p-6 flex md:flex-col overflow-x-auto md:overflow-visible gap-4 md:gap-0 md:space-y-5 snap-x snap-mandatory scrollbar-hide md:scrollbar-default">
                                {events.length > 0 ? (
                                    events.map((event, index) => (
                                        <Link
                                            key={event.id}
                                            href={`/lich-le/${event.slug || event.id}`}
                                            className="flex-shrink-0 w-[85%] md:w-auto snap-center block group/item border md:border-b border-gold-primary/20 last:border-0 md:pb-5 last:pb-0 hover:bg-gradient-to-r hover:from-gold-primary/5 hover:to-transparent px-4 py-3 md:px-6 md:-mx-6 md:py-4 transition-all duration-300 rounded-xl bg-white/50 md:bg-transparent"
                                        >
                                            <div className="flex items-start gap-4 md:gap-5">
                                                {/* Enhanced Date Badge - Much Larger! */}
                                                <div className="flex-shrink-0 w-16 h-20 md:w-20 md:h-24 bg-gradient-to-br from-brown to-brown/80 rounded-2xl shadow-lg flex flex-col items-center justify-center group-hover/item:scale-110 group-hover/item:-rotate-2 transition-all duration-300 relative overflow-hidden">
                                                    {/* Shine effect */}
                                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover/item:translate-x-full transition-transform duration-700" />

                                                    <span className="text-[10px] md:text-xs text-white/80 uppercase font-bold tracking-wider relative z-10">
                                                        {format(new Date(event.start_date), 'MMM', { locale: vi })}
                                                    </span>
                                                    <span className="text-2xl md:text-3xl font-black text-white relative z-10 leading-none my-1">
                                                        {format(new Date(event.start_date), 'dd')}
                                                    </span>
                                                    <span className="text-[9px] md:text-[10px] text-white/70 relative z-10 font-medium">
                                                        {format(new Date(event.start_date), 'yyyy')}
                                                    </span>
                                                </div>

                                                <div className="flex-1 min-w-0 py-1">
                                                    <h4 className="font-bold text-coffee-dark text-sm md:text-base mb-1.5 md:mb-2 group-hover/item:text-gold-primary transition-colors line-clamp-2 leading-snug whitespace-normal">
                                                        {getLocalizedContent(event, locale, 'title')}
                                                    </h4>

                                                    <div className="flex flex-col gap-1">
                                                        {event.start_time && (
                                                            <div className="flex items-center gap-1.5 text-xs md:text-sm text-coffee/70">
                                                                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-gold-primary flex-shrink-0" />
                                                                <span className="font-medium">{event.start_time.slice(0, 5)}</span>
                                                            </div>
                                                        )}

                                                        {event.is_major_festival && (
                                                            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-gold-primary to-gold-dark text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wide w-fit shadow-md mt-1">
                                                                ★ Lễ Lớn
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <ChevronRight className="hidden md:block w-5 h-5 text-gold-primary flex-shrink-0 mt-1.5 group-hover/item:translate-x-1 transition-transform" />
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-stone-500 w-full">
                                        <div className="w-16 h-16 mx-auto mb-4 text-gold-primary/30">
                                            <LotusIcon className="w-full h-full" />
                                        </div>
                                        <p className="font-medium text-stone-600">Chưa có sự kiện nào</p>
                                        <p className="text-sm mt-1 text-stone-500">Vui lòng quay lại sau</p>
                                    </div>
                                )}
                            </div>

                            {/* Personalized Footer with Cultural Touch */}
                            <div className="p-5 bg-gradient-to-r from-page-surface via-white to-page-surface border-t-2 border-gold-primary/30">
                                <Link
                                    href="/lien-he"
                                    className="group/footer flex items-center justify-center gap-2 text-brown hover:text-brown/80 font-bold text-sm transition-all duration-300 py-2 px-4 rounded-xl hover:bg-white/80 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-gold-primary/5 via-gold-primary/10 to-gold-primary/5 opacity-0 group-hover/footer:opacity-100 transition-opacity" />

                                    <LotusIcon className="w-4 h-4 text-gold-primary group-hover/footer:rotate-12 transition-transform relative z-10" />
                                    <span className="relative z-10 flex items-center gap-2">
                                        Thăm chi nhánh hay đăng ký lễ sớ?
                                        <span className="text-gold-primary font-black">Mời Quý vị liên hệ</span>
                                    </span>
                                    <ChevronRight className="w-4 h-4 group-hover/footer:translate-x-1 transition-transform relative z-10" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:hidden text-center mt-8">
                    <GoldButton asChild variant="outline" className="w-full">
                        <Link href="/tin-tuc">
                            Xem tất cả tin tức
                        </Link>
                    </GoldButton>
                </div>
            </div>
        </section>
    );
}
