const fieldLabels: Record<string, string> = {
    title: 'Tiêu đề',
    title_vi: 'Tiêu đề (Tiếng Việt)',
    title_en: 'Tiêu đề (Tiếng Anh)',
    title_km: 'Tiêu đề (Tiếng Khmer)',
    content: 'Nội dung',
    content_vi: 'Nội dung (Tiếng Việt)',
    content_en: 'Nội dung (Tiếng Anh)',
    content_km: 'Nội dung (Tiếng Khmer)',
    excerpt: 'Tóm tắt',
    excerpt_vi: 'Tóm tắt (Tiếng Việt)',
    excerpt_en: 'Tóm tắt (Tiếng Anh)',
    excerpt_km: 'Tóm tắt (Tiếng Khmer)',
    slug: 'Đường dẫn (Slug)',
    name: 'Tên',
    domain: 'Tên miền',
    subdomain: 'Tên miền phụ',
    status: 'Trạng thái',
    amount: 'Số tiền',
    description: 'Mô tả',
    email: 'Email',
    role: 'Vai trò',
    phone: 'Số điện thoại',
    address: 'Địa chỉ',
    logo_url: 'Đường dẫn Logo',
    tenant_type: 'Loại hình tổ chức',
    layout_style: 'Phong cách giao diện',
    theme_colors: 'Màu sắc giao diện',
    modules_config: 'Cấu hình tính năng',
    parent_id: 'Đơn vị quản lý',
    contact_info: 'Thông tin liên hệ',
    bank_name: 'Tên ngân hàng',
    account_number: 'Số tài khoản',
    account_holder: 'Chủ tài khoản',
    project_id: 'Chiến dịch / Dự án',
    is_active: 'Kích hoạt',
    is_published: 'Xuất bản',
    user_roles: 'Phân quyền',
    metadata: 'Dữ liệu cấu hình',
    author_name: 'Tác giả',
    category_name: 'Danh mục',
    published_at: 'Ngày xuất bản',
    thumbnail_url: 'Ảnh đại diện',
};

/**
 * Loại bỏ các trường kỹ thuật không mang lại thông tin hữu ích cho người dùng.
 */
function isTechnicalField(key: string): boolean {
    return (
        key.endsWith('_id') || 
        ['id', 'created_at', 'updated_at', 'password', 'tenant_id', 'parent_id', 'user_id', 'record_id'].includes(key)
    );
}

/**
 * Chuẩn hóa giá trị hiển thị: loại bỏ HTML, dịch nhãn, giới hạn độ dài.
 */
function cleanAndFormatValue(key: string, val: any): string | null {
    if (val === null || val === undefined) return null;
    
    // Nếu là object phức tạp, bỏ qua
    if (typeof val === 'object') {
        const str = JSON.stringify(val);
        if (str === '{}' || str === '[]') return null;
        return null;
    }
    
    let strVal = String(val).trim();
    if (strVal === '' || strVal === '[]' || strVal === '{}') return null;

    // Loại bỏ thẻ HTML bằng Regex cực mạnh
    strVal = strVal.replace(/<[^>]*>/g, ' ').trim();
    // Thay thế nhiều dấu cách bằng một dấu cách
    strVal = strVal.replace(/\s+/g, ' ');

    // Thu gọn nếu quá dài để tránh vỡ giao diện
    if (strVal.length > 80) {
        strVal = strVal.substring(0, 77) + '...';
    }

    // Việt hóa các trạng thái và Boolean
    if (key === 'status' || key === 'status_name') {
        if (strVal === 'draft') return 'Bản nháp';
        if (strVal === 'published') return 'Đã xuất bản';
        if (strVal === 'active') return 'Đang hoạt động';
        if (strVal === 'inactive') return 'Ngừng hoạt động';
    }
    if (strVal === 'true') return 'Bật / Có';
    if (strVal === 'false') return 'Tắt / Không';

    return strVal;
}

/**
 * Xử lý hiển thị các thay đổi dữ liệu trong Audit Log.
 * Trả về chuỗi mô tả các thay đổi hoặc '-' nếu không có.
 */
export function formatAuditChanges(changes: any): string {
    if (!changes) return '-';
    
    // Xử lý nếu changes là chuỗi JSON
    let parsed = changes;
    if (typeof changes === 'string') {
        try {
            parsed = JSON.parse(changes);
        } catch (e) {
            return changes;
        }
    }

    try {
        // Trường hợp so sánh Before / After (Update action)
        if (parsed.before && parsed.after && typeof parsed.after === 'object') {
            const updates: string[] = [];
            for (const key in parsed.after) {
                if (isTechnicalField(key)) continue;
                
                const beforeVal = cleanAndFormatValue(key, parsed.before[key]);
                const afterVal = cleanAndFormatValue(key, parsed.after[key]);

                // Chỉ hiển thị nếu thực sự thay đổi giá trị
                if ((beforeVal || afterVal) && beforeVal !== afterVal) {
                    const fieldLabel = fieldLabels[key] || key;
                    updates.push(`• ${fieldLabel}: "${beforeVal || 'trống'}" ➝ "${afterVal || 'trống'}"`);
                }
            }
            if (updates.length > 0) return updates.join('\n');
            return 'Cập nhật thông tin hệ thống';
        }

        // Trường hợp chỉ có dữ liệu cũ (Delete action)
        if (parsed.before && (!parsed.after || parsed.after === null)) {
            const deletes: string[] = [];
            for (const key in parsed.before) {
                if (isTechnicalField(key)) continue;
                const displayVal = cleanAndFormatValue(key, parsed.before[key]);
                if (displayVal) {
                    const fieldLabel = fieldLabels[key] || key;
                    deletes.push(`• ${fieldLabel}: "${displayVal}"`);
                }
            }
            if (deletes.length > 0) return '[ĐÃ XÓA TÀI NGUYÊN]\n' + deletes.join('\n');
            return 'Xóa thông tin hệ thống';
        }

        // Trường hợp chỉ có dữ liệu mới (Create action)
        if (typeof parsed === 'object') {
            const dataToFormat = parsed.after || parsed;
            const creates: string[] = [];
            for (const key in dataToFormat) {
                if (isTechnicalField(key)) continue;
                const displayVal = cleanAndFormatValue(key, dataToFormat[key]);
                if (displayVal) {
                    const fieldLabel = fieldLabels[key] || key;
                    creates.push(`• ${fieldLabel}: "${displayVal}"`);
                }
            }
            if (creates.length > 0) return creates.join('\n');
        }

        return '-';
    } catch (e) {
        return '-';
    }
}

