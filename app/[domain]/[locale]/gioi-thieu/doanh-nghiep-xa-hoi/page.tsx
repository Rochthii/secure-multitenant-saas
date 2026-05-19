import { Metadata } from 'next';
import { BRAND_NAME_VI } from '@/lib/constants';
import { Link } from '@/i18n/routing';

export const metadata: Metadata = {
    title: 'DNXH là gì?',
    description: 'Tìm hiểu về mô hình Doanh nghiệp Xã hội — sứ mệnh, cơ chế hoạt động và tại sao mô hình này được lựa chọn.',
};

const PILLARS = [
    { icon: '🎯', title: 'Sứ mệnh trước lợi nhuận', desc: 'DNXH đặt mục tiêu xã hội lên hàng đầu. Lợi nhuận được tái đầu tư vào sứ mệnh thay vì chia cho cổ đông.' },
    { icon: '🔄', title: 'Tự vận hành & Bền vững', desc: 'Không phụ thuộc tài trợ. DNXH tự tạo doanh thu từ dịch vụ, đảm bảo hoạt động liên tục và mở rộng tác động.' },
    { icon: '📊', title: 'Đo lường tác động', desc: 'Tác động xã hội đo bằng số liệu thực: người được hỗ trợ, quỹ huy động, tổ chức được số hóa — không chỉ là câu chuyện.' },
    { icon: '🤝', title: 'Minh bạch với cộng đồng', desc: 'Mọi số liệu tài chính và tác động đều được công bố công khai. Đây là cam kết, không phải PR.' },
];

const MYTHS = [
    { myth: 'DNXH là tổ chức từ thiện?', truth: 'Không. DNXH có doanh thu, có khách hàng, có hợp đồng — nhưng lợi nhuận phục vụ sứ mệnh, không phải làm giàu cổ đông.' },
    { myth: 'DNXH không cần chuyên nghiệp?', truth: 'Ngược lại. DNXH phải vừa tạo giá trị kinh tế, vừa tạo tác động xã hội — đòi hỏi tính chuyên nghiệp cao hơn.' },
    { myth: 'DNXH quy mô nhỏ, không có tầm nhìn lớn?', truth: 'Sai. Grameen Bank, TOMS, Patagonia — đều là DNXH hoặc có mô hình DNXH. Quy mô không giới hạn tác động.' },
];

export default function DoanhNghiepXaHoiPage() {
    return (
        <div className="min-h-screen relative" style={{ background: '#030812' }}>
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(0,210,255,0.07) 0%, transparent 70%)' }} />
                <div className="absolute inset-0 opacity-[0.02]"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
            </div>

            <div className="relative z-10 px-4 pt-8 max-w-6xl mx-auto">
                <div className="flex items-center gap-2 text-[13px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
                    <span>/</span>
                    <Link href="/gioi-thieu" className="hover:text-white transition-colors">Về Minh Châu</Link>
                    <span>/</span>
                    <span style={{ color: '#00D2FF' }}>DNXH là gì?</span>
                </div>
            </div>

            <section className="relative z-10 px-4 pt-14 pb-20 max-w-5xl mx-auto text-center">
                <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-8"
                    style={{ background: 'rgba(0,210,255,0.06)', border: '1px solid rgba(0,210,255,0.15)' }}>
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00D2FF' }} />
                    <span className="text-[12px] font-bold tracking-[0.18em] uppercase" style={{ color: '#00D2FF' }}>Khái niệm cốt lõi</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                    Doanh nghiệp Xã hội<br />
                    <span className="text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #00D2FF 0%, #FFD700 100%)' }}>
                        là gì?
                    </span>
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
                    Một mô hình kinh doanh mới — lấy tác động xã hội làm thước đo thành công thay vì chỉ nhìn vào lợi nhuận.
                </p>
            </section>

            <section className="relative z-10 px-4 pb-20 max-w-6xl mx-auto">
                <div className="relative rounded-3xl overflow-hidden p-10 md:p-14 mb-8"
                    style={{ background: 'rgba(0,210,255,0.04)', border: '1px solid rgba(0,210,255,0.1)' }}>
                    <blockquote className="text-2xl md:text-3xl font-black text-white leading-relaxed mb-4">
                        "Doanh nghiệp Xã hội hoạt động{' '}
                        <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #00D2FF, #FFD700)' }}>
                            như doanh nghiệp
                        </span>
                        {' '}nhưng lấy{' '}
                        <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #00D2FF, #FFD700)' }}>
                            mục tiêu xã hội
                        </span>
                        {' '}làm sứ mệnh cốt lõi."
                    </blockquote>
                    <p className="text-gray-400 text-[15px] leading-relaxed max-w-3xl">
                        Doanh thu từ dịch vụ thực tế, lợi nhuận tái đầu tư vào sứ mệnh — không phải từ thiện, không phải doanh nghiệp thuần lợi nhuận. Đây là <strong className="text-white">con đường thứ ba</strong>.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {PILLARS.map((p) => (
                        <div key={p.title} className="flex gap-5 p-7 rounded-2xl"
                            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="text-3xl flex-shrink-0">{p.icon}</div>
                            <div>
                                <h3 className="text-[15px] font-bold text-white mb-2">{p.title}</h3>
                                <p className="text-[13px] text-gray-400 leading-relaxed">{p.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mb-10">
                    <div className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: '#FFD700' }}>Hiểu đúng</div>
                    <h2 className="text-2xl font-black text-white mb-5">Những quan niệm sai lầm</h2>
                    <div className="flex flex-col gap-3">
                        {MYTHS.map((m) => (
                            <div key={m.myth} className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden"
                                style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                                <div className="p-5 flex gap-3" style={{ background: 'rgba(239,68,68,0.05)' }}>
                                    <span className="text-red-400 flex-shrink-0">✗</span>
                                    <p className="text-[13px] font-semibold text-gray-300">{m.myth}</p>
                                </div>
                                <div className="p-5 flex gap-3" style={{ background: 'rgba(16,185,129,0.04)' }}>
                                    <span className="text-emerald-400 flex-shrink-0">✓</span>
                                    <p className="text-[13px] text-gray-300 leading-relaxed">{m.truth}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative z-10 px-4 pb-28 max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-black text-white mb-4">Đồng hành cùng sứ mệnh</h2>
                <p className="text-gray-400 mb-8 text-[15px]">Dù là đối tác, khách hàng hay tình nguyện viên — chúng tôi chào đón bạn.</p>
                <Link href="/lien-he"
                    className="inline-flex items-center gap-3 px-8 py-4 font-extrabold rounded-full transition-all hover:-translate-y-0.5 text-[15px]"
                    style={{ background: '#00D2FF', color: '#030812', boxShadow: '0 4px 24px rgba(0,210,255,0.3)' }}>
                    Liên hệ chúng tôi
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </Link>
            </section>
        </div>
    );
}
