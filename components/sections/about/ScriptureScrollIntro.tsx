'use client';
import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import type { AboutSectionRow } from '@/lib/cache/queries';

interface ScriptureScrollIntroProps {
    introSection?: AboutSectionRow | null;
}

export function ScriptureScrollIntro({ introSection }: ScriptureScrollIntroProps) {
    const t = useTranslations('home.intro');

    const title = introSection?.title_vi || "Kinh Lá Buông Khmer";
    const excerpt = introSection?.summary_vi ||
        (introSection?.content_vi ? introSection.content_vi.replace(/<[^>]*>/g, '').substring(0, 250) + '...' : '');

    return (
        <section className="relative py-24 md:py-32 overflow-hidden bg-[#FDFBF7]">
            {/* Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/images/paper-texture.png')] mix-blend-multiply" />
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-stretch gap-0 rounded-[2rem] overflow-hidden shadow-[0_10px_40px_rgba(139,115,85,0.1)] bg-[#FFFDF9] border border-[#E7D9C1]">
                        
                        {/* Image Side - "The Artifact" */}
                        <div className="lg:w-2/5 relative min-h-[400px]">
                            {introSection?.image_url ? (
                                <img 
                                    src={introSection.image_url} 
                                    alt={title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-[#D4C3A3] flex items-center justify-center">
                                    <span className="text-[#8B7355] font-serif italic">Scripture Illustration</span>
                                </div>
                            )}
                            
                            {/* Ornamental Frame for Image */}
                            <div className="absolute inset-4 border border-white/20 pointer-events-none" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent pointer-events-none" />
                        </div>

                        {/* Content Side - "The Scroll" */}
                        <div className="lg:w-3/5 p-12 md:p-16 lg:p-20 flex flex-col justify-center relative bg-[#FAF6F0]">
                            {/* Vertical Line Decoration (Leaf spine) */}
                            <div className="absolute left-0 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-[#8B7355]/20 to-transparent" />
                            
                            <h2 className="text-sm font-serif text-[#8B7355] tracking-[0.3em] uppercase mb-4 text-center lg:text-left">
                                {t('subtitle') || "Di Sản Văn Hóa"}
                            </h2>

                            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-[#4A3B32] mb-8 leading-tight text-center lg:text-left">
                                {title}
                            </h1>

                            <div className="w-20 h-0.5 bg-gold-primary mb-8 mx-auto lg:mx-0" />

                            <div className="relative">
                                <p className="text-lg md:text-xl text-[#6B5A4E] leading-[2] font-light italic mb-10 text-justify relative z-10 first-letter:text-5xl first-letter:font-playfair first-letter:font-bold first-letter:text-gold-primary first-letter:mr-3 first-letter:float-left">
                                    {excerpt}
                                </p>
                            </div>

                            <div className="mt-4 flex justify-center lg:justify-start">
                                <Link href={`/gioi-thieu/${introSection?.key || 'dong-chay-lich-su'}`} className="group inline-flex items-center gap-4">
                                    <span className="text-lg font-serif font-bold text-[#4A3B32] group-hover:text-gold-primary transition-colors border-b border-[#4A3B32]/20 group-hover:border-gold-primary/40 pb-1">
                                        {t('readMore') || "Tìm Hiểu Chi Tiết"}
                                    </span>
                                    <div className="w-10 h-10 rounded-full border border-[#4A3B32]/20 flex items-center justify-center transition-all group-hover:bg-gold-primary group-hover:border-gold-primary group-hover:text-white">
                                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ScriptureScrollIntro;
