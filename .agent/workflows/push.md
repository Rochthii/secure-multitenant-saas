---
description: Kiểm tra lint, build và push code lên GitHub
---

1. Chạy kiểm tra TypeScript để phát hiện lỗi type.
// turbo
2. Chạy lệnh sau để kiểm tra lỗi lint:
```powershell
npx next lint
```
3. Chạy build để đảm bảo không có lỗi runtime/build:
```powershell
npm run build
```
4. Nếu có lỗi nghiêm trọng ở các bước trên, hãy dừng lại và sửa lỗi.
5. Xem lại toàn bộ những thay đổi đã thực hiện (diff) và tóm tắt ngắn gọn.
6. Đề xuất commit message theo chuẩn Conventional Commits.
7. Thực hiện add, commit và push (Trong PowerShell dùng `;` để ngăn cách câu lệnh thay vì `&&`):
```powershell
git add .; git commit -m "feat/fix: descriptive message"; git push origin main
```
