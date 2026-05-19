'use client';

import React, { useCallback, useEffect } from 'react';
import { useLocale } from 'next-intl';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';
import { Star, MapPin } from 'lucide-react';
import { HandsPrayerIcon, DharmaWheelIcon } from '@/components/ui/khmer-icons';

interface Testimonial {
    id: string;
    quote_vi: string;
    quote_km: string | null;
    quote_en: string | null;
    author_name_vi: string;
    author_name_km: string | null;
    author_name_en: string | null;
    author_role_vi: string | null;
    author_role_km: string | null;
    author_role_en: string | null;
    author_location: string | null;
    rating: number | null;
}

interface TestimonialsSectionProps {
    testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
    const locale = useLocale();

    // Setup Embla Carousel with autoplay
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, align: 'start' },
        [Autoplay({ delay: 6000, stopOnInteraction: true })]
    );

    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

    // Update selected index on scroll
    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    // Initialize scroll snaps
    useEffect(() => {
        if (!emblaApi) return;
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on('select', onSelect);
        onSelect();

        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi, onSelect]);

    const scrollTo = useCallback(
        (index: number) => {
            if (emblaApi) emblaApi.scrollTo(index);
        },
        [emblaApi]
    );

    const getLocalizedContent = (testimonial: Testimonial) => {
        const quote = locale === 'km' && testimonial.quote_km
            ? testimonial.quote_km
            : locale === 'en' && testimonial.quote_en
                ? testimonial.quote_en
                : testimonial.quote_vi;

        const name = locale === 'km' && testimonial.author_name_km
            ? testimonial.author_name_km
            : locale === 'en' && testimonial.author_name_en
                ? testimonial.author_name_en
                : testimonial.author_name_vi;

        const role = locale === 'km' && testimonial.author_role_km
            ? testimonial.author_role_km
            : locale === 'en' && testimonial.author_role_en
                ? testimonial.author_role_en
                : testimonial.author_role_vi;

        return { quote, name, role };
    };

    const renderStars = (rating: number | null) => {
        if (!rating) return null;
        return (
            <div className="flex gap-1 justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={cn(
                            "w-5 h-5",
                            i < rating ? "fill-gold-primary text-gold-primary" : "text-stone-300"
                        )}
                    />
                ))}
            </div>
        );
    };

    if (!testimonials || testimonials.length === 0) {
        return null;
    }

    return (
        <section className="py-16 bg-gradient-to-b from-white to-ivory relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 bg-[url('/patterns/khmer-pattern-light.png')] opacity-3 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-playfair font-bold text-coffee-dark mb-4">
                        {locale === 'vi' ? 'Chia sẻ từ Nhân sự' : locale === 'km' ? 'ការចែករំលែកពីពុទ្ធសាសនិកជន' : 'Devotee Testimonials'}
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-gold-primary to-gold-dark mx-auto" />
                    <p className="text-stone-600 mt-4 max-w-2xl mx-auto">
                        {locale === 'vi'
                            ? 'Những chia sẻ chân thành từ Nhân sự về hành trình tu học tại chi nhánh'
                            : locale === 'km'
                                ? 'ការចែករំលែកពិតប្រាកដពីពុទ្ធសាសនិកជនអំពីដំណើរនៃការសិក្សានៅវត្ត'
                                : 'Sincere sharing from devotees about their spiritual journey at the tenant'}
                    </p>
                </div>

                {/* Testimonials Carousel */}
                <div className="max-w-4xl mx-auto">
                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex">
                            {testimonials.map((testimonial) => {
                                const content = getLocalizedContent(testimonial);

                                return (
                                    <div
                                        key={testimonial.id}
                                        className="flex-[0_0_100%] min-w-0 px-4"
                                    >
                                        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 relative">
                                            {/* Decorative quote marks */}
                                            <div className="absolute top-6 left-6 text-6xl text-gold-primary/20 font-serif leading-none">
                                                "
                                            </div>
                                            <div className="absolute bottom-6 right-6 text-6xl text-gold-primary/20 font-serif leading-none rotate-180">
                                                "
                                            </div>

                                            {/* Rating */}
                                            {renderStars(testimonial.rating)}

                                            {/* Quote */}
                                            <blockquote className="text-lg md:text-xl text-stone-700 leading-relaxed text-center mb-8 relative z-10 italic">
                                                {content.quote}
                                            </blockquote>

                                            {/* Author Info */}
                                            <div className="text-center relative z-10">
                                                {/* Decorative divider */}
                                                <div className="w-16 h-1 bg-gradient-to-r from-transparent via-gold-primary to-transparent mx-auto mb-4" />

                                                <p className="font-playfair font-bold text-coffee-dark text-lg mb-1">
                                                    {content.name}
                                                </p>
                                                {content.role && (
                                                    <p className="text-gold-primary text-sm font-medium mb-1">
                                                        {content.role}
                                                    </p>
                                                )}
                                                {testimonial.author_location && (
                                                    <p className="text-stone-500 text-sm flex items-center justify-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        {testimonial.author_location}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Dots Navigation */}
                    {testimonials.length > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            {scrollSnaps.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => scrollTo(index)}
                                    className={cn(
                                        'w-3 h-3 rounded-full transition-all duration-300',
                                        index === selectedIndex
                                            ? 'bg-gold-primary w-8'
                                            : 'bg-stone-300 hover:bg-gold-primary/50'
                                    )}
                                    aria-label={`Go to testimonial ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Decorative elements */}
                <div className="absolute top-20 left-10 text-6xl text-gold-primary opacity-10">
                    <HandsPrayerIcon className="w-24 h-24" />
                </div>
                <div className="absolute bottom-20 right-10 text-6xl text-gold-primary opacity-10">
                    <DharmaWheelIcon className="w-24 h-24" />
                </div>
            </div>
        </section>
    );
}
