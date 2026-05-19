import { requireSuperAdmin } from '@/lib/permissions';

export default async function MobileAdminLayout({ children }: { children: React.ReactNode }) {
    // ─── SUPER ADMIN GUARD ──────────────────────────────────────────────
    // Chặn hoàn toàn mọi role (trừ super_admin) ngay từ Server (Backend)
    // Các role khác sẽ tự động nhận lỗi 404 (để ẩn đi sự tồn tại của chức năng)
    await requireSuperAdmin();

    return <>{children}</>;
}
