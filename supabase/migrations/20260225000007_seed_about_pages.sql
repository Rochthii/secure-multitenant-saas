-- Migration: Seed about_sections cho 11 trang Giới Thiệu
-- Nguồn: Trang cũ chua-chantarangsay-new.vercel.app/vi/gioi-thieu
-- + Nghiên cứu từ: Wikipedia, btgcp.gov.vn, vnexpress, tuoitre, giacngo.vn
-- + Sách: Thượng toạ Danh Lung, Đại đức Châu Hoài Thái (2014). Danh tăng Nam Tông Khmer

-- XÓA SẠCH TOÀN BỘ about_sections cũ (abbot, founder, intro, history, architecture, ...)
-- Bảng này được quản lý hoàn toàn bằng migration, không có user-created data cần giữ
TRUNCATE TABLE about_sections RESTART IDENTITY CASCADE;

INSERT INTO
    about_sections (
        key,
        title_vi,
        summary_vi,
        content_vi,
        display_order,
        is_active
    )
VALUES

-- ═══════════════════════════════════════════════════════════════
-- 1. DÒNG CHẢY LỊCH SỬ
-- ═══════════════════════════════════════════════════════════════
(
    'dong-chay-lich-su',
    'Dòng Chảy Lịch Sử',
    'Hành trình hơn 80 năm: từ cốc lá bên bờ rạch Nhiêu Lộc đến ngôi chi nhánh Di tích Kiến trúc Nghệ thuật cấp Thành phố.',
    '<h2>Khởi Nguyên — Từ Cốc Lá Đến Ngôi Chi nhánh (1946 – 1953)</h2>
<p>Chi nhánh Chantarangsay (ចន្ទរង្សី — "Ánh Trăng") được sáng lập bởi <strong>Hòa thượng Lâm Em</strong> (pháp danh Candaraṅsī), một vị Tăng tài hoa quê Sóc Trăng, từng là Hiệu trưởng trường Phật học tại Phnom Penh.</p>
<p>Cuối năm 1947, sau 8 năm thực hành hạnh Đầu Đà trong rừng tại Campuchia, Hòa thượng trở về Việt Nam và lên Sài Gòn. Ngài tìm đến cộng đồng người Khmer đang sinh sống tại đây, dựng lên một <strong>cốc nhỏ bên bờ rạch Nhiêu Lộc</strong> vùng Tân Định để có nơi tu và chờ đợi trợ duyên.</p>
<p>Năm 1948, Hòa thượng Oul Srey từ Campuchia sang Sài Gòn, cùng toàn thể Nhân sự trợ duyên kiến tạo nên ngôi Tam Bảo. Từ cốc nhỏ trên bãi đất lầy đầy cỏ dại bên bờ kênh Nhiêu Lộc, đã hình thành một ngôi chi nhánh uy nghi đồ sộ theo truyền thống Khmer — <strong>Chi nhánh Candaransi</strong>.</p>
<p>Năm <strong>1949 – 1953</strong>: Ngôi Chánh điện kiên cố bằng bê tông cốt thép chính thức được xây dựng và hoàn thành, đánh dấu sự ra đời của một ngôi phạm vũ uy nghiêm mang tên Candaransi (Ánh Trăng) — biểu tượng cho ánh sáng giác ngộ và từ bi xua tan màn vô minh tăm tối.</p>

<h2>Pháp Nạn 1963</h2>
<p>Trong Pháp nạn 1963, Hòa thượng Lâm Em đã dẫn thân cùng các vị Tôn túc lãnh đạo tham gia đấu tranh chống đàn áp Phật giáo. Ngài là một trong năm vị <strong>Cố vấn của Ủy ban Liên phái Bảo vệ Phật giáo</strong>. Ngày 30/5/1963, Ngài đã tuyệt thực 48 giờ — đó cũng là ngày đầu tiên cả Sài Gòn tuyệt thực, mang ý nghĩa tiên phong cho các cuộc đấu tranh bất bạo động sau này.</p>

<h2>Phát Triển Qua Các Thời Kỳ</h2>
<p>Trải qua hơn 80 năm hình thành và phát triển, chi nhánh đã trải qua <strong>7 lần trùng tu lớn</strong>, từ cốc lá ban đầu trở thành ngôi chi nhánh khang trang với tổng diện tích khoảng <strong>4.500 m²</strong>. Năm 1965, Hòa thượng Lâm Em được bầu vào chức vụ <strong>Tăng thống Giáo Hội Theravāda</strong>.</p>

<h2>Di Tích Lịch Sử — Văn Hóa</h2>
<p>Chi nhánh Chantarangsay là ngôi chi nhánh Phật giáo Nam tông Khmer <strong>đầu tiên</strong> được xây dựng tại Sài Gòn – Gia Định xưa. Với giá trị lịch sử, kiến trúc và văn hóa đặc sắc, chi nhánh đã được công nhận là <strong>Di tích Kiến trúc Nghệ thuật cấp Thành phố</strong>.</p>

<h2>Tìm Hiểu Thêm</h2>
<ul>
  <li><a href="/gioi-thieu/dong-chay-lich-su">📜 Dòng Chảy Lịch Sử — Từ cốc lá đến Di tích cấp Thành phố</a></li>
  <li><a href="/gioi-thieu/truyen-thua-tiep-noi/tru-tri-duong-nhiem">👤 Hòa thượng Danh Lung — Trụ Trì đương nhiệm</a></li>
  <li><a href="/gioi-thieu/di-san-nghe-thuat/kien-truc-dieu-khac">🏛️ Kiến trúc & Điêu khắc Chánh điện</a></li>
</ul>',
    1,
    true
),

