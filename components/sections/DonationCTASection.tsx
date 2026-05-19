'use client';
import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { LotusIcon } from '@/components/ui/khmer-icons';
import { GoldButton } from '@/components/ui/gold-button';

export function TransactionCTASection({ modulesConfig }: { modulesConfig?: Record<string, boolean> }) {
    if (modulesConfig?.transactions === false) return null;
    
    const t = useTranslations('transaction');

    return (
        <section className="py-16 bg-coffee-dark relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-[url('/images/pattern-khmer.png')] bg-repeat" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[url('/images/pattern-khmer.png')] bg-repeat" />
            </div>
            {/* Subtle top accent line */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-gold-primary/60 to-transparent" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Lotus Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="w-16 h-16 text-gold-light animate-pulse-slow">
                            <LotusIcon className="w-full h-full" color="currentColor" />
                        </div>
                    </div>

                    {/* Heading */}
                    <h2 className="text-3xl md:text-5xl font-playfair font-bold text-white mb-4">
                        {t('cta.title')}
                    </h2>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-gold-light mb-6 font-light italic">
                        {t('cta.subtitle')}
                    </p>

                    {/* Description */}
                    <p className="text-base md:text-lg text-stone-200 mb-10 max-w-2xl mx-auto leading-relaxed">
                        {t('cta.description')}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/transactions">
                            <GoldButton
                                size="lg"
                                className="min-w-[220px] bg-gold-light text-coffee-dark hover:bg-white hover:text-coffee-dark font-bold uppercase tracking-wider shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <LotusIcon className="w-5 h-5 mr-2" color="currentColor" />
                                {t('cta.button')}
                            </GoldButton>
                        </Link>

                        <Link href="/transactions#methods">
                            <GoldButton
                                variant="outline"
                                size="lg"
                                className="min-w-[220px] border-2 border-white text-white hover:bg-white hover:text-coffee-dark uppercase tracking-wider"
                            >
                                {t('cta.learnMore')}
                            </GoldButton>
                        </Link>
                    </div>

                    {/* Trust indicator */}
                    <p className="mt-8 text-sm text-stone-300 opacity-80">
                        {t('cta.trustIndicator')}
                    </p>
                </div>
            </div>
        </section>
    );
}

