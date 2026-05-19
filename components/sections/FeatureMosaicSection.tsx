'use client';
import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { LotusIcon } from '@/components/ui/khmer-icons';
import type { AboutSectionRow } from '@/lib/cache/queries';

interface FeatureMosaicSectionProps {
    abbotSection?: AboutSectionRow | null;
    introSection?: AboutSectionRow | null;
    architectureSection?: AboutSectionRow | null;
}

export function FeatureMosaicSection({ abbotSection, introSection, architectureSection }: FeatureMosaicSectionProps) {
    const t = useTranslations('home.features');

    const abbotName = abbotSection?.title_vi || 'Hòa thượng ....';
    const abbotThumbnail = abbotSection?.image_url || '/images/abbot.webp';

    return (
        <section className="py-8 md:py-16 bg-ivory">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 h-auto lg:h-[600px]">

                    {/* LEFT LARGE BLOCK - HISTORY */}
                    <Link
                        href={`/gioi-thieu/${introSection?.key || 'dong-chay-lich-su'}`}
                        className="lg:col-span-7 relative group overflow-hidden rounded-lg shadow-lg min-h-[220px] sm:min-h-[280px] lg:min-h-full"
                    >
                        <Image
                            src={introSection?.image_url || "/images/hero-tenant-main.jpg"}
                            alt={introSection?.title_vi || "Lịch sử ngôi chi nhánh"}
                            fill
                            className="object-cover lg:transition-transform lg:duration-700 lg:group-hover:scale-110"
                            // Correct sizes: mobile=100vw, tablet≈100vw, desktop≈58vw
                            sizes="(max-width: 1024px) 100vw, 58vw"
                            // Below-fold on mobile — lazy load to save bandwidth
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-5 left-5 right-5 sm:bottom-8 sm:left-8 sm:right-8 border-l-4 border-gold-primary pl-4 sm:pl-6">
                            <h3 className="text-white text-xl sm:text-3xl font-playfair font-bold mb-1 sm:mb-2 uppercase tracking-wide">
                                {introSection?.title_vi || t('history.title')}
                            </h3>
                            {/* Always visible on mobile (touch can't hover) — hidden on desktop until hover */}
                            <p className="text-gray-200 text-sm sm:text-base lg:opacity-0 lg:group-hover:opacity-100 lg:transition-opacity lg:duration-300 lg:transform lg:translate-y-4 lg:group-hover:translate-y-0 line-clamp-2">
                                {introSection?.summary_vi || (introSection?.content_vi ? introSection.content_vi.replace(/<[^>]*>/g, '').substring(0, 120) + '...' : t('history.desc'))}
                            </p>
                        </div>
                    </Link>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6 h-full">

                        {/* TOP RIGHT - ABBOT */}
                        <div className="flex-1 relative bg-brown rounded-lg shadow-lg overflow-hidden group min-h-[180px] sm:min-h-[220px]">
                            <Image
                                src={abbotThumbnail}
                                alt={abbotName}
                                fill
                                className="object-cover lg:transition-transform lg:duration-700 lg:group-hover:scale-110"
                                // Mobile: 100vw, desktop: 42vw
                                sizes="(max-width: 1024px) 100vw, 42vw"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                                <h3 className="text-gold-light text-base sm:text-xl font-playfair font-bold uppercase mb-1">
                                    {t('abbot.title')}
                                </h3>
                                <p className="text-white/90 font-medium text-sm mb-3">
                                    {abbotName}
                                </p>
                                <Link
                                    href={`/gioi-thieu/${abbotSection?.key || 'truyen-thua-tiep-noi/tru-tri-duong-nhiem'}`}
                                    className="inline-block text-[10px] text-white border border-white/30 px-3 py-2 hover:bg-white hover:text-brown transition-colors uppercase tracking-wider backdrop-blur-sm min-h-[36px] flex items-center"
                                >
                                    {t('abbot.action')}
                                </Link>
                            </div>
                        </div>

                        {/* BOTTOM RIGHT - ARCHITECTURE/GALLERY */}
                        <Link
                            href={`/gioi-thieu/${architectureSection?.key || 'di-san-nghe-thuat/kien-truc-dieu-khac'}`}
                            className="flex-1 relative group overflow-hidden rounded-lg shadow-lg min-h-[180px] sm:min-h-[220px]"
                        >
                            <Image
                                src={architectureSection?.image_url || "/images/hero-chua.jpg"}
                                alt={architectureSection?.title_vi || "Kiến trúc ngôi chi nhánh"}
                                fill
                                className="object-cover lg:transition-transform lg:duration-700 lg:group-hover:scale-110"
                                sizes="(max-width: 1024px) 100vw, 42vw"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/40 lg:group-hover:bg-black/50 transition-colors" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/90 backdrop-blur-sm px-5 py-4 sm:px-8 sm:py-6 text-center lg:transform lg:group-hover:-translate-y-2 lg:transition-transform lg:duration-300 shadow-xl rounded-sm">
                                    <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gold-dark">
                                        <LotusIcon className="w-full h-full" color="currentColor" />
                                    </div>
                                    <h3 className="text-[#8B2635] text-base sm:text-xl font-bold uppercase tracking-wider border-b-2 border-gold-primary pb-2 mb-2">
                                        {architectureSection?.title_vi || t('architecture.title')}
                                    </h3>
                                    <p className="text-gray-600 text-sm line-clamp-2">
                                        {architectureSection?.summary_vi || (architectureSection?.content_vi ? architectureSection.content_vi.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : t('architecture.desc'))}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