-- ═══════════════════════════════════════════════════════════════
-- 2. TRUYỀN THỪA & TIẾP NỐI
-- ═══════════════════════════════════════════════════════════════
(
    'truyen-thua-tiep-noi',
    'Truyền Thừa & Tiếp Nối',
    'Ba đời Trụ trì (Sư Cả): từ Hòa thượng Lâm Em khai sơn đến HT. Danh Lung đương nhiệm — hơn 80 năm truyền đăng tục diệm.',
    '<h2>Các Đời Trụ Trì (Sư Cả)</h2>

<h3>Đời thứ nhất: Hòa thượng Lâm Em (1946 – 1979)</h3>
<p>Vị Tổ khai sơn, người đặt nền móng đầu tiên cho ngôi chi nhánh. Pháp danh <strong>Candaraṅsī</strong>, sinh năm 1898 tại làng Mỹ Tú, Sóc Trăng. Ngài xuất gia năm 18 tuổi (1916), thọ Tỳ Khưu năm 22 tuổi (1920). Sau 8 năm thực hành hạnh Đầu Đà trong rừng tại Campuchia, Ngài trở về Việt Nam kiến tạo Chi nhánh Chantarangsay. Viên tịch ngày 28/10/1979, trụ thế 81 năm, Hạ lạp 60 năm.</p>

<h3>Đời thứ hai: Hòa thượng Brahmakesara Oul Srey (1979 – 1995)</h3>
<p>Người kế thừa và gìn giữ hưng thịnh ngôi Tam Bảo trong giai đoạn đất nước đổi mới. HT. Oul Srey chính là vị đã từ Campuchia sang Sài Gòn năm 1948 trợ duyên cùng HT. Lâm Em kiến tạo nên ngôi chi nhánh từ thuở ban đầu.</p>

<h3>Đời thứ ba: Hòa thượng Danh Lung (1995 – Nay)</h3>
<p>Vị Trụ trì đương nhiệm, Tiến sĩ Dân tộc học, người có công trùng tu lớn và đưa chi nhánh trở thành trung tâm văn hóa nổi tiếng. Dưới sự lãnh đạo của Ngài, chi nhánh không ngừng phát triển các hoạt động từ thiện, giáo dục và gìn giữ bản sắc văn hóa Phật giáo Nam tông Khmer.</p>

<h2>Xem Tiểu Sử Chi Tiết</h2>
<ul>
  <li><a href="/gioi-thieu/dong-chay-lich-su">📜 Cố Hòa thượng Lâm Em — Xem chi tiết trong Dòng Chảy Lịch Sử</a></li>
  <li><a href="/gioi-thieu/truyen-thua-tiep-noi/tru-tri-duong-nhiem">👤 Hòa thượng Danh Lung — Tiểu sử, chức vụ & khen thưởng đầy đủ</a></li>
</ul>',
    2,
    true
),

