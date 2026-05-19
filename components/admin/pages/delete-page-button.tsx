'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { deletePage } from '@/app/actions/admin/pages';

export function DeletePageButton({ slug, tenantId, hasChildren }: { slug: string, tenantId: string, hasChildren?: boolean }) {
    const [loading, setLoading] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (hasChildren) {
            toast.error('Không thể xóa trang này vì đang có trang con.');
            return;
        }

        if (!confirm) {
            setConfirm(true);
            setTimeout(() => setConfirm(false), 3500);
            return;
        }

        setLoading(true);
        const result = await deletePage(slug, tenantId);

        if (result.success) {
            toast.success('Đã xóa trang thành công!');
            router.refresh();
        } else {
            toast.error(result.error || 'Có lỗi xảy ra');
            setLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={loading || hasChildren}
            className={`transition-colors ${confirm ? 'text-red-700 bg-red-50 font-semibold' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
            title={hasChildren ? 'Không thể xoá vì có trang con' : confirm ? 'Nhấn lần nữa để xác nhận xóa' : 'Xoá trang'}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
    );
}
