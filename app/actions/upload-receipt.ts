'use server';

import { v2 as cloudinary } from 'cloudinary';

// Configure cloudinary
cloudinary.config({
    secure: true,
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set([
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
]);

export async function uploadReceipt(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: 'Không có file nào được cung cấp' };
        }

        // Validate type
        if (!ALLOWED_TYPES.has(file.type)) {
            return { success: false, error: `Định dạng "${file.type}" không được phép. Chỉ nhận ảnh hoặc PDF.` };
        }
    
        // Validate size
        if (file.size > MAX_FILE_SIZE) {
            const fileMb = (file.size / 1024 / 1024).toFixed(1);
            return { success: false, error: `Tệp tin (${fileMb} MB) vượt quá giới hạn 10 MB.` };
        }

        // Generate filename
        const fileName = `receipt-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const folderPath = `chantarangsay/receipts/${new Date().getFullYear()}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary using Upload Stream
        const uploadResult = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folderPath,
                    public_id: fileName,
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        if (!uploadResult || !uploadResult.secure_url) {
            throw new Error('Upload tệp thất bại.');
        }

        return {
            success: true,
            url: uploadResult.secure_url,
        };
    } catch (error: any) {
        console.error('Upload receipt error:', error);
        return {
            success: false,
            error: 'Đã có lỗi xảy ra khi tải tệp lên. Vui lòng thử lại.'
        };
    }
}