-- ═══════════════════════════════════════════════════════════════
-- 3. TRỤ TRÌ ĐƯƠNG NHIỆM
-- ═══════════════════════════════════════════════════════════════
(
    'truyen-thua-tiep-noi/tru-tri-duong-nhiem',
    'Hòa Thượng Danh Lung — Trụ Trì Đương Nhiệm',
    'Tiến sĩ Dân tộc học, Trụ trì Chi nhánh Chantarangsay, Đại biểu HĐND TP.HCM.',
    '<h2>Tiểu Sử</h2>
<p><strong>Hòa thượng Danh Lung</strong> — Tiến sĩ Dân tộc học — Trụ trì Chi nhánh Chantarangsay.</p>
<ul>
  <li><strong>Ngày sinh:</strong> 25/01/1964</li>
  <li><strong>Quê quán:</strong> Xã Tây Yên, huyện An Biên, tỉnh Kiên Giang</li>
  <li><strong>Trụ sở:</strong> Chi nhánh Chantarangsay — 164/235 Trần Quốc Thảo, Q.3, TP.HCM</li>
</ul>

<h2>Chức Vụ & Đạo Nghiệp</h2>
<ul>
  <li>Ủy viên Ban Thư ký Hội đồng Trị sự GHPGVN</li>
  <li>Phó Văn phòng 2 Trung ương GHPGVN</li>
  <li>Ủy viên Thường trực Ban Trị sự GHPGVN TP.HCM</li>
  <li>Ủy viên Ủy ban Trung ương Mặt trận Tổ quốc Việt Nam</li>
  <li>Đại biểu Hội đồng nhân dân TP.HCM nhiệm kỳ 2021 – 2026</li>
</ul>

<h2>Quá Trình Công Tác</h2>
<p>Hòa thượng là một vị tu sĩ trí thức, bảo vệ thành công luận án <strong>Tiến sĩ ngành Dân tộc học</strong>. Trong suốt quá trình hành đạo, Ngài đã có nhiều đóng góp to lớn cho Đạo pháp và Dân tộc:</p>
<ul>
  <li><strong>2002 – Nay:</strong> Tham gia Hội đồng Trị sự GHPGVN, đảm nhiệm nhiều trọng trách quan trọng tại Văn phòng 2 Trung ương Giáo hội.</li>
  <li><strong>2004 – Nay:</strong> Tích cực tham gia công tác Mặt trận Tổ quốc Việt Nam từ cấp Thành phố đến Trung ương.</li>
</ul>

<h2>Khen Thưởng & Ghi Nhận</h2>
<ul>
  <li><strong>Huân chương Đại đoàn kết dân tộc</strong> do Chủ tịch nước trao tặng (2017)</li>
  <li><strong>Bằng khen của Thủ tướng Chính phủ</strong> về thành tích xây dựng CNXH và bảo vệ Tổ quốc (2010)</li>
</ul>

<h2>Chương Trình Hành Động Vì Cộng Đồng</h2>
<p>Với tư cách là Đại biểu HĐND Thành phố, Hòa thượng luôn tâm niệm: <em>"Công việc có thành công hay không tùy thuộc chủ yếu vào lòng dân, nhân dân là trung tâm của sự phát triển và ổn định."</em></p>
<ul>
  <li><strong>Lắng nghe Dân:</strong> Chủ động gặp gỡ, lắng nghe tâm tư nguyện vọng của cử tri. Phản ánh trung thực những bức xúc của dân đến chính quyền.</li>
  <li><strong>Hòa hợp Tôn giáo:</strong> Đề xuất giải pháp để tôn giáo và dân tộc phát triển hài hòa, xây dựng đời sống "Tốt đời đẹp đạo".</li>
  <li><strong>An sinh Xã hội & Giáo dục:</strong> Ngăn ngừa tệ nạn qua giáo dục đạo đức, phát triển văn hóa song hành với kinh tế, đặc biệt quan tâm đời sống người dân sau đại dịch.</li>
</ul>

<p style="margin-top:2em;"><em>Thông tin trên được tổng hợp từ nguồn: <a href="/gioi-thieu/truyen-thua-tiep-noi"><strong>Truyền Thừa & Tiếp Nối</strong></a> và <a href="/gioi-thieu/dong-chay-lich-su"><strong>Dòng Chảy Lịch Sử</strong></a>.</em></p>',
    3,
    true
),

