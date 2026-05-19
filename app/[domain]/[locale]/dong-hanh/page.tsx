import { Metadata } from 'next';
import { BRAND_NAME_VI } from '@/lib/constants';
import { Link } from '@/i18n/routing';
import { getTenantConfig } from '@/lib/tenant';
import { getTenantBaseUrl } from '@/lib/utils/seo';

export async function generateMetadata({ params }: { params: Promise<{ domain: string; locale: string }> }): Promise<Metadata> {
    const { domain, locale } = await params;
    const tenant = await getTenantConfig(domain);
    const tenantBaseUrl = getTenantBaseUrl(domain);
    const siteName = tenant?.name || BRAND_NAME_VI;

    return {
        title: `Đồng hành cùng ${siteName} | Hợp tác, Tài trợ & Tình nguyện`,
        description: `Hợp tác dự án, tài trợ và tình nguyện cùng ${siteName} — Doanh nghiệp xã hội công nghệ phục vụ cộng đồng. Cam kết minh bạch 100%.`,
        alternates: {
            canonical: `${tenantBaseUrl}/${locale}/dong-hanh`,
            languages: {
                'vi-VN': `${tenantBaseUrl}/vi/dong-hanh`,
                'km-KH': `${tenantBaseUrl}/km/dong-hanh`,
                'en-US': `${tenantBaseUrl}/en/dong-hanh`,
            },
        },
        openGraph: {
            title: `Đồng hành cùng ${siteName}`,
            description: `Hợp tác, tài trợ và tình nguyện — cùng tạo ra tác động thực.`,
            url: `${tenantBaseUrl}/${locale}/dong-hanh`,
        },
    };
}

const WAYS = [
    {
        id: 'hop-tac',
        icon: '🤝',
        label: 'Partnership',
        title: 'Hợp tác Dự án',
        desc: 'Bạn có một tổ chức cần chuyển đổi số, xây dựng website hoặc phát triển truyền thông? Hãy cùng chúng tôi làm điều đó — với mô hình chia sẻ tác động, không chỉ phí dịch vụ.',
        accent: '#00D2FF',
        cta: 'Gửi đề xuất hợp tác',
        href: '/lien-he',
        items: [
            'Tổ chức tôn giáo & chi nhánh chiền',
            'NGO & tổ chức phi lợi nhuận',
            'Cộng đồng văn hóa & giáo dục',
            'Mạng lưới tình nguyện viên',
        ],
    },
    {
        id: 'tai-tro',
        icon: '💛',
        label: 'Sponsorship',
        title: 'Tài trợ & Hỗ trợ',
        desc: 'Mỗi đồng tài trợ đến tay chúng tôi đều đi vào hạ tầng công nghệ phục vụ cộng đồng. Không có phí quản lý ẩn. Báo cáo minh bạch từng tháng.',
        accent: '#FFD700',
        cta: 'Xem báo cáo minh bạch',
        href: '/minh-bach',
        items: [
            '100% vào hạ tầng & phát triển',
            'Báo cáo tác động theo quý',
            'Ghi nhận công khai trên Cổng minh bạch',
            'Ưu tiên tư vấn kỹ thuật miễn phí',
        ],
    },
    {
        id: 'tinh-nguyen',
        icon: '🌱',
        label: 'Volunteering',
        title: 'Tình nguyện Kỹ thuật',
        desc: 'Bạn là developer, designer, content creator hay marketing expert? Chúng tôi luôn tìm kiếm những người muốn đóng góp kỹ năng cho cộng đồng.',
        accent: '#10B981',
        cta: 'Đăng ký tình nguyện',
        href: '/lien-he',
        items: [
            'Web Development & DevOps',
            'UI/UX Design',
            'Content & Social Media',
            'Video Production',
        ],
    },
] as const;

const STATS = [
    { num: '0đ', label: 'Vốn ban đầu', desc: 'Bắt đầu hoàn toàn từ đam mê' },
    { num: '100%', label: 'Minh bạch', desc: 'Mọi dòng tiền đều công khai' },
    { num: '∞', label: 'Tác động', desc: 'Không giới hạn đối tượng phục vụ' },
];

