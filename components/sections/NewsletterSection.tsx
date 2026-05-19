'use client';

import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { Mail, Bell, Inbox, Lock } from 'lucide-react';

export function NewsletterSection() {
    const locale = useLocale();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, locale }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: locale === 'vi'
                        ? 'Đăng ký thành công! Cảm ơn bạn đã theo dõi.'
                        : locale === 'km'
                            ? 'ចុះឈ្មោះបានជោគជ័យ! សូមអរគុណសម្រាប់ការតាមដាន។'
                            : 'Successfully subscribed! Thank you for following us.',
                });
                setEmail('');
            } else {
                throw new Error(data.error || 'Subscription failed');
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: locale === 'vi'
                    ? 'Có lỗi xảy ra. Vui lòng thử lại sau.'
                    : locale === 'km'
                        ? 'មានកំហុសកើតឡើង។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។'
                        : 'An error occurred. Please try again later.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-16 bg-gradient-to-br from-gold-primary via-gold-primary/90 to-gold-dark text-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 bg-[url('/patterns/khmer-pattern-light.png')] opacity-10 pointer-events-none" />
            <div className="absolute top-10 right-10 text-gold-primary opacity-10">
                <Mail className="w-32 h-32" />
            </div>
            <div className="absolute bottom-10 left-10 text-gold-primary opacity-10">
                <Bell className="w-32 h-32" />
            </div>

            <div className="container mx-auto px-4 text-center relative z-10">
                <div className="max-w-3xl mx-auto">
                    {/* Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="p-4 bg-gold-primary/10 rounded-full text-gold-primary">
                            <Inbox className="w-12 h-12" />
                        </div>
                    </div>

                    {/* Heading */}
                    <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-4">
                        {locale === 'vi'
                            ? 'Nhận Tin Từ Chi nhánh'
                            : locale === 'km'
                                ? 'ទទួលព័ត៌មានពីវត្ត'
                                : 'Receive Tenant Updates'}
                    </h2>
                    <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                        {locale === 'vi'
                            ? 'Đăng ký nhận thông báo về lịch tu học, pháp thoại mới, và các hoạt động từ thiện của chi nhánh'
                            : locale === 'km'
                                ? 'ចុះឈ្មោះដើម្បីទទួលព័ត៌មានអំពីកាលវិភាគការសិក្សា ការទេសនាថ្មី និងសកម្មភាពសប្បុរសធម៌របស់វត្ត'
                                : 'Subscribe to receive updates about schedules, new dharma talks, and charity activities'}
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto mb-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={
                                locale === 'vi'
                                    ? 'Nhập email của bạn'
                                    : locale === 'km'
                                        ? 'បញ្ចូលអ៊ីមែលរបស់អ្នក'
                                        : 'Enter your email'
                            }
                            required
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 rounded-lg text-coffee-dark placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={cn(
                                'px-8 py-3 bg-white text-gold-primary font-semibold rounded-lg',
                                'hover:bg-stone-50 transition-colors duration-200',
                                'disabled:opacity-50 disabled:cursor-not-allowed',
                                'whitespace-nowrap'
                            )}
                        >
                            {isSubmitting
                                ? locale === 'vi'
                                    ? 'Đang xử lý...'
                                    : locale === 'km'
                                        ? 'កំពុងដំណើរការ...'
                                        : 'Processing...'
                                : locale === 'vi'
                                    ? 'Đăng ký'
                                    : locale === 'km'
                                        ? 'ចុះឈ្មោះ'
                                        : 'Subscribe'}
                        </button>
                    </form>

                    {/* Message */}
                    {message && (
                        <div
                            className={cn(
                                'inline-block px-6 py-3 rounded-lg text-sm',
                                message.type === 'success'
                                    ? 'bg-green-500/20 text-white border border-green-300'
                                    : 'bg-red-500/20 text-white border border-red-300'
                            )}
                        >
                            {message.text}
                        </div>
                    )}

                    <p className="text-white/70 text-xs mt-4 flex items-center justify-center gap-1.5">
                        <Lock className="w-3 h-3" />
                        {locale === 'vi'
                            ? 'Chúng tôi tôn trọng quyền riêng tư của bạn và không chia sẻ email'
                            : locale === 'km'
                                ? 'យើងគោរពឯកជនភាពរបស់អ្នក និងមិនចែករំលែកអ៊ីមែល'
                                : 'We respect your privacy and will not share your email'}
                    </p>
                </div>
            </div>
        </section>
    );
}