-- ═══════════════════════════════════════════════════════════════
-- 4. TỔ CHỨC TĂNG ĐOÀN
-- ═══════════════════════════════════════════════════════════════
(
    'truyen-thua-tiep-noi/to-chuc-tang-doan',
    'Tổ Chức Tăng Đoàn',
    'Cơ cấu tổ chức Tăng đoàn theo truyền thống Phật giáo Theravada tại Chi nhánh Chantarangsay.',
    '<h2>Cơ Cấu Tăng Đoàn</h2>
<p>Tăng đoàn tại Chi nhánh Chantarangsay được tổ chức theo truyền thống <strong>Phật giáo Theravada</strong>, tuân thủ nghiêm ngặt Luật tạng (Vinaya Piṭaka) gồm 227 giới điều dành cho Tỳ-kheo.</p>

<h3>Phẩm Trật Tăng Sĩ</h3>
<ul>
  <li><strong>Trụ trì (Chau Athikar)</strong> — Vị đứng đầu ngôi chi nhánh, chịu trách nhiệm tổng quát mọi hoạt động tu học và hành chính.</li>
  <li><strong>Phó trụ trì</strong> — Hỗ trợ trụ trì trong các công tác quản trị và giảng dạy.</li>
  <li><strong>Tỳ-kheo (Bhikkhu)</strong> — Các vị sư đã thọ đại giới, tu tập chính thức theo Giới-Định-Tuệ.</li>
  <li><strong>Sa-di (Sāmaṇera)</strong> — Các vị xuất gia tuổi trẻ đang trong giai đoạn học tập và rèn luyện.</li>
</ul>

<h3>Sinh Hoạt Tu Tập</h3>
<p>Chư Tăng thực hành thiền định, tụng kinh Pāli hàng ngày vào lúc sáng sớm và chiều tối. Truyền thống <strong>khất thực</strong> cũng được duy trì vào các dịp lễ lớn. Đặc biệt, theo truyền thống Theravada, chư Tăng chỉ dùng bữa trước ngọ (trước 12h trưa), sau ngọ chỉ dùng nước, trà hoặc thuốc.</p>',
    4,
    true
),

