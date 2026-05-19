import React from 'react';
import { Metadata } from 'next';
import { BRAND_NAME_VI } from '@/lib/constants';
import { Link } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
    title: 'Truyền thông Cộng đồng',
    description: 'Chiến lược truyền thông, nội dung số và nhận diện thương hiệu cho tổ chức cộng đồng và NGO.',
};

const SERVICES = [
    { icon: '✍️', title: 'Content Strategy', desc: 'Lên kế hoạch nội dung bài bản, nhất quán với sứ mệnh — không phải đăng cho có. Mỗi bài viết, mỗi post đều có mục tiêu rõ ràng.' },
    { icon: '📱', title: 'Social Media Management', desc: 'Quản lý và phát triển kênh Facebook, YouTube, TikTok cho tổ chức. Tăng tương tác thực, không mua like.' },
    { icon: '🎨', title: 'Thiết kế Ấn phẩm', desc: 'Banner, poster, infographic, bộ nhận diện thương hiệu chuyên nghiệp, nhất quán trên mọi kênh truyền thông.' },
    { icon: '🎬', title: 'Video & Podcast', desc: 'Sản xuất video ngắn, phỏng vấn, ghi hình sự kiện và podcast cho cộng đồng — kể câu chuyện thực sự.' },
    { icon: '📣', title: 'Chiến dịch Cộng đồng', desc: 'Lên kế hoạch và thực thi chiến dịch gây quỹ, vận động xã hội — từ hashtag đến press release.' },
    { icon: '📊', title: 'Báo cáo Tác động', desc: 'Đo lường và báo cáo hiệu quả chiến dịch bằng số liệu thực: reach, engagement, conversion, impact.' },
];

const ACCENT = '#A855F7';

export default async function TruyenThongPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    return (
        <div className="min-h-screen relative bg-gradient-to-b from-white to-slate-50">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 right-1/4 w-[600px] h-[400px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)' }} />
                <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 70%)' }} />
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
                    <span style={{ color: ACCENT }}>Truyền thông Cộng đồng</span>
                </div>
            </div>

            {/* Hero */}
            <section className="relative z-10 px-4 pt-14 pb-20 max-w-6xl mx-auto">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-6 bg-white border border-slate-200 shadow-sm"
                    >
                    <span className="text-[11px] font-bold tracking-[0.15em] uppercase" style={{ color: ACCENT }}>Community Communications</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-none mb-6">
                    Truyền thông<br />
                    <span className="text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)' }}>
                        Cộng đồng
                    </span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl font-medium leading-relaxed mb-10">
                    Câu chuyện truyền cảm hứng, hình ảnh chân thực và chiến lược thông minh — giúp tổ chức của bạn kết nối sâu sắc hơn với cộng đồng.
                </p>
                <div className="flex gap-4 flex-wrap">
                    <Link href="/lien-he"
                        className="inline-flex items-center gap-2 px-6 py-3.5 font-bold rounded-full transition-all hover:-translate-y-0.5 text-[15px] text-white"
                        style={{ background: ACCENT, boxShadow: '0 4px 20px rgba(168,85,247,0.3)' }}>
                        Tư vấn miễn phí
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
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
                        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.05) 0%, transparent 70%)' }} />
                    <h2 className="text-3xl font-black text-slate-900 mb-3 relative">Bắt đầu câu chuyện của bạn</h2>
                    <p className="text-slate-600 mb-8 max-w-lg mx-auto relative">Cùng chúng tôi xây chiến lược truyền thông phù hợp với sứ mệnh và nguồn lực thực tế của tổ chức.</p>
                    <Link href="/lien-he"
                        className="inline-flex items-center gap-3 px-8 py-4 font-extrabold rounded-full transition-all hover:-translate-y-0.5 relative text-[15px] text-white"
                        style={{ background: ACCENT, boxShadow: '0 4px 24px rgba(168,85,247,0.35)' }}>
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
