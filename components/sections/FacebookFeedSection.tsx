"use client";

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Script from 'next/script';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { Facebook } from 'lucide-react';

export function FacebookFeedSection({ facebookUrl, settings }: { facebookUrl?: string; settings?: Record<string, any> }) {
    const siteName = settings?.['site_name_vi'] || 'Ngôi chi nhánh Phật giáo';
    const resolvedFbUrl = facebookUrl || settings?.['facebook_url'] || 'https://www.facebook.com';
    const t = useTranslations('HomePage');
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(500); // Default width
    const [isLoaded, setIsLoaded] = useState(false);

    // Load much earlier when within 800px of viewport to prevent delay
    const entry = useIntersectionObserver(containerRef, {
        freezeOnceVisible: true,
        rootMargin: '800px',
    });
    const isVisible = !!entry?.isIntersecting;

    useEffect(() => {
        if (isVisible) {
            setIsLoaded(true);
        }
    }, [isVisible]);

    useEffect(() => {
        // Responsive width handler
        const handleResize = () => {
            if (containerRef.current && containerRef.current.parentElement) {
                // Get parent width minus padding, max 500px (FB limit)
                const parentWidth = containerRef.current.parentElement.clientWidth - 32;
                const width = Math.max(280, Math.min(parentWidth, 500));
                setContainerWidth(width);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Re-parse XFBML when width changes or when first loaded
    useEffect(() => {
        const renderFB = () => {
            // @ts-ignore
            if (window.FB) {
                // @ts-ignore
                window.FB.XFBML.parse(containerRef.current);
            }
        };

        if (isLoaded) {
            // Delay slightly to ensure DOM is ready and FB object is populated
            setTimeout(renderFB, 300);
        }
    }, [containerWidth, isLoaded]);

    return (
        <section className="py-16 bg-page-surface relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-primary/40 to-transparent" />

            {isLoaded && (
                <Script
                    id="facebook-jssdk"
                    src="https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v19.0"
                    strategy="lazyOnload"
                    crossOrigin="anonymous"
                />
            )}

            <div className="container mx-auto px-4 max-w-6xl relative z-10">
                <div className="text-center mb-14">
                    <p className="text-gold-primary text-xs font-semibold tracking-[0.25em] uppercase mb-3">
                        Kết Nối Cộng Đồng
                    </p>
                    <h2 className="text-3xl md:text-4xl font-playfair font-bold text-coffee-dark mb-4">
                        Kênh Thông Tin Chính Thức
                    </h2>
                    <div className="w-12 h-0.5 bg-gold-primary mx-auto mb-5" />
                    <p className="text-stone-500 max-w-xl mx-auto text-base leading-relaxed">
                        Theo dõi Fanpage chính thức để cập nhật các hoạt động tu học, hình ảnh và tin bài Phật sự từ {siteName}.
                    </p>
                </div>

                <div
                    className="flex justify-center min-h-[800px]"
                    ref={containerRef}
                    suppressHydrationWarning
                >
                    {!isLoaded ? (
                        /* Placeholder to prevent layout shift */
                        <div className="w-full max-w-[500px] h-[800px] bg-white rounded-2xl shadow-sm border border-stone-200 flex flex-col items-center justify-center gap-4 animate-pulse">
                            <div className="w-20 h-20 bg-blue-50/50 rounded-full flex items-center justify-center text-blue-500/50 border border-blue-100 mb-2">
                                <Facebook size={40} />
                            </div>
                            <p className="text-stone-400 font-bold text-sm uppercase tracking-widest">Đang tải Fanpage...</p>
                        </div>
                    ) : (
                        <div
                            className="fb-page shadow-2xl rounded-2xl overflow-hidden bg-white ring-1 ring-gold-primary/20"
                            data-href={resolvedFbUrl}
                            data-tabs="timeline"
                            data-width={containerWidth}
                            data-height="800"
                            data-small-header="false"
                            data-adapt-container-width="true"
                            data-hide-cover="false"
                            data-show-facepile="true"
                            suppressHydrationWarning>
                            <blockquote
                                cite={resolvedFbUrl}
                                className="fb-xfbml-parse-ignore"
                                suppressHydrationWarning
                            >
                                <a
                                    href={resolvedFbUrl}
                                    suppressHydrationWarning
                                >
                                    {resolvedFbUrl.replace('https://www.facebook.com/', '') || siteName}
                                </a>
                            </blockquote>
                        </div>
                    )}
                </div>
            </div>

            {/* FB Root div is required */}
            <div id="fb-root" suppressHydrationWarning></div>
        </section >
    );
}