-- ═══════════════════════════════════════════════════════════════
-- 5. BAN THƯ KÝ
-- ═══════════════════════════════════════════════════════════════
(
    'truyen-thua-tiep-noi/ban-thu-ky',
    'Ban Thư Ký',
    'Cơ cấu ban thư ký và bộ máy quản lý hành chính phục vụ hoạt động của chi nhánh.',
    '<h2>Vai Trò Ban Thư Ký</h2>
<p>Ban Thư ký là bộ phận hành chính cốt lõi, hỗ trợ Trụ trì trong việc quản lý toàn bộ hoạt động thường nhật và đối ngoại của Chi nhánh Chantarangsay.</p>

<h3>Chức Năng Chính</h3>
<ul>
  <li><strong>Quản trị hành chính:</strong> Xử lý văn thư, thư từ đối ngoại với Giáo hội và chính quyền các cấp.</li>
  <li><strong>Tổ chức lễ hội:</strong> Lên kế hoạch và điều phối các sự kiện tôn giáo, lễ hội truyền thống Khmer.</li>
  <li><strong>Tiếp đón Nhân sự:</strong> Hướng dẫn khách tham quan, đoàn khách quốc tế và Nhân sự đến chi nhánh.</li>
  <li><strong>Quản lý tài chính:</strong> Quản lý quỹ phước điền, chi phí trùng tu và các hoạt động từ thiện.</li>
</ul>

<h3>Cấu Trúc Nhân Sự</h3>
<p>Ban Thư ký hoạt động dưới sự chỉ đạo trực tiếp của Trụ trì, gồm các Nhân sự thuần thành tình nguyện phục vụ và một số nhân sự chuyên trách.</p>',
    5,
    true
),

-- ═══════════════════════════════════════════════════════════════
-- 6. DI SẢN & NGHỆ THUẬT (Trang cha)
-- ═══════════════════════════════════════════════════════════════
(
    'di-san-nghe-thuat',
    'Di Sản & Nghệ Thuật',
    'Kiến trúc Khmer truyền thống kết hợp Phật giáo Theravada — một bảo tàng nghệ thuật Khmer sống động giữa lòng thành phố.',
    '<h2>Di Sản Kiến Trúc Nghệ Thuật Cấp Thành Phố</h2>
<p>Kiến trúc Chi nhánh Chantarangsay là sự kết hợp tinh tế giữa phong cách <strong>Khmer truyền thống</strong> và <strong>Phật giáo Theravada</strong>. Chánh điện hai tầng hướng Đông với mái ba tầng, ba ngọn tháp Tam Bảo uy nghiêm, và hệ thống phù điêu khắc nổi kể về cuộc đời Đức Phật. Toàn bộ công trình trải rộng trên <strong>4.500 m²</strong>, là một bảo tàng nghệ thuật Khmer sống động giữa lòng thành phố.</p>

<h3>Các Giá Trị Nổi Bật</h3>
<ul>
  <li><a href="/gioi-thieu/di-san-nghe-thuat/kien-truc-dieu-khac"><strong>Kiến trúc & Điêu Khắc</strong></a> — Mái ba tầng, tháp Tam Bảo, Naga, Garuda, tượng Cầy No</li>
  <li><a href="/gioi-thieu/di-san-nghe-thuat/co-vat-phap-bao"><strong>Cổ Vật & Pháp Bảo</strong></a> — Xá lợi Phật, tượng cổ, kinh lá buông</li>
  <li><a href="/gioi-thieu/di-san-nghe-thuat/nghe-thuat-truyen-thong"><strong>Nghệ Thuật Truyền Thống</strong></a> — Tranh tường Jataka, chạm khắc gỗ, phong cách Angkor</li>
  <li><a href="/gioi-thieu/di-san-nghe-thuat/doi-song-van-hoa"><strong>Đời Sống Văn Hóa</strong></a> — Lễ hội Khmer, lớp dạy chữ, hoạt động cộng đồng</li>
</ul>',
    6,
    true
),

