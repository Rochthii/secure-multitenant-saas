'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteAboutSection } from '@/app/actions/admin/about-sections';

interface DeleteAboutSectionButtonProps {
    sectionKey: string;
    hasChildren: boolean;
    tenantId?: string;
}

export function DeleteAboutSectionButton({ sectionKey, hasChildren, tenantId = '' }: DeleteAboutSectionButtonProps) {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteAboutSection(sectionKey, tenantId);
            if (result.success) {
                toast.success('Đã xóa section thành công');
                setOpen(false);
                router.refresh();
            } else {
                toast.error(result.error || 'Có lỗi khi xóa section');
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    if (hasChildren) {
        return (
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => toast.error('Không thể xóa mục đang có chứa mục con. Vui lòng xóa các mục con trước.')}
                title="Xóa section"
            >
                <Trash2 className="h-4 w-4 text-gray-300 cursor-not-allowed" />
            </Button>
        );
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Xóa section">
                    <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa section</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa phần giới thiệu này? Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isDeleting ? 'Đang xóa...' : 'Xóa'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
