'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    getContactMessages,
    updateMessageStatus,
    deleteContactMessage
} from '@/app/actions/admin/contact-messages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Eye,
    Trash2,
    Mail,
    CheckCircle,
    MessageSquare,
    Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
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
} from "@/components/ui/alert-dialog";

export default function ContactMessagesPage() {
    const params = useParams();
    const tenantId = params.tenant_id as string;

    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all');

    const fetchMessages = async () => {
        setLoading(true);
        const data = await getContactMessages(tenantId, filter === 'all' ? undefined : filter);
        setMessages(data);
        setLoading(false);
    };

    useEffect(() => {
        if (tenantId) {
            fetchMessages();
        }
    }, [filter, tenantId]);

    const handleStatusChange = async (id: string, newStatus: 'unread' | 'read' | 'replied') => {
        const result = await updateMessageStatus(tenantId, id, newStatus);
        if (result.success) {
            toast.success('Cập nhật trạng thái thành công');
            fetchMessages();
        } else {
            toast.error(result.error || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id: string) => {
        const result = await deleteContactMessage(tenantId, id);
        if (result.success) {
            toast.success('Xóa tin nhắn thành công');
            fetchMessages();
        } else {
            toast.error(result.error || 'Có lỗi xảy ra');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tin nhắn liên hệ</h1>
                    <p className="text-muted-foreground mt-1">
                        Quản lý tin nhắn từ form liên hệ
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilter('all')}
                    >
                        Tất cả
                    </Button>
                    <Button
                        variant={filter === 'unread' ? 'default' : 'outline'}
                        onClick={() => setFilter('unread')}
                        className={filter === 'unread' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    >
                        Chưa đọc
                    </Button>
                    <Button
                        variant={filter === 'replied' ? 'default' : 'outline'}
                        onClick={() => setFilter('replied')}
                        className={filter === 'replied' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                        Đã trả lời
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách tin nhắn ({messages.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ngày gửi</TableHead>
                                    <TableHead>Người gửi</TableHead>
                                    <TableHead>Tiêu đề</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {messages.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            Không có tin nhắn nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    messages.map((item) => (
                                        <TableRow key={item.id} className={item.status === 'unread' ? 'bg-muted/30 font-medium' : ''}>
                                            <TableCell className="whitespace-nowrap">
                                                {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span>{item.name}</span>
                                                    <span className="text-xs text-muted-foreground">{item.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{item.subject}</TableCell>
                                            <TableCell>
                                                {item.status === 'unread' && <Badge variant="destructive">Mới</Badge>}
                                                {item.status === 'read' && <Badge variant="secondary">Đã xem</Badge>}
                                                {item.status === 'replied' && <Badge className="bg-green-600">Đã trả lời</Badge>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {item.status === 'unread' && (
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            title="Đánh dấu đã đọc"
                                                            onClick={() => handleStatusChange(item.id, 'read')}
                                                        >
                                                            <CheckCircle className="h-4 w-4 text-blue-500" />
                                                        </Button>
                                                    )}

                                                    <Link href={`/admin/t/${tenantId}/messages/${item.id}`}>
                                                        <Button size="icon" variant="ghost">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive/90">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Xóa tin nhắn?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Hành động này không thể hoàn tác. Tin nhắn này sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(item.id)}
                                                                    className="bg-destructive hover:bg-destructive/90"
                                                                >
                                                                    Xóa
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
