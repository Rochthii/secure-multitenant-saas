import React from 'react';
import { Link } from '@/i18n/routing';
import { KhmerPatternBg } from '@/components/ui/khmer-pattern-bg';

export default function EtiquetteContent() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <div className="relative py-16 lg:py-24 bg-coffee-dark overflow-hidden">
                <KhmerPatternBg />
                <div className="container mx-auto px-4 max-w-4xl relative z-10">
                    <Link href="/gioi-thieu" className="inline-flex items-center text-gold-light/70 hover:text-gold-light mb-6 transition-colors text-sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Giới Thiệu
                    </Link>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-playfair font-bold text-gold-light mb-4">
                        Nội Quy Tự Viện
                    </h1>
                    <p className="text-gray-300 text-base lg:text-lg max-w-2xl leading-relaxed">
                        Những hướng dẫn giúp bạn cư xử phù hợp khi bước vào không gian thiêng liêng
                        của ngôi chi nhánh Khmer — không phải luật lệ, mà là cách thể hiện lòng tôn kính.
                    </p>
                </div>
            </div>

            {/* Table of Contents */}
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm py-3 hidden lg:block">
                <div className="container mx-auto px-4 flex justify-center gap-6 text-sm">
                    <a href="#trang-phuc" className="text-gray-600 hover:text-gold-primary font-medium transition-colors">Trang phục</a>
                    <a href="#di-dung-ngoi" className="text-gray-600 hover:text-gold-primary font-medium transition-colors">Đi – Đứng – Ngồi</a>
                    <a href="#gap-chu-tang" className="text-gray-600 hover:text-gold-primary font-medium transition-colors">Gặp chư Tăng</a>
                    <a href="#hanh-vi-nen-tranh" className="text-gray-600 hover:text-gold-primary font-medium transition-colors">Hành vi nên tránh</a>
                    <a href="#chua-dong-nguoi" className="text-gray-600 hover:text-gold-primary font-medium transition-colors">Khi chi nhánh đông</a>
                    <a href="#chup-anh" className="text-gray-600 hover:text-gold-primary font-medium transition-colors">Chụp ảnh & Quay video</a>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 max-w-4xl py-12 lg:py-16">

                {/* Section 1: Trang phục */}
                <section id="trang-phuc" className="mb-16 scroll-mt-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gold-primary/10 text-gold-primary font-bold text-lg">1</div>
                        <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-coffee-dark">
                            Trang Phục Khi Vào Chi nhánh
                        </h2>
                    </div>

                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 mb-8">
                        <p className="text-gray-700 leading-relaxed">
                            Trong Phật giáo Nam Tông, trang phục kín đáo thể hiện sự tôn kính đối với Tam Bảo
                            (Phật – Pháp – Tăng) và sự trang nghiêm của không gian tu tập. Đây không phải quy
                            định cứng nhắc mà là truyền thống văn hoá đã được gìn giữ qua nhiều thế hệ.
                        </p>
                    </div>

                    {/* Nam giới */}
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-coffee-dark mb-4 flex items-center gap-2">
                            <span className="text-gold-primary">●</span> Nam giới
                        </h3>
                        <div className="space-y-4 pl-6">
                            <div>
                                <h4 className="font-medium text-gray-800 mb-2">Ngày thường</h4>
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-1">✓</span>
                                        <span>Áo có tay (áo sơ mi, áo thun có cổ, áo dài tay). Nên chọn màu trắng hoặc màu nhạt, trang nhã.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-1">✓</span>
                                        <span>Quần dài — quần tây, quần kaki, hoặc quần vải dài qua đầu gối.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 mt-1">✗</span>
                                        <span>Tránh áo ba lỗ, áo sát nách, quần đùi, dép lê. Trang phục quá thoải mái dễ gây mất trang nghiêm trong chánh điện.</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800 mb-2">Ngày lễ lớn (Visak Bochea, Chôl Chnăm Thmây, Phchum Bân...)</h4>
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-1">✓</span>
                                        <span>Nên mặc <strong>áo trắng</strong> — trong truyền thống Theravada, màu trắng tượng trưng cho sự thanh tịnh của người cư sĩ lúc thọ giới.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-1">✓</span>
                                        <span>Quần tây tối màu hoặc sà rông (sampot) truyền thống nếu có.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Nữ giới */}
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-coffee-dark mb-4 flex items-center gap-2">
                            <span className="text-gold-primary">●</span> Nữ giới
                        </h3>
                        <div className="space-y-4 pl-6">
                            <div>
                                <h4 className="font-medium text-gray-800 mb-2">Ngày thường</h4>
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-1">✓</span>
                                        <span>Áo có tay, kín cổ, che vai — áo dài, áo bà ba, áo kiểu kín đáo.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-1">✓</span>
                                        <span>Váy dài hoặc quần dài. Nếu mặc váy, nên qua đầu gối.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 mt-1">✗</span>
                                        <span>Tránh áo hở vai, áo dây, váy ngắn, quần short. Trong truyền thống Khmer, phụ nữ ăn mặc kín đáo khi đến chi nhánh thể hiện sự kính trọng đối với nơi tu tập của chư Tăng.</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800 mb-2">Ngày lễ lớn</h4>
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-1">✓</span>
                                        <span>Nên mặc <strong>áo trắng</strong>, váy hoặc sà rông (sampot) tối màu — đây là trang phục truyền thống của nữ cư sĩ Khmer khi đi lễ chi nhánh.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-1">✓</span>
                                        <span>Có thể quàng khăn trắng (sbai) qua vai trái — đây là nét đẹp truyền thống Khmer, không bắt buộc nhưng rất được trân trọng.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Thanh thiếu niên */}
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-coffee-dark mb-4 flex items-center gap-2">
                            <span className="text-gold-primary">●</span> Thanh thiếu niên
                        </h3>
                        <div className="pl-6">
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-1">✓</span>
                                    <span>Áp dụng nguyên tắc tương tự người lớn: áo có tay, quần/váy dài.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-1">✓</span>
                                    <span>Nếu từ trường học đến, đồng phục học sinh được chấp nhận.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-600 mt-1">⚬</span>
                                    <span>Nếu bạn trẻ chưa có trang phục phù hợp, chi nhánh luôn sẵn lòng đón tiếp — điều quan trọng nhất là thái độ tôn kính, không phải bộ quần áo.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Lưu ý chung */}
                    <div className="bg-coffee-dark/5 rounded-xl p-5 border border-coffee-dark/10">
                        <h4 className="font-semibold text-coffee-dark mb-3">💡 Lưu ý chung về trang phục</h4>
                        <ul className="space-y-2 text-gray-700 text-sm">
                            <li>• Tháo giày dép trước khi bước vào chánh điện (sala) — đây là quy tắc chung ở tất cả chi nhánh Theravada trên thế giới.</li>
                            <li>• Tháo mũ và kính râm khi vào bên trong chánh điện.</li>
                            <li>• Không nên xức nước hoa nồng — hương thơm trong chánh điện nên đến từ nhang và hoa cúng Phật.</li>
                            <li>• Nếu bạn đến chi nhánh bất ngờ và chưa kịp chuẩn bị trang phục phù hợp, hãy yên tâm — sự thành kính trong lòng quan trọng hơn hình thức bên ngoài.</li>
                        </ul>
                    </div>
                </section>

                {/* Section 2: Đi – Đứng – Ngồi */}
                <section id="di-dung-ngoi" className="mb-16 scroll-mt-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gold-primary/10 text-gold-primary font-bold text-lg">2</div>
                        <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-coffee-dark">
                            Cách Đi – Đứng – Ngồi – Nói Chuyện
                        </h2>
                    </div>

                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 mb-8">
                        <p className="text-gray-700 leading-relaxed">
                            Trong không gian chi nhánh, mọi hành động đều nên thể hiện sự chánh niệm — tức là ý thức
                            về từng cử chỉ của mình. Đây cũng là một hình thức thực hành Phật pháp trong đời sống hàng ngày.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xl font-semibold text-coffee-dark mb-3">Cách đi trong chi nhánh</h3>
                            <ul className="space-y-3 text-gray-700 pl-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-gold-primary mt-1">▸</span>
                                    <span>Đi nhẹ nhàng, chậm rãi. Không chạy nhảy trong khuôn viên chi nhánh, đặc biệt gần chánh điện.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-gold-primary mt-1">▸</span>
                                    <span>Khi đi ngang qua tượng Phật hoặc chư Tăng đang ngồi, nên cúi đầu nhẹ thể hiện sự tôn kính. Không nên đi ngang trước mặt người đang lạy Phật.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-gold-primary mt-1">▸</span>
                                    <span>Trong truyền thống Theravada, khi đi nhiễu (đi vòng quanh chánh điện hoặc bảo tháp trong dịp lễ), luôn đi theo chiều kim đồng hồ (hướng phải) — tượng trưng cho sự thuận theo Chánh Pháp.</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-coffee-dark mb-3">Cách đứng</h3>
                            <ul className="space-y-3 text-gray-700 pl-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-gold-primary mt-1">▸</span>
                                    <span>Không đứng cao hơn chư Tăng — nếu sư ngồi trên sàn, người cư sĩ nên ngồi xuống hoặc quỳ khi nói chuyện. Đây là cách thể hiện sự kính trọng bậc xuất gia trong Vinaya (Luật tạng).</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-gold-primary mt-1">▸</span>
                                    <span>Không đứng chắn lối đi, đặc biệt khi đông người. Nhường đường cho chư Tăng và người lớn tuổi.</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-coffee-dark mb-3">Cách ngồi trong chánh điện</h3>
                            <ul className="space-y-3 text-gray-700 pl-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-gold-primary mt-1">▸</span>
                                    <span><strong>Ngồi xếp bằng</strong> (kiết già hoặc bán già) hoặc <strong>ngồi quỳ</strong> là tư thế phổ biến nhất.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-gold-primary mt-1">▸</span>
                                    <span><strong>Không ngồi duỗi chân về phía tượng Phật hay chư Tăng</strong> — trong văn hoá Khmer và Phật giáo Theravada, bàn chân được xem là phần thấp nhất của cơ thể, hướng về phía tôn kính là điều bất kính.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-gold-primary mt-1">▸</span>
                                    <span>Nếu bạn có vấn đề về sức khoẻ hoặc không quen ngồi sàn, có thể ngồi ghế (nếu có) — không ai phán xét việc này.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-gold-primary mt-1">▸</span>
                                    <span>Không ngồi trên bệ thờ, bục giảng pháp, hoặc chỗ ngồi dành riêng cho chư Tăng.</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-coffee-dark mb-3">Nói chuyện trong chi nhánh</h3>
                            <ul className="space-y-3 text-gray-700 pl-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-gold-primary mt-1">▸</span>
                                    <span>Nói nhỏ, từ tốn. Chánh điện là nơi trang nghiêm, giữ yên lặng hoặc chỉ nói khe khẽ khi cần thiết.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-gold-primary mt-1">▸</span>
                                    <span>Tắt hoặc chuyển điện thoại sang chế độ im lặng trước khi vào chánh điện.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-gold-primary mt-1">▸</span>
                                    <span>Không bàn chuyện thế tục, không tranh luận. Nếu cần trao đổi, hãy ra sân hoặc khu vực ngoài chánh điện.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Section 3: Gặp chư Tăng */}
                <section id="gap-chu-tang" className="mb-16 scroll-mt-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gold-primary/10 text-gold-primary font-bold text-lg">3</div>
                        <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-coffee-dark">
                            Thái Độ Khi Gặp Chư Tăng
                        </h2>
                    </div>

                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 mb-8">
                        <p className="text-gray-700 leading-relaxed">
                            Trong Phật giáo Nam Tông, chư Tăng (bhikkhu — tỳ kheo) là những người đã xuất gia,
                            giữ 227 giới luật, sống đời phạm hạnh để tu tập và hoằng pháp. Người cư sĩ đối với
                            chư Tăng thể hiện lòng kính trọng bậc tu hành, không phải sự phục tùng.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                            <h3 className="font-semibold text-coffee-dark mb-3">Cách chào hỏi</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li>• Chắp tay trước ngực (añjalī) và cúi đầu nhẹ — đây là cách chào phổ biến nhất.</li>
                                <li>• Có thể nói <em>&quot;Chumreap suor&quot;</em> (chào hỏi theo tiếng Khmer) hoặc đơn giản chắp tay cúi đầu.</li>
                                <li>• Nếu muốn tỏ lòng tôn kính sâu hơn, có thể quỳ xuống và lạy một lạy (bangtum).</li>
                            </ul>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                            <h3 className="font-semibold text-coffee-dark mb-3">Khi nói chuyện với sư</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li>• Gọi bằng <strong>&quot;Sư&quot;</strong>, <strong>&quot;Thầy&quot;</strong>, hoặc <strong>&quot;Lok Sông&quot;</strong> (លោកសង្ឃ — cách gọi kính trọng trong tiếng Khmer). Với sư trụ trì, gọi là <strong>&quot;Lok Aechar&quot;</strong> hoặc <strong>&quot;Sư cả&quot;</strong>.</li>
                                <li>• Xưng <strong>&quot;con&quot;</strong> hoặc <strong>&quot;dạ&quot;</strong> — thể hiện sự khiêm nhường phù hợp.</li>
                                <li>• Nếu sư ngồi, không nên đứng nói chuyện — hãy ngồi xuống hoặc quỳ.</li>
                                <li>• Nói chuyện từ tốn, tránh tranh cãi hoặc nói về những chuyện không liên quan đến Phật pháp.</li>
                            </ul>
                        </div>

                        <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                            <h3 className="font-semibold text-red-800 mb-3">⚠️ Quy tắc quan trọng với nữ giới</h3>
                            <div className="text-gray-700 space-y-2">
                                <p>
                                    <strong>Phụ nữ không được chạm vào thân thể chư Tăng</strong> — đây là giới luật
                                    Vinaya nghiêm ngặt trong Phật giáo Nam Tông, không phải sự phân biệt giới tính.
                                    Chư Tăng giữ giới thanh tịnh, bất kỳ sự tiếp xúc thân thể nào với nữ giới đều
                                    có thể vi phạm giới luật.
                                </p>
                                <ul className="space-y-1 mt-3">
                                    <li>• Khi dâng vật phẩm cho sư, nữ giới đặt vật phẩm lên khăn trải (tấm vải dâng) hoặc trên bàn, không trao trực tiếp vào tay.</li>
                                    <li>• Không ngồi sát cạnh sư.</li>
                                    <li>• Khi chụp ảnh, giữ khoảng cách phù hợp.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                            <h3 className="font-semibold text-coffee-dark mb-3">Khi gặp sư đi khất thực (bintabaht)</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li>• Nếu muốn thanh toán thức ăn, quỳ xuống, đặt thức ăn vào bát của sư (nếu là nam).</li>
                                <li>• Nữ giới đặt thức ăn lên tấm vải mà sư đặt ra.</li>
                                <li>• Sau khi thanh toán, chắp tay và cúi đầu nhận phước.</li>
                                <li>• Không cần nói gì — hành động thành kính tự nó đã đủ.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Section 4: Hành vi nên tránh */}
                <section id="hanh-vi-nen-tranh" className="mb-16 scroll-mt-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gold-primary/10 text-gold-primary font-bold text-lg">4</div>
                        <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-coffee-dark">
                            Hành Vi Nên Tránh
                        </h2>
                    </div>

                    <p className="text-gray-600 mb-6">
                        Những điều dưới đây không nhằm phán xét, mà giúp bạn hiểu vì sao một số hành vi
                        không phù hợp trong không gian chi nhánh.
                    </p>

                    <div className="space-y-4">
                        {[
                            {
                                action: 'Cười đùa lớn tiếng, nô đùa trong chánh điện',
                                reason: 'Chánh điện là nơi thờ Phật và là không gian tu tập — tương tự như một phòng thiền định. Tiếng ồn phá vỡ sự tĩnh lặng cần thiết cho việc hành thiền và tụng kinh.',
                            },
                            {
                                action: 'Tự ý vào khu tăng xá (nơi ở của chư Tăng)',
                                reason: 'Tăng xá (kuti) là không gian riêng tư để chư Tăng tu tập và nghỉ ngơi. Trong giới luật Vinaya, chỗ ở của tỳ kheo cần được bảo vệ sự thanh tịnh. Muốn gặp sư, hãy đến khu vực tiếp khách hoặc nhờ người trong chi nhánh thông báo.',
                            },
                            {
                                action: 'Hút thuốc, uống rượu bia trong khuôn viên chi nhánh',
                                reason: 'Ngũ giới của người cư sĩ Nhân sự bao gồm không sử dụng chất gây say (Pañca Sīla, giới thứ 5). Dù bạn không phải Nhân sự, đây cũng là không gian mà mọi người đang thực hành giới luật — xin tôn trọng điều đó.',
                            },
                            {
                                action: 'Chỉ tay hoặc dùng chân chỉ về phía tượng Phật, tháp, hoặc chư Tăng',
                                reason: 'Trong văn hoá Khmer và Phật giáo Theravada, bàn tay chỉ và bàn chân đều mang nghĩa bất kính khi hướng về đối tượng tôn kính. Thay vào đó, dùng cả bàn tay phải hoặc cả hai tay để chỉ.',
                            },
                            {
                                action: 'Xoa đầu tượng Phật hoặc sờ vào các vật thờ',
                                reason: 'Tượng Phật trong chi nhánh Theravada là biểu trưng cho Đức Phật và giáo pháp, không phải vật trang trí hay bùa may mắn. Hành động sờ chạm tuỳ tiện thể hiện sự thiếu tôn kính.',
                            },
                            {
                                action: 'Mang thức ăn mặn hoặc ăn uống trong chánh điện',
                                reason: 'Chánh điện dành riêng cho việc lễ bái và tu tập. Thức ăn được dùng ở khu vực riêng (sala chàn — nhà ăn) hoặc sân chi nhánh.',
                            },
                            {
                                action: 'Đặt đồ vật cá nhân (giày dép, túi xách) lên bàn thờ hoặc bệ Phật',
                                reason: 'Đây là không gian dành riêng cho vật phẩm thanh toán. Đồ cá nhân nên để ở khu vực riêng.',
                            },
                        ].map((item, index) => (
                            <div key={index} className="border border-gray-100 rounded-xl p-5 hover:border-gold-primary/20 transition-colors">
                                <div className="flex items-start gap-3">
                                    <span className="text-red-500 text-lg mt-0.5 flex-shrink-0">✗</span>
                                    <div>
                                        <p className="font-medium text-gray-800 mb-2">{item.action}</p>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            <span className="text-gold-primary font-medium">Vì sao:</span> {item.reason}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 5: Khi chi nhánh đông người */}
                <section id="chua-dong-nguoi" className="mb-16 scroll-mt-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gold-primary/10 text-gold-primary font-bold text-lg">5</div>
                        <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-coffee-dark">
                            Ứng Xử Khi Chi nhánh Đông Người
                        </h2>
                    </div>

                    <p className="text-gray-600 mb-6">
                        Vào các dịp lễ lớn như Chôl Chnăm Thmây (Năm mới Khmer), Phchum Bân (Lễ cúng ông bà),
                        hay Visak Bochea (Phật Đản), chi nhánh có thể đón hàng trăm đến hàng ngàn Nhân sự.
                        Dưới đây là cách ứng xử phù hợp:
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            { tip: 'Đến sớm để có chỗ ngồi thoải mái, tránh chen lấn khi buổi lễ đã bắt đầu.' },
                            { tip: 'Ngồi gọn gàng, không chiếm quá nhiều chỗ. Nhường chỗ cho người lớn tuổi và trẻ em.' },
                            { tip: 'Xếp giày dép ngay ngắn ở khu vực quy định, không để tràn lan lối đi.' },
                            { tip: 'Khi chánh điện quá đông, có thể ngồi ở hành lang hoặc sân — buổi lễ thường được phát qua loa.' },
                            { tip: 'Tránh đứng chắn tầm nhìn của người phía sau, đặc biệt khi đang có lễ tụng kinh.' },
                            { tip: 'Giữ con nhỏ gần bên, hướng dẫn trẻ cách cư xử nhẹ nhàng.' },
                            { tip: 'Nếu cần rời đi giữa buổi lễ, đi nhẹ nhàng phía sau, không đi ngang trước tượng Phật.' },
                            { tip: 'Xếp hàng trật tự khi nhận thức ăn, nước uống trong các buổi lễ.' },
                        ].map((item, index) => (
                            <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <span className="text-gold-primary font-bold">{index + 1}.</span>
                                <span className="text-gray-700 text-sm">{item.tip}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 6: Chụp ảnh, quay video */}
                <section id="chup-anh" className="mb-16 scroll-mt-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gold-primary/10 text-gold-primary font-bold text-lg">6</div>
                        <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-coffee-dark">
                            Ứng Xử Khi Chụp Ảnh & Quay Video
                        </h2>
                    </div>

                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 mb-6">
                        <p className="text-gray-700 leading-relaxed">
                            Chi nhánh có kiến trúc Khmer đẹp và nhiều du khách muốn chụp ảnh lưu niệm.
                            Chi nhánh không cấm chụp ảnh, nhưng xin lưu ý một số điều để giữ sự trang nghiêm.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="border-l-4 border-green-500 pl-4 py-2">
                            <h4 className="font-semibold text-gray-800 mb-2 text-green-800">Được phép</h4>
                            <ul className="space-y-2 text-gray-700 text-sm">
                                <li>• Chụp ảnh kiến trúc, cảnh quan chi nhánh từ bên ngoài và sân chi nhánh.</li>
                                <li>• Chụp ảnh kỷ niệm trong các dịp lễ (với thái độ tôn kính, đứng ở vị trí không gây cản trở).</li>
                                <li>• Chụp ảnh tượng Phật nếu có thái độ trang nghiêm — đây là cách ghi nhận vẻ đẹp nghệ thuật Phật giáo.</li>
                            </ul>
                        </div>
                        <div className="border-l-4 border-amber-500 pl-4 py-2">
                            <h4 className="font-semibold text-gray-800 mb-2 text-amber-800">Cần xin phép</h4>
                            <ul className="space-y-2 text-gray-700 text-sm">
                                <li>• Chụp ảnh hoặc quay phim bên trong chánh điện (hỏi ban quản trị hoặc sư trong chi nhánh).</li>
                                <li>• Chụp ảnh chư Tăng — nên xin phép trước, nhiều sư sẵn lòng nhưng một vài vị có thể từ chối vì lý do tu tập.</li>
                                <li>• Quay phim phóng sự, làm nội dung truyền thông — phải được sự đồng ý của ban trụ trì.</li>
                            </ul>
                        </div>
                        <div className="border-l-4 border-red-500 pl-4 py-2">
                            <h4 className="font-semibold text-gray-800 mb-2 text-red-800">Không nên</h4>
                            <ul className="space-y-2 text-gray-700 text-sm">
                                <li>• Tạo dáng phản cảm, gợi cảm, hoặc thiếu trang nghiêm trước tượng Phật — đây là nơi thờ tự, không phải studio chụp hình.</li>
                                <li>• Dùng flash khi chụp các bức tranh, tượng cổ — ánh sáng mạnh có thể làm hư hại di sản nghệ thuật.</li>
                                <li>• Chụp ảnh/quay video trong lúc chư Tăng đang tụng kinh, hành lễ mà không xin phép.</li>
                                <li>• Livestream không xin phép trong khuôn viên chi nhánh.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Navigation to other sections */}
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
