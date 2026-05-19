import React from 'react';
import { Metadata } from 'next';
import { BRAND_NAME_VI } from '@/lib/constants';
import { Link } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
    title: 'Văn hóa & Bảo tồn',
    description: 'Số hóa và gìn giữ di sản văn hóa, ngôn ngữ và tri thức truyền thống cho cộng đồng.',
};

const SERVICES = [
    { icon: '📜', title: 'Số hóa Tài liệu', desc: 'Chuyển đổi tài liệu, ấn phẩm và hồ sơ truyền thống sang định dạng số bền vững, có thể tìm kiếm và chia sẻ.' },
    { icon: '📚', title: 'Thư viện Di sản Số', desc: 'Xây dựng kho lưu trữ có thể phân loại, tìm kiếm toàn văn và truy cập mọi lúc mọi nơi — cho cả cộng đồng và nghiên cứu viên.' },
    { icon: '🏛️', title: 'Tour Ảo 360°', desc: 'Trải nghiệm thăm quan ảo cho di tích, danh lam thắng cảnh và không gian văn hóa — tiếp cận cộng đồng toàn cầu.' },
    { icon: '🌐', title: 'Dịch thuật Đa ngôn ngữ', desc: 'Phiên dịch và bản địa hóa nội dung sang Tiếng Việt, Khmer, Anh và các ngôn ngữ thiểu số khác.' },
    { icon: '🏗️', title: 'Bảo tồn Kiến trúc', desc: 'Ghi chép kiến trúc di sản bằng 3D scanning, photogrammetry và mô hình hóa kỹ thuật số.' },
    { icon: '🎓', title: 'Giáo dục Văn hóa', desc: 'Phát triển tài liệu giáo dục kết hợp văn hóa truyền thống với phương pháp học hiện đại, tương tác.' },
];

const ACCENT = '#F59E0B';

export default async function VanHoaPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    return (
        <div className="min-h-screen relative bg-gradient-to-b from-white to-slate-50">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 left-1/3 w-[600px] h-[400px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)' }} />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.05) 0%, transparent 70%)' }} />
                <div className="absolute inset-0 opacity-[0.05]"
                    style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
            </div>

            {/* Breadcrumb */}
            <div className="relative z-10 px-4 pt-8 max-w-6xl mx-auto">
                <div className="flex items-center gap-2 text-[13px] text-slate-500">
                    <Link href="/" className="hover:text-slate-900 transition-colors">Trang chủ</Link>
                    <span>/</span>
                    <Link href="/giai-phap" className="hover:text-slate-900 transition-colors">Giải pháp</Link>
                    <span>/</span>
                    <span style={{ color: ACCENT }}>Văn hóa & Bảo tồn</span>
                </div>
            </div>

            {/* Hero */}
            <section className="relative z-10 px-4 pt-14 pb-20 max-w-6xl mx-auto">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-6 bg-white border border-slate-200 shadow-sm"
                    >
                    <span className="text-[11px] font-bold tracking-[0.15em] uppercase" style={{ color: ACCENT }}>Culture & Heritage</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-none mb-6">
                    Văn hóa &<br />
                    <span className="text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)' }}>
                        Bảo tồn
                    </span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl font-medium leading-relaxed mb-10">
                    Di sản văn hóa là hồn cốt của cộng đồng. Chúng tôi giúp gìn giữ và phát huy giá trị đó bằng công nghệ lưu trữ và số hóa hiện đại.
                </p>
                <Link href="/lien-he"
                    className="inline-flex items-center gap-2 px-6 py-3.5 font-bold rounded-full transition-all hover:-translate-y-0.5 text-[15px]"
                    style={{ background: ACCENT, color: '#030812', boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}>
                    Tư vấn miễn phí
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </Link>
            </section>

            {/* Services */}
            <section className="relative z-10 px-4 pb-20 max-w-6xl mx-auto">
                <div className="mb-10">
                    <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: ACCENT }}>Dịch vụ</p>
                    <h2 className="text-3xl font-black text-slate-900">Chúng tôi làm gì?</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SERVICES.map((s) => (
                        <div key={s.title} className="p-7 rounded-2xl transition-all duration-300 hover:-translate-y-1 bg-white border border-slate-200 shadow-sm hover:shadow-md"
                            >
                            <div className="text-3xl mb-5">{s.icon}</div>
                            <h3 className="text-[16px] font-bold text-slate-900 mb-2.5">{s.title}</h3>
                            <p className="text-[13px] text-slate-600 leading-relaxed">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 px-4 pb-28 max-w-6xl mx-auto">
                <div className="relative rounded-3xl overflow-hidden p-10 md:p-14 text-center bg-white border border-slate-200 shadow-sm"
                    >
                    <div className="absolute inset-0 pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.05) 0%, transparent 70%)' }} />
                    <h2 className="text-3xl font-black text-slate-900 mb-3 relative">Bảo tồn để trường tồn</h2>
                    <p className="text-slate-600 mb-8 max-w-lg mx-auto relative">Liên hệ để bắt đầu dự án số hóa di sản văn hóa của tổ chức bạn.</p>
                    <Link href="/lien-he"
                        className="inline-flex items-center gap-3 px-8 py-4 font-extrabold rounded-full transition-all hover:-translate-y-0.5 relative text-[15px]"
                        style={{ background: ACCENT, color: '#030812', boxShadow: '0 4px 24px rgba(245,158,11,0.35)' }}>
                        Liên hệ ngay
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </section>
        </div>
    );
}
