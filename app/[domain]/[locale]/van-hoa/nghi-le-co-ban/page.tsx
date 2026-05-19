import React from 'react';
import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { KhmerPatternBg } from '@/components/ui/khmer-pattern-bg';

export const dynamic = 'force-static';

export const metadata: Metadata = {
    title: 'Nghi Lễ Cơ Bản | Multi-tenant Ecosystem',
    description: 'Hướng dẫn nghi lễ cơ bản: cách thắp nhang, lễ Phật, dâng bông, dâng nước, tham dự tụng kinh tại chi nhánh Phật giáo Nam Tông Khmer. Dành cho người lần đầu đến chi nhánh.',
};

export default function BasicRitualsPage() {
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
                        Nghi Lễ Cơ Bản Trong Chi nhánh Khmer
                    </h1>
                    <p className="text-gray-300 text-base lg:text-lg max-w-2xl leading-relaxed">
                        Hướng dẫn từng bước cho người lần đầu đến chi nhánh — từ cách thắp nhang, lễ Phật,
                        đến tham dự buổi tụng kinh.
                    </p>
                </div>
            </div>

            {/* Table of Contents */}
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm py-3 hidden lg:block">
                <div className="container mx-auto px-4 flex justify-center gap-6 text-sm">
                    <a href="#thap-nhang" className="text-gray-600 hover:text-gold-primary font-medium transition-colors">Thắp nhang</a>
                    <a href="#le-phat" className="text-gray-600 hover:text-gold-primary font-medium transition-colors">Lễ Phật</a>
                    <a href="#dang-vat-pham" className="text-gray-600 hover:text-gold-primary font-medium transition-colors">Dâng vật phẩm</a>
                    <a href="#tung-kinh" className="text-gray-600 hover:text-gold-primary font-medium transition-colors">Tụng kinh</a>
                    <a href="#loi-thuong-gap" className="text-gray-600 hover:text-gold-primary font-medium transition-colors">Lỗi thường gặp</a>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 max-w-4xl py-12 lg:py-16">

                {/* Lời dẫn */}
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-6 mb-12">
                    <p className="text-gray-700 leading-relaxed">
                        Nếu bạn chưa từng đến chi nhánh Khmer, đừng lo lắng. Nghi lễ trong chi nhánh Phật giáo
                        Nam Tông đơn giản và mang ý nghĩa rõ ràng. Mỗi hành động đều hướng về ba đối tượng
                        tôn kính: <strong>Phật</strong> (bậc giác ngộ), <strong>Pháp</strong> (giáo lý),
                        và <strong>Tăng</strong> (cộng đồng tu sĩ) — gọi chung là <strong>Tam Bảo</strong>
                        (Tiratana / ត្រៃរ័ត្ន).
                    </p>
                </div>

                {/* Section 1: Thắp nhang */}
                <section id="thap-nhang" className="mb-16 scroll-mt-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gold-primary/10 text-gold-primary font-bold text-lg">1</div>
                        <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-coffee-dark">
                            Cách Thắp Nhang (Thắp Hương)
                        </h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold text-coffee-dark mb-3">Ý nghĩa</h3>
                            <p className="text-gray-700 leading-relaxed">
                                Trong Phật giáo Theravada, nhang (dhūpa) tượng trưng cho <strong>giới hạnh</strong> (sīla)
                                — hương thơm từ nhang lan toả khắp nơi, giống như người giữ giới thanh tịnh thì
                                đức hạnh toả khắp mọi hướng. Đức Phật dạy: <em>&quot;Hương của giới hạnh bay ngược gió&quot;</em>
                                (Dhammapada, kệ 54) — nghĩa là đức hạnh tốt đẹp lan xa hơn bất kỳ mùi hương vật chất nào.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-coffee-dark mb-3">Số lượng nhang</h3>
                            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                                <ul className="space-y-3 text-gray-700">
                                    <li className="flex items-start gap-3">
                                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gold-primary/10 text-gold-primary font-bold text-sm flex-shrink-0">3</span>
                                        <div>
                                            <strong>3 cây nhang</strong> — phổ biến nhất, tượng trưng cho Tam Bảo:
                                            Phật (Buddha), Pháp (Dhamma), Tăng (Saṅgha). Đây là cách thắp nhang
                                            tiêu chuẩn trong hầu hết mọi dịp.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gold-primary/10 text-gold-primary font-bold text-sm flex-shrink-0">5</span>
                                        <div>
                                            <strong>5 cây nhang</strong> — trong một số dịp lễ, tượng trưng cho
                                            Ngũ Giới (Pañca Sīla) hoặc Năm ân đức của Đức Phật.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gold-primary/10 text-gold-primary font-bold text-sm flex-shrink-0">1</span>
                                        <div>
                                            <strong>1 cây nhang</strong> — cũng được chấp nhận, tượng trưng cho
                                            sự chuyên nhất hướng về Đức Phật. Quan trọng là tâm thành, không phải số lượng.
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-coffee-dark mb-3">Các bước thắp nhang</h3>
                            <div className="space-y-3">
                                {[
                                    'Lấy nhang từ hộp nhang (thường đặt gần bàn thờ hoặc lối vào chánh điện).',
                                    'Châm lửa, đợi nhang cháy đều rồi phẩy nhẹ cho tắt ngọn lửa — chỉ để khói toả.',
                                    'Đứng hoặc quỳ trước tượng Phật, hai tay cầm nhang ngang trán, chắp tay lại.',
                                    'Thầm nguyện hoặc niệm: "Namo Tassa Bhagavato Arahato Sammāsambuddhassa" (Con xin kính lễ Đức Thế Tôn, bậc A-la-hán, bậc Chánh Đẳng Giác). Niệm 3 lần.',
                                    'Cắm nhang vào bát nhang (lư hương) một cách nhẹ nhàng. Nếu 3 cây, cắm thẳng hàng hoặc thành hình tam giác nhỏ.',
                                    'Lùi lại một bước, chắp tay xá một lần.',
                                ].map((step, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gold-primary text-white text-sm font-bold flex-shrink-0">{index + 1}</span>
                                        <span className="text-gray-700">{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-coffee-dark/5 rounded-xl p-5 border border-coffee-dark/10">
                            <h4 className="font-semibold text-coffee-dark mb-2">💡 Ghi chú</h4>
                            <ul className="space-y-1 text-gray-700 text-sm">
                                <li>• Nhang trong chi nhánh Khmer thường là nhang thẳng (không phải nhang vòng như chi nhánh Bắc Tông).</li>
                                <li>• Nếu bát nhang đã đầy, có thể đặt nhang gọn vào khoảng trống hoặc hỏi người trong chi nhánh.</li>
                                <li>• Không cần thắp quá nhiều nhang — một tâm thành kính quan trọng hơn số lượng.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Section 2: Lễ Phật */}
                <section id="le-phat" className="mb-16 scroll-mt-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gold-primary/10 text-gold-primary font-bold text-lg">2</div>
                        <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-coffee-dark">
                            Cách Lễ Phật (Cách Lạy)
                        </h2>
                    </div>

                    <div className="space-y-6">
                        <p className="text-gray-700 leading-relaxed">
                            Lễ Phật (vandanā) trong Phật giáo Nam Tông khác với cách lạy trong Bắc Tông.
                            Đây là cách bày tỏ lòng tôn kính Tam Bảo, không phải cầu xin điều gì.
                            Người lạy thể hiện sự khiêm nhường và lòng biết ơn đối với Đức Phật,
                            giáo pháp, và Tăng đoàn.
                        </p>

                        <div>
                            <h3 className="text-xl font-semibold text-coffee-dark mb-3">Lạy theo truyền thống Khmer Theravada</h3>
                            <p className="text-gray-600 mb-4">
                                Thông thường lạy <strong>3 lạy</strong>, mỗi lạy tương ứng với một trong Tam Bảo:
                            </p>
                            <div className="space-y-3">
                                {[
                                    { step: 'Quỳ xuống', detail: 'Ngồi quỳ trên hai gót chân, hai đầu gối chạm sàn. Lưng thẳng, mặt hướng về tượng Phật.' },
                                    { step: 'Chắp tay (Añjalī)', detail: 'Hai lòng bàn tay úp vào nhau, các ngón tay hướng lên, đặt ngang ngực. Đây là ấn chào kính trọng.' },
                                    { step: 'Đưa tay lên trán', detail: 'Nâng hai tay chắp lên ngang trán — tượng trưng cho sự tôn kính bằng thân, khẩu, ý.' },
                                    { step: 'Cúi xuống lạy', detail: 'Hạ người xuống, hai lòng bàn tay úp xuống đặt trên sàn, trán chạm hoặc gần chạm hai bàn tay. Hai khuỷu tay đặt sát hai đầu gối. Đây gọi là "ngũ thể đầu địa" — năm điểm chạm đất (trán, hai tay, hai đầu gối).' },
                                    { step: 'Ngẩng lên', detail: 'Ngồi thẳng lại, chắp tay ngang ngực. Lặp lại 3 lần.' },
                                ].map((item, index) => (
                                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                        <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gold-primary text-white text-sm font-bold flex-shrink-0">{index + 1}</span>
                                        <div>
                                            <span className="font-medium text-coffee-dark">{item.step}: </span>
                                            <span className="text-gray-700">{item.detail}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5">
                            <h4 className="font-semibold text-coffee-dark mb-2">Ý nghĩa 3 lạy</h4>
                            <ul className="space-y-2 text-gray-700">
                                <li><strong>Lạy thứ 1:</strong> Kính lễ Đức Phật (Buddhaṃ saraṇaṃ gacchāmi — Con xin quy y Phật)</li>
                                <li><strong>Lạy thứ 2:</strong> Kính lễ Giáo Pháp (Dhammaṃ saraṇaṃ gacchāmi — Con xin quy y Pháp)</li>
                                <li><strong>Lạy thứ 3:</strong> Kính lễ Tăng Đoàn (Saṅghaṃ saraṇaṃ gacchāmi — Con xin quy y Tăng)</li>
                            </ul>
                        </div>

                        <div className="bg-coffee-dark/5 rounded-xl p-5 border border-coffee-dark/10">
                            <h4 className="font-semibold text-coffee-dark mb-2">💡 Nếu bạn chưa quen</h4>
                            <ul className="space-y-1 text-gray-700 text-sm">
                                <li>• Nếu không biết cách lạy, chỉ cần chắp tay cúi đầu — đó đã là đủ trang nghiêm.</li>
                                <li>• Có thể quan sát người xung quanh và làm theo.</li>
                                <li>• Không ai đánh giá bạn lạy đúng hay chưa — điều quan trọng là tâm thành kính.</li>
                                <li>• Nếu sức khoẻ không cho phép quỳ, ngồi trên ghế và chắp tay cúi đầu là phù hợp.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Section 3: Dâng vật phẩm */}
                <section id="dang-vat-pham" className="mb-16 scroll-mt-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gold-primary/10 text-gold-primary font-bold text-lg">3</div>
                        <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-coffee-dark">
                            Dâng Bông, Dâng Nước & Dâng Vật Phẩm
                        </h2>
                    </div>

                    <div className="space-y-8">
                        {/* Dâng hoa */}
                        <div className="border border-gray-100 rounded-xl p-6 shadow-sm">
                            <h3 className="text-xl font-semibold text-coffee-dark mb-3 flex items-center gap-2">
                                🌸 Dâng hoa (Puppha pūjā)
                            </h3>
                            <div className="space-y-3 text-gray-700">
                                <p>
                                    <strong>Ý nghĩa:</strong> Hoa tượng trưng cho sự vô thường — hoa tươi rồi sẽ héo,
                                    nhắc nhở chúng ta về bản chất không bền vững của mọi sự vật. Dâng hoa là cách
                                    quán chiếu giáo lý vô thường (anicca) của Đức Phật.
                                </p>
                                <p>
                                    <strong>Loại hoa:</strong> Hoa sen (biểu tượng của sự giác ngộ — mọc từ bùn nhưng không nhiễm bùn),
                                    hoa nhài, hoa cúc, hoa đại (sứ) là những loại hoa thường được dùng.
                                    Tránh hoa có gai nhọn hoặc hoa giả.
                                </p>
                                <p>
                                    <strong>Cách dâng:</strong> Đặt hoa nhẹ nhàng trên bàn thờ hoặc trong bình hoa trước tượng Phật.
                                    Chắp tay, cúi đầu. Không ném hoa hoặc đặt tuỳ tiện.
                                </p>
                            </div>
                        </div>

                        {/* Dâng nước */}
                        <div className="border border-gray-100 rounded-xl p-6 shadow-sm">
                            <h3 className="text-xl font-semibold text-coffee-dark mb-3 flex items-center gap-2">
                                💧 Dâng nước (Udaka pūjā)
                            </h3>
                            <div className="space-y-3 text-gray-700">
                                <p>
                                    <strong>Ý nghĩa:</strong> Nước trong tượng trưng cho tâm thanh tịnh, không vẩn đục.
                                    Trong truyền thống Khmer, nước cũng liên quan đến nghi thức <strong>hồi hướng phước</strong>
                                    (pattidāna) — rót nước từ bình ra chén nhỏ, tượng trưng cho việc chia sẻ phước
                                    đức đến tất cả chúng sinh.
                                </p>
                                <p>
                                    <strong>Cách dâng:</strong> Dùng nước sạch, đổ vào ly hoặc chén nhỏ trên bàn thờ.
                                    Trong các buổi lễ, khi chư Tăng tụng kinh hồi hướng, Nhân sự sẽ rót nước
                                    từ từ vào chén — gọi là <strong>&quot;bạt nước&quot;</strong> hay <strong>&quot;kroch tek&quot;</strong> (ក្រោចទឹក) — đây là nghi thức đặc trưng
                                    của Phật giáo Theravada Khmer.
                                </p>
                            </div>
                        </div>

                        {/* Dâng vật phẩm khác */}
                        <div className="border border-gray-100 rounded-xl p-6 shadow-sm">
                            <h3 className="text-xl font-semibold text-coffee-dark mb-3 flex items-center gap-2">
                                🎁 Dâng vật phẩm khác (Dāna)
                            </h3>
                            <div className="space-y-3 text-gray-700">
                                <p>
                                    <strong>Dāna (bố thí)</strong> là hạnh đầu tiên trong mười ba-la-mật (pāramī) của Phật giáo.
                                    Người cư sĩ thanh toán vật phẩm cho chi nhánh và chư Tăng không phải để &quot;mua phước&quot;,
                                    mà để thực hành hạnh buông xả, giảm bớt sự dính mắc vào vật chất.
                                </p>
                                <div className="bg-gray-50 rounded-lg p-4 mt-3">
                                    <h4 className="font-medium text-coffee-dark mb-2">Vật phẩm thường thanh toán:</h4>
                                    <ul className="space-y-1 text-sm">
                                        <li>• <strong>Thực phẩm</strong> — cơm, thức ăn chín, trái cây, nước uống (dâng trước ngọ — 12h trưa, vì chư Tăng Theravada không ăn sau ngọ)</li>
                                        <li>• <strong>Tứ vật dụng</strong> — y phục (vải may y), thuốc men, vật dụng sinh hoạt</li>
                                        <li>• <strong>Nến (đèn cầy)</strong> — tượng trưng cho trí tuệ soi sáng vô minh</li>
                                        <li>• <strong>Tiền thanh toán</strong> — giúp chi nhánh duy trì hoạt động và tu bổ cơ sở</li>
                                    </ul>
                                </div>
                                <div className="mt-3">
                                    <h4 className="font-medium text-coffee-dark mb-2">Cách dâng cho chư Tăng:</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li>• <strong>Nam giới:</strong> Quỳ hoặc ngồi, hai tay dâng vật phẩm ngang ngực, trao trực tiếp cho sư.</li>
                                        <li>• <strong>Nữ giới:</strong> Đặt vật phẩm lên tấm vải trải (sabong) mà sư đặt ra, hoặc đặt lên bàn. Không trao trực tiếp vào tay sư — đây là giới luật Vinaya, không phải sự phân biệt.</li>
                                        <li>• Sau khi dâng, chắp tay, cúi đầu, và lắng nghe sư tụng kinh ban phước (anumodanā).</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Tham dự tụng kinh */}
                <section id="tung-kinh" className="mb-16 scroll-mt-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gold-primary/10 text-gold-primary font-bold text-lg">4</div>
                        <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-coffee-dark">
                            Tham Dự Buổi Tụng Kinh
                        </h2>
                    </div>

                    <div className="space-y-6">
                        <p className="text-gray-700 leading-relaxed">
                            Trong chi nhánh Khmer, buổi tụng kinh (sūtra chanting) được thực hiện bằng <strong>tiếng Pali</strong>
                            — ngôn ngữ ghi chép Tam Tạng kinh điển (Tipiṭaka) của Phật giáo Theravada.
                            Không cần hiểu hết tiếng Pali để tham dự — nhiều Nhân sự ngồi lắng nghe với
                            tâm an tịnh, đó đã là một hình thức thực hành.
                        </p>

                        <div>
                            <h3 className="text-xl font-semibold text-coffee-dark mb-3">Các buổi tụng kinh thường nhật</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                                    <h4 className="font-semibold text-coffee-dark mb-2">🌅 Buổi sáng</h4>
                                    <p className="text-gray-700 text-sm">Tụng kinh sáng (thường 5:00 – 6:00). Nội dung chính: kinh Tam Quy Y, kinh chúc phúc, kinh hồi hướng.</p>
                                </div>
                                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                                    <h4 className="font-semibold text-coffee-dark mb-2">🌙 Buổi tối</h4>
                                    <p className="text-gray-700 text-sm">Tụng kinh tối (thường 18:00 – 19:00). Nội dung: kinh niệm Phật, kinh Từ Bi (Metta Sutta), thiền định.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-coffee-dark mb-3">Hướng dẫn khi tham dự</h3>
                            <div className="space-y-3">
                                {[
                                    'Đến trước giờ tụng kinh 5–10 phút để ổn định chỗ ngồi.',
                                    'Ngồi trên sàn, xếp bằng hoặc quỳ, mặt hướng về tượng Phật. Chư Tăng ngồi phía trước, Nhân sự ngồi phía sau.',
                                    'Khi bắt đầu, chắp tay và lạy 3 lạy cùng mọi người.',
                                    'Trong lúc chư Tăng tụng kinh Pali, bạn có thể: chắp tay lắng nghe, tụng theo (nếu biết), hoặc ngồi yên với tâm an tĩnh.',
                                    'Khi có phần "bạt nước" (hồi hướng phước), nếu có dụng cụ, rót nước từ từ vào chén nhỏ theo lời dẫn.',
                                    'Kết thúc buổi tụng kinh, lạy 3 lạy, chắp tay nói "Sādhu! Sādhu! Sādhu!" (Lành thay! Lành thay! Lành thay!) — đây là cách tuỳ hỷ, đồng ý với phước lành.',
                                ].map((step, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gold-primary text-white text-sm font-bold flex-shrink-0">{index + 1}</span>
                                        <span className="text-gray-700 text-sm">{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-coffee-dark/5 rounded-xl p-5 border border-coffee-dark/10">
                            <h4 className="font-semibold text-coffee-dark mb-2">💡 Về buổi tụng kinh đặc biệt</h4>
                            <p className="text-gray-700 text-sm leading-relaxed">
                                Trong các dịp lễ lớn (Visak Bochea, ngày Sīla — giữ giới, Phchum Bân...),
                                buổi tụng kinh dài hơn và có thêm các nghi thức đặc biệt. Nếu bạn tham dự
                                lần đầu, cứ ngồi yên lắng nghe và quan sát — không ai bắt bạn phải biết hết.
                                Sự có mặt của bạn đã là một hình thức kính trọng.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 5: Lỗi thường gặp */}
                <section id="loi-thuong-gap" className="mb-16 scroll-mt-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gold-primary/10 text-gold-primary font-bold text-lg">5</div>
                        <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-coffee-dark">
                            Những Lỗi Thường Gặp Của Người Mới
                        </h2>
                    </div>

                    <p className="text-gray-600 mb-6">
                        Ai cũng có lần đầu tiên. Đây là những nhầm lẫn thường gặp — hoàn toàn bình thường
                        và không ai phiền trách. Biết trước để tránh, nhưng nếu lỡ mắc cũng không sao.
                    </p>

                    <div className="space-y-4">
                        {[
                            {
                                mistake: 'Lạy theo kiểu Bắc Tông (đứng lạy, hoặc lạy theo nhịp chuông mõ)',
                                correct: 'Trong chi nhánh Khmer, luôn quỳ khi lạy, lạy 3 lạy theo Tam Bảo. Không có chuông mõ trong nghi lễ Theravada.',
                            },
                            {
                                mistake: 'Cúng vàng mã, đốt giấy tiền vàng bạc',
                                correct: 'Phật giáo Nam Tông không có tục đốt vàng mã. Đây là tín ngưỡng dân gian, không thuộc giáo lý Theravada. Thanh toán bằng hoa, nến, nhang, thực phẩm, và nước.',
                            },
                            {
                                mistake: 'Gọi sư là "thầy chi nhánh" hoặc "ông sư"',
                                correct: 'Gọi bằng "Sư", "Thầy", "Lok Sông" (លោកសង្ឃ). Cách gọi tôn kính thể hiện sự hiểu biết về truyền thống Phật giáo.',
                            },
                            {
                                mistake: 'Dâng thức ăn cho sư vào buổi chiều/tối',
                                correct: 'Chư Tăng Theravada chỉ ăn trước ngọ (trước 12h trưa). Sau 12h, sư chỉ dùng nước, trà, hoặc thuốc. Thanh toán thức ăn nên vào buổi sáng.',
                            },
                            {
                                mistake: 'Cầu xin tượng Phật ban phước, cho may mắn, trúng số...',
                                correct: 'Trong Phật giáo Theravada, Đức Phật là bậc đã nhập Niết-bàn, không phải thần linh ban phước. Lễ Phật là để tưởng nhớ giáo pháp, không phải cầu xin. Phước đến từ hành động thiện lành (kamma) của chính mình.',
                            },
                            {
                                mistake: 'Tự ý thỉnh tượng Phật, lấy vật phẩm trên bàn thờ',
                                correct: 'Mọi vật phẩm trên bàn thờ đều đã được thanh toán. Nếu muốn thỉnh tượng hoặc lấy vật gì, hãy hỏi ban quản trị chi nhánh.',
                            },
                        ].map((item, index) => (
                            <div key={index} className="border border-gray-100 rounded-xl overflow-hidden">
                                <div className="bg-red-50 px-5 py-3 border-b border-red-100">
                                    <p className="text-red-800 font-medium text-sm flex items-start gap-2">
                                        <span className="text-red-500">✗</span>
                                        {item.mistake}
                                    </p>
                                </div>
                                <div className="bg-green-50 px-5 py-3">
                                    <p className="text-green-800 text-sm flex items-start gap-2">
                                        <span className="text-green-600">✓</span>
                                        {item.correct}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

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
                                <p className="text-sm text-gray-500">Trang phục, đi đứng, gặp chư Tăng</p>
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
