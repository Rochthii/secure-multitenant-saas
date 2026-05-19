'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { submitContactForm } from '@/app/actions/submit-contact';

const contactSchema = z.object({
    name: z.string().min(2, 'Vui lòng nhập tên'),
    email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
    phone: z.string().optional(),
    subject: z.string().min(5, 'Vui lòng nhập tiêu đề'),
    message: z.string().min(10, 'Nội dung quá ngắn'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm({ tenantId }: { tenantId?: string | null }) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitted, setSubmitted] = React.useState(false);
 
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
    });
 
    const onSubmit = async (data: ContactFormData) => {
        setIsSubmitting(true);
        try {
            const result = await submitContactForm(data, tenantId);

            if (!result.success) {
                alert(result.error || 'Có lỗi xảy ra. Vui lòng thử lại!');
                return;
            }

            setSubmitted(true);
            reset();
            setTimeout(() => setSubmitted(false), 5000);
        } catch (error) {
            console.error('Error:', error);
            alert('Có lỗi hệ thống. Vui lòng thử lại!');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="p-6 h-full border-gold-primary/20 bg-white/50 backdrop-blur-sm">
            <h2 className="text-2xl font-playfair font-semibold mb-6 text-gold-darker">Gửi tin nhắn</h2>

            {submitted && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 text-sm animate-in fade-in slide-in-from-top-2">
                    Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất qua thông tin đã cung cấp.
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <Label htmlFor="name" className="text-gray-700">Họ tên <span className="text-red-500">*</span></Label>
                    <Input id="name" {...register('name')} className="bg-white/80 focus:ring-gold-primary/50" />
                    {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="email" className="text-gray-700">Email</Label>
                        <Input id="email" type="email" {...register('email')} className="bg-white/80 focus:ring-gold-primary/50" />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="phone" className="text-gray-700">Điện thoại</Label>
                        <Input id="phone" {...register('phone')} className="bg-white/80 focus:ring-gold-primary/50" />
                    </div>
                </div>

                <div>
                    <Label htmlFor="subject" className="text-gray-700">Tiêu đề <span className="text-red-500">*</span></Label>
                    <Input id="subject" {...register('subject')} className="bg-white/80 focus:ring-gold-primary/50" />
                    {errors.subject && (
                        <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="message" className="text-gray-700">Nội dung <span className="text-red-500">*</span></Label>
                    <Textarea id="message" {...register('message')} rows={5} className="bg-white/80 focus:ring-gold-primary/50 resize-y" />
                    {errors.message && (
                        <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full bg-gold-primary hover:bg-gold-dark text-white font-medium transition-colors mt-2"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
                </Button>
            </form>
        </Card>
    );
}
