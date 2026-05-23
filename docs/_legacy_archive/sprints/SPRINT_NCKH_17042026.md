---
title: Sprint NCKH - Hybrid RAG & Buddhist Ontology
date: 17/04/2026
epic: Scientific Agentic GraphRAG Upgrade
---

# SPRINT PLAN: NCKH TRỤ CỘT 1 & 2

**Mục tiêu Sprint:** Hoàn thiện nâng cấp RAG truyền thống lên **Hybrid RAG** (kết hợp vector + từ khóa chuẩn BM25) ngang tầm Enterprise và tích hợp **Domain Ontology** (Bộ giải nghĩa từ vựng) chặn ảo giác thuật ngữ.

---

## Danh sách Task (Theo độ ưu tiên Tức Thời)

### 🔴 P0 (Critical - Ưu tiên hàng đầu)
*Đây là chốt chặn quan trọng định hình toàn bộ khả năng truy xuất.*

1. **[TASK-01] Nâng cấp DB Database (Migration)** - ✅ **Done**
   - **Thành tựu:** Chạy thành công các migration về Hybrid Search và Restricted RBAC.

2. **[TASK-02] Code Hàm Hybrid Search RRF** - ✅ **Done**
   - **Thành tựu:** Kết hợp thành công Vector + BM25, tăng độ chính xác tìm kiếm kinh điển.

### 🟠 P1 (Core - Cốt lõi)
*Phần nội lực Tri thức số mà Hội đồng NCKH đánh giá.*

3. **[TASK-03] Xây dựng Lược đồ Bảng Ontology** - ✅ **Done**
   - **Thành tựu:** Tạo bảng `dharma_ontology` phục vụ GraphRAG.

4. **[TASK-05] Truy vấn Đa kích (Query Expansion)** - ✅ **Done**
   - **Thành tựu:** Tích hợp thành công Router Agent và SHA-256 Cache.

### 🔵 Kết quả Sprint ngày 17/04/2026

- **Security**: Đã đạt tiêu chuẩn Enterprise với Role-based Access Control (`dharma_ai_role`) và IP Rate Limiting.
- **Stability**: Đã fix lỗi 500 nạp PDF, đảm bảo luồng nạp liệu mượt mà từ Admin Portal.
- **Data Ingestion**: Đã nạp thành công cuốn **"Tâm Lý Học Phật Giáo"** (205 chunks) phục vụ RAG.
- **Reliability**: Đã cấu hình hệ thống dự phòng (Failover) đa nhà cung cấp (Gemini & Groq).

---

## 📌 Khái niệm Hoàn thành (Definition of Done)
1. **[Kỹ thuật]** Hệ thống đã được `npm run build` thành công và push lên GitHub.
2. **[Học thuật]** Các câu trả lời của AI hiện đã có dẫn chứng nguồn gốc minh bạch và tuân thủ hệ phái.

---
*Người cập nhật: Antigravity AI — 17/04/2026*

---

# CẬP NHẬT NGÀY 21/05/2026

## ✅ Các hạng mục đã làm

1. **Performance Benchmark (RLS O(N) vs O(1))**
   - Tạo trang **/admin/performance** với dashboard P50/P90/P99 và so sánh Legacy vs JWT Claims.
   - Thêm action `runRlsBenchmark` + migrations `benchmark_legacy`/`benchmark_jwt` để có dataset đo lường.

2. **SOC / Security Center**
   - Bổ sung **Threat Simulation** (cross-tenant attack demo) + audit log ghi nhận.
   - Thêm **Noisy Neighbors widget** (rate limit hits).
   - Anomaly alerts có nút **Force Logout** (API bảo vệ tenant isolation).

3. **Audit Logs theo Tenant**
   - Tạo trang audit logs cho từng tenant: `/admin/t/[tenant_id]/audit-logs`.
   - Hỗ trợ export Excel theo bộ lọc + tenant.

4. **Backup / Cron Observability**
   - Bổ sung bảng `cron_job_logs` + logging cho backup/publish/reminder crons.
   - Trang backup có history panel và filter export theo tenant/table.

5. **Tenant Security & Lifecycle**
   - Tenant Security Center: KPI 24h, anomaly, tuân thủ 2FA, cấu hình IP whitelist.
   - Tenant Lifecycle: suspend/reactivate workspace + trạng thái lifecycle.
   - Feature toggles cho modules theo tenant.

---

## 🔎 Đối chiếu với [docs/17_GRADUATION_THESIS_PROPOSAL.md](../17_GRADUATION_THESIS_PROPOSAL.md)

- **Mục 2.2.4 & 4.3 (SOC Dashboard & Audit Log):** Đã có SOC Dashboard, audit log explorer, export, anomaly alerts.
- **Mục 2.2.5 (Noisy Neighbor / Rate Limiting):** Đã có Noisy Neighbors widget từ `rate_limit_hits`.
- **Mục 2.2.6 (Active Defense):** Force Logout + Threat Simulation demo, ghi audit.
- **Mục 5 (Benchmarking):** Hoàn thiện flow đo hiệu năng RLS O(N) vs O(1).
- **DevSecOps / Cron Observability:** Ghi log cron jobs (backup/publish/reminder) để phục vụ audit vận hành.
