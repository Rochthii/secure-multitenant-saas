import React from 'react';
import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { KhmerPatternBg } from '@/components/ui/khmer-pattern-bg';

export const dynamic = 'force-static';

export const metadata: Metadata = {
    title: 'Điều Nên Làm & Không Nên | Multi-tenant Ecosystem',
    description: 'Tổng hợp nhanh những điều nên làm và không nên khi đến chi nhánh Phật giáo Nam Tông Khmer, kèm lý do văn hoá – tâm linh rõ ràng. Dễ nhớ, dễ áp dụng.',
};

const dosItems = [
    {
        action: 'Mặc trang phục kín đáo, gọn gàng',
        reason: 'Thể hiện sự tôn kính đối với Tam Bảo và không gian tu tập. Trong truyền thống Theravada, trang phục kín đáo là cách người cư sĩ bày tỏ lòng tôn trọng bậc xuất gia và nơi thờ Phật.',
    },
    {
        action: 'Tháo giày dép trước khi vào chánh điện',
        reason: 'Quy tắc chung ở tất cả chi nhánh Theravada trên thế giới. Giày dép mang bụi bẩn từ bên ngoài, tháo ra thể hiện sự thanh tịnh khi bước vào không gian thiêng liêng.',
    },
    {
        action: 'Chắp tay cúi đầu khi gặp chư Tăng',
        reason: 'Đây là cách chào kính trọng (añjalī) trong Phật giáo Theravada, tương tự cách bạn bắt tay để chào trong văn hoá phương Tây. Thể hiện sự kính trọng bậc tu hành.',
    },
    {
        action: 'Ngồi xếp bằng hoặc quỳ trong chánh điện',
        reason: 'Tư thế ngồi thấp thể hiện sự khiêm nhường trước Tam Bảo. Quỳ hoặc xếp bằng cũng là tư thế truyền thống khi tụng kinh và thiền định.',
    },
    {
        action: 'Giữ yên lặng hoặc nói nhỏ',
        reason: 'Chi nhánh là không gian tu tập — sự yên lặng giúp chư Tăng và Nhân sự tập trung thiền định, tụng kinh. Tiếng ồn phá vỡ sự tĩnh lặng cần thiết cho việc tu tập.',
    },
    {
        action: 'Tắt hoặc chuyển điện thoại sang im lặng',
        reason: 'Tiếng chuông điện thoại giữa buổi tụng kinh hoặc thuyết pháp gây mất tập trung cho mọi người. Đây là phép lịch sự cơ bản, tương tự khi vào rạp hát hoặc phòng họp.',
    },
    {
        action: 'Thanh toán bằng tâm hoan hỷ',
        reason: 'Dāna (bố thí) là hạnh đầu tiên trong ba-la-mật. Thanh toán với tâm vui vẻ, không miễn cưỡng, không so bì — dù ít hay nhiều đều tạo phước đức.',
    },
    {
        action: 'Lạy 3 lạy khi vào và khi rời chánh điện',
        reason: 'Ba lạy tương ứng Tam Quy Y — quy y Phật, Pháp, Tăng. Đây là nghi thức đơn giản nhất thể hiện lòng kính trọng, ai cũng có thể thực hiện.',
    },
    {
        action: 'Xin phép trước khi chụp ảnh chư Tăng hoặc trong chánh điện',
        reason: 'Thể hiện sự tôn trọng đối với con người và không gian. Một số vị sư có thể từ chối vì lý do tu tập — xin phép trước tránh gây phiền.',
    },
    {
        action: 'Nhường đường cho chư Tăng và người lớn tuổi',
        reason: 'Trong văn hoá Khmer và Phật giáo, kính trọng người lớn tuổi và bậc tu hành là đạo đức căn bản. Đây cũng là cách thực hành hạnh nhẫn nại và khiêm nhường.',
    },
    {
        action: 'Đi nhiễu (đi vòng quanh) bảo tháp hoặc chánh điện theo chiều kim đồng hồ',
        reason: 'Chiều kim đồng hồ (hướng phải) tượng trưng cho sự thuận theo Chánh Pháp. Đây là truyền thống Phật giáo có từ thời Đức Phật, khi các đệ tử đi nhiễu quanh Ngài để tỏ lòng tôn kính.',
    },
    {
        action: 'Nếu có thắc mắc, hỏi ban quản trị hoặc Nhân sự trong chi nhánh',
        reason: 'Mọi người trong chi nhánh đều sẵn lòng giúp đỡ. Hỏi thể hiện sự cầu thị và tôn trọng — tốt hơn là tự ý hành động không đúng.',
    },
];

