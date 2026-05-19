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
        title: `Đội ngũ & Ban lãnh đạo | ${siteName}`,
        description: `Gặp gỡ đội ngũ sáng lập và ban lãnh đạo của ${siteName} — những con người tâm huyết kết hợp công nghệ và sứ mệnh phụng sự cộng đồng.`,
        alternates: {
            canonical: `${tenantBaseUrl}/${locale}/gioi-thieu/doi-ngu`,
            languages: {
                'vi-VN': `${tenantBaseUrl}/vi/gioi-thieu/doi-ngu`,
                'km-KH': `${tenantBaseUrl}/km/gioi-thieu/doi-ngu`,
                'en-US': `${tenantBaseUrl}/en/gioi-thieu/doi-ngu`,
            },
        },
        openGraph: {
            title: `Đội ngũ | ${siteName}`,
            description: `Ban lãnh đạo và đội ngũ chuyên gia xây dựng nền tảng công nghệ phụng sự cộng đồng.`,
            url: `${tenantBaseUrl}/${locale}/gioi-thieu/doi-ngu`,
        },
    };
}

const LEADERSHIP = [
    {
        name: 'NGUYỄN NGỌC MINH CHÂU',
        role: 'Tổng Giám đốc & Đồng sáng lập',
        shortRole: 'CEO',
        desc: 'Tầm nhìn chiến lược và khát vọng phụng sự. Dẫn dắt doanh nghiệp trở thành hạt nhân kết nối công nghệ và giá trị truyền thống, xây dựng hệ sinh thái số hóa cho hàng chục tổ chức cộng đồng.',
        specialties: ['Strategic Vision', 'Social Impact', 'Community Building', 'Business Development'],
        accent: '#FFD700',
        bgGradient: 'linear-gradient(135deg, #001530 0%, #002B5B 50%, #001936 100%)',
    },
    {
        name: 'CTO',
        role: 'Giám đốc Công nghệ & Đồng sáng lập',
        shortRole: 'CTO',
        desc: 'Kiến trúc sư hệ thống chính. Thiết kế và xây dựng nền tảng Multi-tenant SaaS bảo mật enterprise-grade với RLS, JWT Claims và hạ tầng cloud hiện đại. Đảm bảo uptime 99.9%.',
        specialties: ['System Architecture', 'Cloud Security', 'AI/ML', 'DevOps'],
        accent: '#00D2FF',
        bgGradient: undefined,
    },
    {
        name: 'ANH ĐẠM',
        role: 'Giám đốc Sáng tạo',
        shortRole: 'CCO',
        desc: 'Định hình phong cách thương hiệu và thiết kế trải nghiệm người dùng. Chịu trách nhiệm toàn bộ creative direction — từ UI/UX đến truyền thông hình ảnh, truyền tải thông điệp vì cộng đồng.',
        specialties: ['UI/UX Design', 'Brand Identity', 'Visual Communication', 'Content Strategy'],
        accent: '#A855F7',
        bgGradient: undefined,
    },
];

const VALUES = [
    { icon: '🎯', title: 'Sứ mệnh trên hết', desc: 'Mọi quyết định đều đặt tác động xã hội lên đầu tiên — lợi nhuận là phương tiện, không phải mục đích.' },
    { icon: '🔍', title: 'Minh bạch tuyệt đối', desc: '100% giao dịch tài chính được công khai. Cộng đồng có quyền kiểm tra bất kỳ lúc nào.' },
    { icon: '⚡', title: 'Công nghệ vượt trội', desc: 'Sử dụng công nghệ tiên tiến nhất — AI, Cloud, RLS Security — để phục vụ tổ chức phi lợi nhuận.' },
    { icon: '🤝', title: 'Đồng hành dài hạn', desc: 'Không chỉ giao sản phẩm rồi bỏ đi. Chúng tôi cam kết đồng hành vận hành cùng tổ chức.' },
];

const TECH_STACK = [
    { name: 'Next.js 15', category: 'Frontend' },
    { name: 'React 19', category: 'Frontend' },
    { name: 'TypeScript', category: 'Language' },
    { name: 'Supabase', category: 'Backend' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'Vercel', category: 'Deployment' },
    { name: 'TailwindCSS', category: 'Styling' },
    { name: 'Framer Motion', category: 'Animation' },
    { name: 'LangChain', category: 'AI' },
    { name: 'pgvector', category: 'AI' },
    { name: 'Gemini', category: 'AI' },
    { name: 'RLS / JWT', category: 'Security' },
];

