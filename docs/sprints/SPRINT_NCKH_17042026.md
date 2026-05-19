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