-- ═══════════════════════════════════════════════════════════════
-- 7. KIẾN TRÚC & ĐIÊU KHẮC
-- ═══════════════════════════════════════════════════════════════
(
    'di-san-nghe-thuat/kien-truc-dieu-khac',
    'Kiến Trúc & Điêu Khắc',
    'Chánh điện hai tầng hướng Đông, mái ba tầng với ba ngọn tháp Tam Bảo và hệ thống phù điêu khắc nổi tinh xảo.',
    '<h2>Chánh Điện</h2>
<p>Ngôi chánh điện được xây dựng <strong>hướng chính Đông</strong> — hướng của Mặt Trời mọc và nơi Đức Phật thành đạo dưới cội Bồ Đề. Chánh điện có <strong>hai tầng</strong>, nền cao hơn hẳn các công trình khác trong khuôn viên, tượng trưng cho <strong>ngọn núi thiêng Meru</strong> (Tu Di Sơn) trong vũ trụ quan Phật giáo.</p>

<h2>Mái Ba Tầng & Tháp Tam Bảo</h2>
<p>Mái chi nhánh có <strong>ba tầng</strong>, trên nóc là <strong>ba ngọn tháp</strong> tượng trưng cho Tam Bảo (Phật – Pháp – Tăng). Mỗi ngọn tháp được xây dựng theo kiểu <strong>tám cấp</strong>, đại diện cho <em>Bát Chính Đạo</em>. Chóp cao nhất tượng trưng cho <strong>Niết Bàn</strong>.</p>

<h2>Hệ Thống Phù Điêu & Điêu Khắc</h2>
<p>Khắp tường bao chánh điện, các cây cột và mái vòm đều được chạm khắc tinh xảo:</p>
<ul>
  <li><strong>Rắn thần Naga (Neak)</strong> — Vị thần bảo hộ nước, uốn lượn quanh lan can và cầu thang.</li>
  <li><strong>Chim thần Garuda</strong> — Linh vật quyền năng trong thần thoại Á Đông, chạm trổ trên các trụ cột.</li>
  <li><strong>Tượng Cầy No (Kayno)</strong> — Nữ thần nửa người nửa chim trong truyền thuyết Khmer.</li>
  <li><strong>Hoa văn Apsara</strong> — Tiên nữ múa được tạc trên tường, mang đậm phong cách mỹ thuật Angkor.</li>
</ul>

<h2>Nội Thất Chánh Điện</h2>
<p>Bên trong, vị trí trung tâm là bàn thờ Kim thân Đức Phật với <strong>năm cấp</strong> từ thấp đến cao, mỗi cấp là một ban thờ Đức Phật ở những tư thế khác nhau, phản ánh các sự kiện quan trọng trong cuộc đời Đức Phật. Chi nhánh <strong>chỉ thờ duy nhất Đức Phật Thích Ca Mâu Ni</strong>, không thờ Bồ Tát hay các vị thần linh khác — đúng theo truyền thống Theravada.</p>',
    7,
    true
),

-- ═══════════════════════════════════════════════════════════════
-- 8. CỔ VẬT & PHÁP BẢO
-- ═══════════════════════════════════════════════════════════════
(
    'di-san-nghe-thuat/co-vat-phap-bao',
    'Cổ Vật & Pháp Bảo',
    'Xá lợi Phật, tượng cổ, kinh lá buông và các pháp khí quý hiếm lưu giữ tại chi nhánh.',
    '<h2>Xá Lợi Phật</h2>
<p>Chi nhánh Chantarangsay vinh dự được tôn trí <strong>Xá Lợi Phật</strong> — báu vật linh thiêng nhất trong Phật giáo. Xá lợi được an trí trong bảo tháp trang nghiêm, là nơi để Nhân sự và tăng sĩ lễ bái, tưởng niệm Đức Thế Tôn.</p>

<h2>Tượng Phật</h2>
<p>Bộ tượng Phật tại chi nhánh bao gồm nhiều pho tượng với các tư thế (mudrā) khác nhau:</p>
<ul>
  <li><strong>Phật tọa thiền (Samādhi)</strong> — Tư thế an định, nhập thiền dưới cội Bồ Đề</li>
  <li><strong>Phật Niết Bàn (Parinibbāna)</strong> — Tư thế nằm nghiêng về phía phải</li>
  <li><strong>Phật đứng chúc phúc (Abhaya)</strong> — Tư thế ban phước lành cho chúng sanh</li>
  <li><strong>Phật hàng ma (Māravijaya)</strong> — Tư thế chiến thắng Ma Vương trong đêm thành đạo</li>
</ul>

<h2>Kinh Lá Buông (Satra)</h2>
<p>Chi nhánh lưu giữ các bộ <strong>Kinh lá buông</strong> (Satra) — kinh điển Phật giáo viết trên lá cọ bằng ngôn ngữ Pāli, một trong những hình thức bảo tồn Tam Tạng kinh điển cổ xưa nhất của Phật giáo Theravada.</p>',
    8,
    true
),

