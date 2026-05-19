# 📌 HƯỚNG DẪN SỬ DỤNG PROMPTS

> **Mục đích:** Tệp prompts để copy-paste cho AI coding assistants làm từng task cụ thể

---

## 🎯 CÁCH SỬ DỤNG

### Bước 1: Chọn prompt phù hợp
```
prompts/
├── 01_setup_project.md         → Khởi tạo dự án Next.js
├── 02_design_system.md         → Tạo design system components
├── 03_database_setup.md        → Setup Supabase database
├── 04_pages_homepage.md        → Làm trang chủ
├── 05_pages_news.md            → Làm trang tin tức
├── 06_pages_events.md          → Làm trang lịch lễ
├── 07_pages_gallery.md         → Làm thư viện ảnh
├── 08_feature_registration.md  → Tính năng đăng ký lễ
├── 09_feature_transaction.md      → Tính năng thanh toán
├── 10_admin_dashboard.md       → Admin dashboard
├── 11_seo_optimization.md      → SEO optimization
└── 12_deployment.md            → Deploy production
```

### Bước 2: Copy prompt
- Mở file prompt tương ứng
- Copy toàn bộ nội dung từ dòng "--- START PROMPT ---"
- Paste vào AI assistant (Claude, ChatGPT, Cursor, v3...)

### Bước 3: Cung cấp context
AI sẽ cần access vào:
- `docs/` - Tài liệu thiết kế
- Code hiện tại (nếu đã có)

### Bước 4: Review & iterate
- AI sẽ generate code
- Bạn test
- Feedback để AI adjust

---

## 📋 THỨ TỰ LÀM VIỆC ĐỀ XUẤT

### TUẦN 1: Foundation
1. ✅ `01_setup_project.md` - Khởi tạo dự án
2. ✅ `02_design_system.md` - Design system
3. ✅ `03_database_setup.md` - Database

### TUẦN 2-3: Core Pages
4. ✅ `04_pages_homepage.md` - Trang chủ
5. ✅ `05_pages_news.md` - Tin tức
6. ✅ `06_pages_events.md` - Lịch lễ
7. ✅ `07_pages_gallery.md` - Thư viện

### TUẦN 4-5: Features
8. ✅ `08_feature_registration.md` - Đăng ký lễ
9. ✅ `09_feature_transaction.md` - Thanh toán
10. ✅ `10_admin_dashboard.md` - Admin

### TUẦN 6: Polish & Launch
11. ✅ `11_seo_optimization.md` - SEO
12. ✅ `12_deployment.md` - Deploy

---

## 💡 TIPS

### Làm việc với AI hiệu quả:

1. **Một prompt, một task**
   - Đừng gộp nhiều prompts cùng lúc
   - Focus vào 1 feature/page tại 1 thời điểm

2. **Cung cấp đủ context**
   ```
   AI cần biết:
   - Đã làm đến đâu (files hiện có)
   - Dependencies đã cài gì
   - Convention đang dùng (naming, structure)
   ```

3. **Test sau mỗi prompt**
   ```bash
   npm run dev
   # Test UI
   # Test functionality
   # Fix bugs trước khi next task
   ```

4. **Version control**
   ```bash
   git add .
   git commit -m "feat: complete homepage"
   # Commit sau mỗi task hoàn thành
   ```

---

## 🚨 LƯU Ý QUAN TRỌNG

### PHẢI làm trước khi dùng prompts:

- [ ] Đã đăng ký Supabase account
- [ ] Đã đăng ký Vercel account
- [ ] Đã cài Node.js >= 18
- [ ] Đã có Git
- [ ] Đã có code editor (VS Code/Cursor)

### Context files AI cần access:

```
Khi paste prompt, đính kèm:
📎 docs/_legacy_archive/2026-03/03_THIET_KE_UI_UX.md (cho design tasks legacy)
📎 docs/_legacy_archive/2026-03/04_KIEN_TRUC_KY_THUAT.md (cho technical tasks legacy)
📎 docs/_legacy_archive/2026-03/05_CAU_TRUC_NOI_DUNG.md (cho pages/features legacy)
📎 docs/_index.md (nguồn chuẩn hiện tại)
```

---

## 📞 HỖ TRỢ

Nếu AI không hiểu prompt:
1. Đọc lại "Context" trong prompt
2. Cung cấp thêm files docs
3. Chia nhỏ task hơn
4. Hỏi AI: "Bạn cần thêm thông tin gì?"
