import React from 'react';
import { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { BRAND_NAME_VI } from '@/lib/constants';

export const metadata: Metadata = {
    title: 'Chuyển đổi số Tổ chức',
    description: 'Xây dựng website, hệ thống quản lý và nền tảng số hóa toàn diện cho tổ chức tôn giáo, NGO và cộng đồng.',
};

const FEATURES = [
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
        ),
        title: 'Website Đa ngôn ngữ',
        desc: 'Tiếng Việt, Anh, Khmer và hơn nữa. SEO tối ưu, Core Web Vitals xanh, tốc độ tải nhanh với Next.js App Router.',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
            </svg>
        ),
        title: 'Admin Panel Toàn diện',
        desc: 'Dashboard quản lý nội dung, người dùng, phân tích lượt truy cập và cấu hình giao diện — không cần viết code.',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
        ),
        title: 'Bảo mật & Phân quyền',
        desc: 'Row Level Security (RLS) với Supabase, RBAC đa cấp — Super Admin, Admin, Phụ tá, Cộng tác viên.',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
        ),
        title: 'Multi-tenant Platform',
        desc: 'Một nền tảng, nhiều tổ chức — mỗi đơn vị có domain, giao diện và dữ liệu hoàn toàn độc lập.',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
            </svg>
        ),
        title: 'Page Builder Kéo thả',
        desc: 'Thiết kế giao diện trang chủ bằng cách kéo thả các block — Hero, Impact Dashboard, Timeline, Network.',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
        ),
        title: 'Analytics & Minh Bạch',
        desc: 'Dashboard tác động real-time: quỹ cộng đồng, số tổ chức, dự án đang triển khai — số liệu thực, minh bạch.',
    },
];

const PROCESS = [
    { num: '01', title: 'Khảo sát & Phân tích', desc: 'Tìm hiểu nhu cầu thực tế, mục tiêu và hạ tầng hiện có của tổ chức.' },
    { num: '02', title: 'Thiết kế hệ thống', desc: 'Phác thảo kiến trúc, thiết kế giao diện, chọn công nghệ phù hợp.' },
    { num: '03', title: 'Xây dựng & Triển khai', desc: 'Phát triển, kiểm thử và deploy với CI/CD tự động, zero downtime.' },
    { num: '04', title: 'Đào tạo & Hỗ trợ liên tục', desc: 'Hướng dẫn vận hành, đào tạo team và hỗ trợ kỹ thuật bền vững.' },
];

export default async function ChuyenDoiSoPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    return (
        <div className="min-h-screen relative bg-gradient-to-b from-white to-slate-50">

            {/* Ambient glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 left-1/4 w-[700px] h-[400px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(0,210,255,0.05) 0%, transparent 70%)' }} />
                <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(123,97,255,0.05) 0%, transparent 70%)' }} />
                <div className="absolute inset-0 opacity-[0.05]"
                    style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
            </div>

            {/* Hero */}
            <section className="relative z-10 px-4 pt-16 pb-20 md:pt-24 max-w-6xl mx-auto">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8 bg-white border border-slate-200 shadow-sm"
                    >
                    <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#00D2FF]">Solution 01</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D2FF]" />
                    <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-500">Digital Transformation</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-8">
                    Chuyển đổi số<br />
                    <span className="text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #00D2FF 0%, #7B61FF 100%)' }}>
                        Tổ chức
                    </span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl font-medium leading-relaxed mb-10">
                    Xây dựng toàn bộ hạ tầng kỹ thuật số cho tổ chức tôn giáo, NGO và cộng đồng — từ website, hệ thống quản trị đến thư viện số hóa.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/lien-he"
                        className="inline-flex items-center gap-2 px-8 py-4 font-bold rounded-full transition-all hover:-translate-y-0.5"
                        style={{ background: '#00D2FF', color: '#030812', boxShadow: '0 4px 20px rgba(0,210,255,0.3)' }}>
                        Nhận tư vấn giải pháp
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </section>

            {/* Features */}
            <section className="relative z-10 px-4 pb-24 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {FEATURES.map((f) => (
                        <div key={f.title} className="p-8 rounded-3xl transition-all duration-300 bg-white border border-slate-200 shadow-sm hover:shadow-md"
                            >
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-slate-50 border border-slate-100"
                                style={{ color: '#00D2FF' }}>
                                {f.icon}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">{f.title}</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Process */}
            <section className="relative z-10 px-4 pb-28 max-w-6xl mx-auto">
                <div className="px-10 py-16 rounded-[3rem] bg-white border border-slate-200 shadow-sm">
                    <div className="mb-14 text-center">
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Quy trình triển khai</h2>
                        <p className="text-slate-600 max-w-xl mx-auto">Chúng tôi đồng hành cùng tổ chức từ những bước đầu tiên đến khi vận hành ổn định.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {PROCESS.map((p) => (
                            <div key={p.num} className="relative">
                                <span className="text-5xl font-black opacity-[0.15] mb-4 block" style={{ color: '#00D2FF' }}>{p.num}</span>
                                <h4 className="text-[17px] font-bold text-slate-900 mb-2.5">{p.title}</h4>
                                <p className="text-[13px] text-slate-600 leading-relaxed">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
