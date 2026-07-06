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
Dự án đã hoàn thành "Hardening" bảo mật toàn diện:
1. **RLS & JWT Claims:** Đã áp dụng JWT Claims trong DB cho RLS và sửa lỗi đăng nhập đa chi nhánh (getCachedUserContext).
2. **Access Control:** Thu hồi quyền INSERT audit_logs từ client, phân quyền RPC block_ip/unblock_ip và khóa chặt `search_path` cho các hàm SECURITY DEFINER.
3. **Edge Cache & IPFS WORM:** Đồng bộ hóa cache Redis tức thời khi Admin thay đổi trạng thái và tự động đóng gói, băm liên kết chuỗi và đẩy log kiểm toán nhạy cảm lên IPFS phi tập trung.

## 🧠 Context Memory
- **Last Milestone:** Vá thành công 14 điểm lỗi và lỗ hổng bảo mật nghiêm trọng (F#01 -> F#14), chuyển đổi Connection Pooler sang phân tán dùng Upstash Redis, đồng bộ hóa kiểm thử Middleware pass 100%, tích hợp thành công Sổ cái WORM phi tập trung lên IPFS (Pinata JWT) và nạp database migration thành công lên Supabase Cloud (`cvqmmrpupyvbrtsisudd`).
- **Current Focus:** Hoàn tất tài liệu và chuẩn bị kịch bản thuyết trình bảo vệ đồ án tốt nghiệp PTIT.
- **Next Step:** Soạn slide thuyết trình 10 phút, chuẩn bị kịch bản demo an ninh thực chiến (SOC Dashboard, Sổ cái WORM Vault / IPFS WORM Link, Threat Simulator, Edge IP Block SOAR, Zero Trust SVG Map).
