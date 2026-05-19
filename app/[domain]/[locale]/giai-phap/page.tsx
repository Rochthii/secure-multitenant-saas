import React from 'react';
import { Metadata } from 'next';
import { BRAND_NAME_VI } from '@/lib/constants';
import { Link } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { getTenantConfig } from '@/lib/tenant';
import { getTenantBaseUrl } from '@/lib/utils/seo';

export async function generateMetadata({ params }: { params: Promise<{ domain: string; locale: string }> }): Promise<Metadata> {
    const { domain, locale } = await params;
    const tenant = await getTenantConfig(domain);
    const tenantBaseUrl = getTenantBaseUrl(domain);
    const siteName = tenant?.name || BRAND_NAME_VI;

    return {
        title: `Giải pháp Chuyển đổi số & Truyền thông Cộng đồng | ${siteName}`,
        description: `Hệ sinh thái giải pháp từ ${siteName}: Chuyển đổi số tổ chức, Truyền thông cộng đồng, Bảo tồn văn hóa và Quản lý sự kiện xã hội.`,
        alternates: {
            canonical: `${tenantBaseUrl}/${locale}/giai-phap`,
            languages: {
                'vi-VN': `${tenantBaseUrl}/vi/giai-phap`,
                'km-KH': `${tenantBaseUrl}/km/giai-phap`,
                'en-US': `${tenantBaseUrl}/en/giai-phap`,
            },
        },
        openGraph: {
            title: `Giải pháp công nghệ | ${siteName}`,
            description: `Công nghệ phục vụ con người — Chuyển đổi số, truyền thông, văn hóa và sự kiện xã hội.`,
            url: `${tenantBaseUrl}/${locale}/giai-phap`,
        },
    };
}

const SOLUTIONS = [
    {
        slug: 'chuyen-doi-so',
        num: '01',
        label: 'Digital Transformation',
        title: 'Chuyển đổi số\nTổ chức',
        desc: 'Xây dựng toàn bộ hạ tầng kỹ thuật số cho tổ chức tôn giáo, NGO và cộng đồng — từ website, hệ thống quản trị đến thư viện số hóa.',
        tags: ['Website', 'Admin Panel', 'Thư viện số', 'Multi-tenant'],
        glow: 'rgba(0,210,255,0.12)',
        accent: '#00D2FF',
        border: 'rgba(0,210,255,0.2)',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
            </svg>
        ),
    },
    {
        slug: 'truyen-thong',
        num: '02',
        label: 'Community Communications',
        title: 'Truyền thông\nCộng đồng',
        desc: 'Chiến lược nội dung, quản lý mạng xã hội, thiết kế ấn phẩm và sản xuất video giúp tổ chức của bạn tiếp cận sâu rộng hơn với cộng đồng.',
        tags: ['Content', 'Social Media', 'Thiết kế', 'Video'],
        glow: 'rgba(168,85,247,0.12)',
        accent: '#A855F7',
        border: 'rgba(168,85,247,0.2)',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
            </svg>
        ),
    },
    {
        slug: 'van-hoa',
        num: '03',
        label: 'Culture & Heritage',
        title: 'Văn hóa &\nBảo tồn',
        desc: 'Số hóa và gìn giữ tri thức nội bộ, tài liệu ngôn ngữ và hồ sơ truyền thống của cộng đồng bằng công nghệ lưu trữ hiện đại.',
        tags: ['Số hóa', 'Thư viện Di sản', 'Tour 360°', 'Dịch thuật'],
        glow: 'rgba(245,158,11,0.12)',
        accent: '#F59E0B',
        border: 'rgba(245,158,11,0.2)',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
            </svg>
        ),
    },
    {
        slug: 'su-kien',
        num: '04',
        label: 'Social Events',
        title: 'Sự kiện\nXã hội',
        desc: 'Lên kế hoạch, tổ chức và quản lý sự kiện từ thiện, lễ hội văn hóa và hoạt động cộng đồng từ A đến Z — có số liệu tác động.',
        tags: ['Đăng ký', 'Check-in QR', 'Livestream', 'Báo cáo'],
        glow: 'rgba(16,185,129,0.12)',
        accent: '#10B981',
        border: 'rgba(16,185,129,0.2)',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
        ),
    },
];

