import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getContactMessages } from '@/app/actions/admin/contact-messages';

export async function UnreadMessagesWidget({ tenantId }: { tenantId: string }) {
    const unreadMessages = await getContactMessages(tenantId, 'unread');
    const count = unreadMessages.length;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Tin nhắn chưa đọc
                </CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">
                    {count > 0 ? (
                        <Link href="/admin/messages?status=unread" className="text-primary hover:underline">
                            Xem {count} tin nhắn mới
                        </Link>
                    ) : (
                        'Không có tin nhắn mới'
                    )}
                </p>
            </CardContent>
        </Card>
    );
}
