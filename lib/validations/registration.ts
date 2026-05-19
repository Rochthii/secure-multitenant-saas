import { z } from 'zod';

export const registrationSchema = z.object({
    event_id: z.string().uuid('ID sự kiện không hợp lệ'),
    full_name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ (10-11 số)'),
    email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
    num_participants: z.number().min(1, 'Số người tham gia phải ít nhất 1').max(50, 'Số người tham gia tối đa 50'),
    note: z.string().max(500, 'Ghi chú không được quá 500 ký tự').optional(),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
