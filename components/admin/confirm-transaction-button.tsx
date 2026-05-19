'use client';

import React, { useState } from 'react';
// @ts-ignore - TypeScript cache issue with newly created action
import { confirmTransaction } from '@/app/actions/admin/transactions';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle, Loader2 } from 'lucide-react';

export function ConfirmTransactionButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const router = useRouter();

    const handleConfirm = async () => {
        if (!confirm) {
            setConfirm(true);
            setTimeout(() => setConfirm(false), 3500);
            return;
        }

        setLoading(true);
        const result = await confirmTransaction(id);

        if (result.success) {
            toast.success('Đã xác nhận thanh toán thành công!');
            router.refresh();
        } else {
            toast.error(result.error || 'Có lỗi xảy ra');
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleConfirm}
            disabled={loading}
            size="sm"
            className={`transition-all ${confirm ? 'bg-green-700 hover:bg-green-800' : 'bg-green-600 hover:bg-green-700'}`}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : confirm ? (
                <CheckCircle className="h-4 w-4 mr-1" />
            ) : null}
            {loading ? 'Đang xử lý...' : confirm ? 'Xác nhận ngay' : 'Xác nhận'}
        </Button>
    );
}