export default async function GiaiPhapPage({ params }: { params: Promise<{ locale: string; domain: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    return (
        <div className="min-h-screen relative bg-gradient-to-b from-white to-slate-50">

            {/* ── Global ambient glows ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 left-1/3 w-[600px] h-[400px] rounded-full opacity-30"
                    style={{ background: 'radial-gradient(circle, rgba(0,210,255,0.05) 0%, transparent 70%)' }} />
                <div className="absolute top-1/2 right-10 w-[500px] h-[500px] rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)' }} />
                {/* Subtle grid with better spacing and opacity */}
                <div className="absolute inset-0 opacity-[0.05]"
                    style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
            </div>

            {/* ── Hero ── */}
            <section className="relative z-10 px-4 pt-28 pb-20 md:pt-40 md:pb-32 max-w-7xl mx-auto">
                {/* Eyebrow */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border backdrop-blur-md bg-white shadow-sm"
                        style={{ borderColor: 'rgba(0,210,255,0.15)' }}>
                        <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#00D2FF' }} />
                        <span className="text-[13px] font-bold tracking-[0.25em] uppercase" style={{ color: '#00D2FF' }}>
                            Hệ sinh thái Giải pháp
                        </span>
                    </div>
                </div>

                {/* Headline */}
                <h1 className="text-center text-6xl md:text-8xl font-black leading-[1.1] tracking-tighter mb-10">
                    <span className="text-slate-900">Công nghệ phục vụ</span>
                    <br />
                    <span className="text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #00D2FF 0%, #7B61FF 50%, #FFD700 100%)' }}>
                        con người
                    </span>
                </h1>

                <p className="text-center text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
                    {BRAND_NAME_VI} cung cấp hệ sinh thái giải pháp số hóa toàn diện, 
                    giúp các tổ chức cộng đồng và xã hội phát triển bền vững trong kỷ nguyên số.
                </p>
            </section>

            {/* ── Solutions grid ── */}
            <section className="relative z-10 px-4 pb-32 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {SOLUTIONS.map((sol) => (
                        <Link
                            key={sol.slug}
                            href={`/giai-phap/${sol.slug}`}
                            className="group block relative rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 h-full bg-white border border-slate-200 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]"
                        >
                            {/* Inner glow on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2.5rem]"
                                style={{ background: `radial-gradient(circle at 30% 50%, ${sol.glow} 0%, transparent 60%)` }} />

                            {/* Refined border glow */}
                            <div className="absolute inset-0 border border-transparent group-hover:border-black/5 transition-colors duration-700 rounded-[2.5rem]" />

                            {/* Top border accent on hover */}
                            <div className="absolute top-0 left-12 right-12 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-full"
                                style={{ background: `linear-gradient(90deg, transparent, ${sol.accent}, transparent)` }} />

                            <div className="relative z-10 p-10 md:p-14">
                                {/* Header row */}
                                <div className="flex items-start justify-between mb-10">
                                    {/* Icon badge */}
                                    <div className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3 shadow-sm bg-white"
                                        style={{ border: `1px solid ${sol.border}`, color: sol.accent }}>
                                        {sol.icon}
                                    </div>
                                    {/* Step number */}
                                    <span className="text-7xl font-black leading-none select-none opacity-5 group-hover:opacity-10 transition-opacity"
                                        style={{ color: sol.accent }}>
                                        {sol.num}
                                    </span>
                                </div>

                                {/* Label */}
                                <div className="text-[13px] font-bold tracking-[0.22em] uppercase mb-4" style={{ color: sol.accent }}>
                                    {sol.label}
                                </div>

                                {/* Title */}
                                <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-6 whitespace-pre-line group-hover:text-[#00D2FF] transition-colors">
                                    {sol.title}
                                </h2>

                                {/* Desc */}
                                <p className="text-[16px] text-slate-600 leading-relaxed mb-8 font-medium">{sol.desc}</p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2.5 mb-10">
                                    {sol.tags.map((tag) => (
                                        <span key={tag} className="px-4 py-2 text-[13px] font-bold rounded-full transition-colors group-hover:bg-slate-50 bg-white"
                                            style={{ border: `1px solid ${sol.border}`, color: sol.accent }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* CTA row */}
                                <div className="flex items-center gap-3 text-[15px] font-black transition-all duration-300 text-slate-500 group-hover:text-slate-900">
                                    <span className="transition-colors duration-300">Khám phá chi tiết</span>
                                    <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-[#00D2FF] group-hover:bg-[#00D2FF]/10 transition-all">
                                        <svg className="w-5 h-5 group-hover:translate-x-1 group-hover:text-[#00D2FF] transition-all duration-300"
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── Why us ── */}
            <section className="relative z-10 px-4 pb-32 max-w-7xl mx-auto">
                <div className="relative rounded-[3rem] overflow-hidden p-12 md:p-20 bg-white border border-slate-200 shadow-sm"
                    >
                    {/* Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-64 opacity-50 pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse, rgba(0,210,255,0.1) 0%, transparent 70%)' }} />

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
                        {[
                            { value: '35+', label: 'Tổ chức đối tác', sub: 'mạng lưới hệ sinh thái' },
                            { value: '645tr', label: 'Quỹ vì Cộng đồng', sub: 'được quản lý minh bạch' },
                            { value: '14+', label: 'Dự án đang triển khai', sub: 'tác động thực tế' },
                        ].map((stat) => (
                            <div key={stat.label} className="group">
                                <div className="text-5xl md:text-6xl font-black mb-4 text-transparent bg-clip-text transition-transform duration-500 group-hover:scale-110"
                                    style={{ backgroundImage: 'linear-gradient(135deg, #0f172a 30%, #00D2FF 100%)' }}>
                                    {stat.value}
                                </div>
                                <div className="text-lg font-black text-slate-900 mb-2">{stat.label}</div>
                                <div className="text-[14px] text-slate-500 font-medium">{stat.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Bottom ── */}
            <section className="relative z-10 px-4 pb-40 max-w-4xl mx-auto text-center">
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                    Chưa tìm được giải pháp phù hợp?
                </h2>
                <p className="text-slate-600 mb-12 text-lg md:text-xl leading-relaxed font-medium">
                    Mỗi tổ chức có một sứ mệnh riêng. Hãy để {BRAND_NAME_VI} <br className="hidden md:block" />
                    đồng hành cùng bạn thiết kế lộ trình chuyển đổi số tối ưu nhất.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link href="/lien-he"
                        className="group inline-flex items-center gap-4 px-10 py-5 font-black rounded-full transition-all hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,210,255,0.4)] text-[16px] relative overflow-hidden"
                        style={{ background: '#00D2FF', color: '#030812' }}>
                        <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative z-10">Tư vấn miễn phí</span>
                        <svg className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                    <Link href="/minh-bach"
                        className="inline-flex items-center gap-4 px-10 py-5 font-black rounded-full transition-all hover:bg-slate-50 text-[16px] border border-slate-200 text-slate-700 bg-white shadow-sm">
                        Xem Cổng Minh Bạch
                    </Link>
                </div>
            </section>
        </div>
    );
}
