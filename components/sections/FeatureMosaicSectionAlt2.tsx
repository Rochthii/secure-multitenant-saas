'use client';
import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { LotusIcon } from '@/components/ui/khmer-icons';
import type { AboutSectionRow } from '@/lib/cache/queries';
import { autoMapAboutSections } from '@/lib/utils/autoMapAboutSections';

interface FeatureMosaicSectionAlt2Props {
    abbotSection?: AboutSectionRow | null;
    introSection?: AboutSectionRow | null;
    architectureSection?: AboutSectionRow | null;
    aboutSections?: AboutSectionRow[];
    settings?: Record<string, any>;
}

export function FeatureMosaicSectionAlt2(props: FeatureMosaicSectionAlt2Props) {
    const t = useTranslations('home.features');
    const { introSection, abbotSection, architectureSection } = autoMapAboutSections(
        props.aboutSections, props, props.settings
    );

    const abbotName = abbotSection?.title_vi || 'Đại Đức Trụ Trì';
    const abbotThumbnail = abbotSection?.image_url || '/images/abbot.webp';

    return (
        <section className="py-12 md:py-20 bg-white">
            <div className="container mx-auto px-4 max-w-6xl">
                
                {/* HEAD TITLE */}
                <div className="text-center mb-10 md:mb-16">
                    <div className="flex items-center justify-center gap-3 text-gold-dark mb-4">
                        <div className="w-12 h-px bg-gold-primary" />
                        <LotusIcon className="w-6 h-6" color="currentColor" />
                        <div className="w-12 h-px bg-gold-primary" />
                    </div>
                    <h2 className="text-3xl lg:text-5xl font-playfair font-bold text-brown uppercase tracking-wide">
                        Di Sản Tam Bảo
                    </h2>
                    <p className="text-gray-500 mt-3 text-sm tracking-widest uppercase">Lịch Sử · Phật Pháp · Kiến Trúc</p>
                </div>

                <div className="flex flex-col gap-6 md:gap-8">
                    {/* PANORAMA TOP - ARCHITECTURE */}
                    <Link 
                        href={`/gioi-thieu/${architectureSection?.key || 'di-san-nghe-thuat/kien-truc-dieu-khac'}`}
                        className="group relative w-full h-[300px] md:h-[450px] rounded-2xl overflow-hidden shadow-xl"
                    >
                        <Image
                            src={architectureSection?.image_url || "/images/hero-chua.jpg"}
                            alt={architectureSection?.title_vi || "Kiến trúc"}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                            sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 max-w-2xl border-l-4 border-gold-primary pl-6">
                            <h3 className="text-white text-2xl md:text-4xl font-playfair font-bold uppercase mb-3">
                                {architectureSection?.title_vi || t('architecture.title')}
                            </h3>
                            <p className="text-gray-200 text-sm md:text-base line-clamp-2 md:line-clamp-3">
                                {architectureSection?.summary_vi || (architectureSection?.content_vi ? architectureSection.content_vi.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : t('architecture.desc'))}
                            </p>
                            <span className="inline-block mt-4 text-gold-light text-sm font-semibold tracking-wider uppercase group-hover:underline">Tìm hiểu thêm →</span>
                        </div>
                    </Link>

                    {/* TWO CARDS BOTTOM */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {/* ABBOT CARD */}
                        <div className="bg-brown rounded-2xl overflow-hidden shadow-lg flex flex-col md:flex-row items-center border border-brown/20 group">
                            <div className="w-full md:w-2/5 h-64 md:h-full relative overflow-hidden">
                                <Image
                                    src={abbotThumbnail}
                                    alt={abbotName}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, 40vw"
                                />
                            </div>
                            <div className="w-full md:w-3/5 p-6 lg:p-10 flex flex-col justify-center">
                                <h3 className="text-gold-light font-playfair font-bold text-lg lg:text-xl uppercase mb-2">
                                    {t('abbot.title')}
                                </h3>
                                <div className="w-10 h-0.5 bg-gold-primary/50 mb-4" />
                                <h4 className="text-white text-xl font-medium mb-6">{abbotName}</h4>
                                <Link
                                    href={`/gioi-thieu/${abbotSection?.key || 'truyen-thua-tiep-noi/tru-tri-duong-nhiem'}`}
                                    className="inline-flex max-w-max items-center justify-center border border-white/40 text-white px-5 py-2.5 text-sm uppercase tracking-widest hover:bg-white hover:text-brown transition-colors"
                                >
                                    {t('abbot.action')}
                                </Link>
                            </div>
                        </div>

                        {/* HISTORY CARD */}
                        <Link 
                            href={`/gioi-thieu/${introSection?.key || 'dong-chay-lich-su'}`}
                            className="bg-ivory rounded-2xl p-6 lg:p-10 shadow-lg border border-stone-200 group relative overflow-hidden flex flex-col justify-center"
                        >
                            {/* Decorative Watermark */}
                            <div className="absolute -right-6 -bottom-6 text-stone-200/50 w-48 h-48 transform -rotate-12 transition-transform group-hover:rotate-0 group-hover:scale-110 duration-700">
                                <LotusIcon className="w-full h-full" color="currentColor" />
                            </div>
                            
                            <div className="relative z-10">
                                <div className="text-gold-dark mb-4">
                                    <LotusIcon className="w-8 h-8" color="currentColor" />
                                </div>
                                <h3 className="text-brown text-2xl font-playfair font-bold uppercase mb-4 group-hover:text-gold-dark transition-colors">
                                    {introSection?.title_vi || t('history.title')}
                                </h3>
                                <p className="text-gray-600 line-clamp-4 text-sm md:text-base mb-6 leading-relaxed">
                                    {introSection?.summary_vi || (introSection?.content_vi ? introSection.content_vi.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : t('history.desc'))}
                                </p>
                                <span className="inline-block text-brown font-semibold text-sm tracking-wider uppercase border-b-2 border-transparent group-hover:border-brown pb-1 transition-all">
                                    Đọc chi tiết →
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
