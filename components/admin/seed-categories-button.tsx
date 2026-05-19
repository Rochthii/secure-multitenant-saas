'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { seedCategoriesFromTemplate } from '@/app/actions/admin/category';
import { useRouter } from 'next/navigation';

interface SeedCategoriesButtonProps {
    tenantId: string;
}

export function SeedCategoriesButton({ tenantId }: SeedCategoriesButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSeed = async () => {
        if (!confirm('Bạn có chắc chắn muốn khởi tạo dữ liệu mẫu? Việc này sẽ thêm các danh mục tiêu chuẩn vào hệ thống của bạn.')) {
            return;
        }

        setLoading(true);
        try {
            const result = await seedCategoriesFromTemplate(tenantId);
            if (result.success) {
                toast.success(`Đã khởi tạo thành công ${result.count} danh mục mẫu!`);
                router.refresh();
            } else {
                toast.error(result.error || 'Có lỗi xảy ra khi khởi tạo dữ liệu mẫu');
            }
        } catch (error) {
            toast.error('Có lỗi hệ thống xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button 
            variant="outline" 
            onClick={handleSeed} 
            disabled={loading}
            className="border-gold-primary text-gold-primary hover:bg-gold-50"
        >
            {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
                <Wand2 className="h-4 w-4 mr-2" />
            )}
            Khởi tạo dữ liệu mẫu
        </Button>
    );
}
