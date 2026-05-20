import React from 'react';
import { Metadata } from 'next';
import { BRAND_NAME_VI } from '@/lib/constants';
import { Link } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { getTenantConfig } from '@/lib/tenant';
import { getTenantBaseUrl } from '@/lib/utils/seo';
import { createClient } from '@/lib/supabase/server';

export async function generateMetadata({ params }: { params: Promise<{ domain: string; locale: string }> }): Promise<Metadata> {
    const { domain, locale } = await params;
    const tenant = await getTenantConfig(domain);
    const tenantBaseUrl = getTenantBaseUrl(domain);
    const siteName = tenant?.name || BRAND_NAME_VI;

    return {
        title: `Dự án & Tác động | ${siteName}`,
        description: `Các dự án chuyển đổi số, truyền thông cộng đồng và bảo tồn văn hóa đã triển khai bởi ${siteName}.`,
        alternates: {
            canonical: `${tenantBaseUrl}/${locale}/du-an`,
            languages: {
                'vi-VN': `${tenantBaseUrl}/vi/du-an`,
                'km-KH': `${tenantBaseUrl}/km/du-an`,
                'en-US': `${tenantBaseUrl}/en/du-an`,
            },
        },
        openGraph: {
            title: `Dự án & Case Studies | ${siteName}`,
            description: `Portfolio dự án chuyển đổi số và tác động xã hội.`,
            url: `${tenantBaseUrl}/${locale}/du-an`,
        },
    };
}

const CASE_STUDIES = [
    {
        id: 'ktans-platform',
        num: '01',
        status: 'LIVE',
        statusColor: '#10B981',
        label: 'Multi-tenant SaaS Platform',
        title: 'Hệ thống Quản trị Mạng lưới Tổ chức',
        desc: 'Xây dựng nền tảng SaaS đa khách hàng (Multi-tenant) cho phép quản trị tập trung hàng chục chi nhánh và đơn vị thành viên doanh nghiệp. Bao gồm website động, CMS đa ngôn ngữ, hệ thống kiểm toán tài chính minh bạch và dashboard phân tích thời gian thực.',
        impact: [
            { num: '8+', label: 'Đơn vị đang vận hành' },
            { num: '3', label: 'Ngôn ngữ hỗ trợ' },
            { num: '99.9%', label: 'Uptime SLA' },
        ],
        tags: ['Next.js', 'Supabase', 'RLS', 'Multi-tenant', 'i18n'],
        accent: '#00D2FF',
        border: 'rgba(0,210,255,0.15)',
        glow: 'rgba(0,210,255,0.08)',
    },
    {
        id: 'enterprise-rag',
        num: '02',
        status: 'BETA',
        statusColor: '#A855F7',
        label: 'AI & Knowledge Management',
        title: 'Trợ lý AI Tri thức Doanh nghiệp (Enterprise AI RAG)',
        desc: 'Hệ thống trí tuệ nhân tạo RAG (Retrieval-Augmented Generation) chuyên biệt. Hỗ trợ truy vấn và trả lời câu hỏi tự động với nguồn trích dẫn chính xác từ tài liệu chuyên môn và quy trình SOP nội bộ doanh nghiệp, đảm bảo không bịa đặt (zero hallucination).',
        impact: [
            { num: '500+', label: 'Tài liệu quy chuẩn' },
            { num: '< 2s', label: 'Thời gian phản hồi' },
            { num: '95%', label: 'Độ chính xác nguồn' },
        ],
        tags: ['LangChain', 'pgvector', 'Gemini', 'GraphRAG', 'Embedding'],
        accent: '#A855F7',
        border: 'rgba(168,85,247,0.15)',
        glow: 'rgba(168,85,247,0.08)',
    },
    {
        id: 'digital-knowledge',
        num: '03',
        status: 'IN PROGRESS',
        statusColor: '#F59E0B',
        label: 'Knowledge Management Systems',
        title: 'Hệ thống Số hóa Tri thức & E-Learning',
        desc: 'Dự án số hóa toàn diện tri thức doanh nghiệp — bao gồm thư viện tài liệu vận hành SOP, hướng dẫn chuyên môn, video đào tạo nội bộ và biểu mẫu quy chuẩn. Lưu trữ bảo mật cao trên nền tảng đám mây tích hợp phân quyền chặt chẽ.',
        impact: [
            { num: '1,200+', label: 'Tài liệu đã số hóa' },
            { num: '50+', label: 'Khóa đào tạo nội bộ' },
            { num: '∞', label: 'Thời gian lưu trữ' },
        ],
        tags: ['Enterprise Library', 'Cloud Storage', 'CDN', 'OCR Search', 'Metadata'],
        accent: '#F59E0B',
        border: 'rgba(245,158,11,0.15)',
        glow: 'rgba(245,158,11,0.08)',
    },
    {
        id: 'transparency-portal',
        num: '04',
        status: 'LIVE',
        statusColor: '#10B981',
        label: 'Financial Transparency',
        title: 'Cổng Minh Bạch Tài chính',
        desc: 'Hệ thống công khai và giám sát ngân sách thời gian thực của tổ chức, cho phép cộng đồng và đối tác liên kết theo dõi tính minh bạch dòng tiền. Tích hợp dashboard thời gian thực, timeline cột mốc và báo cáo tác động.',
        impact: [
            { num: '100%', label: 'Giao dịch công khai' },
            { num: 'Real-time', label: 'Cập nhật dữ liệu' },
            { num: '0đ', label: 'Chi phí ẩn' },
        ],
        tags: ['Audit Trail', 'Dashboard', 'Real-time', 'Public API'],
        accent: '#10B981',
        border: 'rgba(16,185,129,0.15)',
        glow: 'rgba(16,185,129,0.08)',
    },
];

