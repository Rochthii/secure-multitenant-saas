import { z } from 'zod';

export const transactionSchema = z.object({
    purpose: z.string().min(1, 'Vui lòng chọn quỹ thanh toán'),
    amount: z
        .number()
        .min(1, 'Vui lòng nhập số tiền thanh toán')
        .max(999999999, 'Số tiền tối đa 999.999.999 VNĐ'),
    donor_name: z
        .string()
        .min(2, 'Tên phải có ít nhất 2 ký tự')
        .max(100, 'Tên không được quá 100 ký tự'),
    dharma_name: z
        .string()
        .max(100, 'Pháp danh không được quá 100 ký tự')
        .optional()
        .or(z.literal('')),
    donor_phone: z
        .string()
        .regex(/^0[0-9]{9}$/, 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0')
        .optional()
        .or(z.literal('')),
    donor_email: z
        .string()
        .email('Email không hợp lệ')
        .optional()
        .or(z.literal('')),
    note: z
        .string()
        .max(500, 'Ghi chú không được quá 500 ký tự')
        .optional()
        .or(z.literal('')),
    image_url: z
        .string()
        .url('URL hình ảnh không hợp lệ')
        .optional()
        .or(z.literal('')),
    is_anonymous: z.boolean().default(false),
    payment_method: z.enum(['bank_transfer', 'momo'], {
        message: 'Vui lòng chọn phương thức thanh toán',
    }),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
