'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createTransaction } from '@/app/actions/create-transaction';
import { TransactionFormData } from '@/lib/validations/transaction';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { InlineSpinner } from '@/components/ui/buddhist-spinner';
import { useRouter } from 'next/navigation';

interface ConfirmPaymentButtonProps {
    transactionData: TransactionFormData & { tempId?: string };
}

export function ConfirmPaymentButton({ transactionData }: ConfirmPaymentButtonProps) {
    const [confirmed, setConfirmed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            // Chèn dữ liệu thật vào DB ở bước này (người dùng xác nhận đã chuyển)
            const res = await createTransaction(transactionData);
            if (res && res.success && res.transaction?.id) {
                toast.success('Đã xác nhận chuyển khoản thành công!');
                router.replace(`?id=${res.transaction.id}`);
            } else {
                toast.error(res?.error || 'Có lỗi xảy ra, vui lòng thử lại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (confirmed) {
        return (
            <Button
                disabled
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
            >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Đã xác nhận chuyển khoản
            </Button>
        );
    }

    return (
        <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full bg-gold-primary hover:bg-gold-dark"
            size="lg"
        >
            {isLoading ? (
                <>
                    <InlineSpinner className="mr-2 h-5 w-5" />
                    Đang xử lý...
                </>
            ) : (
                'Tôi đã chuyển khoản'
            )}
        </Button>
    );
}