export default async function DuAnPage({ params }: { params: Promise<{ locale: string; domain: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <div className="min-h-screen relative" style={{ background: '#030812' }}>
            {/* Ambient Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(0,210,255,0.06) 0%, transparent 70%)' }} />
                <div className="absolute bottom-1/3 right-0 w-[600px] h-[400px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 70%)' }} />
                <div className="absolute inset-0 opacity-[0.015]"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
            </div>

            {/* Breadcrumb */}
            <div className="relative z-10 px-4 pt-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-2 text-[13px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
                    <span>/</span>
                    <span style={{ color: '#00D2FF' }}>Dự án</span>
                </div>
            </div>

            {/* Hero */}
            <section className="relative z-10 px-4 pt-14 pb-16 max-w-5xl mx-auto text-center">
                <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-8"
                    style={{ background: 'rgba(0,210,255,0.06)', border: '1px solid rgba(0,210,255,0.15)' }}>
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00D2FF' }} />
                    <span className="text-[12px] font-bold tracking-[0.18em] uppercase" style={{ color: '#00D2FF' }}>Case Studies</span>
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6">
                    Dự án{' '}
                    <span className="text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #00D2FF 0%, #A855F7 50%, #FFD700 100%)' }}>
                        & Tác động
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
                    Mỗi dự án chúng tôi xây dựng đều hướng tới một mục đích duy nhất: tạo ra giá trị thực cho cộng đồng — có đo lường, có minh bạch.
                </p>
            </section>

            {/* Stats Bar */}
            <section className="relative z-10 px-4 pb-16 max-w-5xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { num: '4+', label: 'Dự án triển khai', desc: 'Đang hoạt động' },
                        { num: '8+', label: 'Tổ chức phục vụ', desc: 'Trên toàn quốc' },
                        { num: '645tr', label: 'Quỹ quản lý', desc: 'Minh bạch 100%' },
                        { num: '99.9%', label: 'Uptime', desc: 'Enterprise SLA' },
                    ].map((s) => (
                        <div key={s.label} className="text-center p-5 rounded-2xl"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="text-2xl md:text-3xl font-black text-white mb-1">{s.num}</div>
                            <div className="text-[11px] font-bold text-gray-300 mb-0.5">{s.label}</div>
                            <div className="text-[10px] text-gray-500">{s.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Case Studies */}
            <section className="relative z-10 px-4 pb-24 max-w-7xl mx-auto">
                <div className="space-y-8">
                    {CASE_STUDIES.map((cs) => (
                        <div key={cs.id} className="group relative rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-1"
                            style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${cs.border}` }}>

                            {/* Hover glow */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2.5rem]"
                                style={{ background: `radial-gradient(circle at 20% 50%, ${cs.glow} 0%, transparent 60%)` }} />

                            {/* Top border accent */}
                            <div className="absolute top-0 left-16 right-16 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{ background: `linear-gradient(90deg, transparent, ${cs.accent}, transparent)` }} />

                            <div className="relative z-10 p-8 md:p-12">
                                {/* Header row */}
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                                    <div className="flex-1">
                                        {/* Status + Label */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                                                style={{ background: `${cs.statusColor}15`, border: `1px solid ${cs.statusColor}30` }}>
                                                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cs.statusColor }} />
                                                <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: cs.statusColor }}>
                                                    {cs.status}
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-bold tracking-[0.15em] uppercase" style={{ color: cs.accent }}>
                                                {cs.label}
                                            </span>
                                        </div>

                                        <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mb-4 group-hover:text-[#00D2FF] transition-colors">
                                            {cs.title}
                                        </h2>
                                        <p className="text-[15px] text-gray-400 leading-relaxed max-w-3xl font-medium">
                                            {cs.desc}
                                        </p>
                                    </div>

                                    {/* Number watermark */}
                                    <span className="text-8xl font-black leading-none select-none opacity-5 group-hover:opacity-10 transition-opacity flex-shrink-0 hidden md:block"
                                        style={{ color: cs.accent }}>
                                        {cs.num}
                                    </span>
                                </div>

                                {/* Impact metrics */}
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    {cs.impact.map((m) => (
                                        <div key={m.label} className="p-4 rounded-2xl text-center"
                                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            <div className="text-xl md:text-2xl font-black mb-1" style={{ color: cs.accent }}>{m.num}</div>
                                            <div className="text-[11px] text-gray-500 font-medium">{m.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Tags + CTA */}
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex flex-wrap gap-2">
                                        {cs.tags.map((tag) => (
                                            <span key={tag} className="px-3 py-1.5 text-[11px] font-bold rounded-full"
                                                style={{ background: `${cs.accent}08`, border: `1px solid ${cs.accent}20`, color: cs.accent }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2.5 text-[13px] font-bold text-gray-500 group-hover:text-white transition-colors">
                                        <span>Xem chi tiết</span>
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                                            style={{ border: `1px solid ${cs.border}` }}>
                                            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" style={{ color: cs.accent }}
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Bottom */}
            <section className="relative z-10 px-4 pb-32 max-w-4xl mx-auto text-center">
                <div className="rounded-3xl p-10 md:p-14 relative overflow-hidden"
                    style={{ background: 'rgba(0,210,255,0.04)', border: '1px solid rgba(0,210,255,0.10)' }}>
                    <div className="absolute inset-0"
                        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(0,210,255,0.06) 0%, transparent 70%)' }} />
                    <div className="relative z-10">
                        <div className="text-3xl mb-4">🚀</div>
                        <h2 className="text-2xl md:text-3xl font-black text-white mb-4">Bạn có dự án cần triển khai?</h2>
                        <p className="text-[14px] text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
                            Chúng tôi sẵn sàng đồng hành cùng bạn — từ ý tưởng đến sản phẩm. Miễn phí tư vấn, cam kết minh bạch.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/lien-he"
                                className="inline-flex items-center gap-2 px-8 py-4 font-bold rounded-full text-[14px] transition-all hover:-translate-y-0.5"
                                style={{ background: '#00D2FF', color: '#030812', boxShadow: '0 4px 20px rgba(0,210,255,0.25)' }}>
                                Liên hệ hợp tác
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                            <Link href="/dong-hanh"
                                className="inline-flex items-center gap-2 px-8 py-4 font-bold rounded-full text-[14px] transition-all"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>
                                Đồng hành cùng chúng tôi
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
