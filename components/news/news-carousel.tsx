'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';
import { format } from 'date-fns';
import { getLocalizedContent } from '@/lib/utils/localized-content';

interface NewsItem {
    id: string;
    title_vi: string;
    title_km: string | null;
    title_en: string | null;
    content_vi: string | null;
    content_km: string | null;
    content_en: string | null;
    slug: string;
    thumbnail_url: string | null;
    published_at: string | null;
}

interface NewsCarouselProps {
    news: NewsItem[];
    locale: string;
}

export function NewsCarousel({ news, locale }: NewsCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, align: 'start', skipSnaps: false },
        [Autoplay({ delay: 5000, stopOnInteraction: false })]
    );

    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const onSelect = useCallback((emblaApi: any) => {
        setPrevBtnDisabled(!emblaApi.canScrollPrev());
        setNextBtnDisabled(!emblaApi.canScrollNext());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect(emblaApi);
        emblaApi.on('reInit', onSelect);
        emblaApi.on('select', onSelect);
    }, [emblaApi, onSelect]);

    return (
        <div className="relative group">
            {/* Carousel Container */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-8">
                    {news.map((item) => {
                        const date = item.published_at ? new Date(item.published_at) : new Date();
                        const day = format(date, 'dd');
                        const month = format(date, 'MM/yyyy');

                        const title = getLocalizedContent(item, locale, 'title');
                        const excerpt = getLocalizedContent(item, locale, 'excerpt') ||
                            (item.content_vi ? item.content_vi.replace(/<[^>]*>?/gm, '').substring(0, 100) + "..." : "");

                        return (
                            <div key={item.id} className="flex-[0_0_90%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pr-4 md:pr-0 pl-1">
                                <Link href={`/tin-tuc/${item.slug}`} className="group/card block h-full">
                                    <article className="rounded-xl md:rounded-none overflow-hidden min-h-[110px] md:min-h-0 h-full flex flex-row md:flex-col border shadow-sm md:hover:shadow-xl transition-all duration-300" style={{ backgroundColor: 'rgb(var(--theme-surface))', borderColor: 'rgb(var(--theme-text) / 0.05)' }}>
                                        {/* Image & Badge Container */}
                                        <div className="relative h-auto md:h-56 w-[35%] md:w-full shrink-0 overflow-hidden min-h-[110px]">
                                            {/* Date Badge — dynamic per tenant */}
                                            <div className="absolute top-0 left-0 text-white z-10 px-1.5 md:px-3 py-1 md:py-2 text-center min-w-[40px] md:min-w-[60px] border-b-2 font-playfair" style={{ backgroundColor: 'rgb(var(--theme-primary-dark, var(--theme-primary)))', borderColor: 'rgb(var(--theme-primary) / 0.4)' }}>
                                                <div className="text-sm md:text-2xl font-bold leading-none">{day}</div>
                                                <div className="hidden md:block text-[9px] md:text-xs font-semibold opacity-90">{month}</div>
                                            </div>

                                            {item.thumbnail_url ? (
                                                <Image
                                                    src={item.thumbnail_url}
                                                    alt={title}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'rgb(var(--theme-primary) / 0.05)' }}>
                                                    <Newspaper className="h-6 w-6 md:h-10 md:w-10" style={{ color: 'rgb(var(--theme-primary) / 0.2)' }} />
                                                </div>
                                            )}

                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/10 transition-colors duration-300" />
                                        </div>

                                        {/* Content */}
                                        <div className="p-3 md:p-6 flex-1 flex flex-col relative justify-center md:justify-start" style={{ backgroundColor: 'rgb(var(--theme-surface))' }}>
                                            {/* Decorative top border */}
                                            <div 
                                                className="hidden md:block absolute top-0 left-6 right-6 h-0.5 transition-colors duration-500 bg-gold-primary/10 group-hover/card:bg-gold-primary" 
                                            />

                                            <h3 className="font-playfair font-bold text-[13px] leading-[1.3] sm:text-base md:text-xl md:mb-3 group-hover/card:text-gold-primary transition-colors line-clamp-2" style={{ color: 'rgb(var(--theme-text))' }}>
                                                {title}
                                            </h3>
                                            <p className="hidden md:block text-coffee/70 text-sm leading-relaxed line-clamp-3 mb-4 flex-1 font-light">
                                                {excerpt}
                                            </p>

                                            <div className="hidden md:flex items-center text-gold-primary font-medium text-sm mt-auto group/link">
                                                {locale === 'vi' ? 'XEM CHI TIẾT' : locale === 'km' ? 'មើលលម្អិត' : 'READ MORE'}
                                                <span className="ml-2 transform group-hover/link:translate-x-1 transition-transform">→</span>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Buttons - Hidden on small screens, visible on hover on large */}
            <div className="hidden md:flex justify-end gap-3 mt-8 md:absolute md:-top-24 md:right-0">
                <button
                    onClick={scrollPrev}
                    disabled={prevBtnDisabled}
                    className="p-3 rounded-full border shadow-sm transition-all duration-300 disabled:opacity-30 group/btn"
                    style={{ 
                        backgroundColor: 'rgb(var(--theme-surface))',
                        borderColor: 'rgb(var(--theme-text) / 0.1)'
                    }}
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-5 h-5 group-hover/btn:text-white transition-colors" />
                </button>
                <button
                    onClick={scrollNext}
                    disabled={nextBtnDisabled}
                    className="p-3 rounded-full border shadow-sm transition-all duration-300 disabled:opacity-30 group/btn"
                    style={{ 
                        backgroundColor: 'rgb(var(--theme-surface))',
                        borderColor: 'rgb(var(--theme-text) / 0.1)'
                    }}
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-5 h-5 group-hover/btn:text-white transition-colors" />
                </button>
            </div>
        </div>
    );
}
