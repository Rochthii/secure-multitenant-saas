# MULTITENANT_TENANTS: Operating Manual

Hệ thống quản lý đa chi nhánh dùng kiến trúc Multi-tenant (Supabase / Next.js).
Kiến trúc ECC (Everything Claude Code) được cài đặt để hỗ trợ phát triển Agentic chuyên sâu.

## 🛠 Tech Stack
- **Frontend:** Next.js (App Router), Tailwind CSS, Framer Motion
- **Backend/DB:** Supabase (PostgreSQL), Shared DB w/ Tenant Isolation (RLS)
- **Auth:** Supabase Auth (RBAC: super_admin, tenant_admin, etc.)
- **Agentic Infrastructure:** ECC (Everything Claude Code) v1.0

## 📜 Lệnh thường dùng
- `npm run dev` - Chạy local development
- `npm run build` - Kiểm tra build production
- `npm run lint` - Kiểm tra lỗi code/style
- `npm run test` - Chạy unit tests
- `/compact` - Lệnh dọn dẹp ngữ cảnh (Workflow ECC Custom)

## 🛡️ Security Mission (Hardening)
Dự án đang trong giai đoạn "Hardening" bảo mật:
1. **Patching RLS:** Đã vá lỗ hổng leo thang đặc quyền trong `init_tenant.sql`.
2. **Postgres RPC:** Cần chuyển đổi các thao tác Update nhạy cảm (như view_count) sang RPC `SECURITY DEFINER`.
3. **Audit Monitoring:** Theo dõi Audit Logs cho mọi hành động Admin.

## 🧠 Context Memory
- **Last Milestone:** Hoàn thành 100% tối ưu hóa an ninh, vá lỗi FTS tiếng Việt & Gateway RAG, nạp vector nhúng 1536, đăng ký Vercel Cron báo cáo Telegram. Đồng bộ hóa và chuẩn hóa thuật ngữ học thuật (RAM Claims $O(1)$ vs Index Scan $O(\log N)$) trên giao diện UI, code logic, cẩm nang phản biện Walkthrough và tài liệu tĩnh `docs/`. Toàn bộ đã push sạch sẽ lên GitHub main.
- **Current Focus:** Chuẩn bị tối ưu cho buổi bảo vệ tốt nghiệp PTIT.
- **Next Step:** Soạn slide thuyết trình 10 phút, chuẩn bị kịch bản demo an ninh thực chiến (SOC Dashboard, Threat Simulator, Auto-suspend SOAR).
