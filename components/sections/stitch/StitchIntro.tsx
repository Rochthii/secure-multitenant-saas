'use client';
import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ArrowRight, Terminal, Binary, Cpu } from 'lucide-react';
import type { AboutSectionRow } from '@/lib/cache/queries';

interface StitchIntroProps {
    introSection?: AboutSectionRow | null;
}

export function StitchIntro({ introSection }: StitchIntroProps) {
    const t = useTranslations('home.intro');

    const title = introSection?.title_vi || "Digital Legacy";
    const excerpt = introSection?.summary_vi ||
        (introSection?.content_vi ? introSection.content_vi.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : "Exploring the intersection of tradition and digital future.");

    return (
        <section className="bg-[#0A0F1A] py-24 relative overflow-hidden border-y border-white/5">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Visual Side */}
                    <div className="lg:w-1/2 relative">
                        <div className="relative z-10 rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                            {introSection?.image_url ? (
                                <img 
                                    src={introSection.image_url} 
                                    alt={title}
                                    className="w-full aspect-[4/3] object-cover"
                                />
                            ) : (
                                <div className="w-full aspect-[4/3] bg-slate-900 flex items-center justify-center">
                                    <Cpu className="w-24 h-24 text-blue-500/20" />
                                </div>
                            )}
                        </div>

                        {/* Minimal Accents */}
                        <div className="absolute -top-4 -right-4 p-4 bg-[#0F172A] border border-white/10 rounded-lg z-20 hidden md:block">
                            <Binary className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="absolute -bottom-4 -left-4 p-4 bg-[#0F172A] border border-white/10 rounded-lg z-20 hidden md:block">
                            <Terminal className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>

                    {/* Content Side */}
                    <div className="lg:w-1/2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-6 uppercase tracking-widest">
                            System.Identity.Introduction
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 leading-tight tracking-tight">
                            {title}
                            <span className="text-blue-500">.</span>
                        </h2>

                        <div className="space-y-6 mb-10">
                            <p className="text-gray-400 text-lg leading-relaxed font-medium">
                                {excerpt}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                                    <div className="text-blue-400 font-mono text-xs font-bold mb-1 uppercase">01. Heritage</div>
                                    <div className="text-white font-bold text-lg">Ancient Wisdom</div>
                                </div>
                                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                                    <div className="text-blue-400 font-mono text-xs font-bold mb-1 uppercase">02. Future</div>
                                    <div className="text-white font-bold text-lg">Digital Pulse</div>
                                </div>
                            </div>
                        </div>

                        <Link href={`/gioi-thieu/${introSection?.key || 'dong-chay-lich-su'}`}>
                            <button className="group px-10 py-5 bg-blue-600 text-white font-black rounded-xl transition-all hover:bg-blue-500 active:scale-95">
                                <div className="flex items-center gap-3">
                                    {t('readMore')}
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </div>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default StitchIntro;
