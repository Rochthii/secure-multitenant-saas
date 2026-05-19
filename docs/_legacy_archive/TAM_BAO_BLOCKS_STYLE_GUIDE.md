# Style chuẩn cho 5 khối Tam Bảo (Homepage Blocks)

**Mục đích:** Mỗi khối có một style chuẩn phù hợp Phật giáo Nam Tông (Theravada): trang nghiêm, tông màu vàng–nâu–đỏ saffron, typography rõ ràng, tránh emoji/generic mystic.

---

## 1. Tam Bảo — Classic Triptych (`triple_gem_alt1`)

**Đánh giá:** Bố cục 3 cột cổ điển, Pali rõ, mô tả đủ. Phù hợp Nam Tông.

**Style chuẩn:**
- **Layout:** 3 cột đều, card bo tròn lớn (rounded-[2.5rem]), nền amber-50 / orange-50 / vàng nhạt.
- **Màu:** Amber (Phật), Orange (Pháp), Vàng nâu (Tăng). Viền nhạt, shadow nhẹ.
- **Icon:** SVG tĩnh — Phật (flame/đạo sư), Pháp (Bánh xe Pháp), Tăng (nhóm người hoặc bát khất thực), không emoji.
- **Typography:** Serif cho title, sans cho body; Pali in uppercase nhỏ, tracking rộng.
- **Animation:** Hover nhẹ (lift), không quay icon mạnh.

**Dùng khi:** Cần block Tam Bảo trang nghiêm, dễ đọc, chuẩn "giáo lý".

---

## 2. Tam Bảo — Mandala Flow (`triple_gem_alt2`)

**Đánh giá:** Vòng kết nối 3 node đẹp nhưng nền tối dễ lệch sang "mystic" chung chung.

**Style chuẩn:**
- **Layout:** Trái: text + CTA; phải: vòng tròn central (Bánh xe Pháp) + 3 node (Phật, Pháp, Tăng).
- **Màu:** Nền slate-800 hoặc warm dark (#1c1917), accent amber-500; tránh đen tuyền. Node: amber, đỏ saffron nhạt, nâu áo Tăng.
- **Icon:** SVG trong node; giữa dùng ☸ hoặc SVG Dharmachakra.
- **Typography:** Tiêu đề trắng/vàng nhạt, body slate-400.
- **Animation:** Vòng dashed quay chậm (60s), node hover scale; glow pulse nhẹ.

**Dùng khi:** Cần block "nghệ thuật", nhấn sự liên kết ba ngôi.

---

## 3. Tam Bảo — Sacred Scrolls (`triple_gem_alt3`)

**Đánh giá:** Rất phù hợp Nam Tông — lá bối kinh, Pali "Buddham saranam...", tone hoài niệm.

**Style chuẩn:**
- **Layout:** Cột dọc, mỗi "scroll" = một thẻ giống lá bối (binding trái, viền vàng nâu).
- **Màu:** Nền #FAF9F6, scroll #F4ECE0, viền amber-900/20, chữ amber-900.
- **Icon:** Emoji nhẹ (🧘 📜 📿) có thể thay bằng SVG nhỏ để trang nghiêm hơn.
- **Typography:** Serif toàn bộ; Pali italic, "Lá Bối Kinh No.x" nhỏ.
- **CTA:** Link "Xem thêm" dùng Link từ i18n/routing, style ghost border-b.

**Dùng khi:** Cần nhấn kinh văn, truyền thống, Qui y.

---

## 4. Tam Bảo — Vertical Immersive (`triple_gem_alt4`)

**Đánh giá:** Full-screen từng section ấn tượng; cần fix progress theo scroll và chuẩn hóa màu Nam Tông.

**Style chuẩn:**
- **Layout:** Mỗi "màn" full viewport, sticky; 3 màn: Phật → Pháp → Tăng. Progress indicator bên phải theo scroll thực.
- **Màu:** Phật: amber-600; Pháp: #8B2635 (saffron red); Tăng: #5D4037 (nâu áo). Ảnh nền opacity 20%, grayscale.
- **Typography:** Title rất lớn (8xl–10rem), subtitle uppercase tracking; quote italic.
- **Kỹ thuật:** Dùng useScroll + useTransform để indicator đúng section; ảnh nên từ CMS/Cloudinary, fallback Unsplash.

**Dùng khi:** Trang chủ cần trải nghiệm "cuộn sâu", một trang một bảo.

---

## 5. Tam Bảo — Bento Modern (`triple_gem_alt5`)

**Đánh giá:** Bento grid hiện đại nhưng emoji (🧘☸️📿) kém trang nghiêm.

**Style chuẩn:**
- **Layout:** Grid Bento: ô lớn Phật Bảo (2 col x 2 row), ô ngang Pháp + Tăng, ô nhỏ CTA + decorative.
- **Màu:** Nền #FFF9E6 (Phật), #FEF3E2 (Pháp), #F5F0E8 (Tăng), CTA slate-900 + amber-500; viền slate-100/amber-200.
- **Icon:** Thay emoji bằng SVG (flame/Buddha, Dharmachakra, Sangha) hoặc chữ "PHẬT" "PHÁP" "TĂNG" trong ô nhỏ.
- **Typography:** Serif black title, body slate-600; label uppercase tracking.

**Dùng khi:** Cần block hiện đại, dễ scan, vẫn đúng tone Nam Tông.

---

## Tóm tắt chọn nhanh

| Block        | Style chuẩn        | Dùng khi                           |
|-------------|--------------------|------------------------------------|
| Alt1        | Classic Triptych   | Trang nghiêm, giáo lý rõ           |
| Alt2        | Mandala Flow       | Nghệ thuật, liên kết ba ngôi        |
| Alt3        | Sacred Scrolls     | Kinh văn, truyền thống, Qui y      |
| Alt4        | Vertical Immersive| Trải nghiệm cuộn sâu, từng bảo     |
| Alt5        | Bento Modern       | Hiện đại, scan nhanh                |

Màu chuẩn Nam Tông thống nhất: **amber** (Phật), **#8B2635 / red-700** (Pháp), **#5D4037 / orange-900** (Tăng).
