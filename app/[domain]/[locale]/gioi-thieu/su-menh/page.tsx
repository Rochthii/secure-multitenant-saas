import { Metadata } from 'next';
import { BRAND_NAME_VI } from '@/lib/constants';
import { Link } from '@/i18n/routing';

export const metadata: Metadata = {
    title: 'Sứ mệnh & Tầm nhìn',
    description: 'Sứ mệnh, tầm nhìn và các giá trị cốt lõi của doanh nghiệp xã hội về công nghệ phục vụ cộng đồng.',
};

const PILLARS = [
    {
        icon: '🌍',
        title: 'Công nghệ cho mọi người',
        desc: 'Mang công nghệ tiên tiến đến với những tổ chức phi lợi nhuận và cộng đồng vốn không có điều kiện tiếp cận.',
        accent: '#00D2FF',
    },
    {
        icon: '🔍',
        title: 'Minh bạch tuyệt đối',
        desc: 'Mọi dòng tiền, mọi quyết định đều được công khai. Chúng tôi tin rằng minh bạch là nền tảng của lòng tin.',
        accent: '#FFD700',
    },
    {
        icon: '🌱',
        title: 'Bền vững dài hạn',
        desc: 'Xây dựng hệ thống có thể tự vận hành và phát triển qua nhiều thế hệ, không phụ thuộc vào cá nhân hay ngân sách ngắn hạn.',
        accent: '#10B981',
    },
    {
        icon: '🤝',
        title: 'Cộng tác, không cạnh tranh',
        desc: 'Chúng tôi chia sẻ nền tảng, chia sẻ kiến thức và kết nối các tổ chức lại với nhau để tạo ra tác động lớn hơn.',
        accent: '#A855F7',
    },
];

const TIMELINE = [
    { year: '2024', event: 'Khởi đầu từ con số 0 — 2 tháng xuyên đêm viết code cho hệ thống multi-tenant đầu tiên.' },
    { year: '2025', event: `Ra mắt nền tảng ${BRAND_NAME_VI}, phục vụ các tổ chức tôn giáo và NGO đầu tiên.` },
    { year: '2026', event: 'Mở rộng sang lĩnh vực truyền thông cộng đồng, văn hóa bảo tồn và sự kiện xã hội.' },
    { year: '2030', event: 'Tầm nhìn: 100+ tổ chức cộng đồng trên hệ thống, mạng lưới liên kết Đông Nam Á.' },
];

