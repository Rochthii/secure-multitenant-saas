import React from 'react';
import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { KhmerPatternBg } from '@/components/ui/khmer-pattern-bg';

export const dynamic = 'force-static';

export const metadata: Metadata = {
    title: 'Bản Sắc Văn Hoá | Multi-tenant Ecosystem',
    description: 'Tìm hiểu bản sắc Phật giáo Nam Tông Khmer: sự khác biệt với Bắc Tông, vai trò của chi nhánh, ngôn ngữ Pali-Khmer, kiến trúc, trang phục và lễ hội truyền thống.',
};

export default function KhmerIdentityPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <div className="relative py-16 lg:py-24 bg-coffee-dark overflow-hidden">
                <KhmerPatternBg />
                <div className="container mx-auto px-4 max-w-4xl relative z-10">
                    <Link href="/van-hoa" className="inline-flex items-center text-gold-light/70 hover:text-gold-light mb-6 transition-colors text-sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Văn Hoá
                    </Link>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-playfair font-bold text-gold-light mb-4">
                        Bản Sắc Phật Giáo Nam Tông Khmer
                    </h1>
                    <p className="text-gray-300 text-base lg:text-lg max-w-2xl leading-relaxed">
                        Hiểu về truyền thống, ngôn ngữ, kiến trúc, trang phục và lễ hội —
                        những giá trị tạo nên linh hồn của ngôi chi nhánh Khmer.
                    </p>
                </div>
            </div>

            {/* Table of Contents */}
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm py-3 hidden lg:block">
                <div className="container mx-auto px-4 flex justify-center gap-6 text-sm">
                    <a href="#nam-tong-bac-tong" className="text-gray-600 hover:text-gold-primary font-medium transition-colors">Nam Tông & Bắc Tông</a>
                    <a href="#vai-tro-chua" className="text-gray-600 hover:text-gold-primary font-medium transition-colors">Vai trò của chi nhánh</a>
                    <a href="#ngon-ngu" className="text-gray-600 hover:text-gold-primary font-medium transition-colors">Ngôn ngữ</a>
                    <a href="#trang-phuc" className="text-gray-600 hover:text-gold-primary font-medium transition-colors">Trang phục</a>
                    <a href="#kien-truc" className="text-gray-600 hover:text-gold-primary font-medium transition-colors">Kiến trúc</a>
                    <a href="#le-hoi" className="text-gray-600 hover:text-gold-primary font-medium transition-colors">Lễ hội</a>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 max-w-4xl py-12 lg:py-16">

                {/* Section 1: Nam Tông vs Bắc Tông */}
                <section id="nam-tong-bac-tong" className="mb-16 scroll-mt-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gold-primary/10 text-gold-primary font-bold text-lg">1</div>
                        <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-coffee-dark">
                            Phật Giáo Nam Tông Khmer & Bắc Tông — Khác Nhau Thế Nào?
                        </h2>
                    </div>

                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 mb-8">
                        <p className="text-gray-700 leading-relaxed">
                            Phật giáo tại Việt Nam có nhiều truyền thống song hành. Hai nhánh lớn nhất là
                            <strong> Phật giáo Bắc Tông</strong> (Đại thừa — Mahāyāna, phổ biến ở miền Bắc và Trung)
                            và <strong>Phật giáo Nam Tông</strong> (Theravāda — Thượng toạ bộ, phổ biến trong cộng đồng
                            Khmer Nam Bộ). Cả hai đều bắt nguồn từ giáo lý Đức Phật Thích Ca, nhưng có nhiều
                            khác biệt về thực hành và truyền thống.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-coffee-dark text-white">
                                    <th className="text-left p-3 font-semibold rounded-tl-lg">Tiêu chí</th>
                                    <th className="text-left p-3 font-semibold">Nam Tông Khmer (Theravāda)</th>
                                    <th className="text-left p-3 font-semibold rounded-tr-lg">Bắc Tông (Mahāyāna)</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                <tr className="border-b border-gray-100">
                                    <td className="p-3 font-medium bg-gray-50">Kinh điển</td>
                                    <td className="p-3">Tam Tạng Pali (Tipiṭaka) — ghi bằng tiếng Pali, được xem là gần nhất với lời Phật dạy nguyên thuỷ</td>
                                    <td className="p-3">Kinh điển Đại thừa (Hoa Nghiêm, Pháp Hoa, Bát Nhã...) — ghi bằng chữ Hán hoặc Sanskrit</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="p-3 font-medium bg-gray-50">Mục tiêu tu tập</td>
                                    <td className="p-3">Đạt quả vị A-la-hán (Arahant) — giải thoát bản thân khỏi luân hồi</td>
                                    <td className="p-3">Đạt quả vị Phật (Bồ-tát đạo) — cứu độ tất cả chúng sinh</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="p-3 font-medium bg-gray-50">Chư Tăng</td>
                                    <td className="p-3">Chỉ có Tăng (bhikkhu), giữ 227 giới, mặc y vàng cam. Không có ni giới chính thức tại Campuchia/VN</td>
                                    <td className="p-3">Có cả tăng và ni, số giới khác nhau tuỳ truyền thống</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="p-3 font-medium bg-gray-50">Khất thực</td>
                                    <td className="p-3">Duy trì truyền thống khất thực (bintabaht) — sư đi bát vào buổi sáng</td>
                                    <td className="p-3">Phần lớn không khất thực, chi nhánh tự nấu ăn</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="p-3 font-medium bg-gray-50">Bữa ăn</td>
                                    <td className="p-3">Chỉ ăn trước ngọ (trước 12h trưa), không ăn tối</td>
                                    <td className="p-3">Ăn chay (một số nơi), không giới hạn giờ ăn</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="p-3 font-medium bg-gray-50">Thờ cúng</td>
                                    <td className="p-3">Chỉ thờ Đức Phật Thích Ca. Không thờ Bồ-tát, không đốt vàng mã</td>
                                    <td className="p-3">Thờ Phật, Bồ-tát (Quan Âm, Di Đà...), có vàng mã ở một vài nơi</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="p-3 font-medium bg-gray-50">Ngôn ngữ kinh</td>
                                    <td className="p-3">Tiếng Pali</td>
                                    <td className="p-3">Tiếng Hán Việt (hoặc Phạn ngữ)</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium bg-gray-50 rounded-bl-lg">Nghi lễ đặc trưng</td>
                                    <td className="p-3">Bạt nước hồi hướng, dâng cơm bát, tụng kinh Pali, lễ dâng y (Kaṭhina)</td>
                                    <td className="p-3 rounded-br-lg">Tụng kinh Hoa Nghiêm, niệm Phật A-di-đà, chuông mõ</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-coffee-dark/5 rounded-xl p-5 border border-coffee-dark/10 mt-6">
                        <h4 className="font-semibold text-coffee-dark mb-2">💡 Ghi chú quan trọng</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            Cả Nam Tông và Bắc Tông đều là Phật giáo chính thống, không có truyền thống nào
                            &quot;đúng hơn&quot; hay &quot;sai&quot;. Sự khác biệt chủ yếu nằm ở phương pháp thực hành và
                            truyền thống văn hoá. Khi đến chi nhánh Khmer, chỉ cần nhận biết những khác biệt
                            này để ứng xử cho phù hợp.
                        </p>
                    </div>
                </section>

                {/* Section 2: Vai trò của chi nhánh */}
                <section id="vai-tro-chua" className="mb-16 scroll-mt-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gold-primary/10 text-gold-primary font-bold text-lg">2</div>
                        <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-coffee-dark">
                            Vai Trò Của Chi nhánh Trong Cộng Đồng Khmer
                        </h2>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-6">
                        Với người Khmer, chi nhánh (វត្ត — vôt/wat) không chỉ là nơi thờ Phật.
                        Chi nhánh là <strong>trung tâm đời sống</strong> của cả cộng đồng — nơi mọi hoạt
                        động quan trọng từ sinh ra đến qua đời đều gắn liền.
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4 mb-8">
                        {[
                            {
                                title: 'Trung tâm tâm linh',
                                desc: 'Nơi thờ Phật, tụng kinh, hành thiền, nơi chư Tăng tu tập và hoằng pháp. Mọi nghi lễ quan trọng trong đời người Khmer đều diễn ra tại chi nhánh.',
                                icon: '🙏',
                            },
                            {
                                title: 'Trung tâm giáo dục',
                                desc: 'Từ xa xưa, chi nhánh Khmer là trường học duy nhất của cộng đồng. Sư dạy chữ Khmer, dạy tiếng Pali, dạy đạo đức, dạy nghề. Truyền thống này vẫn được giữ gìn.',
                                icon: '📚',
                            },
                            {
                                title: 'Trung tâm văn hoá',
                                desc: 'Nơi bảo tồn ngôn ngữ, chữ viết, nhạc cụ truyền thống, nghệ thuật điêu khắc, tranh vẽ Phật tích. Chi nhánh là "bảo tàng sống" của văn hoá Khmer.',
                                icon: '🎨',
                            },
                            {
                                title: 'Trung tâm cộng đồng',
                                desc: 'Nơi người Khmer xa xứ gặp gỡ, giúp đỡ nhau, tổ chức lễ hội, đám cưới, tang lễ. Chi nhánh là "ngôi nhà chung" kết nối cộng đồng.',
                                icon: '🏘️',
                            },
                            {
                                title: 'Nơi tu tập của thanh niên',
                                desc: 'Trong truyền thống Khmer, mỗi nam thanh niên được khuyến khích xuất gia ít nhất một lần trong đời (thường vài tháng đến vài năm) để báo hiếu cha mẹ và rèn luyện đạo đức. Đây không phải tu trọn đời mà là giai đoạn trưởng thành.',
                                icon: '🧘',
                            },
                            {
                                title: 'Nơi bảo trợ xã hội',
                                desc: 'Chi nhánh tiếp nhận trẻ mồ côi, người nghèo, người già neo đơn. Nhiều chi nhánh Khmer vừa là nơi tu tập vừa là trung tâm từ thiện cho cộng đồng.',
                                icon: '❤️',
                            },
                        ].map((item, index) => (
                            <div key={index} className="border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="text-2xl mb-2">{item.icon}</div>
                                <h3 className="font-semibold text-coffee-dark mb-2">{item.title}</h3>
                                <p className="text-gray-700 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5">
                        <p className="text-gray-700 text-sm leading-relaxed italic">
                            &quot;Người Khmer có câu: &#39;Không có chi nhánh thì không có phum srok&#39; (phum srok = làng xóm).
                            Chi nhánh không chỉ là toà nhà — chi nhánh là linh hồn của cộng đồng, là nơi giữ cho
                            người Khmer luôn nhớ mình là ai, dù sống ở đâu.&quot;
                        </p>
                    </div>
                </section>

                {/* Section 3: Ngôn ngữ */}
                <section id="ngon-ngu" className="mb-16 scroll-mt-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gold-primary/10 text-gold-primary font-bold text-lg">3</div>
                        <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-coffee-dark">
                            Ngôn Ngữ: Pali & Khmer
                        </h2>
                    </div>

                    <div className="space-y-6">
                        <div className="border border-gray-100 rounded-xl p-6 shadow-sm">
                            <h3 className="text-xl font-semibold text-coffee-dark mb-3">Tiếng Pali — Ngôn ngữ thiêng liêng</h3>
                            <p className="text-gray-700 leading-relaxed mb-3">
                                Pali (Pāḷi) là ngôn ngữ mà Tam Tạng kinh điển Theravada được ghi chép.
                                Mặc dù không phải là ngôn ngữ giao tiếp hàng ngày, Pali giữ vai trò thiêng liêng
                                trong sinh hoạt chi nhánh: tất cả bài kinh, lời chúc phúc, câu nguyện đều được
                                tụng bằng tiếng Pali.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-coffee-dark mb-2">Một số câu Pali thường nghe trong chi nhánh:</h4>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li><strong>&quot;Namo Tassa Bhagavato Arahato Sammāsambuddhassa&quot;</strong> — Con xin kính lễ Đức Thế Tôn, bậc A-la-hán, bậc Chánh Đẳng Giác (câu mở đầu mọi buổi tụng kinh)</li>
                                    <li><strong>&quot;Buddhaṃ saraṇaṃ gacchāmi&quot;</strong> — Con xin quy y Phật</li>
                                    <li><strong>&quot;Dhammaṃ saraṇaṃ gacchāmi&quot;</strong> — Con xin quy y Pháp</li>
                                    <li><strong>&quot;Saṅghaṃ saraṇaṃ gacchāmi&quot;</strong> — Con xin quy y Tăng</li>
                                    <li><strong>&quot;Sādhu! Sādhu! Sādhu!&quot;</strong> — Lành thay! (lời tuỳ hỷ, thường nói sau khi nghe kinh hoặc phước lành)</li>
                                </ul>
                            </div>
                        </div>

                        <div className="border border-gray-100 rounded-xl p-6 shadow-sm">
                            <h3 className="text-xl font-semibold text-coffee-dark mb-3">Tiếng Khmer — Ngôn ngữ cộng đồng</h3>
                            <p className="text-gray-700 leading-relaxed mb-3">
                                Tiếng Khmer (ភាសាខ្មែរ) là ngôn ngữ giao tiếp hàng ngày trong chi nhánh và cộng
                                đồng Khmer. Chư Tăng thường giảng pháp bằng tiếng
                                Khmer (và tiếng Việt cho Nhân sự không nói tiếng Khmer).
                                Bảng chữ Khmer (អក្សរខ្មែរ) có nguồn gốc từ chữ Brāhmi của Ấn Độ,
                                là một trong những hệ chữ viết cổ nhất Đông Nam Á.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-coffee-dark mb-2">Một số từ Khmer thường gặp ở chi nhánh:</h4>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li><strong>វត្ត (Vôt/Wat)</strong> — Chi nhánh</li>
                                    <li><strong>លោកសង្ឃ (Lok Sông)</strong> — Cách gọi kính trọng với chư Tăng</li>
                                    <li><strong>សាលា (Sala)</strong> — Nhà hội, chánh điện</li>
                                    <li><strong>កុដិ (Kuti)</strong> — Tăng xá, nơi ở của sư</li>
                                    <li><strong>ស្តូប (Stupa)</strong> — Bảo tháp</li>
                                    <li><strong>ក្រោចទឹក (Kroch tek)</strong> — Nghi thức rót nước hồi hướng</li>
                                    <li><strong>បុណ្យ (Bon)</strong> — Lễ, phước báu</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Trang phục truyền thống */}
                <section id="trang-phuc" className="mb-16 scroll-mt-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gold-primary/10 text-gold-primary font-bold text-lg">4</div>
                        <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-coffee-dark">
                            Trang Phục Truyền Thống
                        </h2>
                    </div>

                    <div className="space-y-6">
                        <div className="border border-gray-100 rounded-xl p-6 shadow-sm">
                            <h3 className="text-xl font-semibold text-coffee-dark mb-3">Y phục chư Tăng</h3>
                            <p className="text-gray-700 leading-relaxed mb-3">
                                Chư Tăng Theravada mặc <strong>tam y</strong> (ticīvara) — bộ y phục ba phần theo
                                đúng quy định trong Luật tạng (Vinaya Piṭaka):
                            </p>
                            <ul className="space-y-2 text-gray-700 text-sm">
                                <li>• <strong>Antaravāsaka (y hạ)</strong> — tấm vải quấn phần dưới, từ eo đến đầu gối.</li>
                                <li>• <strong>Uttarāsaṅga (y trung)</strong> — tấm vải choàng phần trên, quấn qua vai trái, để hở vai phải.</li>
                                <li>• <strong>Saṅghāṭi (y kép)</strong> — tấm y lớn, gấp lại, thường dùng khi lạnh hoặc trong các buổi lễ trang nghiêm.</li>
                            </ul>
                            <p className="text-gray-700 text-sm mt-3">
                                Màu y phổ biến trong truyền thống Khmer là <strong>vàng cam</strong> hoặc <strong>vàng nghệ</strong> —
                                được nhuộm từ gốc cây jackfruit hoặc nghệ theo truyền thống. Ngày nay, y thường được nhuộm sẵn
                                nhưng vẫn giữ tông màu truyền thống.
                            </p>
                        </div>

                        <div className="border border-gray-100 rounded-xl p-6 shadow-sm">
                            <h3 className="text-xl font-semibold text-coffee-dark mb-3">Trang phục cư sĩ khi đi lễ</h3>
                            <div className="space-y-3 text-gray-700 text-sm">
                                <p>
                                    <strong>Nam giới:</strong> Áo trắng (sơ mi hoặc áo cổ tròn), quần tối màu hoặc
                                    <strong> sampot</strong> (សំពត់ — sà rông truyền thống Khmer). Sampot được quấn
                                    quanh hông, thả dài đến mắt cá chân, là trang phục mà đàn ông Khmer mặc khi
                                    đi lễ chi nhánh từ xa xưa.
                                </p>
                                <p>
                                    <strong>Nữ giới:</strong> Áo trắng kín đáo, sampot tối màu hoặc váy dài.
                                    Đặc biệt, nhiều phụ nữ Khmer quàng <strong>sbai</strong> (ស្បៃ — khăn choàng)
                                    qua vai trái — tấm vải dài, thường màu trắng hoặc sáng, thể hiện sự trang
                                    nghiêm và nữ tính.
                                </p>
                                <p>
                                    <strong>Dịp đặc biệt:</strong> Trong lễ Chôl Chnăm Thmây (Năm mới), phụ nữ
                                    và nam giới Khmer thường mặc trang phục truyền thống rực rỡ hơn — sampot
                                    lụa thêu, áo dài Khmer (av hol) — vì đây là dịp vui, không phải nghi lễ
                                    tụng kinh trang nghiêm.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 5: Kiến trúc */}
                <section id="kien-truc" className="mb-16 scroll-mt-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gold-primary/10 text-gold-primary font-bold text-lg">5</div>
                        <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-coffee-dark">
                            Kiến Trúc Chi nhánh Khmer
                        </h2>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-6">
                        Kiến trúc chi nhánh Khmer Theravada có những đặc điểm riêng biệt, phản ánh vũ trụ quan
                        Phật giáo và thẩm mỹ truyền thống Khmer. Mỗi chi tiết kiến trúc đều mang ý nghĩa
                        tôn giáo và văn hoá sâu sắc.
                    </p>

                    <div className="space-y-6">
                        {[
                            {
                                title: 'Chánh điện (ព្រះវិហារ — Preah Vihear)',
                                desc: 'Là toà nhà trung tâm, nơi đặt tượng Phật chính và diễn ra các buổi lễ. Chánh điện chi nhánh Khmer thường hướng Đông — hướng mặt trời mọc, tượng trưng cho ánh sáng giác ngộ. Mái nhọn nhiều tầng, thường 3 tầng, tượng trưng cho Tam Bảo. Trên đỉnh mái là tháp nhọn (prean) hoặc hình Naga.',
                            },
                            {
                                title: 'Sala (សាលា — Nhà hội)',
                                desc: 'Nhà đa năng bên cạnh chánh điện, dùng cho các buổi sinh hoạt cộng đồng, lễ thanh toán, ăn cơm, hội họp. Sala thường rộng, trống trải, không có vách ngăn, thể hiện tinh thần cởi mở của cộng đồng.',
                            },
                            {
                                title: 'Naga (នាគ — Rồng/Rắn thần)',
                                desc: 'Lan can cầu thang, mái chi nhánh thường có hình Naga — rắn thần bảo hộ Phật pháp. Theo truyền thuyết Phật giáo, Naga vương Mucalinda đã dùng thân che mưa cho Đức Phật lúc Ngài thiền định. Naga trong chi nhánh Khmer thường có 5 hoặc 7 đầu.',
                            },
                            {
                                title: 'Bảo tháp (ស្តូប — Stupa)',
                                desc: 'Tháp hình nón hoặc hình chuông, nơi lưu giữ xá lợi (remain) hoặc di cốt của các vị sư đức hạnh. Nhân sự đi nhiễu quanh bảo tháp (theo chiều kim đồng hồ) để tỏ lòng tôn kính.',
                            },
                            {
                                title: 'Tranh tường & Điêu khắc',
                                desc: 'Tường chánh điện thường được vẽ hoặc chạm khắc các cảnh từ Phật tích (Jātaka) — 547 câu chuyện tiền thân Đức Phật, hoặc cuộc đời Đức Phật Thích Ca từ lúc đản sinh đến nhập Niết-bàn. Các bức tranh khắc nổi kể lại hành trình tu tập của Đức Phật là di sản nghệ thuật quý giá.',
                            },
                            {
                                title: 'Cổng chi nhánh (ទ្វារ — Door/Gate)',
                                desc: 'Cổng chi nhánh Khmer thường được trang trí công phu với hình Devata (chư thiên), hoa văn thực vật, và mái cong dạng tiara. Cổng tượng trưng cho ranh giới giữa thế giới phàm tục bên ngoài và không gian thiêng liêng bên trong.',
                            },
                        ].map((item, index) => (
                            <div key={index} className="border border-gray-100 rounded-xl p-5 shadow-sm">
                                <h3 className="text-lg font-semibold text-coffee-dark mb-2">{item.title}</h3>
                                <p className="text-gray-700 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 6: Lễ hội */}
                <section id="le-hoi" className="mb-16 scroll-mt-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gold-primary/10 text-gold-primary font-bold text-lg">6</div>
                        <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-coffee-dark">
                            Các Lễ Hội Lớn
                        </h2>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-6">
                        Lễ hội Khmer luôn gắn liền với chi nhánh. Đây không chỉ là dịp vui chơi mà còn là
                        thời điểm cộng đồng hướng về Tam Bảo, thực hành bố thí, giữ giới, và nhớ về
                        tổ tiên. Dưới đây là các lễ hội quan trọng nhất.
                    </p>

                    <div className="space-y-6">
                        {[
                            {
                                name: 'Chôl Chnăm Thmây (ចូលឆ្នាំថ្មី) — Năm Mới Khmer',
                                time: 'Tháng 4 dương lịch (13-16 tháng 4)',
                                meaning: 'Đây là lễ hội lớn nhất trong năm của người Khmer, đánh dấu sự chuyển giao giữa năm cũ và năm mới theo lịch Phật giáo Khmer. Tương đương Tết Nguyên Đán của người Việt hay Songkran của người Thái.',
                                activities: [
                                    'Lễ tắm Phật — rưới nước thơm lên tượng Phật để thanh tịnh và đón mừng năm mới.',
                                    'Đắp núi cát — mỗi hạt cát tượng trưng cho một sinh mạng được giải thoát.',
                                    'Thanh toán thực phẩm cho chư Tăng.',
                                    'Tụng kinh cầu an, hồi hướng phước cho tổ tiên.',
                                    'Các trò chơi dân gian Khmer, múa truyền thống.',
                                ],
                            },
                            {
                                name: 'Visak Bochea (វិសាខបូជា) — Đại Lễ Tam Hợp',
                                time: 'Rằm tháng 4 âm lịch Khmer (tháng 5 dương lịch)',
                                meaning: 'Kỷ niệm ba sự kiện trọng đại trong cuộc đời Đức Phật đều xảy ra vào ngày trăng tròn tháng Vesak: Đản sinh (sinh ra), Thành đạo (giác ngộ dưới cội Bồ-đề), và Nhập Niết-bàn (viên tịch). Đây là ngày lễ quan trọng nhất của Phật giáo Theravada trên toàn thế giới, được UNESCO công nhận.',
                                activities: [
                                    'Lễ tụng kinh suốt đêm.',
                                    'Đi nhiễu quanh chánh điện với nhang, nến, hoa (3 vòng = Tam Bảo).',
                                    'Nhân sự phát nguyện giữ Bát quan trai giới (Uposatha sīla — 8 giới).',
                                    'Thuyết pháp về cuộc đời Đức Phật.',
                                ],
                            },
                            {
                                name: 'Phchum Bân (ភ្ជុំបិណ្ឌ) — Lễ Cúng Ông Bà',
                                time: '15 ngày cuối tháng 10 âm lịch Khmer (tháng 9-10 dương lịch)',
                                meaning: 'Lễ hội kéo dài 15 ngày, tương tự Vu Lan (Bắc Tông) nhưng có nghi thức riêng. Người Khmer tin rằng trong thời gian này, linh hồn tổ tiên được phép trở về từ các cõi khác. Con cháu thanh toán thức ăn, dâng phước cho người đã khuất thông qua chư Tăng.',
                                activities: [
                                    'Mỗi ngày, Nhân sự từ một "gia đình trực" mang cơm và thức ăn đến chi nhánh thanh toán cho chư Tăng lúc sáng sớm.',
                                    'Chư Tăng tụng kinh hồi hướng phước cho người đã mất.',
                                    'Ngày cuối cùng (Phchum Bân) là ngày lễ chính, toàn cộng đồng tập trung tại chi nhánh.',
                                    'Nghi thức "bạt nước" hồi hướng phước đặc biệt trang nghiêm.',
                                ],
                            },
                            {
                                name: 'Kaṭhina (កឋិន) — Lễ Dâng Y',
                                time: 'Tháng 10-11 âm lịch Khmer (sau mùa an cư kiết hạ — Vassa)',
                                meaning: 'Sau 3 tháng an cư (Vassa — mùa mưa, chư Tăng ở cố định trong chi nhánh tu tập), Nhân sự tổ chức lễ dâng y (vải may y) cho chư Tăng. Đây là một trong những hạnh bố thí lớn nhất trong Phật giáo Theravada — mỗi chi nhánh chỉ được nhận Kaṭhina 1 lần/năm.',
                                activities: [
                                    'Nhân sự chuẩn bị vải may y và các vật phẩm thanh toán.',
                                    'Lễ rước y từ nhà Nhân sự đến chi nhánh.',
                                    'Chư Tăng tụng kinh chấp nhận y và ban phước.',
                                    'Bữa tiệc cộng đồng sau lễ dâng y.',
                                ],
                            },
                            {
                                name: 'Ngày Sīla (សីល) — Ngày Giữ Giới',
                                time: 'Bốn ngày trong tháng theo lịch âm: mùng 8, rằm 15, 23, 30 (hoặc 29)',
                                meaning: 'Nhân sự đến chi nhánh giữ Bát quan trai giới (8 giới) từ sáng đến sáng hôm sau. Đây là ngày tu tập tích cực — ăn chay trước ngọ, không giải trí, không trang điểm, ngủ trên sàn cứng, tụng kinh và thiền định cùng chư Tăng.',
                                activities: [
                                    'Nhân sự mặc đồ trắng đến chi nhánh từ sáng sớm.',
                                    'Thọ giới từ chư Tăng.',
                                    'Tụng kinh, nghe pháp, thiền định suốt ngày.',
                                    'Ăn trước ngọ, sau đó chỉ dùng nước.',
                                ],
                            },
                        ].map((festival, index) => (
                            <div key={index} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-coffee-dark/5 px-5 py-4 border-b border-gray-100">
                                    <h3 className="text-lg font-semibold text-coffee-dark">{festival.name}</h3>
                                    <p className="text-sm text-gold-primary mt-1">📅 {festival.time}</p>
                                </div>
                                <div className="p-5 space-y-3">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Ý nghĩa:</h4>
                                        <p className="text-gray-700 text-sm leading-relaxed">{festival.meaning}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Hoạt động chính:</h4>
                                        <ul className="space-y-1 text-gray-700 text-sm">
                                            {festival.activities.map((activity, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-gold-primary mt-0.5">▸</span>
                                                    <span>{activity}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Navigation */}
                <div className="border-t border-gray-100 pt-8">
                    <h3 className="text-lg font-semibold text-coffee-dark mb-4">Đọc thêm</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Link href="/van-hoa/nghi-le-co-ban" className="group flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gold-primary/5 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gold-primary/10 flex items-center justify-center text-gold-primary group-hover:bg-gold-primary group-hover:text-white transition-colors">
                                →
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">Nghi Lễ Cơ Bản</p>
                                <p className="text-sm text-gray-500">Cách thắp nhang, lễ Phật, dâng vật phẩm</p>
                            </div>
                        </Link>
                        <Link href="/van-hoa/nen-va-khong-nen" className="group flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gold-primary/5 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gold-primary/10 flex items-center justify-center text-gold-primary group-hover:bg-gold-primary group-hover:text-white transition-colors">
                                →
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">Nên & Không Nên</p>
                                <p className="text-sm text-gray-500">Hướng dẫn nhanh, dễ nhớ</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