export default function DongHanhPage() {
    return (
        <div className="min-h-screen relative" style={{ background: '#030812' }}>
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(0,210,255,0.07) 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)' }} />
                <div className="absolute inset-0 opacity-[0.02]"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
            </div>

            {/* Breadcrumb */}
            <div className="relative z-10 px-4 pt-8 max-w-6xl mx-auto">
                <div className="flex items-center gap-2 text-[13px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
                    <span>/</span>
                    <span style={{ color: '#00D2FF' }}>Đồng hành</span>
                </div>
            </div>

            {/* Hero */}
            <section className="relative z-10 px-4 pt-14 pb-20 max-w-5xl mx-auto text-center">
                <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-8"
                    style={{ background: 'rgba(0,210,255,0.06)', border: '1px solid rgba(0,210,255,0.15)' }}>
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00D2FF' }} />
                    <span className="text-[12px] font-bold tracking-[0.18em] uppercase" style={{ color: '#00D2FF' }}>Get Involved</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                    Cùng nhau tạo ra{' '}
                    <span className="text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #00D2FF 0%, #10B981 100%)' }}>
                        tác động thực
                    </span>
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
                    Không phân biệt cách bạn tham gia — hợp tác, tài trợ hay tình nguyện — chúng tôi đều trân trọng và minh bạch về mọi đóng góp.
                </p>
            </section>

            {/* Stats */}
            <section className="relative z-10 px-4 pb-16 max-w-4xl mx-auto">
                <div className="grid grid-cols-3 gap-4">
                    {STATS.map((s) => (
                        <div key={s.label} className="text-center p-6 rounded-2xl"
                            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="text-3xl font-black text-white mb-1">{s.num}</div>
                            <div className="text-[12px] font-bold text-gray-300 mb-1">{s.label}</div>
                            <div className="text-[11px] text-gray-500">{s.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3 ways to get involved */}
            <section className="relative z-10 px-4 pb-20 max-w-6xl mx-auto">
                <div className="mb-10 text-center">
                    <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: '#00D2FF' }}>3 cách để tham gia</p>
                    <h2 className="text-3xl font-black text-white">Bạn muốn đồng hành như thế nào?</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {WAYS.map((way) => (
                        <div key={way.id} id={way.id} className="relative rounded-3xl overflow-hidden p-8 flex flex-col"
                            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="absolute top-0 left-0 right-0 h-px"
                                style={{ background: `linear-gradient(90deg, transparent, ${way.accent}40, transparent)` }} />

                            {/* Icon + badge */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="text-4xl">{way.icon}</div>
                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full"
                                    style={{ background: `${way.accent}12`, border: `1px solid ${way.accent}20`, color: way.accent }}>
                                    {way.label}
                                </span>
                            </div>

                            <h3 className="text-xl font-black text-white mb-3">{way.title}</h3>
                            <p className="text-[13px] text-gray-400 leading-relaxed mb-6 flex-1">{way.desc}</p>

                            {/* Feature list */}
                            <ul className="space-y-2 mb-7">
                                {way.items.map((item) => (
                                    <li key={item} className="flex items-center gap-2.5 text-[13px] text-gray-400">
                                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: way.accent }} />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <Link href={way.href}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-2xl text-[13px] transition-all hover:-translate-y-0.5"
                                style={{ background: `${way.accent}15`, border: `1px solid ${way.accent}30`, color: way.accent }}>
                                {way.cta}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* Trust strip */}
            <section className="relative z-10 px-4 pb-20 max-w-5xl mx-auto">
                <div className="rounded-3xl p-10 md:p-12 relative overflow-hidden"
                    style={{ background: 'rgba(0,210,255,0.04)', border: '1px solid rgba(0,210,255,0.10)' }}>
                    <div className="absolute inset-0"
                        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(0,210,255,0.06) 0%, transparent 70%)' }} />
                    <div className="relative z-10 text-center">
                        <div className="text-3xl mb-4">🛡️</div>
                        <h2 className="text-2xl font-black text-white mb-4">Cam kết minh bạch tuyệt đối</h2>
                        <p className="text-[14px] text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
                            Mọi khoản đóng góp đều được ghi lại trên Cổng Minh Bạch công khai. Bạn có thể kiểm tra bất kỳ lúc nào — không cần đăng nhập.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/minh-bach"
                                className="inline-flex items-center gap-2 px-7 py-3.5 font-bold rounded-full text-[14px] transition-all hover:-translate-y-0.5"
                                style={{ background: '#00D2FF', color: '#030812', boxShadow: '0 4px 20px rgba(0,210,255,0.25)' }}>
                                Xem Cổng Minh Bạch
                            </Link>
                            <Link href="/lien-he"
                                className="inline-flex items-center gap-2 px-7 py-3.5 font-bold rounded-full text-[14px] transition-all"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>
                                Liên hệ trực tiếp
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
