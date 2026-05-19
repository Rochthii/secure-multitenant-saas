'use client';

import React, { useTransition } from 'react';
import { updateThemeSettings } from '@/app/actions/admin/theme';
import { LiveThemeEditor } from '@/components/admin/live-theme-editor';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ThemeSettingsClientProps {
    initialSettings: Record<string, string>;
    tenantId: string;
    tenantName: string;
}

export function ThemeSettingsClient({ initialSettings, tenantId }: ThemeSettingsClientProps) {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.append('tenant_id', tenantId);

        startTransition(async () => {
            try {
                const result = await updateThemeSettings(formData);
                if (result?.error) {
                    toast.error(result.error);
                } else {
                    toast.success('✅ Đã lưu giao diện thành công! Trang web chi nhánh sẽ cập nhật ngay.');
                }
            } catch (error: any) {
                toast.error(error.message || 'Đã xảy ra lỗi không xác định.');
            }
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                <LiveThemeEditor initialSettings={initialSettings} />
            </div>

            <div className="flex items-center gap-4 mt-6 sticky bottom-0 bg-white/80 backdrop-blur-md py-4 border-t border-stone-200 px-1 rounded-b-xl">
                <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-gold-primary hover:bg-gold-dark text-white font-bold px-8 h-11"
                >
                    {isPending ? '⏳ Đang lưu...' : '💾 Lưu giao diện'}
                </Button>
                <p className="text-xs text-gray-400">
                    Thay đổi sẽ có hiệu lực ngay sau khi lưu và cache được làm mới.
                </p>
            </div>
        </form>
    );
}
