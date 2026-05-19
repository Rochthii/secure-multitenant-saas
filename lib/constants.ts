/**
 * SITE_URL — Ưu tiên env var NEXT_PUBLIC_SITE_URL.
 * Trailing slash được tự loại bỏ.
 *
 * ► Hiện tại: set NEXT_PUBLIC_SITE_URL=https://chua-chantarangsay-new.vercel.app trong Vercel
 * ► Khi mua domain: đổi thành https://chantarangsay.org → redeploy → xong
 * Không cần sửa code.
 */
export const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'https://khleang.vercel.app';

export const DEFAULT_SITE_NAME = "Secure Multi-tenant SaaS";
export const DEFAULT_SITE_DESCRIPTION = "Nghiên cứu và thiết kế kiến trúc phần mềm an toàn cho nền tảng đa khách hàng";

export const BRAND_NAME_VI = "Secure Multi-tenant SaaS";
export const BRAND_NAME_EN = "Secure Multi-tenant SaaS";

export const LOCALES = {
    vi: "Tiếng Việt",
    km: "ភាសាខ្មែរ",
    en: "English",
} as const;

export const DEFAULT_LOCALE = "vi";
