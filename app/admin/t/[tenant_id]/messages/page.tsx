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
    Loader2,
    ShieldAlert
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
        <div className="space-y-6 text-slate-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Mail className="w-8 h-8 text-amber-400" />
                        Hộp thư Liên hệ
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">
                        Quản lý tin nhắn, phản hồi và yêu cầu từ form liên hệ của khách hàng
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilter('all')}
                        className={filter === 'all' ? 'bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl' : 'border-white/10 text-slate-300 hover:bg-white/5 rounded-xl'}
                    >
                        Tất cả
                    </Button>
                    <Button
                        variant={filter === 'unread' ? 'default' : 'outline'}
                        onClick={() => setFilter('unread')}
                        className={filter === 'unread' ? 'bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl' : 'border-white/10 text-slate-300 hover:bg-white/5 rounded-xl'}
                    >
                        Chưa đọc
                    </Button>
                    <Button
                        variant={filter === 'replied' ? 'default' : 'outline'}
                        onClick={() => setFilter('replied')}
                        className={filter === 'replied' ? 'bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl' : 'border-white/10 text-slate-300 hover:bg-white/5 rounded-xl'}
                    >
                        Đã trả lời
                    </Button>
                </div>
            </div>

            {/* List Table Card */}
            <Card className="border-white/[0.08] bg-slate-900/40 backdrop-blur-xl overflow-hidden rounded-2xl">
                <CardHeader className="border-b border-white/5 pb-4">
                    <CardTitle className="text-white font-bold text-lg">Danh sách tin nhắn ({messages.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-white/[0.08] hover:bg-transparent bg-white/[0.02]">
                                        <TableHead className="text-slate-400 font-bold py-4">Ngày gửi</TableHead>
                                        <TableHead className="text-slate-400 font-bold py-4">Người gửi</TableHead>
                                        <TableHead className="text-slate-400 font-bold py-4">Tiêu đề</TableHead>
                                        <TableHead className="text-slate-400 font-bold py-4">Trạng thái</TableHead>
                                        <TableHead className="text-right text-slate-400 font-bold py-4">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {messages.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12 text-slate-500 italic">
                                                Không có tin nhắn nào
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        messages.map((item) => (
                                            <TableRow key={item.id} className={`border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors ${item.status === 'unread' ? 'bg-amber-500/[0.02] font-semibold text-white' : ''}`}>
                                                <TableCell className="whitespace-nowrap text-slate-400 font-mono text-sm">
                                                    {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-white text-sm">{item.name}</span>
                                                        <span className="text-xs text-slate-500 font-mono">{item.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-300 text-sm max-w-xs truncate">{item.subject}</TableCell>
                                                <TableCell>
                                                    {item.status === 'unread' && (
                                                        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold px-2 py-0.5 rounded-full text-[11px]">
                                                            Mới
                                                        </Badge>
                                                    )}
                                                    {item.status === 'read' && (
                                                        <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700/50 font-bold px-2 py-0.5 rounded-full text-[11px]">
                                                            Đã xem
                                                        </Badge>
                                                    )}
                                                    {item.status === 'replied' && (
                                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold px-2 py-0.5 rounded-full text-[11px]">
                                                            Đã trả lời
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        {item.status === 'unread' && (
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                title="Đánh dấu đã đọc"
                                                                onClick={() => handleStatusChange(item.id, 'read')}
                                                                className="text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </Button>
                                                        )}

                                                        <Link href={`/admin/t/${tenantId}/messages/${item.id}`}>
                                                            <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>

                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button size="icon" variant="ghost" className="text-slate-500 hover:text-red-400 hover:bg-red-500/15 rounded-xl">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent className="bg-slate-950 border-white/[0.08] text-slate-300 rounded-2xl">
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle className="text-white font-bold">Xóa tin nhắn?</AlertDialogTitle>
                                                                    <AlertDialogDescription className="text-slate-400 text-sm">
                                                                        Hành động này không thể hoàn tác. Tin nhắn này sẽ bị xóa vĩnh viễn khỏi hệ thống của chi nhánh.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter className="gap-2">
                                                                    <AlertDialogCancel className="bg-slate-900 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white rounded-xl">
                                                                        Hủy
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDelete(item.id)}
                                                                        className="bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl"
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
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
