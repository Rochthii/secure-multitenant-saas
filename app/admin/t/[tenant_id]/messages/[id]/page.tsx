import { notFound } from 'next/navigation';
import { getContactMessage } from '@/app/actions/admin/contact-messages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Mail, Phone, Calendar, User, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageStatusButton } from '@/components/admin/message-status-button'; // Will create this small component

interface PageProps {
    params: Promise<{
        id: string;
        tenant_id: string;
    }>;
}

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    status: 'unread' | 'read' | 'replied';
    created_at: string;
    replied_at: string | null;
    replied_by: string | null;
}

export default async function MessageDetailPage({ params }: PageProps) {
    const { id, tenant_id: tenantId } = await params;
    const message = await getContactMessage(tenantId, id) as ContactMessage | null;

    if (!message) {
        notFound();
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href={`/admin/t/${tenantId}/messages`}>
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Chi tiết tin nhắn</h1>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Clock className="h-3 w-3" />
                        {format(new Date(message.created_at), 'HH:mm, dd/MM/yyyy', { locale: vi })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Message Content */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="bg-muted/20">
                            <h2 className="text-xl font-semibold">{message.subject}</h2>
                        </CardHeader>
                        <CardContent className="p-6 whitespace-pre-wrap leading-relaxed text-gray-800 text-lg">
                            {message.message}
                        </CardContent>
                    </Card>

                    {message.status === 'replied' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                                <CheckCircle className="h-5 w-5" />
                                Đã trả lời lúc {message.replied_at ? format(new Date(message.replied_at), 'HH:mm dd/MM/yyyy', { locale: vi }) : ''}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sender Info & Actions */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin người gửi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <div className="font-medium">Họ tên</div>
                                    <div className="text-sm">{message.name}</div>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <div className="font-medium">Email</div>
                                    <a href={`mailto:${message.email}`} className="text-sm text-blue-600 hover:underline break-all">
                                        {message.email}
                                    </a>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <div className="font-medium">Số điện thoại</div>
                                    <a href={`tel:${message.phone}`} className="text-sm text-blue-600 hover:underline">
                                        {message.phone || 'N/A'}
                                    </a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Trạng thái</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Hiện tại:</span>
                                    {message.status === 'unread' && <Badge variant="destructive">Mới</Badge>}
                                    {message.status === 'read' && <Badge variant="secondary">Đã xem</Badge>}
                                    {message.status === 'replied' && <Badge className="bg-green-600">Đã trả lời</Badge>}
                                </div>
                                <div className="pt-4">
                                    <MessageStatusButton
                                        tenantId={tenantId}
                                        id={message.id}
                                        currentStatus={message.status}
                                        email={message.email}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}