export default async function DoiNguPage({ params }: { params: Promise<{ locale: string; domain: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <div className="min-h-screen relative" style={{ background: '#030812' }}>
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/3 w-[800px] h-[500px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(0,210,255,0.06) 0%, transparent 70%)' }} />
                <div className="absolute bottom-1/4 right-0 w-[600px] h-[400px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 left-0 w-[500px] h-[300px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.04) 0%, transparent 70%)' }} />
                <div className="absolute inset-0 opacity-[0.015]"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
            </div>

            {/* Breadcrumb */}
            <div className="relative z-10 px-4 pt-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-2 text-[13px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
                    <span>/</span>
                    <Link href="/gioi-thieu" className="hover:text-white transition-colors">Giới thiệu</Link>
                    <span>/</span>
                    <span style={{ color: '#00D2FF' }}>Đội ngũ</span>
                </div>
            </div>

            {/* Hero */}
            <section className="relative z-10 px-4 pt-14 pb-16 max-w-5xl mx-auto text-center">
                <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-8"
                    style={{ background: 'rgba(0,210,255,0.06)', border: '1px solid rgba(0,210,255,0.15)' }}>
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00D2FF' }} />
                    <span className="text-[12px] font-bold tracking-[0.18em] uppercase" style={{ color: '#00D2FF' }}>Our Team</span>
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6">
                    Trái tim{' '}
                    <span className="text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #FFD700 0%, #00D2FF 50%, #A855F7 100%)' }}>
                        & Khối óc
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
                    Ba người, một sứ mệnh — xây dựng nền tảng công nghệ phục vụ cộng đồng từ con số 0. Tài sản lớn nhất: niềm tin và sự bền bỉ.
                </p>
            </section>

            {/* Leadership Grid */}
            <section className="relative z-10 px-4 pb-20 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {LEADERSHIP.map((person, idx) => (
                        <div key={person.shortRole}
                            className="group relative rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-2"
                            style={{
                                background: person.bgGradient || 'rgba(255,255,255,0.02)',
                                border: `1px solid ${idx === 0 ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.06)'}`,
                            }}>

                            {/* Hover glow */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2.5rem]"
                                style={{ background: `radial-gradient(circle at 30% 100%, ${person.accent}12 0%, transparent 60%)` }} />

                            {/* Top accent */}
                            <div className="absolute top-0 left-12 right-12 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{ background: `linear-gradient(90deg, transparent, ${person.accent}, transparent)` }} />

                            {/* Dot pattern */}
                            {idx === 0 && (
                                <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
                            )}

                            <div className="relative z-10 p-8 md:p-10 flex flex-col min-h-[480px]">
                                {/* Role badge */}
                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                                        style={{
                                            background: idx === 0 ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.03)',
                                            border: `1px solid ${person.accent}30`,
                                            color: person.accent,
                                        }}>
                                        <span className="text-2xl font-black">{person.shortRole}</span>
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                                        style={{ background: `${person.accent}10`, border: `1px solid ${person.accent}25` }}>
                                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: person.accent }} />
                                        <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: person.accent }}>
                                            Co-Founder
                                        </span>
                                    </div>
                                </div>

                                {/* Name + Role */}
                                <div className="mb-6">
                                    <h2 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
                                        {person.name}
                                    </h2>
                                    <p className="text-[13px] font-bold" style={{ color: person.accent }}>
                                        {person.role}
                                    </p>
                                </div>

                                {/* Description */}
                                <p className={`text-[14px] leading-relaxed mb-8 flex-1 ${idx === 0 ? 'text-gray-300' : 'text-gray-400'}`}>
                                    {person.desc}
                                </p>

                                {/* Specialties */}
                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {person.specialties.map((s) => (
                                        <span key={s} className="px-3 py-1.5 text-[10px] font-bold rounded-full"
                                            style={{
                                                background: `${person.accent}08`,
                                                border: `1px solid ${person.accent}20`,
                                                color: person.accent,
                                            }}>
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Story Section */}
            <section className="relative z-10 px-4 pb-20 max-w-6xl mx-auto">
                <div className="relative rounded-3xl overflow-hidden p-10 md:p-14"
                    style={{ background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.08)' }}>
                    <div className="absolute inset-0 pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse at 100% 0%, rgba(255,215,0,0.05) 0%, transparent 60%)' }} />
                    <div className="relative z-10 max-w-3xl">
                        <div className="text-[11px] font-bold tracking-[0.2em] uppercase mb-4" style={{ color: '#FFD700' }}>Câu chuyện chúng tôi</div>
                        <h2 className="text-3xl font-black text-white mb-5">Bắt đầu từ con số không</h2>
                        <div className="space-y-4 text-[14px] text-gray-400 leading-relaxed">
                            <p>
                                {BRAND_NAME_VI} bắt đầu không phải từ một văn phòng hay vốn đầu tư triệu đô. Chúng tôi bắt đầu từ một câu hỏi: <em className="text-white">Tại sao các chi nhánh chiền, NGO và tổ chức cộng đồng lại không có công nghệ tốt như doanh nghiệp thương mại?</em>
                            </p>
                            <p>
                                Với 0 đồng vốn ban đầu và 2 tháng xuyên đêm viết code, chúng tôi đã xây dựng một nền tảng multi-tenant hoàn chỉnh — từ hệ thống quản trị đến giao diện đa ngôn ngữ, phân quyền RLS và dashboard minh bạch.
                            </p>
                            <p>
                                Đây không phải sản phẩm demo. Đây là nền tảng thực sự phục vụ cộng đồng thực sự — và chúng tôi vẫn đang tiếp tục xây.
                            </p>
                        </div>
                        <div className="mt-8 flex items-center gap-4 flex-wrap">
                            <div className="px-4 py-2 rounded-full text-[12px] font-bold"
                                style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', color: '#FFD700' }}>
                                🌙 2 tháng xuyên đêm
                            </div>
                            <div className="px-4 py-2 rounded-full text-[12px] font-bold"
                                style={{ background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.2)', color: '#00D2FF' }}>
                                💻 0 đồng vốn đầu tư
                            </div>
                            <div className="px-4 py-2 rounded-full text-[12px] font-bold"
                                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>
                                🚀 8+ tổ chức đang dùng
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="relative z-10 px-4 pb-20 max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: '#A855F7' }}>Tech Stack</p>
                    <h2 className="text-3xl md:text-4xl font-black text-white">Công nghệ chúng tôi sử dụng</h2>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                    {TECH_STACK.map((tech) => (
                        <div key={tech.name} className="group px-5 py-3 rounded-2xl transition-all duration-300 hover:-translate-y-1 cursor-default"
                            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="text-[14px] font-bold text-white group-hover:text-[#00D2FF] transition-colors">{tech.name}</div>
                            <div className="text-[10px] text-gray-500 font-medium">{tech.category}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Values Section */}
            <section className="relative z-10 px-4 pb-20 max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: '#00D2FF' }}>Core Values</p>
                    <h2 className="text-3xl md:text-4xl font-black text-white">Giá trị cốt lõi</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {VALUES.map((v) => (
                        <div key={v.title} className="group relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>

                            <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{ background: 'linear-gradient(90deg, transparent, rgba(0,210,255,0.3), transparent)' }} />

                            <div className="flex items-start gap-5">
                                <div className="text-3xl flex-shrink-0">{v.icon}</div>
                                <div>
                                    <h3 className="text-lg font-black text-white mb-2">{v.title}</h3>
                                    <p className="text-[13px] text-gray-400 leading-relaxed">{v.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Hiring CTA */}
            <section className="relative z-10 px-4 pb-32 max-w-4xl mx-auto">
                <div className="rounded-3xl p-10 md:p-14 relative overflow-hidden"
                    style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.10)' }}>
                    <div className="absolute inset-0"
                        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(168,85,247,0.06) 0%, transparent 70%)' }} />
                    <div className="relative z-10 text-center">
                        <div className="text-3xl mb-4">🌱</div>
                        <h2 className="text-2xl md:text-3xl font-black text-white mb-4">Tham gia đội ngũ</h2>
                        <p className="text-[14px] text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
                            Bạn có đam mê công nghệ và muốn tạo ra tác động xã hội thực sự? Chúng tôi luôn tìm kiếm những người tài năng muốn đồng hành lâu dài.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/lien-he"
                                className="inline-flex items-center gap-2 px-8 py-4 font-bold rounded-full text-[14px] transition-all hover:-translate-y-0.5"
                                style={{ background: '#A855F7', color: 'white', boxShadow: '0 4px 20px rgba(168,85,247,0.25)' }}>
                                Ứng tuyển ngay
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                            <Link href="/dong-hanh"
                                className="inline-flex items-center gap-2 px-8 py-4 font-bold rounded-full text-[14px] transition-all"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>
                                Tình nguyện kỹ thuật
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
