import { format } from 'date-fns';

/**
 * Lấy đối tượng Date tương ứng với giờ Việt Nam (UTC+7)
 * Đảm bảo tính nhất quán giữa Server (thường là UTC) và Client.
 * 
 * SỬA ĐỔI: Sử dụng phép tính dựa trên offset thay vì toLocaleString 
 * để tránh lỗi "Invalid Date" trên một số môi trường Node.js.
 */
export function getVietnamTime(date: Date = new Date()): Date {
    // 1. Kiểm tra đầu vào hợp lệ
    if (!date || isNaN(date.getTime())) {
        return new Date(); // Fallback về thời gian hiện tại nếu input lỗi
    }

    try {
        // UTC time = local time + localized offset
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        // Vietnam is always UTC+7
        const vnTime = new Date(utc + (3600000 * 7));
        
        // Kiểm tra kết quả cuối cùng
        if (isNaN(vnTime.getTime())) return new Date();
        
        return vnTime;
    } catch (e) {
        console.error('[DateUtils] getVietnamTime error:', e);
        return new Date(); 
    }
}

/**
 * Trả về chuỗi ngày YYYY-MM-DD theo giờ Việt Nam
 */
export function getVietnamDateString(date: Date = new Date()): string {
    return format(getVietnamTime(date), 'yyyy-MM-dd');
}

/**
 * Trả về thông tin đầu tháng và cuối tháng theo giờ Việt Nam
 */
export function getVietnamMonthRange(monthsOffset: number = 0) {
    const vnNow = getVietnamTime();
    const target = new Date(vnNow.getFullYear(), vnNow.getMonth() + monthsOffset, 1);
    const vnTarget = getVietnamTime(target);

    const year = vnTarget.getFullYear();
    const month = vnTarget.getMonth();

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);

    return {
        start: format(start, 'yyyy-MM-dd'),
        end: format(end, 'yyyy-MM-dd')
    };
}
