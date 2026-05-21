# 07 — Database, Migrations & RLS Playbook

> **Tài liệu chuẩn dữ liệu và bảo mật DB — Đồ Án Tốt Nghiệp PTIT**  
> **Đề tài:** Secure Multi-tenant SaaS: Áp dụng RLS và Audit Log trong quản trị rủi ro thông tin.  
> **Cập nhật:** 2026-05-16

---

## 1) Mục tiêu

Mô tả cách hệ thống quản lý vòng đời schema, migration, và **tenant isolation** bằng **PostgreSQL Row-Level Security (RLS)** trong kiến trúc Shared Database — Shared Schema.

> **Tại sao Shared Schema?** So với Isolated DB (chi phí cao, quản trị phức tạp) và Separate Schema (phức tạp migration), Shared Schema cho phép một codebase phục vụ hàng trăm tenant với chi phí thấp nhất — nhưng đòi hỏi **RLS chặt chẽ** để cô lập dữ liệu.

---

## 2) Kiến trúc dữ liệu Multi-tenant

### 2.1 Bảng trung tâm: `tenants`

- Mỗi tenant (chi nhánh/tổ chức) là 1 record trong bảng `tenants`.
- Thuộc tính: `id (UUID PK)`, `name`, `domain`, `subdomain`, `tenant_type`, `theme_colors`, `is_active`.
- Mọi bảng nghiệp vụ **bắt buộc** có cột `tenant_id UUID REFERENCES tenants(id)`.

### 2.2 Nhóm bảng nghiệp vụ

| Nhóm | Bảng | RLS |
|---|---|---|
| **Nội dung** | `news`, `events`, `pages`, `about_sections`, `categories`, `media`, `hero_slides`, `faqs` | ✅ tenant_id |
| **Vận hành** | `event_registrations`, `contact_messages`, `newsletter_subscribers` | ✅ tenant_id |
| **Tài chính** | `transactions`, `transaction_projects`, `bank_accounts` | ✅ tenant_id |
| **Quản trị** | `user_roles`, `role_permissions`, `audit_logs`, `site_settings` | ✅ tenant_id |
| **Hệ thống** | `tenants`, `organizations` | 🔒 Admin-only |

### 2.3 Trigger tự động: `auto_set_tenant_id`

```sql
-- Trigger BEFORE INSERT: Tự động gán tenant_id từ user context
CREATE OR REPLACE FUNCTION auto_set_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tenant_id IS NULL THEN
        NEW.tenant_id := get_current_tenant_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

> **Ý nghĩa:** Developer không cần truyền `tenant_id` thủ công — trigger tự động gắn từ JWT context. Giảm rủi ro quên tenant_id.

---

## 3) RLS Model — Cơ chế cô lập dữ liệu tầng Database

### 3.1 Nguyên tắc thiết kế

1. **Deny by default:** Mỗi bảng có `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY`.
2. **Explicit allow:** Chỉ cho phép truy cập qua CREATE POLICY rõ ràng.
3. **Context resolution:** Dùng `SECURITY DEFINER` functions để lấy tenant_id/role từ JWT.
4. **No application bypass:** RLS hoạt động ở tầng PostgreSQL — application code không thể bypass.

### 3.2 Chuỗi Policy chuẩn cho mỗi bảng

```sql
-- 1. SELECT: Tenant đọc dữ liệu của mình + Global admin đọc tất cả
CREATE POLICY "tenant_select_own" ON public.{table}
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        OR get_current_user_role() IN ('super_admin', 'company_editor')
    );

-- 2. INSERT: Ghi vào tenant mình + ABAC constraint
CREATE POLICY "tenant_insert_own" ON public.{table}
    FOR INSERT WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND get_current_user_role() IN ('super_admin', 'tenant_admin', 'tenant_editor')
    );

-- 3. UPDATE: Sửa dữ liệu tenant mình
CREATE POLICY "tenant_update_own" ON public.{table}
    FOR UPDATE USING (
        tenant_id = get_current_tenant_id()
        AND get_current_user_role() IN ('super_admin', 'tenant_admin', 'tenant_editor')
    );

-- 4. DELETE: Chỉ admin
CREATE POLICY "tenant_delete_admin" ON public.{table}
    FOR DELETE USING (
        tenant_id = get_current_tenant_id()
        AND get_current_user_role() IN ('super_admin', 'tenant_admin')
    );
