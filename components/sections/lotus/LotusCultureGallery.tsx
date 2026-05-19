'use client';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Palette, Trees } from 'lucide-react';
import { TenantIcon, ChampaFlowerIcon, LotusIcon, KhmerDrumIcon } from '@/components/ui/khmer-icons';

/**
 * LotusCultureGallery — "Văn Hóa Phật Giáo Khmer"
 * Style: Masonry 2-3 cột ảnh about-sections chi nhánh. Không chữ overlay.
 * Hover: scale 1.04 + ring màu đỏ son. Click → trang giới thiệu.
 * Data: Fetch about_sections thực từ DB (ảnh thumbnail). Fallback: tiles emoji 6 mục.
 */

const FALLBACK_TILES = [
    { label: 'Kiến trúc Khmer', icon: <TenantIcon className="w-8 h-8" />, color: 'rgba(199,59,42,0.08)' },
    { label: 'Hoa Champa', icon: <ChampaFlowerIcon className="w-8 h-8" />, color: 'rgba(255,160,50,0.08)' },
    { label: 'Phật Giáo Nam Tông', icon: <LotusIcon className="w-8 h-8" />, color: 'rgba(199,59,42,0.06)' },
    { label: 'Lễ hội Kathina', icon: <Trees className="w-8 h-8" />, color: 'rgba(255,120,30,0.06)' },
    { label: 'Nhạc Pinpeat', icon: <KhmerDrumIcon className="w-8 h-8" />, color: 'rgba(199,59,42,0.08)' },
    { label: 'Văn hóa Khmer', icon: <Palette className="w-8 h-8" />, color: 'rgba(255,180,50,0.08)' },
];

interface GalleryItem {
    title: string;
    image: string | null;
    slug: string | null;
    icon?: React.ReactNode;
}

export function LotusCultureGallery() {
    const ref = useRef<HTMLElement>(null);
    const [items, setItems] = useState<GalleryItem[] | null>(null);
    const fetched = useRef(false);

    useEffect(() => {
        const cached = sessionStorage.getItem('cache_lotus_gallery_v1');
        if (cached) {
            try {
                const p = JSON.parse(cached);
                if (Date.now() - p.fetchedAt < 600_000) { setItems(p.items); return; }
            } catch { /* ignore */ }
        }

        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !fetched.current) {
                fetched.current = true;
                observer.disconnect();

                fetch('/api/sections/about')
                    .then(r => r.json())
                    .then(data => {
                        const sections = data.sections || [];
                        const withImage = sections
                            .filter((s: any) => s.image_url || s.thumbnail_url)
                            .slice(0, 6)
                            .map((s: any) => ({
                                title: s.title_vi || s.title || 'Giới Thiệu',
                                image: s.image_url || s.thumbnail_url || null,
                                slug: s.slug || null,
                            }));

                        // Nếu không có ảnh nào thì fallback
                        const result: GalleryItem[] = withImage.length >= 3
                            ? withImage
                            : FALLBACK_TILES.map(t => ({ title: t.label, image: null, slug: null, icon: t.icon }));

                        setItems(result);
                        try {
                            sessionStorage.setItem('cache_lotus_gallery_v1', JSON.stringify({ items: result, fetchedAt: Date.now() }));
                        } catch { /* ignore */ }
                    })
                    .catch(() => setItems(
                        FALLBACK_TILES.map(t => ({ title: t.label, image: null, slug: null, icon: t.icon }))
                    ));
            }
        }, { rootMargin: '300px' });

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    // Skeleton
    if (items === null) {
        return (
            <section
                ref={ref}
                className="py-12 px-6 sm:px-10 lg:px-16"
                style={{ backgroundColor: 'rgb(var(--theme-text) / 0.02)' }}
            >
                <div className="max-w-7xl mx-auto animate-pulse">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-7 rounded-full" style={{ backgroundColor: 'rgb(var(--theme-primary) / 0.2)' }} />
                        <div className="h-5 w-48 rounded" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.06)' }} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="aspect-square rounded-xl" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.05)' }} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section
            ref={ref}
            className="py-12 px-6 sm:px-10 lg:px-16"
            style={{ backgroundColor: 'rgb(var(--theme-text) / 0.02)' }}
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-7 rounded-full" style={{ backgroundColor: 'rgb(var(--theme-primary))' }} />
                        <h2
                            className="text-lg font-black uppercase tracking-wide"
                            style={{ color: 'rgb(var(--theme-text))' }}
                        >
                            Văn Hóa Phật Giáo Khmer
                        </h2>
                    </div>
                    <Link
                        href="/gioi-thieu"
                        className="text-[13px] font-bold transition-opacity hover:opacity-70"
                        style={{ color: 'rgb(var(--theme-primary))' }}
                    >
                        Xem tất cả →
                    </Link>
                </div>

                {/* Gallery grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {items.map((item, i) => {
                        const inner = (
                            <div
                                className="group rounded-xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col items-center justify-center relative"
                                style={{
                                    backgroundColor: 'rgb(var(--theme-primary) / 0.06)',
                                    border: '1px solid rgb(var(--theme-primary) / 0.1)',
                                    aspectRatio: '1',
                                }}
                            >
                                {item.image ? (
                                    <>
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                        {/* Overlay on hover - Subtle */}
                                        <div
                                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3"
                                            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)' }}
                                        >
                                            <span className="text-white text-[12px] font-bold line-clamp-2 leading-tight">
                                                {item.title}
                                            </span>
                                        </div>
                                        {/* Minimal Border on hover */}
                                        <div
                                            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                            style={{ border: '2px solid rgb(var(--theme-primary))' }}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <div className="text-gold-primary mb-2">{item.icon || <TenantIcon className="w-8 h-8" />}</div>
                                        <span
                                            className="text-[11px] font-semibold text-center px-2"
                                            style={{ color: 'rgb(var(--theme-text) / 0.7)' }}
                                        >
                                            {item.title}
                                        </span>
                                    </>
                                )}
                            </div>
                        );

                        return item.slug ? (
                            <Link key={i} href={`/gioi-thieu/${item.slug}` as any}>
                                {inner}
                            </Link>
                        ) : (
                            <div key={i}>{inner}</div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
