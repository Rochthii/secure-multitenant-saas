# 03 — Security & Permissions

> **Tài liệu chuẩn bảo mật/phân quyền — Đồ Án Tốt Nghiệp PTIT**  
> **Đề tài:** Secure Multi-tenant SaaS: Áp dụng RLS và Audit Log trong quản trị rủi ro thông tin.  
> **Cập nhật:** 2026-05-23  
> **Tham chiếu:** ISO/IEC 27017 §CLD.9.5.1 — Kiểm soát truy cập đặc quyền

---

## 1) Mô hình bảo mật tổng quan — Defense-in-depth (4 lớp)

Hệ thống áp dụng **Defense-in-depth** — mỗi lớp hoạt động độc lập, đảm bảo ngay cả khi một lớp bị compromise, các lớp còn lại vẫn bảo vệ dữ liệu.

```
Lớp 1: Middleware Layer
├── Host/Domain resolution → xác định tenant
├── Locale routing (vi/km/en)
└── Security headers (HSTS, X-Frame-Options, etc.)

Lớp 2: Auth + RBAC (Application Layer)
├── Supabase Auth (JWT token, session management)
├── Role-based Access Control (6 vai trò)
└── Permission matrix: resource × action × role

Lớp 3: Server Action Guards
├── requireTenantAccess(tenantIdFromUrl) → tenant scope check
├── enforceTenantScopeForRecord(table, recordId) → cross-tenant mutation block
├── requirePermission(resource, action) → fine-grained permission
└── Audit log ghi nhận mọi mutation

Lớp 4: Database-Level RLS (PostgreSQL)
├── RLS Policies → tenant_id enforcement
├── SECURITY DEFINER functions → context resolution
├── ABAC policies → time-based, operation-type constraints
└── Triggers → auto_set_tenant_id, audit_before_delete

Lớp 5: Post-Storage Integrity (v1.4.0)
├── WORM Vault → SHA-256 hash-chaining bất biến trên file ledger
├── Tenant Connection Pooler → cô lập connection slot theo tier
└── Threat Simulator → kiểm thử 4 kịch bản tấn công tự động
```

> **Điểm mấu chốt của đề tài:** Lớp 4 (Database RLS) là lớp bảo mật **không thể bypass** từ application code. Ngay cả khi developer viết sai query hoặc quên guard ở Lớp 2-3, RLS vẫn chặn truy cập cross-tenant. Lớp 5 (Post-Storage) bổ sung tính bất biến cho audit log và bảo vệ tài nguyên DB khỏi Noisy Neighbor attack.

---

## 2) Hệ thống phân quyền RBAC (Role-Based Access Control)

### 2.1 Danh mục vai trò

Theo `lib/permissions.ts` và bảng `user_roles`:

| Vai trò | Phạm vi | Mô tả |
|---|---|---|
| `super_admin` | **Toàn hệ thống** | Quyền cao nhất — quản trị mọi tenant, users, RLS monitoring |
| `company_editor` | **Toàn hệ thống** | Quản lý nội dung cross-tenant (broadcast/publish_to) |
| `tenant_admin` | **Tenant-scoped** | Quản trị viên chi nhánh — full CRUD trong tenant mình |
| `tenant_editor` | **Tenant-scoped** | Biên tập nội dung — tạo/sửa bài, chờ duyệt |
| `tenant_accountant` | **Tenant-scoped** | Quản lý ngân sách/quỹ — chỉ đọc nội dung |
| `dharma_ai_role` | **Restricted** | AI Edge Functions — chỉ đọc embeddings/knowledge base |

### 2.2 Nguyên tắc Đặc quyền Tối thiểu (Least Privilege)

- Mỗi user chỉ có **1 vai trò duy nhất** (UNIQUE constraint trên `user_roles`).
- Vai trò tenant-scoped **không thể** truy cập dữ liệu tenant khác.
- `service_role` chỉ dùng trong backend routes đã kiểm soát auth — **không expose** ra client.

### 2.3 Nguồn xác định quyền

1. **Ưu tiên:** Bảng `user_roles` (multi-tenant aware).
2. **Fallback legacy:** `auth.users.app_metadata` (chỉ dùng khi `user_roles` chưa có record).

> **Lưu ý:** Không dựa metadata làm nguồn chính vì có thể stale và gây sai tenant isolation.

---

## 3) Mô hình ABAC (Attribute-Based Access Control) — Bổ sung

ABAC được triển khai **bổ sung** lên RBAC (không thay thế) để tăng cường kiểm soát dựa trên **ngữ cảnh** (context attributes).

### 3.1 Thuộc tính ngữ cảnh đã triển khai

| Thuộc tính | Function | Mô tả |
|---|---|---|
| **Thời gian** | `is_within_business_hours()` | Giới hạn ghi 07:00–22:00 ICT cho editor/accountant |
| **Loại thao tác** | RLS policy per-operation | INSERT/UPDATE có ràng buộc riêng biệt |
| **Tenant context** | `get_current_tenant_id()` | Xác định tenant hiện tại từ JWT claim |
| **Role context** | `get_current_user_role()` | Xác định vai trò từ JWT/user_roles |

