import React from 'react';
import Image from 'next/image';
import { getCachedTransactionProjects } from '@/lib/cache/queries';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/constants/transaction';
import { Link } from '@/i18n/routing';

import { getTenantConfig } from '@/lib/tenant';

export async function CallToDonateProjects({ locale, tenantId, domain }: { locale: string; tenantId?: string; domain?: string }) {
    // Check if transaction module is enabled for this tenant
    if (domain || tenantId) {
        const tenant = await getTenantConfig(domain || tenantId!);
        if (tenant?.modules_config && tenant.modules_config.transactions === false) {
            return null;
        }
    }

    // Fetch up to 2 random ongoing projects from cache for specific tenant
    const projects = await getCachedTransactionProjects(2, tenantId);

    if (!projects || projects.length === 0) {
        return null;
    }

    return (
        <div className="bg-page-surface rounded-xl p-6 md:p-8 my-12 relative overflow-hidden border border-gold-primary/5">
            {/* Subtle top border accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-primary/40 to-transparent" />

            <div className="mb-8 text-center">
                <p className="text-gold-primary text-xs font-semibold tracking-[0.25em] uppercase mb-2">
                    Kêu Gọi Đóng Góp
                </p>
                <h3 className="text-2xl md:text-3xl font-playfair font-bold text-coffee-dark mb-4">
                    Phật Sự Đang Kiến Thiết
                </h3>
                <div className="w-12 h-0.5 bg-gold-primary mx-auto mb-5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {projects.map((project) => {
                    const title = locale === 'km' ? project.title_km : project.title_vi;
                    const description = locale === 'km' ? project.description_km : project.description_vi;

                    const progress = Math.min(
                        100,
                        Math.round(((project.current_amount || 0) / (project.target_amount || 1)) * 100)
                    );

                    return (
                        <div key={project.id} className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden flex flex-col hover:border-gold-primary/40 transition-colors duration-300">
                            {project.thumbnail_url && (
                                <div className="h-44 relative w-full overflow-hidden border-b border-stone-100">
                                    <Image
                                        src={project.thumbnail_url}
                                        alt={title || ''}
                                        fill
                                        className="object-cover transition-transform duration-700 hover:scale-105"
                                    />
                                    <div className="absolute top-3 right-3 bg-coffee-dark/90 text-gold-light text-xs font-semibold px-3 py-1.5 uppercase tracking-wider backdrop-blur-sm border border-gold-primary/30">
                                        Đang kêu gọi
                                    </div>
                                </div>
                            )}
                            <div className="p-6 flex-1 flex flex-col">
                                <h4 className="text-lg font-playfair font-bold text-coffee-dark mb-2 line-clamp-2 hover:text-gold-dark transition-colors">{title}</h4>
                                <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-1 leading-relaxed">{description}</p>

                                <div className="mt-auto">
                                    <div className="flex justify-between items-center text-xs text-gray-500 mb-2 font-medium">
                                        <span className="flex items-center gap-1.5 uppercase tracking-wide">
                                            <Wallet className="w-3.5 h-3.5 text-gold-primary" /> Đã nhận
                                        </span>
                                        <strong className="text-coffee-dark text-sm">{formatCurrency(project.current_amount || 0)}</strong>
                                    </div>
                                    <div className="w-full bg-stone-100 h-1.5 mb-5 overflow-hidden">
                                        <div
                                            className="bg-gold-primary h-full transition-all duration-1000"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>

                                    <Link href={`/transactions/hang-muc-du-an/${project.id}`} className="block">
                                        <Button className="w-full bg-coffee-dark hover:bg-gold-primary hover:text-white text-gold-light font-medium tracking-wide transition-all rounded-sm uppercase text-xs h-10">
                                            Xem chi tiết & Thanh toán
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 pt-6 border-t border-stone-200/60 flex justify-center pb-2">
                <Link
                    href="/transactions/hang-muc-du-an"
                    className="group inline-flex items-center gap-2 text-sm font-semibold text-gold-primary hover:text-gold-dark transition-colors whitespace-nowrap"
                >
                    Xem tất cả hạng mục
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 transition-transform group-hover:translate-x-1">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            {/* Subtle bottom border accent */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-primary/40 to-transparent" />
        </div>
    );
}
