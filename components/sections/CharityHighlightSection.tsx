'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';

export interface NewsItem {
    id: string;
    title_vi: string;
    title_km?: string | null;
    title_en?: string | null;
    excerpt_vi?: string | null;
    excerpt_km?: string | null;
    excerpt_en?: string | null;
    image_url?: string | null;
    thumbnail_url?: string | null;
    link_url?: string | null;
    slug?: string | null;
    published_at?: string | null;
    event_date?: string | null;
}

interface CharityHighlightSectionProps {
    posts: NewsItem[];
}

export function CharityHighlightSection({ posts }: CharityHighlightSectionProps) {
    const locale = useLocale();

    // Setup Embla Carousel with autoplay
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, align: 'start' },
        [Autoplay({ delay: 4000, stopOnInteraction: false })]
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

    const getLocalizedContent = (post: NewsItem) => {
        const title = locale === 'km' && post.title_km
            ? post.title_km
            : locale === 'en' && post.title_en
                ? post.title_en
                : post.title_vi;

        const excerpt = locale === 'km' && post.excerpt_km
            ? post.excerpt_km
            : locale === 'en' && post.excerpt_en
                ? post.excerpt_en
                : (post.excerpt_vi || '');

        return { title, excerpt };
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    if (!posts || posts.length === 0) {
        return null;
    }

    return (
        <section className="py-16 bg-gradient-to-b from-white to-ivory relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 bg-[url('/patterns/khmer-pattern-light.png')] opacity-3 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-playfair font-bold text-coffee-dark mb-2 flex items-center gap-3">
                            <span className="w-1.5 h-8 bg-gold-primary rounded-full inline-block"></span>
                            {locale === 'vi' ? 'Tin Tức & Sự Kiện' : locale === 'km' ? 'ព័ត៌មាន & ព្រឹត្តិការណ៍' : 'News & Events'}
                        </h2>
                        <p className="text-gray-600 italic flex items-center gap-2">
                            <Heart className="w-4 h-4 text-[#8B2635]" />
                            {locale === 'vi'
                                ? 'Cập nhật hoạt động Phật sự và thiện nguyện mới nhất'
                                : locale === 'km'
                                    ? 'ធ្វើបច្ចុប្បន្នភាពសកម្មភាពពុទ្ធសាសនា និងសប្បុរសធម៌ចុងក្រោយ'
                                    : 'Updates on Buddhist and charity activities'}
                        </p>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={scrollPrev}
                             className="p-3 rounded-full bg-white border border-stone-200 shadow-sm hover:bg-gold-primary hover:text-white hover:border-gold-primary transition-all duration-300 group"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft className="w-5 h-5 text-stone-600 group-hover:text-white" />
                        </button>
                        <button
                            onClick={scrollNext}
                            className="p-3 rounded-full bg-white border border-stone-200 shadow-sm hover:bg-gold-primary hover:text-white hover:border-gold-primary transition-all duration-300 group"
                            aria-label="Next slide"
                        >
                            <ChevronRight className="w-5 h-5 text-stone-600 group-hover:text-white" />
                        </button>
                    </div>
                </div>

                {/* Carousel */}
                <div className="overflow-hidden p-1 -m-1" ref={emblaRef}>
                    <div className="flex gap-6 md:gap-8">
                        {posts.map((post, index) => {
                            const content = getLocalizedContent(post);
                            // Prioritize thumbnail_url (news), then image_url (charity), then placeholder
                            const imageUrl = post.thumbnail_url || post.image_url || '/placeholder.jpg';
                            // Prioritize slug (news), then link_url (charity), then fallback
                            const link = post.slug ? `/tin-tuc/${post.slug}` : (post.link_url || '#');
                            // Prioritize published_at (news), then event_date (charity)
                            const date = post.published_at || post.event_date;

                            return (
                                <div key={post.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-1">
                                    <Link
                                        href={link}
                                        className="block group h-full bg-white rounded-2xl overflow-hidden shadow-lg border border-stone-100 hover:border-gold-primary hover:shadow-xl transition-all duration-300 flex flex-col"
                                    >
                                        {/* Image */}
                                        <div className="relative h-60 overflow-hidden">
                                            <Image
                                                src={imageUrl}
                                                alt={content.title || ''}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            />
                                            {/* Overlay Gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                            {/* Date Badge */}
                                            {date && (
                                                <div className="absolute bottom-4 left-4 bg-brown text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                    {formatDate(date)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 flex-1 flex flex-col relative">
                                            {/* Decorative Corner */}
                                            <div className="absolute top-0 right-0 w-8 h-8 opacity-10">
                                                <svg viewBox="0 0 100 100" fill="#E5BA73">
                                                    <path d="M0 0 L100 0 L100 100 L0 100 Z" fill="none" />
                                                    <path d="M50 0 C80 0 100 20 100 50 C100 80 80 100 50 100 C20 100 0 80 0 50 C0 20 20 0 50 0" />
                                                </svg>
                                            </div>

                                            <h3 className="text-xl font-playfair font-bold text-coffee-dark mb-3 line-clamp-2 group-hover:text-gold-primary transition-colors">
                                                {content.title}
                                            </h3>
                                            <p className="text-stone-600 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                                                {content.excerpt}
                                            </p>

                                            <div className="mt-auto flex items-center text-gold-primary font-bold text-xs uppercase tracking-wider group-hover:translate-x-2 transition-transform duration-300">
                                                <span>{locale === 'vi' ? 'Xem chi tiết' : locale === 'km' ? 'មើលលម្អិត' : 'Read more'}</span>
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