export default function SuMenhPage() {
    return (
        <div className="min-h-screen relative" style={{ background: '#030812' }}>
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(0,210,255,0.06) 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)' }} />
                <div className="absolute inset-0 opacity-[0.02]"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
            </div>

            {/* Breadcrumb */}
            <div className="relative z-10 px-4 pt-8 max-w-6xl mx-auto">
                <div className="flex items-center gap-2 text-[13px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
                    <span>/</span>
                    <Link href="/gioi-thieu" className="hover:text-white transition-colors">Về Minh Châu</Link>
                    <span>/</span>
                    <span style={{ color: '#00D2FF' }}>Sứ mệnh & Tầm nhìn</span>
                </div>
            </div>

            {/* Hero */}
            <section className="relative z-10 px-4 pt-14 pb-20 max-w-5xl mx-auto text-center">
                <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-8"
                    style={{ background: 'rgba(0,210,255,0.06)', border: '1px solid rgba(0,210,255,0.15)' }}>
                    <span className="text-[12px] font-bold tracking-[0.18em] uppercase" style={{ color: '#00D2FF' }}>Sứ mệnh & Tầm nhìn</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                    Vì sao{' '}
                    <span className="text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #00D2FF 0%, #10B981 100%)' }}>
                        chúng tôi tồn tại?
                    </span>
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
                    {BRAND_NAME_VI} được thành lập với một câu hỏi đơn giản: Liệu công nghệ có thể thực sự phục vụ cộng đồng, không phải ngược lại?
                </p>
            </section>

            {/* Mission statement */}
            <section className="relative z-10 px-4 pb-20 max-w-5xl mx-auto">
                <div className="grid md:grid-cols-2 gap-5">
                    <div className="relative rounded-3xl overflow-hidden p-10"
                        style={{ background: 'rgba(0,210,255,0.04)', border: '1px solid rgba(0,210,255,0.12)' }}>
                        <div className="text-[11px] font-bold tracking-[0.2em] uppercase mb-4" style={{ color: '#00D2FF' }}>Sứ mệnh</div>
                        <h2 className="text-2xl font-black text-white mb-4 leading-tight">Cung cấp công nghệ bền vững cho tổ chức phi lợi nhuận và cộng đồng</h2>
                        <p className="text-[14px] text-gray-400 leading-relaxed">
                            Chúng tôi tin rằng mỗi chi nhánh chiền, NGO và tổ chức cộng đồng đều xứng đáng có một nền tảng công nghệ mạnh mẽ — không phụ thuộc vào ngân sách hay nhân sự kỹ thuật riêng.
                        </p>
                    </div>
                    <div className="relative rounded-3xl overflow-hidden p-10"
                        style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.12)' }}>
                        <div className="text-[11px] font-bold tracking-[0.2em] uppercase mb-4" style={{ color: '#10B981' }}>Tầm nhìn</div>
                        <h2 className="text-2xl font-black text-white mb-4 leading-tight">Xây dựng hệ sinh thái số cho cộng đồng Đông Nam Á đến năm 2030</h2>
                        <p className="text-[14px] text-gray-400 leading-relaxed">
                            Một mạng lưới 100+ tổ chức kết nối với nhau — chia sẻ dữ liệu, nguồn lực và sứ mệnh — tất cả chạy trên một nền tảng minh bạch, mã nguồn mở và cộng đồng quản trị.
                        </p>
                    </div>
                </div>
            </section>

            {/* Core pillars */}
            <section className="relative z-10 px-4 pb-20 max-w-6xl mx-auto">
                <div className="mb-10">
                    <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: '#00D2FF' }}>Giá trị cốt lõi</p>
                    <h2 className="text-3xl font-black text-white">Bốn trụ cột định hướng</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {PILLARS.map((p) => (
                        <div key={p.title} className="group p-7 rounded-2xl transition-all hover:-translate-y-1"
                            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="text-3xl mb-4">{p.icon}</div>
                            <h3 className="text-[15px] font-bold text-white mb-2">{p.title}</h3>
                            <p className="text-[13px] text-gray-400 leading-relaxed">{p.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Timeline */}
            <section className="relative z-10 px-4 pb-20 max-w-3xl mx-auto">
                <div className="mb-10">
                    <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: '#FFD700' }}>Lộ trình</p>
                    <h2 className="text-3xl font-black text-white">Hành trình & Mục tiêu</h2>
                </div>
                <div className="relative pl-8">
                    <div className="absolute left-2.5 top-2 bottom-8 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                    {TIMELINE.map((item, idx) => (
                        <div key={item.year} className="relative mb-8 last:mb-0">
                            <div className="absolute -left-[22px] w-5 h-5 rounded-full flex items-center justify-center"
                                style={{ background: idx === TIMELINE.length - 1 ? 'rgba(255,215,0,0.15)' : 'rgba(0,210,255,0.15)', border: `1px solid ${idx === TIMELINE.length - 1 ? 'rgba(255,215,0,0.4)' : 'rgba(0,210,255,0.4)'}` }}>
                                <div className="w-2 h-2 rounded-full" style={{ background: idx === TIMELINE.length - 1 ? '#FFD700' : '#00D2FF' }} />
                            </div>
                            <div className="text-[11px] font-bold tracking-[0.15em] mb-1.5" style={{ color: idx === TIMELINE.length - 1 ? '#FFD700' : '#00D2FF' }}>
                                {idx === TIMELINE.length - 1 ? '🎯 ' : ''}{item.year}
                            </div>
                            <p className="text-[14px] text-gray-400 leading-relaxed">{item.event}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 px-4 pb-28 max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-black text-white mb-4">Cùng chúng tôi xây dựng tương lai</h2>
                <p className="text-gray-400 mb-8">Nếu bạn tin vào sứ mệnh này, hãy tham gia — dù là người dùng, đối tác hay cộng tác viên.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/lien-he"
                        className="inline-flex items-center gap-3 px-8 py-4 font-extrabold rounded-full transition-all hover:-translate-y-0.5 text-[15px]"
                        style={{ background: '#00D2FF', color: '#030812', boxShadow: '0 4px 24px rgba(0,210,255,0.3)' }}>
                        Liên hệ hợp tác
                    </Link>
                    <Link href="/gioi-thieu/doi-ngu"
                        className="inline-flex items-center gap-3 px-8 py-4 font-bold rounded-full transition-all text-[15px]"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
                        Gặp gỡ đội ngũ
                    </Link>
                </div>
            </section>
        </div>
    );
}
