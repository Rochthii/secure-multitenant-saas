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
- **Last Milestone:** Tích hợp bộ đệm an ninh mạng biên Edge Cache (Upstash Redis kết hợp Local Memory Cache dự phòng) giúp Middleware xử lý dưới < 3ms và chặn đứng DDoS spam DB. Xây dựng Sơ đồ luồng tấn công tương tác SVG động (Zero Trust Map) mô phỏng hoạt họa các chốt chặn an toàn cho Threat Simulator v5. Toàn bộ dự án biên dịch thành công 100% không phát sinh lỗi kiểu TypeScript.
- **Current Focus:** Chuẩn bị tối ưu và hoàn tất slide thuyết trình tốt nghiệp PTIT.
- **Next Step:** Soạn slide thuyết trình 10 phút, chuẩn bị kịch bản demo an ninh thực chiến (SOC Dashboard, Threat Simulator, Auto-suspend SOAR, Zero Trust SVG Map).