### 3.2 Ma trận ABAC

```
┌──────────────────────┬──────────────┬──────────────┬──────────────┐
│ Vai trò              │ SELECT (Đọc) │ INSERT (Tạo) │ DELETE (Xóa) │
├──────────────────────┼──────────────┼──────────────┼──────────────┤
│ super_admin          │ ✅ Mọi lúc   │ ✅ Mọi lúc   │ ✅ Mọi lúc   │
│ tenant_admin         │ ✅ Mọi lúc   │ ✅ Mọi lúc   │ ✅ Mọi lúc   │
│ tenant_editor        │ ✅ Mọi lúc   │ ⚠️ Giờ HC    │ ❌ Không     │
│ tenant_accountant    │ ✅ Mọi lúc   │ ⚠️ Giờ HC    │ ❌ Không     │
│ dharma_ai_role       │ ✅ Chỉ AI    │ ❌ Không     │ ❌ Không     │
└──────────────────────┴──────────────┴──────────────┴──────────────┘
⚠️ Giờ HC = Giờ hành chính (07:00–22:00 ICT)
```

### 3.3 Migration tham chiếu

→ `supabase/migrations/20260516100000_abac_time_ip_policies.sql`

---

## 4) RLS Policies — Cơ chế hoạt động

### 4.1 Context Resolution Functions

| Function | Return | Mô tả |
|---|---|---|
| `get_current_tenant_id()` | UUID | Lấy tenant_id từ JWT claim `user_metadata.tenant_id` |
| `get_current_user_role()` | TEXT | Lấy role từ `user_roles` table (ưu tiên) hoặc `user_metadata` |
| `is_within_business_hours()` | BOOLEAN | Kiểm tra 07:00–22:00 ICT |
| `auto_set_tenant_id()` | TRIGGER | Tự động gán tenant_id vào record mới dựa trên user context |

### 4.2 Mẫu RLS Policy chuẩn

```sql
-- SELECT: Tenant chỉ đọc dữ liệu của mình
CREATE POLICY "tenant_read_own" ON public.news
    FOR SELECT USING (
        tenant_id = public.get_current_tenant_id()
        OR public.get_current_user_role() IN ('super_admin', 'company_editor')
    );

-- INSERT: Chỉ ghi vào tenant mình + ABAC time constraint
CREATE POLICY "ABAC_time_restrict_editor_write" ON public.news
    FOR INSERT WITH CHECK (
        public.get_current_user_role() IN ('super_admin', 'company_editor', 'tenant_admin')
        OR (
            public.get_current_user_role() IN ('tenant_editor', 'tenant_accountant')
            AND public.is_within_business_hours()
            AND tenant_id = public.get_current_tenant_id()
        )
    );
```

### 4.3 RLS Coverage Monitoring

Function `get_rls_coverage()` (SOC Dashboard) kiểm tra tỉ lệ bảng có RLS:

```sql
-- Truy vấn pg_tables + pg_class.relrowsecurity
SELECT
    COUNT(CASE WHEN c.relrowsecurity THEN 1 END) AS protected,
    COUNT(*) AS total,
    (COUNT(CASE WHEN c.relrowsecurity THEN 1 END) * 100 / COUNT(*)) AS percentage
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public';
```

---

## 5) Guard Patterns (Application Layer)

### 5.1 Guard theo tenant

```typescript
// Route: /admin/t/[tenant_id]/*
await requireTenantAccess(tenantIdFromUrl);
// → Kiểm tra user.tenant_id === tenantIdFromUrl (hoặc super_admin bypass)
// → Trả notFound() nếu mismatch (giảm lộ thông tin)
```

### 5.2 Guard theo vai trò

```typescript
// Tính năng hệ thống cấp cao
await requireSuperAdmin();

// Admin actions
await requireAdmin();

// Fine-grained permission
await requirePermission('news', 'create');
```

### 5.3 Guard bản ghi mutate

```typescript
// Trước update/delete — chặn cross-tenant tampering
await enforceTenantScopeForRecord('news', recordId);
```

---

## 6) Phân loại Dữ liệu (Data Classification)

| Mức | Nhãn | Ví dụ | Bảo vệ |
|---|---|---|---|
| **L4** | Bí mật | `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET` | Env vars chỉ server, không log |
| **L3** | Nhạy cảm | `audit_logs`, `user_roles`, `bank_accounts` | RLS + admin-only + immutable |
| **L2** | Nội bộ | `news (draft)`, `transactions`, `settings` | RLS + tenant-scoped |
| **L1** | Công khai | `news (published)`, `events`, `media` | RLS read cho authenticated/anon |

---

## 7) Revalidation API Security

`/api/revalidate` có 5 lớp bảo vệ:

1. **Rate limit:** 15 req/phút/IP.
2. **Header bắt buộc:** `x-signature`, `x-timestamp`.
3. **Replay protection:** Window 5 phút.
4. **HMAC SHA-256:** `timingSafeEqual` — chống timing attack.
5. **Schema validation:** Zod — chặn payload injection.

