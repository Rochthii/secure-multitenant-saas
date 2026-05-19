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
- **Last Milestone:** Hoàn thành cơ chế Broadcast (phát sóng) đa chi nhánh cho Media & Categories + Global Admin Dashboards.
- **Current Focus:** Tối ưu hóa bộ lọc Tenant (Chi nhánh/Công ty) và đồng bộ hóa tài liệu hệ thống (Docs Sync).
- **Next Step:** Sẵn sàng cho các module mới (Lịch lễ, Sự kiện) hoặc mở rộng tính năng Broadcast cho Tin tức/Pháp thoại.
