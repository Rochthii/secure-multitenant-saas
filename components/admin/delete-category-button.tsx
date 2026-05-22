'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
// @ts-ignore
import { deleteCategory } from '@/app/actions/admin/category';

export function DeleteCategoryButton({ id, hasChildren }: { id: string, hasChildren?: boolean }) {
    const [loading, setLoading] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (hasChildren) {
            toast.error('Không thể xóa danh mục này vì đang có danh mục con.');
            return;
        }

        if (!confirm) {
            setConfirm(true);
            setTimeout(() => setConfirm(false), 3500);
            return;
        }

        setLoading(true);
        const result = await deleteCategory(id);

        if (result.success) {
            toast.success('Đã xóa danh mục thành công!');
            router.refresh();
        } else {
            toast.error(result.error || 'Có lỗi xảy ra');
            setLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={loading || hasChildren}
            className={`h-8 w-8 rounded-xl transition-colors ${confirm ? 'text-red-400 bg-red-500/10 border border-red-500/20' : 'text-slate-400 hover:text-red-400 hover:bg-white/5'}`}
            title={hasChildren ? 'Không thể xoá vì có danh mục con' : confirm ? 'Nhấn lần nữa để xác nhận xóa' : 'Xoá'}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
    );
}