---

## 8) Security Headers

Thiết lập tại `next.config.ts`:

| Header | Giá trị | Mục đích |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Ép HTTPS |
| `X-Frame-Options` | `DENY` | Chống Clickjacking |
| `X-Content-Type-Options` | `nosniff` | Chống MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Kiểm soát referrer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Giới hạn API trình duyệt |

---

## 9) Ánh xạ ISO/IEC 27017

| Control | Mô tả | Minh chứng kỹ thuật |
|---|---|---|
| **CLD.6.3.1** | Shared Roles & Responsibilities | Bảng Shared Responsibility (§8.1 Runbook) |
| **CLD.8.1.5** | Asset Handling upon Termination | Quy trình offboard tenant (§8.2 Runbook) |
| **CLD.9.5.1** | Privileged Access Control | RBAC 6 roles + ABAC time constraint |
| **CLD.9.5.2** | Management of Privileged Utilities | `SECURITY DEFINER` functions, service_role restriction |
| **CLD.12.4.1** | Event Logging | Immutable audit_logs + auto DELETE trigger |
| **CLD.12.4.2** | Protection of Log Information | **WORM Vault** SHA-256 hash-chaining — phát hiện tamper |
| **CLD.12.4.3** | Administrator & Operator Logs | SOC Dashboard: Top Users, Activity Timeline |
| **CLD.16.1.2** | Notification of Security Events | Cross-tenant breach notification (§10 Runbook) |
| **CLD.17.1.1** | Availability of Security Resources | **Tenant Pooler** giới hạn connection tránh Noisy Neighbor DoS |

---

## 10) Checklist bảo mật khi thêm feature mới

1. ☐ Có guard auth phù hợp chưa (`require*`)?
2. ☐ Có guard tenant/bản ghi mutate chưa?
3. ☐ Có validate input (Zod) và strip field rác chưa?
4. ☐ Có revalidate đúng tag/path sau mutate chưa?
5. ☐ Có audit log cho thao tác nhạy cảm chưa?
6. ☐ Có RLS policy trên bảng mới chưa?
7. ☐ Bảng mới có `tenant_id` FK chưa? Nếu không, có lý do ghi rõ?
8. ☐ Đã kiểm tra cross-tenant access chưa?
9. ☐ Audit log có được đẩy vào WORM Vault (`/api/admin/security/worm-vault` POST) chưa?
10. ☐ Hành động tạo tải cao có kiểm tra tenant connection slot chưa?

---

## 11) WORM Audit Vault — Tính bất biến mật mã học (v1.4.0)

### 11.1 Cơ chế hoạt động

Hệ thống sử dụng **SHA-256 Hash Chaining** để đảm bảo tính bất biến của audit log ngay cả khi kẻ tấn công có quyền ghi vào file system:

```
Entry[0]: { data, hash: SHA256(data + "GENESIS") }
Entry[1]: { data, hash: SHA256(data + entry[0].hash) }   ← prev_hash
Entry[N]: { data, hash: SHA256(data + entry[N-1].hash) } ← chuỗi không thể giả mạo
```

- File ledger: `storage/worm_vault/immutable_ledger.json`
- Quyền file: `0o444` (read-only sau khi ghi)
- Kiểm tra tính toàn vẹn: `GET /api/admin/security/worm-vault` → `{ integrity: "VERIFIED" | "CORRUPTED" }`

### 11.2 Giới hạn (để ghi nhận học thuật)

| Cơ chế | Bảo vệ chống | Không bảo vệ chống |
|---|---|---|
| Hash chaining | Sửa/xóa 1 entry bất kỳ | Root access xóa cả file ledger |
| `chmod 0o444` | Ghi đè ngẫu nhiên từ app | Người dùng root OS |
| **Mục tiêu tương lai** | AWS S3 Object Lock (WORM thực) | — |

---

## 12) Tenant Connection Pooler — Noisy Neighbor Protection (v1.4.0)

### 12.1 Cơ chế hoạt động

```typescript
// Tier-based connection limits
const TIER_LIMITS = { free: 3, pro: 10, enterprise: 25 }

// Khi tenant request DB connection:
await pooler.acquireSlot(tenantId, tier)  // Throw nếu quá limit
// ... thực hiện query ...
await pooler.releaseSlot(tenantId)        // Giải phóng slot
```

### 12.2 Phân bổ tài nguyên theo tier

| Plan | Max Connections | Hành vi khi vượt ngưỡng |
|---|---|---|
| Free | 3 | 429 Too Many Requests |
| Pro | 10 | 429 Too Many Requests |
| Enterprise | 25 | 429 Too Many Requests |
| **Super Admin** | ∞ | Không giới hạn |

### 12.3 API kiểm soát

- `GET /api/admin/security/tenant-pooler` — trả về stats tất cả tenant
- `POST { action: "simulate_flood" }` — kiểm thử DDoS simulation
- `POST { action: "release", tenantId }` — giải phóng thủ công