const dontsItems = [
    {
        action: 'Cười đùa lớn tiếng trong chánh điện',
        reason: 'Chánh điện là không gian tương đương thiền đường — nơi yên tĩnh để tu tập. Tiếng cười đùa lớn phá vỡ sự tĩnh lặng và có thể gây mất tập trung cho người đang tụng kinh hoặc thiền định.',
    },
    {
        action: 'Tự ý vào khu tăng xá (nơi ở của chư Tăng)',
        reason: 'Tăng xá (kuti) là không gian riêng tư và thanh tịnh của chư Tăng theo giới luật Vinaya. Người ngoài vào có thể gây phiền và vi phạm sự thanh tịnh cần thiết cho việc tu tập.',
    },
    {
        action: 'Hút thuốc, uống rượu bia trong khuôn viên chi nhánh',
        reason: 'Giới thứ 5 trong Ngũ Giới (Pañca Sīla) của Phật giáo là tránh sử dụng chất gây say. Chi nhánh là nơi mọi người đang thực hành giới luật — dùng chất kích thích ở đây là thiếu tôn trọng.',
    },
    {
        action: 'Ngồi duỗi chân về phía tượng Phật hoặc chư Tăng',
        reason: 'Trong văn hoá Khmer và Phật giáo Theravada, bàn chân là phần thấp nhất của cơ thể. Hướng bàn chân về phía đối tượng tôn kính (tượng Phật, chư Tăng, bảo tháp) là bất kính.',
    },
    {
        action: 'Phụ nữ chạm vào thân thể chư Tăng',
        reason: 'Đây là giới luật Vinaya nghiêm ngặt — chư Tăng giữ giới thanh tịnh, bất kỳ sự tiếp xúc thân thể với nữ giới đều có thể vi phạm giới. Khi dâng vật phẩm, nữ giới đặt lên tấm vải hoặc bàn.',
    },
    {
        action: 'Chỉ tay hoặc dùng chân chỉ về phía tượng Phật',
        reason: 'Ngón tay chỉ và bàn chân đều mang nghĩa bất kính trong văn hoá Phật giáo. Nếu cần chỉ, dùng cả bàn tay phải hoặc cả hai tay.',
    },
    {
        action: 'Đốt vàng mã, giấy tiền',
        reason: 'Phật giáo Nam Tông Theravada KHÔNG có tục đốt vàng mã — đây là tín ngưỡng dân gian, không phải giáo lý Phật giáo. Thanh toán bằng hoa, nhang, nến, nước, thực phẩm.',
    },
    {
        action: 'Cầu xin tượng Phật ban phước, cho may mắn, trúng số',
        reason: 'Đức Phật trong Theravada là bậc đã nhập Niết-bàn, không phải thần linh ban phước. Lễ Phật là để tưởng nhớ giáo pháp và phát nguyện tu tập, không phải van xin. Phước đến từ hành động thiện lành (kamma) của chính mình.',
    },
    {
        action: 'Xoa đầu tượng Phật hoặc sờ vào vật thờ',
        reason: 'Tượng Phật là biểu trưng thiêng liêng, không phải vật trang trí hay bùa may mắn. Sờ chạm tuỳ tiện thể hiện sự thiếu hiểu biết và tôn trọng.',
    },
    {
        action: 'Đứng cao hơn chư Tăng khi nói chuyện',
        reason: 'Nếu sư ngồi trên sàn, người cư sĩ nên ngồi xuống hoặc quỳ — không đứng từ trên nhìn xuống. Đây là cách thể hiện sự kính trọng trong Vinaya đối với bậc xuất gia.',
    },
    {
        action: 'Mang thức ăn vào chánh điện hoặc ăn uống trong chánh điện',
        reason: 'Chánh điện dành riêng cho lễ bái và tu tập. Thức ăn được dùng ở Sala (nhà hội) hoặc khu vực ăn uống riêng.',
    },
    {
        action: 'Dâng thức ăn cho chư Tăng vào buổi chiều hoặc tối',
        reason: 'Chư Tăng Theravada tuân thủ giới không ăn sau ngọ (quá ngọ bất thực — sau 12h trưa). Thanh toán thức ăn nên vào buổi sáng, trước 11h là tốt nhất.',
    },
    {
        action: 'Tạo dáng phản cảm khi chụp ảnh trước tượng Phật',
        reason: 'Tượng Phật là biểu tượng tôn giáo thiêng liêng đối với hàng trăm triệu Nhân sự trên thế giới. Tạo dáng thiếu trang nghiêm trước tượng Phật thể hiện sự thiếu tôn trọng với niềm tin tôn giáo của người khác.',
    },
    {
        action: 'Livestream hoặc quay video không xin phép',
        reason: 'Chi nhánh là không gian tu tập, không phải nơi công cộng. Livestream có thể vô tình ghi hình người không muốn, hoặc ghi lại các nghi lễ thiêng liêng một cách không phù hợp.',
    },
];

