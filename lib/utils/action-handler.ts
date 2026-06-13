export type ActionResponse = {
    success: boolean;
    id?: string;
    message?: string;
    error?: string;
    unauthorized?: boolean;
};

/**
 * Server Action Wrapper giúp quản lý bẫy lỗi (try-catch) tập trung.
 * - Tự động bắt lỗi UnauthorizedError hoặc các thông điệp Unauthorized từ hệ thống.
 * - Chuẩn hóa kiểu phản hồi trả về phía Client.
 * - Loại bỏ hoàn toàn boilerplate code try-catch thủ công trong Server Actions.
 */
export function executeSafeAction<Args extends any[]>(
    action: (...args: Args) => Promise<ActionResponse | any>
) {
    return async function (...args: Args): Promise<ActionResponse> {
        try {
            return await action(...args);
        } catch (error: any) {
            const isUnauthorized = 
                error.name === 'UnauthorizedError' || 
                error.message?.includes('Unauthorized') ||
                error.message?.includes('Permission denied');

            console.error('[Server Action Error]:', error);

            return {
                success: false,
                error: error.message || 'Có lỗi hệ thống xảy ra',
                unauthorized: isUnauthorized ? true : undefined
            };
        }
    };
}
