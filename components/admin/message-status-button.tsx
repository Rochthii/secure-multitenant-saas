'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { updateMessageStatus } from '@/app/actions/admin/contact-messages';
import { toast } from 'sonner';
import { Loader2, Mail, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MessageStatusButtonProps {
    tenantId: string;
    id: string;
    currentStatus: 'unread' | 'read' | 'replied';
    email?: string | null;
}

export function MessageStatusButton({ tenantId, id, currentStatus, email }: MessageStatusButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleUpdate = async (status: 'unread' | 'read' | 'replied') => {
        setLoading(true);
        const result = await updateMessageStatus(tenantId, id, status);
        if (result.success) {
            toast.success('Cập nhật trạng thái thành công');
            router.refresh();
        } else {
            toast.error(result.error || 'Có lỗi xảy ra');
        }
        setLoading(false);
    };

    if (currentStatus === 'replied') {
        return (
            <Button variant="outline" className="w-full" disabled>
                <CheckCircle className="mr-2 h-4 w-4" />
                Đã trả lời
            </Button>
        );
    }

    return (
        <div className="space-y-2">
            {currentStatus === 'unread' && (
                <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleUpdate('read')}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />}
                    Đánh dấu đã đọc
                </Button>
            )}

            <Button
                className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                    if (email) {
                        window.open(`mailto:${email}?subject=Re: Phản hồi từ Hệ thống`);
                        // Optionally mark as replied automatically or let user do it
                        handleUpdate('replied');
                    } else {
                        toast.error('Không có email người gửi');
                    }
                }}
                disabled={loading}
            >
                <Mail className="mr-2 h-4 w-4" />
                Gửi email trả lời
            </Button>

            {currentStatus === 'read' && (
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground"
                    onClick={() => handleUpdate('unread')}
                    disabled={loading}
                >
                    <XCircle className="mr-2 h-4 w-4" />
                    Đánh dấu chưa đọc
                </Button>
            )}
        </div>
    );
}