-- ═══════════════════════════════════════════════════════════════
-- 9. NGHỆ THUẬT TRUYỀN THỐNG
-- ═══════════════════════════════════════════════════════════════
(
    'di-san-nghe-thuat/nghe-thuat-truyen-thong',
    'Nghệ Thuật Truyền Thống',
    'Hệ thống phù điêu khắc nổi kể về cuộc đời Đức Phật, chạm khắc gỗ và phong cách mỹ thuật Angkor.',
    '<h2>Phù Điêu & Tranh Tường — Câu Chuyện Tiền Thân Đức Phật</h2>
<p>Trần và các vách chánh điện được trang trí bằng những <strong>bức tranh khắc nổi</strong> nhiều màu sắc, phác họa tiểu sử và cuộc đời Đức Phật Thích Ca. Các bức tranh kể lại câu chuyện <strong>Tiền thân (Jataka)</strong> của Đức Phật qua 550 kiếp tái sinh, mỗi kiếp là một bài học về giáo lý và đạo đức.</p>

<h2>Chạm Khắc Gỗ</h2>
<ul>
  <li><strong>Cửa và cửa sổ</strong> — Chạm trổ hoa văn hình lá Bồ Đề, hoa sen và các motif truyền thống Khmer</li>
  <li><strong>Bàn thờ</strong> — Sơn son thếp vàng theo phong cách hoàng cung Campuchia</li>
  <li><strong>Kèo và vì</strong> — Các thanh kèo chịu lực được trang trí đầu rồng, đầu Naga tinh tế</li>
</ul>

<h2>Phong Cách Mỹ Thuật Angkor</h2>
<p>Tổng thể thiết kế mang đậm dấu ấn <strong>phong cách mỹ thuật Angkor</strong> — thời hoàng kim của đế chế Khmer. Sự kết hợp hài hòa giữa yếu tố Phật giáo và Bà-la-môn giáo tạo nên vẻ đẹp độc đáo, không thể nhầm lẫn với bất kỳ dòng kiến trúc Phật giáo nào khác tại Việt Nam.</p>',
    9,
    true
),

-- ═══════════════════════════════════════════════════════════════
-- 10. ĐỜI SỐNG VĂN HÓA
-- ═══════════════════════════════════════════════════════════════
(
    'di-san-nghe-thuat/doi-song-van-hoa',
    'Đời Sống Văn Hóa',
    'Sinh hoạt văn hóa cộng đồng Khmer, lễ hội truyền thống và hoạt động giáo dục tại chi nhánh.',
    '<h2>Trung Tâm Văn Hóa Cộng Đồng</h2>
<p>Chi nhánh Chantarangsay không chỉ là nơi tu tập mà còn đóng vai trò <strong>trung tâm văn hóa</strong> của cộng đồng Khmer tại TP.HCM — đúng như hoài bão của vị Tổ khai sơn Lâm Em từ thuở ban đầu.</p>

<h3>Lễ Hội Truyền Thống Khmer</h3>
<ul>
  <li><strong>Chôl Chnăm Thmây</strong> — Tết cổ truyền Khmer (tháng 4)</li>
  <li><strong>Sene Đôn Ta</strong> — Lễ cúng tổ tiên, kéo dài 15 ngày (tháng 9-10)</li>
  <li><strong>Ok Om Bok</strong> — Lễ cúng trăng, tạ ơn thiên nhiên (tháng 10-11)</li>
  <li><strong>Kathina</strong> — Lễ dâng y cho chư Tăng sau mùa an cư</li>
  <li><strong>Vesak</strong> — Đại lễ Tam Hợp: Đản Sinh, Thành Đạo, Nhập Niết Bàn (tháng 5)</li>
</ul>

<h3>Giáo Dục & Bảo Tồn Ngôn Ngữ</h3>
<p>Dưới sự chỉ đạo của HT. Danh Lung, chi nhánh thường xuyên mở các <strong>lớp dạy chữ Khmer miễn phí</strong> cho con em đồng bào và bất kỳ ai quan tâm — nỗ lực quan trọng nhằm bảo tồn ngôn ngữ mẹ đẻ trong bối cảnh đô thị hóa mạnh mẽ.</p>

<h3>Tìm Hiểu Thêm Về Văn Hóa Khmer Nam Tông</h3>
<ul>
  <li><a href="/van-hoa/ban-sac-khmer">Bản Sắc Khmer — Nguồn Cội & Truyền Thống</a></li>
  <li><a href="/van-hoa/nghi-le-co-ban">Nghi Lễ Cơ Bản tại Chi nhánh Phật giáo Theravada</a></li>
  <li><a href="/van-hoa/nen-va-khong-nen">Nên và Không Nên khi đến Chi nhánh</a></li>
  <li><a href="/van-hoa/quy-tac-ung-xu">Quy Tắc Ứng Xử tại Chi nhánh</a></li>
</ul>',
    10,
    true
),