```

### 3.3 RLS cho bảng broadcast (`published_to`)

Một số nội dung (news, media) có thể **broadcast** sang nhiều tenant qua cột `published_to UUID[]`:

```sql
CREATE POLICY "broadcast_read" ON public.news
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        OR get_current_tenant_id() = ANY(published_to)
        OR get_current_user_role() IN ('super_admin', 'company_editor')
    );
```

### 3.4 RLS cho Audit Logs — Immutable Design

```sql
-- Chỉ cho phép INSERT (ghi log), KHÔNG UPDATE/DELETE
CREATE POLICY "audit_insert_only" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- SELECT: Admin đọc tất cả, tenant chỉ đọc log của mình
CREATE POLICY "audit_select" ON public.audit_logs
    FOR SELECT USING (
        get_current_user_role() IN ('super_admin', 'tenant_admin')
        AND (
            tenant_id = get_current_tenant_id()
            OR get_current_user_role() = 'super_admin'
        )
    );

-- KHÔNG CÓ policy UPDATE/DELETE → RLS deny by default → immutable
```

---

## 4) ABAC (Attribute-Based Access Control) — Bổ sung RLS

### 4.1 Time-based Access Control

```sql
-- Function: Kiểm tra giờ hành chính 07:00-22:00 ICT
CREATE OR REPLACE FUNCTION is_within_business_hours()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXTRACT(HOUR FROM NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')
        BETWEEN 7 AND 21;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

**Ứng dụng:** Policy INSERT cho `tenant_editor` và `tenant_accountant` chỉ hoạt động trong giờ hành chính.

### 4.2 Audit-enhanced DELETE Trigger

```sql
-- Trigger BEFORE DELETE: Ghi log TRƯỚC KHI xóa record
CREATE OR REPLACE FUNCTION audit_before_delete()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (user_id, user_email, action, resource, record_id, old_data, tenant_id)
    VALUES (auth.uid(), ..., 'delete', TG_TABLE_NAME, OLD.id::TEXT, to_jsonb(OLD), OLD.tenant_id);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gắn trigger cho bảng nhạy cảm: news, events, transactions
```

**Ý nghĩa:** Dữ liệu bị xóa vẫn được lưu trữ vĩnh viễn trong `audit_logs.old_data` — đảm bảo non-repudiation.

### 4.3 Migration tham chiếu

→ `supabase/migrations/20260516100000_abac_time_ip_policies.sql`

---

## 5) RLS Policy Registry

### 5.1 Danh sách RLS Policies đã triển khai

| Bảng | SELECT | INSERT | UPDATE | DELETE | ABAC |
|---|:---:|:---:|:---:|:---:|:---:|
| `news` | ✅ | ✅ | ✅ | ✅ | ⏰ Time |
| `events` | ✅ | ✅ | ✅ | ✅ | — |
| `transactions` | ✅ | ✅ | ✅ | ✅ | 🔒 Trigger |
| `media` | ✅ | ✅ | ✅ | ✅ | — |
| `user_roles` | ✅ | ✅ | ✅ | ✅ | — |
| `audit_logs` | ✅ | ✅ | ❌ | ❌ | 🔒 Immutable |
| `site_settings` | ✅ | ✅ | ✅ | ❌ | — |
| `bank_accounts` | ✅ | ✅ | ✅ | ✅ | — |
| `cron_job_logs` | ✅ | ✅ | ❌ | ❌ | 🔒 Operational log |
| `rls_benchmark_results` | ✅ | ✅ | ❌ | ❌ | 🔒 Performance log |

### 5.2 RLS Coverage Score

Function `get_rls_coverage()` truy vấn trực tiếp `pg_tables` + `pg_class.relrowsecurity`:

```
Mục tiêu: ≥ 90% bảng trong schema public có RLS enabled.
Hiện tại:  25/27 bảng → 93% ✅
```

---

## 6) Audit & Traceability

### 6.1 Schema `audit_logs`

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | UUID PK | ID bản ghi log |
| `user_id` | UUID | Ai thực hiện (auth.uid) |
| `user_email` | TEXT | Email actor |
| `action` | TEXT | create/update/delete/approve/reject/login/... |
| `resource` | TEXT | Bảng/module bị tác động |
| `table_name` | TEXT | Tên bảng gốc |
| `record_id` | TEXT | ID record bị tác động |
| `old_data` | JSONB | Dữ liệu cũ (trước mutation) |
| `new_data` | JSONB | Dữ liệu mới (sau mutation) |
| `ip_address` | TEXT | IP nguồn |
| `tenant_id` | UUID | Tenant context |
| `created_at` | TIMESTAMPTZ | Thời điểm ghi log |

### 6.2 Tính chất Immutable

- **RLS:** Chỉ INSERT policy, không có UPDATE/DELETE policy.
- **Trigger:** `audit_before_delete` ghi bản sao TRƯỚC KHI xóa record gốc.
- **Service role:** Audit log được ghi qua `createAdminClient()` (bypass RLS) — đảm bảo không ai tắt được logging.

### 6.3 SOC Aggregation

Module `lib/audit/security-stats.ts` tổng hợp dữ liệu từ `audit_logs` cho SOC Dashboard:

- **Security Score** = RLS Coverage % − Anomaly Penalty
- **Anomaly Detection** = User có >20 actions/giờ
- **Action Distribution** = Phân bổ CREATE/UPDATE/DELETE theo 24h
- **Tenant Distribution** = Hoạt động theo chi nhánh

---

## 7) Migration Strategy

### 7.1 Nguồn migration

`supabase/migrations/*.sql` — mỗi file theo timestamp, áp dụng tuần tự.

### 7.2 Các cụm migration nổi bật

| Phase | Nội dung | Tham chiếu đề tài |
|---|---|---|
| Foundation | Schema base + settings | Kiến trúc Shared Schema |
| Multi-tenant | tenant_id FK, slug constraints | **Mô hình cô lập dữ liệu** |
| RLS Hardening | Policies + SECURITY DEFINER | **Trọng tâm đề tài** |
| RBAC | user_roles, role_permissions | **Phân quyền vai trò** |
| Broadcast | published_to UUID[] | Cross-tenant content sharing |
| ABAC | Time-based + DELETE triggers | **ABAC bổ sung** |
| Security SOC & Operations | `cron_job_logs`, `rls_benchmark_results`, `tenant_lifecycle` | **Đo lường kiểm chứng, giám sát vận hành và Vòng đời Tenant** |

### 7.3 Quy trình migration an toàn

1. Tạo migration SQL mới — **không sửa** file đã apply production.
2. Test trên dev với dữ liệu tenant mẫu.
3. Kiểm tra backward compatibility cho actions hiện tại.
4. Backup trước khi apply production.
5. Sau apply: regen types + smoke test admin/public.

---

## 8) DB Operational Runbook

### 8.1 Trước migration production

1. Tạo backup (cron/manual).
2. Khóa phạm vi release — tránh chạy song song.
3. Chuẩn bị rollback plan theo bảng chịu tác động.

### 8.2 Sau migration production

1. Kiểm tra bảng/index/constraint mới.
2. Kiểm tra RLS policy mới bằng `pg_policies`.
3. Test quyền theo role: `super_admin`, `tenant_admin`, `tenant_editor`.
4. Theo dõi lỗi Sentry + SOC Dashboard 30–60 phút đầu.

---

## 9) Rủi ro thường gặp

### 9.1 RLS Policy quá rộng → Cross-tenant data leak

- **Dấu hiệu:** User Tenant A nhìn thấy dữ liệu Tenant B.
- **Giải pháp:** Kiểm tra `get_current_tenant_id()` trả đúng giá trị. Review `pg_policies`.
- **Playbook chi tiết:** → `docs/08_INCIDENT_RESPONSE_RUNBOOK.md` §10.

### 9.2 RLS Policy quá chặt → Admin hợp lệ bị chặn

- **Dấu hiệu:** Admin không thể CRUD dù đã đăng nhập đúng.
- **Giải pháp:** Kiểm tra `user_roles` có record đúng tenant_id + role không.

### 9.3 Migration drift → Schema mismatch

- **Dấu hiệu:** Action fail do cột/constraint mismatch.
- **Giải pháp:** Đồng bộ migration state + cập nhật TypeScript types.

---

## 10) Checklist khi thêm bảng mới

1. ☐ Có `tenant_id UUID REFERENCES tenants(id)` không? Nếu không, nêu rõ lý do.
2. ☐ Có `ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY` chưa?
3. ☐ Có 4 policy (SELECT/INSERT/UPDATE/DELETE) với tenant scope chưa?
4. ☐ Có trigger `auto_set_tenant_id` chưa?
5. ☐ Có index phù hợp chưa (`tenant_id`, composite index)?
6. ☐ Đã cập nhật TypeScript types chưa?
7. ☐ Đã test cross-tenant access chưa?
8. ☐ Đã cập nhật RLS Policy Registry (§5) chưa?