/**
 * Nhãn tiếng Việt cho các resource hệ thống.
 * (Enterprise context — Đã chuyển đổi từ ngữ cảnh Tôn giáo sang Doanh nghiệp)
 */
export const resourceLabels: Record<string, string> = {
    news: 'Thông báo nội bộ',
    events: 'Sự kiện',
    media: 'Tài liệu Media',
    users: 'Người dùng',
    settings: 'Cấu hình hệ thống',
    site_settings: 'Cấu hình chi nhánh',
    transactions: 'Ngân sách / Quỹ',
    transaction_projects: 'Dự án / Chiến dịch',
    bank_accounts: 'Tài khoản Ngân hàng',
    registrations: 'Đăng ký',
    event_registrations: 'Đăng ký sự kiện',
    contact_messages: 'Lời nhắn liên hệ',
    organizations: 'Tổ chức / Đối tác',
    tenants: 'Chi nhánh (Tenant)',
    user_roles: 'Phân quyền RBAC',
    audit_logs: 'Nhật ký kiểm toán',
};

/**
 * Màu sắc hiển thị cho các hành động (Badge colors).
 * Mã màu theo chuẩn SOC severity:
 *   - Xanh lá: hoạt động an toàn (create, approve, activate)
 *   - Xanh dương: thay đổi dữ liệu (update)
 *   - Đỏ: xóa/cấm (delete, ban) — cảnh báo cao
 *   - Tím: xuất bản (publish) — thay đổi trạng thái
 *   - Cam: từ chối (reject) — cảnh báo trung bình
 *   - Vàng: thay đổi cấu hình (settings_change)
 */
export const actionColors: Record<string, string> = {
    create: 'bg-green-100 text-green-800',
    update: 'bg-blue-100 text-blue-800',
    delete: 'bg-red-100 text-red-800',
    publish: 'bg-purple-100 text-purple-800',
    approve: 'bg-emerald-100 text-emerald-800',
    reject: 'bg-orange-100 text-orange-800',
    ban: 'bg-red-200 text-red-900',
    activate: 'bg-green-200 text-green-900',
    settings_change: 'bg-amber-100 text-amber-800',
    login: 'bg-sky-100 text-sky-800',
    logout: 'bg-gray-100 text-gray-600',
    backup: 'bg-indigo-100 text-indigo-800',
    upload: 'bg-cyan-100 text-cyan-800',
    submit_review: 'bg-violet-100 text-violet-800',
};

/**
 * Nhãn hành động tiếng Việt (SOC-friendly).
 */
export const actionLabels: Record<string, string> = {
    create: 'TẠO MỚI',
    update: 'CẬP NHẬT',
    delete: 'XÓA',
    publish: 'XUẤT BẢN',
    approve: 'PHÊ DUYỆT',
    reject: 'TỪ CHỐI',
    ban: 'KHÓA TÀI KHOẢN',
    activate: 'KÍCH HOẠT',
    settings_change: 'ĐỔI CẤU HÌNH',
    login: 'ĐĂNG NHẬP',
    logout: 'ĐĂNG XUẤT',
    backup: 'SAO LƯU',
    upload: 'TẢI LÊN',
    submit_review: 'GỬI DUYỆT',
};

/**
 * Lấy màu badge cho hành động.
 */
export function getActionColor(action: string): string {
    return actionColors[action] || 'bg-gray-100 text-gray-800';
}

/**
 * Lấy nhãn hiển thị cho resource.
 */
export function getResourceLabel(resource: string): string {
    return resourceLabels[resource] || resource;
}

/**
 * Lấy nhãn hiển thị cho action.
 */
export function getActionLabel(action: string): string {
    return actionLabels[action] || action.toUpperCase();
}

/**
 * Phân loại mức độ nghiêm trọng (Severity) cho SOC Dashboard.
 * Dựa trên loại hành động để xác định threat level.
 */
export type SeverityLevel = 'critical' | 'warning' | 'info' | 'safe';

export function getActionSeverity(action: string): SeverityLevel {
    if (['delete', 'ban'].includes(action)) return 'critical';
    if (['reject', 'settings_change'].includes(action)) return 'warning';
    if (['login', 'logout', 'backup'].includes(action)) return 'info';
    return 'safe';
}

export const severityColors: Record<SeverityLevel, string> = {
    critical: 'bg-red-500 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-blue-500 text-white',
    safe: 'bg-emerald-500 text-white',
};
