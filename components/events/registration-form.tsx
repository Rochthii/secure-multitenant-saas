'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registrationSchema, type RegistrationFormData } from '@/lib/validations/registration';
import { registerForEvent } from '@/app/actions/register-event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { InlineSpinner } from '@/components/ui/buddhist-spinner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';

interface Event {
    id: string;
    title_vi: string;
    start_date: string;
    start_time: string | null;
    location: string | null;
    max_participants: number | null;
    current_participants: number;
}

interface RegistrationFormProps {
    event: Event;
}

type FormStep = 1 | 2 | 3 | 4;

export function RegistrationForm({ event }: RegistrationFormProps) {
    const [step, setStep] = useState<FormStep>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{
        success: boolean;
        message?: string;
        error?: string;
    } | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        trigger,
        getValues,
    } = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            event_id: event.id,
            num_participants: 1,
        },
    });

    const handleNext = async () => {
        let isValid = false;

        if (step === 2) {
            isValid = await trigger(['full_name', 'phone', 'email']);
        } else if (step === 3) {
            isValid = await trigger(['num_participants', 'note']);
        }

        if (isValid || step === 1) {
            setStep((prev) => Math.min(prev + 1, 4) as FormStep);
        }
    };

    const handleBack = () => {
        setStep((prev) => Math.max(prev - 1, 1) as FormStep);
    };

    const onSubmit = async (data: RegistrationFormData) => {
        setIsSubmitting(true);
        setSubmitResult(null);

        const result = await registerForEvent(data);
        setSubmitResult(result);
        setIsSubmitting(false);
    };

    // Success state
    if (submitResult?.success) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardContent className="p-12 text-center">
                    <div className="mb-6">
                        <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto" />
                    </div>
                    <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-4">
                        Đăng ký thành công!
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Cảm ơn bạn đã đăng ký tham gia sự kiện <strong>{event.title_vi}</strong>.
                        {getValues('email') && (
                            <> Thông tin xác nhận đã được gửi đến email của bạn.</>
                        )}
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href={`/lich-le/${event.id}`}>
                            <Button variant="outline">Về trang sự kiện</Button>
                        </Link>
                        <Link href="/lich-le">
                            <Button className="bg-gold-primary hover:bg-gold-dark">
                                Xem thêm sự kiện
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Error state
    if (submitResult && !submitResult.success) {
        return (
            <Card className="max-w-2xl mx-auto border-red-200">
                <CardContent className="p-12 text-center">
                    <div className="mb-6">
                        <AlertCircle className="h-20 w-20 text-red-500 mx-auto" />
                    </div>
                    <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-4">
                        Đăng ký không thành công
                    </h2>
                    <p className="text-red-600 mb-8">{submitResult.error}</p>
                    <Button onClick={() => setSubmitResult(null)} className="bg-gold-primary hover:bg-gold-dark">
                        Thử lại
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                    {[1, 2, 3, 4].map((s) => (
                        <div
                            key={s}
                            className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${s === step
                                ? 'bg-gold-primary text-white scale-110'
                                : s < step
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                }`}
                        >
                            {s}
                        </div>
                    ))}
                </div>
                <div className="relative h-2 bg-gray-200 rounded-full">
                    <div
                        className="absolute h-full bg-gold-primary rounded-full transition-all duration-300"
                        style={{ width: `${((step - 1) / 3) * 100}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>Thông tin sự kiện</span>
                    <span>Thông tin cá nhân</span>
                    <span>Chi tiết</span>
                    <span>Xác nhận</span>
                </div>
            </div>

            {/* Form */}
            <Card>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Step 1: Event Info */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">
                                    Thông tin sự kiện
                                </h2>

                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">{event.title_vi}</h3>
                                </div>

                                <div className="grid gap-4">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Calendar className="h-5 w-5 text-gold-primary" />
                                        <span>{format(new Date(event.start_date), 'EEEE, dd MMMM yyyy', { locale: vi })}</span>
                                    </div>

                                    {event.start_time && (
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <Clock className="h-5 w-5 text-gold-primary" />
                                            <span>{event.start_time}</span>
                                        </div>
                                    )}

                                    {event.location && (
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <MapPin className="h-5 w-5 text-gold-primary" />
                                            <span>{event.location}</span>
                                        </div>
                                    )}

                                    {event.max_participants && (
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <Users className="h-5 w-5 text-gold-primary" />
                                            <span>
                                                {event.current_participants} / {event.max_participants} người đã đăng ký
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Personal Info */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">
                                    Thông tin cá nhân
                                </h2>

                                <div>
                                    <Label htmlFor="full_name">
                                        Họ và tên <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="full_name"
                                        {...register('full_name')}
                                        placeholder="Nguyễn Văn A"
                                        className="mt-1"
                                    />
                                    {errors.full_name && (
                                        <p className="text-sm text-red-500 mt-1">{errors.full_name.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="phone">
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        {...register('phone')}
                                        placeholder="0901234567"
                                        className="mt-1"
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="email">Email (không bắt buộc)</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register('email')}
                                        placeholder="email@example.com"
                                        className="mt-1"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Details */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">
                                    Chi tiết đăng ký
                                </h2>

                                <div>
                                    <Label htmlFor="num_participants">
                                        Số người tham gia <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="num_participants"
                                        type="number"
                                        min="1"
                                        max="50"
                                        {...register('num_participants', { valueAsNumber: true })}
                                        className="mt-1"
                                    />
                                    {errors.num_participants && (
                                        <p className="text-sm text-red-500 mt-1">{errors.num_participants.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="note">Ghi chú</Label>
                                    <Textarea
                                        id="note"
                                        {...register('note')}
                                        placeholder="Thông tin bổ sung (nếu có)..."
                                        rows={4}
                                        className="mt-1"
                                    />
                                    {errors.note && (
                                        <p className="text-sm text-red-500 mt-1">{errors.note.message}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Confirmation */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">
                                    Xác nhận thông tin
                                </h2>

                                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Họ và tên</p>
                                        <p className="font-semibold">{getValues('full_name')}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Số điện thoại</p>
                                        <p className="font-semibold">{getValues('phone')}</p>
                                    </div>
                                    {getValues('email') && (
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-semibold">{getValues('email')}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-500">Số người tham gia</p>
                                        <p className="font-semibold">{getValues('num_participants')} người</p>
                                    </div>
                                    {getValues('note') && (
                                        <div>
                                            <p className="text-sm text-gray-500">Ghi chú</p>
                                            <p className="font-semibold">{getValues('note')}</p>
                                        </div>
                                    )}
                                </div>

                                <p className="text-sm text-gray-600">
                                    Bằng việc nhấn "Xác nhận đăng ký", bạn xác nhận rằng các thông tin trên là chính xác.
                                </p>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between mt-8 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBack}
                                disabled={step === 1 || isSubmitting}
                            >
                                Quay lại
                            </Button>

                            {step < 4 ? (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="bg-gold-primary hover:bg-gold-dark"
                                >
                                    Tiếp tục
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-gold-primary hover:bg-gold-dark"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <InlineSpinner className="mr-2 h-4 w-4" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        'Xác nhận đăng ký'
                                    )}
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