-- ═══════════════════════════════════════════════════════════════
-- 11. NỘI QUY TỰ VIỆN
-- ═══════════════════════════════════════════════════════════════
(
    'noi-quy-tu-vien',
    'Nội Quy Tự Viện',
    'Quy định dành cho khách viếng chi nhánh, Nhân sự và hành giả tu tập tại Chi nhánh Chantarangsay.',
    '<h2>Nội Quy Dành Cho Khách Viếng Chi nhánh</h2>
<p>Để giữ gìn sự <strong>trang nghiêm và thanh tịnh</strong> của tự viện, kính mời quý khách và Nhân sự tuân thủ những quy định sau:</p>

<h3>📿 Trang Phục</h3>
<ul>
  <li>Mặc quần áo lịch sự, kín đáo, che hết vai và đầu gối</li>
  <li>Không mặc đồ ngắn, hở hang, quần short hoặc áo dây</li>
  <li>Nên mặc trang phục màu trắng hoặc màu nhã khi dự lễ</li>
</ul>

<h3>🙏 Hành Vi</h3>
<ul>
  <li>Cởi giày dép trước khi vào chánh điện</li>
  <li>Không chỉ tay hoặc chĩa chân về phía tượng Phật và chư Tăng</li>
  <li>Phụ nữ không được chạm vào chư Tăng hoặc trao đồ trực tiếp bằng tay</li>
  <li>Giữ yên lặng trong khuôn viên, đặc biệt trong chánh điện</li>
  <li>Không dùng điện thoại trong khi tụng kinh hoặc nghe pháp</li>
</ul>

<h3>📷 Chụp Ảnh</h3>
<ul>
  <li>Được phép chụp ảnh bên ngoài chánh điện</li>
  <li>Xin phép trước khi chụp ảnh bên trong hoặc chụp chư Tăng</li>
  <li>Không dùng flash trong chánh điện</li>
  <li>Không quay video khi đang hành lễ</li>
</ul>

<h3>⏰ Giờ Thăm Viếng</h3>
<ul>
  <li><strong>Sáng:</strong> 6:00 – 11:00</li>
  <li><strong>Chiều:</strong> 14:00 – 17:00</li>
  <li>Các ngày lễ lớn có lịch riêng, vui lòng liên hệ Ban Thư ký</li>
</ul>

<h3>🚫 Lưu Ý Quan Trọng</h3>
<ul>
  <li>Không mang rượu, bia, thuốc lá vào khuôn viên chi nhánh</li>
  <li>Không hái hoa, bẻ cành, giẫm lên bãi cỏ</li>
  <li>Giữ gìn vệ sinh chung, bỏ rác đúng nơi quy định</li>
  <li>Trẻ em cần có người lớn đi kèm</li>
</ul>',
    11,
    true
);