export default function DosAndDontsPage() {
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
                        Nên Làm & Không Nên Khi Đến Chi nhánh
                    </h1>
                    <p className="text-gray-300 text-base lg:text-lg max-w-2xl leading-relaxed">
                        Tổng hợp nhanh, dễ nhớ — mỗi điều đều kèm lý do văn hoá và tâm linh cụ thể,
                        không chỉ &quot;cấm&quot; mà giúp bạn hiểu &quot;vì sao&quot;.
                    </p>
                </div>
            </div>

            {/* Quick Jump */}
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm py-3">
                <div className="container mx-auto px-4 flex justify-center gap-4">
                    <a href="#nen-lam" className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium hover:bg-green-100 transition-colors">
                        <span>✓</span> Nên làm
                    </a>
                    <a href="#khong-nen" className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium hover:bg-red-100 transition-colors">
                        <span>✗</span> Không nên
                    </a>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 max-w-4xl py-12 lg:py-16">

                {/* Lời dẫn */}
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-6 mb-12">
                    <p className="text-gray-700 leading-relaxed">
                        Trang này tổng hợp những hướng dẫn quan trọng nhất khi đến chi nhánh Phật giáo Nam
                        Tông Khmer. Mỗi mục đều có giải thích lý do — không phải &quot;luật lệ&quot; cứng nhắc,
                        mà là cách giúp bạn cư xử phù hợp với văn hoá và truyền thống nơi đây.
                    </p>
                    <p className="text-gray-600 text-sm mt-3 italic">
                        Nếu bạn lỡ quên một điều nào đó, đừng lo — điều quan trọng nhất là thái độ tôn
                        kính và sự sẵn lòng học hỏi.
                    </p>
                </div>

                {/* NÊN LÀM */}
                <section id="nen-lam" className="mb-16 scroll-mt-20">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-xl">
                            ✓
                        </div>
                        <div>
                            <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-coffee-dark">
                                Nên Làm
                            </h2>
                            <p className="text-green-600 text-sm font-medium">{dosItems.length} điều nên thực hiện</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {dosItems.map((item, index) => (
                            <div key={index} className="border border-green-100 rounded-xl overflow-hidden hover:border-green-200 transition-colors">
                                <div className="flex items-start gap-3 p-5">
                                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600 font-bold text-sm flex-shrink-0 mt-0.5">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 mb-2">{item.action}</p>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            <span className="text-green-600 font-medium">Lý do:</span> {item.reason}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Divider */}
                <div className="flex items-center gap-4 my-12">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <div className="text-gray-400 text-sm font-medium">❖</div>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* KHÔNG NÊN */}
                <section id="khong-nen" className="mb-16 scroll-mt-20">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100 text-red-500 text-xl">
                            ✗
                        </div>
                        <div>
                            <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-coffee-dark">
                                Không Nên
                            </h2>
                            <p className="text-red-500 text-sm font-medium">{dontsItems.length} điều nên tránh</p>
                        </div>
                    </div>

                    <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 mb-6">
                        <p className="text-gray-700 text-sm">
                            ⚠️ Những điều dưới đây không nhằm phán xét hay ra lệnh. Chúng tôi giải thích lý do
                            để bạn hiểu — khi hiểu rồi, ứng xử đúng trở nên tự nhiên.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {dontsItems.map((item, index) => (
                            <div key={index} className="border border-red-100 rounded-xl overflow-hidden hover:border-red-200 transition-colors">
                                <div className="flex items-start gap-3 p-5">
                                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-500 font-bold text-sm flex-shrink-0 mt-0.5">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 mb-2">{item.action}</p>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            <span className="text-red-500 font-medium">Vì sao:</span> {item.reason}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Summary card */}
                <div className="bg-gradient-to-br from-coffee-dark to-coffee-DEFAULT rounded-2xl p-6 lg:p-8 text-white mb-12">
                    <h3 className="text-xl lg:text-2xl font-playfair font-bold text-gold-light mb-4">
                        Tóm Lại — Chỉ Cần Nhớ 3 Điều
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                        <div className="bg-white/10 rounded-xl p-4 text-center">
                            <div className="text-3xl mb-2">👔</div>
                            <p className="font-medium text-gold-light text-sm">Trang phục kín đáo</p>
                            <p className="text-gray-300 text-xs mt-1">Che vai, qua gối</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4 text-center">
                            <div className="text-3xl mb-2">🤫</div>
                            <p className="font-medium text-gold-light text-sm">Giữ yên lặng</p>
                            <p className="text-gray-300 text-xs mt-1">Nói nhỏ, tắt chuông</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4 text-center">
                            <div className="text-3xl mb-2">🙏</div>
                            <p className="font-medium text-gold-light text-sm">Tôn kính</p>
                            <p className="text-gray-300 text-xs mt-1">Chắp tay, cúi đầu</p>
                        </div>
                    </div>
                    <p className="text-gray-300 text-sm mt-4 text-center">
                        Phần còn lại — bạn sẽ học được khi ở chi nhánh. Mọi người luôn sẵn lòng giúp đỡ.
                    </p>
                </div>

                {/* Print-friendly version note */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-12">
                    <h4 className="font-semibold text-coffee-dark mb-2">📄 Phiên bản in</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        Nội dung trang này có thể được in ra dạng bảng nội quy để treo tại chi nhánh hoặc
                        phát cho khách thập phương. Nếu cần bản in chính thức, vui lòng liên hệ ban
                        quản trị chi nhánh.
                    </p>
                </div>

                {/* Navigation */}
                <div className="border-t border-gray-100 pt-8">
                    <h3 className="text-lg font-semibold text-coffee-dark mb-4">Đọc thêm</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Link href="/gioi-thieu/noi-quy-tu-vien" className="group flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gold-primary/5 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gold-primary/10 flex items-center justify-center text-gold-primary group-hover:bg-gold-primary group-hover:text-white transition-colors">
                                →
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">Nội Quy Tự Viện</p>
                                <p className="text-sm text-gray-500">Hướng dẫn chi tiết từng tình huống</p>
                            </div>
                        </Link>
                        <Link href="/van-hoa/ban-sac-khmer" className="group flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gold-primary/5 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gold-primary/10 flex items-center justify-center text-gold-primary group-hover:bg-gold-primary group-hover:text-white transition-colors">
                                →
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">Bản Sắc Khmer</p>
                                <p className="text-sm text-gray-500">Truyền thống, kiến trúc, lễ hội</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
