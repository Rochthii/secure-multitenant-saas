'use client';

import React, { useState } from 'react';
import { confirmTransaction, revokeTransaction, deleteTransaction } from '@/app/actions/admin/donations';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TransactionActionsButtonProps {
    id: string;
    status: 'pending' | 'confirmed' | 'cancelled' | string;
}

export function TransactionActionsButton({ id, status }: TransactionActionsButtonProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const router = useRouter();

    const [confirming, setConfirming] = useState<string | null>(null);

    const handleAction = async (
        action: 'confirm' | 'revoke' | 'delete',
        fn: () => Promise<{ success: boolean; error?: string }>
    ) => {
        if (confirming !== action) {
            setConfirming(action);
            setTimeout(() => setConfirming(null), 3000);
            return;
        }

        setLoading(action);
        try {
            const result = await fn();
            if (result.success) {
                toast.success(
                    action === 'confirm' ? 'Đã xác nhận khoản thanh toán' :
                        action === 'revoke' ? 'Đã thu hồi xác nhận' : 'Đã xóa giao dịch'
                );
                router.refresh();
            } else {
                toast.error(result.error || 'Có lỗi xảy ra');
            }
        } finally {
            setLoading(null);
            setConfirming(null);
        }
    };

    return (
        <div className="flex items-center justify-end gap-1.5">
            {/* Xác nhận — chỉ hiện khi đang pending */}
            {status === 'pending' && (
                <Button
                    size="sm"
                    disabled={loading !== null}
                    onClick={() =>
                        handleAction(
                            'confirm',
                            () => confirmTransaction(id)
                        )
                    }
                    className={`${confirming === 'confirm' ? 'bg-amber-600' : 'bg-green-600 hover:bg-green-700'} text-white h-8 px-2.5 text-xs gap-1`}
                >
                    <CheckCircle className="h-3.5 w-3.5" />
                    {loading === 'confirm' ? 'Đang xử lý...' : confirming === 'confirm' ? 'Click lần nữa để xác nhận' : 'Xác nhận'}
                </Button>
            )}

            {/* Thu hồi — chỉ hiện khi đã confirmed */}
            {status === 'confirmed' && (
                <Button
                    size="sm"
                    variant="outline"
                    disabled={loading !== null}
                    onClick={() =>
                        handleAction(
                            'revoke',
                            () => revokeTransaction(id)
                        )
                    }
                    className={`${confirming === 'revoke' ? 'border-red-500 bg-red-50 text-red-600' : 'border-amber-300 text-amber-700 hover:bg-amber-50'} h-8 px-2.5 text-xs gap-1`}
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {loading === 'revoke' ? 'Đang xử lý...' : confirming === 'revoke' ? 'Click lần nữa để thu hồi' : 'Thu hồi'}
                </Button>
            )}

            {/* Xóa — luôn hiện, mọi trạng thái */}
            <Button
                size="sm"
                variant="ghost"
                disabled={loading !== null}
                onClick={() =>
                    handleAction(
                        'delete',
                        () => deleteTransaction(id)
                    )
                }
                className={`${confirming === 'delete' ? 'text-red-700 bg-red-100' : 'text-red-500 hover:text-red-700 hover:bg-red-50'} h-8 w-8 p-0`}
                title={confirming === 'delete' ? 'Nhấn lần nữa để xóa' : 'Xóa giao dịch'}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
