import React from 'react';
import { Metadata } from 'next';
import { BRAND_NAME_VI } from '@/lib/constants';
import { Link } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
    title: 'Sự kiện Xã hội',
    description: 'Tổ chức và quản lý sự kiện từ thiện, lễ hội văn hóa và hoạt động cộng đồng toàn diện.',
};

const SERVICES = [
    { icon: '📋', title: 'Quản lý Đăng ký', desc: 'Hệ thống đăng ký online, xác nhận tự động qua email, quản lý danh sách và quota từng vé tham dự.' },
    { icon: '🔲', title: 'Check-in QR Code', desc: 'Check-in nhanh bằng mã QR, giảm thời gian xếp hàng, ghi nhận thời gian tham dự và xuất báo cáo.' },
    { icon: '📡', title: 'Livestream Tích hợp', desc: 'Phát sóng trực tiếp sự kiện lên Facebook, YouTube — mở rộng đối tượng ra ngoài không gian vật lý.' },
    { icon: '👥', title: 'Quản lý Tình nguyện viên', desc: 'Phân công ca trực, lịch làm việc, liên lạc nhanh và theo dõi giờ tình nguyện của từng thành viên.' },
    { icon: '📊', title: 'Báo cáo Tác động', desc: 'Tổng kết số người tham dự, đóng góp tài chính và các chỉ số tác động xã hội sau mỗi sự kiện.' },
    { icon: '🗓️', title: 'Lịch Sự kiện Công khai', desc: 'Hiển thị lịch sự kiện trên website, nhắc nhở qua email và thông báo tự động đến người đăng ký.' },
];

const ACCENT = '#10B981';

export default async function SuKienPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    return (
        <div className="min-h-screen relative bg-gradient-to-b from-white to-slate-50">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 right-1/3 w-[600px] h-[400px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)' }} />
                <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.05) 0%, transparent 70%)' }} />
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
                    <span style={{ color: ACCENT }}>Sự kiện Xã hội</span>
                </div>
            </div>

            {/* Hero */}
            <section className="relative z-10 px-4 pt-14 pb-20 max-w-6xl mx-auto">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-6 bg-white border border-slate-200 shadow-sm"
                    >
                    <span className="text-[11px] font-bold tracking-[0.15em] uppercase" style={{ color: ACCENT }}>Social Events</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-none mb-6">
                    Sự kiện<br />
                    <span className="text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)' }}>
                        Xã hội
                    </span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl font-medium leading-relaxed mb-10">
                    Từ lễ hội văn hóa, hội thảo cộng đồng đến chiến dịch gây quỹ — tổ chức sự kiện chuyên nghiệp và đo lường tác động thực tế.
                </p>
                <div className="flex gap-4 flex-wrap">
                    <Link href="/lien-he"
                        className="inline-flex items-center gap-2 px-6 py-3.5 font-bold rounded-full transition-all hover:-translate-y-0.5 text-[15px]"
                        style={{ background: ACCENT, color: '#030812', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>
                        Tư vấn miễn phí
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                    <Link href="/tin-tuc"
                        className="inline-flex items-center gap-2 px-6 py-3.5 font-bold rounded-full transition-all text-[15px] bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                        >
                        Xem hoạt động gần đây
                    </Link>
                </div>
            </section>

            {/* Services */}
            <section className="relative z-10 px-4 pb-20 max-w-6xl mx-auto">
                <div className="mb-10">
                    <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: ACCENT }}>Dịch vụ</p>
                    <h2 className="text-3xl font-black text-slate-900">Hỗ trợ từ A đến Z</h2>
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
                        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.05) 0%, transparent 70%)' }} />
                    <h2 className="text-3xl font-black text-slate-900 mb-3 relative">Sự kiện tiếp theo của bạn?</h2>
                    <p className="text-slate-600 mb-8 max-w-lg mx-auto relative">Liên hệ sớm để chúng tôi đồng hành từ khâu lên kế hoạch đến kết thúc sự kiện.</p>
                    <Link href="/lien-he"
                        className="inline-flex items-center gap-3 px-8 py-4 font-extrabold rounded-full transition-all hover:-translate-y-0.5 relative text-[15px]"
                        style={{ background: ACCENT, color: '#030812', boxShadow: '0 4px 24px rgba(16,185,129,0.35)' }}>
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
