# Bộ Tài Liệu Kỹ Thuật — Đồ Án Tốt Nghiệp

> **Đề tài:** Nghiên cứu và thiết kế kiến trúc phần mềm an toàn cho nền tảng đa khách hàng (Secure Multi-tenant SaaS): Áp dụng Row-Level Security và Audit Log trong quản trị rủi ro thông tin.  
> **Sinh viên:** Chăm Rốch Thi  
> **Trường:** Học viện Công nghệ Bưu chính Viễn thông (PTIT)  
> **Cập nhật:** 2026-05-16

---

## Mục tiêu tài liệu

Đây là **bản đồ tài liệu chính thức** của dự án đồ án tốt nghiệp. Toàn bộ nội dung được tổ chức theo 4 trụ cột nghiên cứu, phục vụ làm **nguồn chuẩn** cho chương Phân tích & Thiết kế, Triển khai, và Đánh giá trong quyển ĐATN.

---

## 4 Trụ Cột Tài Liệu

### Trụ 1: Kiến trúc Multi-tenant & Cô lập Dữ liệu

| File | Nội dung |
|---|---|
| `docs/ARCHITECTURE.md` | Kiến trúc tổng thể hệ thống (System Architecture) |
| `docs/07_DATABASE_MIGRATIONS_RLS.md` | Playbook DB: Shared Schema, Migration Strategy, RLS Model |
| `docs/01_OPERATIONS_HANDBOOK.md` | Vận hành hệ thống production: Deploy, Monitoring, Runtime |

> **Trọng tâm đề tài:** Mô hình Shared Database — Shared Schema. Mỗi bảng nghiệp vụ gắn `tenant_id` FK → cô lập dữ liệu hoàn toàn ở tầng database bằng PostgreSQL RLS Policies.

### Trụ 2: Mô hình Bảo mật (RBAC → ABAC + RLS)

| File | Nội dung |
|---|---|
| `docs/03_SECURITY_PERMISSIONS.md` | Defense-in-depth: 4 lớp bảo mật, RBAC + ABAC, Guard patterns |
| `docs/10_ENV_VARIABLES_REFERENCE.md` | Biến môi trường & quản lý bí mật (Secret Management) |
| Migration: `supabase/migrations/20260516100000_abac_time_ip_policies.sql` | ABAC: Time-based Access + Audit DELETE Trigger |

> **Trọng tâm đề tài:** 6 vai trò RBAC (super_admin → tenant_accountant) + ABAC bổ sung (giờ hành chính, loại thao tác). RLS enforcement tại tầng PostgreSQL — không phụ thuộc application layer.

### Trụ 3: Hệ thống Audit Log & Giám sát SOC

| File | Nội dung |
|---|---|
| `docs/05_ADMIN_FEATURES.md` | Module admin: SOC Dashboard, Audit Logs, Cross-cutting concerns |
| `docs/06_API_ACTIONS_CATALOG.md` | Catalog API/Server Actions + audit trail |
| Source: `lib/audit/security-stats.ts` | SOC Query Engine: Security Score, Anomaly Detection, RLS Coverage |
| Source: `lib/audit/formatters.ts` | Audit Log: Action Labels, Severity Levels, SOC-friendly format |
| Source: `app/admin/security-center/page.tsx` | SOC Dashboard UI |

> **Trọng tâm đề tài:** Bảng `audit_logs` ghi nhận mọi mutation (CREATE/UPDATE/DELETE). Immutable design (chỉ INSERT, không UPDATE/DELETE). Trigger tự động trước DELETE trên bảng nhạy cảm.

### Trụ 4: Quản trị Rủi ro & Tuân thủ ISO 27017

| File | Nội dung |
|---|---|
| `docs/08_INCIDENT_RESPONSE_RUNBOOK.md` | Runbook ứng cứu sự cố + ISO 27017 §8-10 |
| `docs/11_SEV1_SCENARIOS_TEMPLATES.md` | Kịch bản SEV-1 + Cross-tenant Breach Playbook |
| `docs/09_RELEASE_HANDOFF_CHECKLIST.md` | Checklist DevSecOps: Pre-release, Deploy, Handoff |
| `docs/02_CRON_BACKUP_RUNBOOK.md` | DR/Backup: Lịch cron, Restore, Data Retention |

> **Trọng tâm đề tài:** Ánh xạ ISO/IEC 27017 — Shared Responsibility Model (10 lớp), Asset Handling (CLD.8.1.5), Privileged Access (CLD.9.5.1), Event Log Protection (CLD.12.4.1).

---

## Đề Cương Đồ Án & Đánh Giá An Ninh

- **Đề cương Đồ án:** `docs/17_GRADUATION_THESIS_PROPOSAL.md`
- **Bản phân tích Ánh xạ:** `docs/18_PROPOSAL_MAPPING_ANALYSIS.md`
- **Đánh giá An ninh & Khoảng trống Kiến trúc:** `docs/19_SECURITY_AUDIT_FEEDBACK.md`

---

## Tài liệu Legacy (Tham khảo lịch sử)

Các tài liệu dưới đây thuộc phiên bản cũ hoặc ngoài phạm vi đề tài hiện tại. Giữ lại để đối chiếu lịch sử quyết định kỹ thuật, **không phải nguồn chuẩn** nếu mâu thuẫn.

| File | Ghi chú |
|---|---|
| `docs/MASTER_TECHNICAL_DOCUMENTATION.md` | Tổng hợp kỹ thuật (v1) |
| `docs/DATABASE_COMPLETE.md` | Schema tổng quan |
| `docs/DATABASE_SETUP_GUIDE.md` | Hướng dẫn setup DB |
| `docs/API_DOCS.md` | API Reference chi tiết |
| `docs/ADMIN_SETUP.md` | Hướng dẫn setup admin |
| `docs/CONTRIBUTING.md` | Contributing guide |
| `docs/_legacy_archive/` | Nhóm tài liệu đã archive |

### Ngoài phạm vi đề tài (Archive)

Các file sau liên quan đến Mobile App, AI/RAG, hoặc nội dung tôn giáo — **không nằm trong phạm vi nghiên cứu** của đề tài ĐATN:

- `docs/04_PUBLIC_FEATURES.md` — Chức năng public site (UX)
- `docs/12_DATABASE_MIGRATION_STRATEGY.md` — So sánh Supabase/Neon
- `docs/13_*` đến `docs/16_*` — Mobile App Ecosystem
- `docs/18_AI_TESTING_SUITE.md` — AI/RAG Testing
- `docs/MOBILE_APP_ULTIMATE_MASTER_PLAN.md` — Mobile master plan
- `docs/TAM_BAO_BLOCKS_STYLE_GUIDE.md` — UI Blocks tâm linh
- `docs/culture_guidelines.md` — Văn hóa Phật giáo

---

## Quy tắc cập nhật tài liệu

1. Mọi thay đổi về **RLS policy / Migration / Guard** → cập nhật `03` và `07`.
2. Mọi thay đổi về **Audit Log / SOC Dashboard** → cập nhật `05` và code tương ứng.
3. Mọi sự cố bảo mật → ghi nhận vào `08` (Runbook) hoặc `11` (SEV-1).
4. Trước mỗi release → kiểm tra `09` (Release Checklist).
5. **Không xóa** file legacy; chỉ đánh nhãn rõ ràng "archive/ngoài phạm vi".
