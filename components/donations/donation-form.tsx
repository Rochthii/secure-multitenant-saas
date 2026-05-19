'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useParams } from 'next/navigation';
import { transactionSchema, type TransactionFormData } from '@/lib/validations/transaction';
import { createTransaction } from '@/app/actions/create-transaction';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InlineSpinner } from '@/components/ui/buddhist-spinner';
import { Textarea } from '@/components/ui/textarea';
import { AmountSelector } from './amount-selector';
import { PaymentMethodSelector } from './payment-method-selector';
import { ReceiptUpload } from './receipt-upload';
import { Loader2, User, Phone, Mail, ArrowRight, AlertCircle, BookOpen, Landmark } from 'lucide-react';

interface TransactionFormProps {
    purpose: string;
    purposeTitle?: string;
    tenantId: string;
    isCompany?: boolean;
}

export function TransactionForm({ purpose, purposeTitle, tenantId, isCompany }: TransactionFormProps) {
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'momo'>('bank_transfer');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const params = useParams();
    const locale = params?.locale || 'vi';

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        resetField,
        formState: { errors },
    } = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema) as any,
        defaultValues: {
            purpose: purpose as any,
            payment_method: 'bank_transfer',
            is_anonymous: false,
            dharma_name: '',
            image_url: '',
        },
    });

    // Sync purpose prop when it changes (e.g. user clicks a category on the left)
    React.useEffect(() => {
        setValue('purpose', purpose as any);
    }, [purpose, setValue]);

    const imageUrl = watch('image_url');

    const handlePresetAmountSelect = (amount: number) => {
        setSelectedAmount(amount);
        setCustomAmount('');
        setValue('amount', amount);
    };

    const handleCustomAmountInput = (value: string) => {
        setCustomAmount(value);
        setSelectedAmount(null);
        setValue('amount', Number(value));
    };

    const handlePaymentMethodChange = (method: 'bank_transfer' | 'momo') => {
        setPaymentMethod(method);
        setValue('payment_method', method);
    };

    const onSubmit = async (data: TransactionFormData) => {
        setIsSubmitting(true);
        try {
            // Validate client side before proceeding
            // Create a short 4-char ID for transaction reference (without hitting DB yet)
            const tempId = Math.random().toString(36).substring(2, 6).toUpperCase();

            const encodeData = btoa(encodeURIComponent(JSON.stringify({ ...data, tempId, tenant_id: tenantId })));

            // Redirect to payment page with encoded data
            if (data.payment_method === 'bank_transfer') {
                router.push(`/${locale}/transactions/thanh-toan/bank?data=${encodeData}`);
            } else if (data.payment_method === 'momo') {
                router.push(`/${locale}/transactions/thanh-toan/momo?data=${encodeData}`);
            }
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra. Vui lòng thử lại!');
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto border-none shadow-none">
            <CardContent className="p-0">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Visual indicator of what is being donated to */}
                    {purposeTitle && (
                        <div className="bg-gold-primary/10 border border-gold-primary/20 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="w-10 h-10 rounded-full bg-gold-primary flex items-center justify-center text-white flex-shrink-0">
                                {isCompany ? <ArrowRight className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-gold-darker font-bold opacity-70">
                                    {isCompany ? 'Hạng mục hỗ trợ' : 'Đang chọn hạng mục'}
                                </p>
                                <p className="text-gold-darker font-bold leading-tight line-clamp-1">{purposeTitle}</p>
                            </div>
                        </div>
                    )}

                    {/* Amount Selection */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <AmountSelector
                            selectedAmount={selectedAmount}
                            customAmount={customAmount}
                            onPresetSelect={handlePresetAmountSelect}
                            onCustomInput={handleCustomAmountInput}
                            error={errors.amount?.message}
                        />
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                            {isCompany ? 'Thông tin người đóng góp' : 'Thông tin của Quý vị'}
                        </h3>

                        {/* Donor Name */}
                        <div>
                            <Label htmlFor="donor_name" className="text-gray-700 font-medium">
                                {isCompany ? 'Họ và tên' : 'Họ tên Nhân sự'} <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative mt-2">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <User className="h-5 w-5" />
                                </div>
                                <Input
                                    id="donor_name"
                                    {...register('donor_name')}
                                    placeholder="VD: Nguyen Van A"
                                    className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                />
                            </div>
                            {errors.donor_name && (
                                <p className="text-sm text-red-500 mt-1 flex items-center gap-1 ">
                                    <AlertCircle className="w-3 h-3" /> {errors.donor_name.message}
                                </p>
                            )}
                        </div>

                        {/* Pháp Danh - tùy chọn */}
                        {!isCompany && (
                            <div>
                                <Label htmlFor="dharma_name" className="text-gray-700 font-medium">
                                    Pháp danh <span className="text-xs text-gray-400 font-normal">(tùy chọn)</span>
                                </Label>
                                <div className="relative mt-2">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <BookOpen className="h-5 w-5" />
                                    </div>
                                    <Input
                                        id="dharma_name"
                                        {...register('dharma_name')}
                                        placeholder="VD: Thiện Tâm, Minh Đức..."
                                        className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Pháp danh sẽ được hiển thị trên bảng giao dịch thay cho tên tục.</p>
                            </div>
                        )}

                        {/* Phone & Email */}
                        <div className="grid md:grid-cols-2 gap-5">
                            <div>
                                <Label htmlFor="donor_phone" className="text-gray-700 font-medium">Số điện thoại</Label>
                                <div className="relative mt-2">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <Input
                                        id="donor_phone"
                                        {...register('donor_phone')}
                                        placeholder="090..."
                                        className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                    />
                                </div>
                                {errors.donor_phone && (
                                    <p className="text-sm text-red-500 mt-1">{errors.donor_phone.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="donor_email" className="text-gray-700 font-medium">Email (để nhận xác nhận)</Label>
                                <div className="relative mt-2">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <Input
                                        id="donor_email"
                                        type="email"
                                        {...register('donor_email')}
                                        placeholder="email@example.com"
                                        className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                    />
                                </div>
                                {errors.donor_email && (
                                    <p className="text-sm text-red-500 mt-1">{errors.donor_email.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Note */}
                        <div>
                            <Label htmlFor="note" className="text-gray-700 font-medium">
                                {isCompany ? 'Lời nhắn / Ghi chú' : 'Lời nhắn / Cầu an'}
                            </Label>
                            <div className="relative mt-2">
                                <Textarea
                                    id="note"
                                    {...register('note')}
                                    rows={3}
                                    placeholder={isCompany ? "Nội dung lời nhắn hoặc ghi chú cho chương trình..." : "Nội dung lời nhắn hoặc danh sách cầu an..."}
                                    className="bg-gray-50 border-gray-200 focus:bg-white transition-all resize-none"
                                />
                            </div>
                            {errors.note && <p className="text-sm text-red-500 mt-1">{errors.note.message}</p>}

                            <ReceiptUpload
                                value={imageUrl}
                                onChange={(val) => setValue('image_url', val)}
                                error={errors.image_url?.message}
                            />
                        </div>

                        {/* Anonymous Checkbox */}
                        <div className="flex items-center pt-2">
                            <input
                                type="checkbox"
                                id="is_anonymous"
                                {...register('is_anonymous')}
                                className="mr-3 h-5 w-5 rounded border-gray-300 text-gold-primary focus:ring-gold-primary cursor-pointer"
                            />
                            <Label htmlFor="is_anonymous" className="cursor-pointer font-normal text-gray-600 select-none">
                                {isCompany ? 'Đóng góp ẩn danh (Không hiện tên công khai)' : 'Gieo duyên ẩn danh (Không hiện tên trên danh sách giao dịch)'}
                            </Label>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <PaymentMethodSelector selected={paymentMethod} onSelect={handlePaymentMethodChange} />
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full h-14 text-lg bg-gradient-to-r from-gold-primary to-gold-dark hover:from-gold-dark hover:to-gold-dark text-white shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 rounded-xl"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <InlineSpinner className="mr-2 h-6 w-6" />
                                Đang khởi tạo giao dịch...
                            </>
                        ) : (
                            <span className="flex items-center gap-2">
                                Tiếp tục thanh toán <ArrowRight className="w-5 h-5" />
                            </span>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
