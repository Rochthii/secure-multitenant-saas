'use client';

import React, { useState } from 'react';
import { TransactionProjectUI, formatCurrency } from '@/lib/constants/transaction';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createTransactionProject, updateTransactionProject, deleteTransactionProject } from '@/app/actions/admin/projects';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Loader2, Save, Heart, TrendingUp, Settings, Landmark } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BankAccount } from '@/app/actions/admin/finance';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// @ts-ignore
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(
    () => import('@/components/admin/rich-text-editor').then((mod) => mod.RichTextEditor),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-[300px] w-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-md">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Đang tải trình soạn thảo...</span>
            </div>
        )
    }
);

interface ProjectsTableProps {
    initialProjects: TransactionProjectUI[];
    bankAccounts: BankAccount[];
    canUpdate?: boolean;
    canDelete?: boolean;
    currentTenantId?: string;
    tenants?: { id: string; name: string }[];
    companyTenantId?: string;
}

export function ProjectsTable({ initialProjects, bankAccounts, canUpdate = false, canDelete = false, currentTenantId, tenants = [], companyTenantId }: ProjectsTableProps) {
    const [projects, setProjects] = useState(initialProjects);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<TransactionProjectUI | null>(null);
    const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

    const handleEdit = (c: TransactionProjectUI) => {
        setEditingProject(c);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingProject(null);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirmingDelete !== id) {
            setConfirmingDelete(id);
            setTimeout(() => setConfirmingDelete(null), 3000);
            return;
        }
        const res = await deleteTransactionProject(id);
        if (res.success) {
            toast.success('Đã xóa thành công');
            setProjects(prev => prev.filter(c => c.id !== id));
            setConfirmingDelete(null);
        } else {
            toast.error('Lỗi khi xóa: ' + res.error);
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        const formData = new FormData();
        formData.append('is_active', (!currentStatus).toString());
        const res = await updateTransactionProject(id, formData);
        if (res.success) {
            toast.success('Đã cập nhật trạng thái');
            setProjects(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
        } else {
            toast.error('Lỗi cập nhật: ' + res.error);
        }
    };

    const renderTable = (data: TransactionProjectUI[]) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Tên hạng mục</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Thực tế / Mục tiêu (VNĐ)</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Hiển thị</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-500 py-10">Chưa có dữ liệu.</TableCell>
                    </TableRow>
                ) : data.map((c) => (
                    <TableRow key={c.id}>
                        <TableCell className="font-medium">
                            <div className="flex flex-col">
                                <span>{c.title}</span>
                                <span className="text-xs text-slate-400">{(c as any).tenants?.name || 'Hệ thống'}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            {c.type === 'specific_project' ? (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><TrendingUp className="w-3 h-3 mr-1"/>Dự án</Badge>
                            ) : (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200"><Heart className="w-3 h-3 mr-1"/>Quỹ</Badge>
                            )}
                        </TableCell>
                        <TableCell>
                            {c.type === 'specific_project' && c.goal > 0 ? (
                                <div className="flex flex-col gap-1 w-32">
                                    <div className="text-xs flex justify-between">
                                        <span>{Math.min(100, Math.round((c.current / c.goal) * 100))}%</span>
                                        <span className="text-slate-400">{formatCurrency(c.goal)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div className="bg-gold-primary h-1.5 rounded-full" style={{ width: `${Math.min(100, (c.current / c.goal) * 100)}%` }}></div>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-emerald-600 font-medium">{formatCurrency(c.current)}</span>
                            )}
                        </TableCell>
                        <TableCell><StatusBadge status={c.status} /></TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Switch checked={c.is_active} onCheckedChange={() => handleToggleActive(c.id, c.is_active)} disabled={!canUpdate} />
                                <span className={`text-xs font-semibold ${c.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {c.is_active ? 'Hiển thị' : 'Ẩn'}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            {canUpdate && (
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}>
                                    <Pencil className="h-4 w-4 text-slate-500" />
                                </Button>
                            )}
                            {canDelete && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={confirmingDelete === c.id ? "text-red-700 bg-red-100" : "text-red-500"}
                                    onClick={() => handleDelete(c.id)}
                                    title={confirmingDelete === c.id ? "Click lần nữa để xóa" : "Xóa"}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                <CardTitle className="text-lg font-semibold">Danh sách</CardTitle>
                {canUpdate && (
                    <Button onClick={handleCreate} className="bg-gold-primary hover:bg-gold-dark text-white">
                        <Plus className="mr-2 h-4 w-4" /> Thêm Hạng mục
                    </Button>
                )}
            </CardHeader>
            <CardContent className="p-0">
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="bg-transparent border-b w-full justify-start rounded-none p-0 h-12">
                        <TabsTrigger value="all" className="data-[state=active]:border-b-2 data-[state=active]:border-gold-primary rounded-none h-full px-6">Tất cả</TabsTrigger>
                        <TabsTrigger value="projects" className="data-[state=active]:border-b-2 data-[state=active]:border-gold-primary rounded-none h-full px-6">1. Các Dự án Cụ thể</TabsTrigger>
                        <TabsTrigger value="general" className="data-[state=active]:border-b-2 data-[state=active]:border-gold-primary rounded-none h-full px-6">2. Quỹ Thanh toán Chung</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="p-0 m-0">{renderTable(projects)}</TabsContent>
                    <TabsContent value="projects" className="p-0 m-0">{renderTable(projects.filter(c => c.type === 'specific_project'))}</TabsContent>
                    <TabsContent value="general" className="p-0 m-0">{renderTable(projects.filter(c => c.type === 'general_fund'))}</TabsContent>
                </Tabs>

                <ProjectFormDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    project={editingProject}
                    bankAccounts={bankAccounts}
                    currentTenantId={currentTenantId}
                    companyTenantId={companyTenantId}
                    tenants={tenants}
                    onSuccess={(saved) => {
                        if (!saved || !saved.id) return;
                        setProjects(prev => {
                            const exists = prev.find(p => p.id === saved.id);
                            if (exists) return prev.map(p => p.id === saved.id ? saved : p);
                            return [saved, ...prev];
                        });
                    }}
                />
            </CardContent>
        </Card>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'ongoing': return <Badge className="bg-emerald-100 text-emerald-700 border-none hover:bg-emerald-100">Đang nhận</Badge>;
        case 'completed': return <Badge className="bg-blue-100 text-blue-700 border-none hover:bg-blue-100">Hoàn thành</Badge>;
        case 'cancelled': return <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-none hover:bg-slate-100">Tạm dừng/Hủy</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
}

// ─── Full-width Dialog Project Form (matches News/Event style) ───────────────

function ProjectFormDialog({ open, onOpenChange, project, bankAccounts, currentTenantId, companyTenantId, tenants, onSuccess }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: TransactionProjectUI | null;
    bankAccounts: BankAccount[];
    currentTenantId?: string;
    companyTenantId?: string;
    tenants: { id: string; name: string }[];
    onSuccess: (c: TransactionProjectUI) => void;
}) {
    const isEditing = !!project;

    // ─── State ─────────────────────────────────────────────────────────────
    const [isProject, setIsProject] = useState<boolean>(project?.type === 'specific_project');
    const [isActive, setIsActive] = useState<boolean>(project ? project.is_active : true);
    const [loading, setLoading] = useState(false);
    const [titleVi, setTitleVi] = useState(project?.title || '');
    const [titleKm, setTitleKm] = useState((project as any)?.title_km || '');
    const [descVi, setDescVi] = useState(project?.description || '');
    const [descKm, setDescKm] = useState((project as any)?.description_km || '');
    const [contentVi, setContentVi] = useState(project?.content_vi || '');
    const [contentKm, setContentKm] = useState((project as any)?.content_km || '');

    // Sync state when dialog opens with new data
    React.useEffect(() => {
        if (open) {
            setIsProject(project?.type === 'specific_project');
            setIsActive(project ? project.is_active : true);
            setTitleVi(project?.title || '');
            setTitleKm((project as any)?.title_km || '');
            setDescVi(project?.description || '');
            setDescKm((project as any)?.description_km || '');
            setContentVi(project?.content_vi || '');
            setContentKm((project as any)?.content_km || '');
        }
    }, [open, project]);

    const generateSlug = (text: string) =>
        text.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/[^a-z0-9 ]/g, ' ')
            .trim().replace(/\s+/g, '-');

    // ─── Submit ─────────────────────────────────────────────────────────────
    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.set('type', isProject ? 'specific_project' : 'general_fund');
        formData.set('title_vi', titleVi);
        formData.set('title_km', titleKm);
        formData.set('description_vi', descVi);
        formData.set('description_km', descKm);
        formData.set('content_vi', contentVi);
        formData.set('content_km', contentKm);
        formData.set('goal', isProject ? (formData.get('goal') as string || '0') : '0');
        formData.set('current', formData.get('current') as string || '0');
        formData.set('status', formData.get('status') as string || 'ongoing');
        formData.set('order_position', formData.get('order_position') as string || '0');
        formData.set('is_active', String(isActive));

        const bankId = formData.get('bank_account_id');
        if (bankId === 'none') formData.delete('bank_account_id');
        if (!formData.get('recipient_type')) formData.set('recipient_type', 'tenant_fund');

        const tenant_id = formData.get('tenant_id');
        if ((!tenant_id || tenant_id === 'none') && companyTenantId) {
            formData.set('tenant_id', companyTenantId);
        }

        if (isEditing) formData.set('id', project!.id);

        const res = isEditing && project
            ? await updateTransactionProject(project.id, formData)
            : await createTransactionProject(formData);

        setLoading(false);

        if (res.success) {
            toast.success(isEditing ? 'Đã cập nhật' : 'Đã lưu Hạng mục');
            const savedData = res.data ? {
                ...res.data,
                title: res.data.title_vi,
                description: res.data.description_vi,
                goal: res.data.target_amount,
                current: res.data.current_amount || 0,
            } : null;
            if (savedData) onSuccess(savedData as unknown as TransactionProjectUI);
            onOpenChange(false);
        } else {
            toast.error('Lỗi: ' + res.error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl w-full bg-white p-0 overflow-hidden flex flex-col max-h-[90vh]">
                {/* ─── Header ─── */}
                <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        {isEditing ? 'Chỉnh sửa Hạng mục' : 'Thêm Hạng mục Đóng góp Quỹ mới'}
                    </DialogTitle>
                </DialogHeader>

                {/* ─── Form Body ─── */}
                <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* ─── Left: Main content (2 cols) ─── */}
                            <div className="lg:col-span-2 space-y-5">

                                {/* Type Toggle */}
                                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <Switch id="type_toggle" checked={isProject} onCheckedChange={setIsProject} />
                                    <div>
                                        <Label htmlFor="type_toggle" className="font-bold text-purple-900 cursor-pointer">Đây là một Dự án cụ thể</Label>
                                        <p className="text-xs text-purple-700 mt-0.5">Bật nếu cần đặt mục tiêu số tiền, theo dõi thanh tiến độ và viết bài giới thiệu chi tiết.</p>
                                    </div>
                                </div>

                                {/* Bilingual Content */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Nội dung Đa ngôn ngữ</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Tabs defaultValue="vi" className="w-full">
                                            <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100">
                                                <TabsTrigger value="vi">🇻🇳 Tiếng Việt</TabsTrigger>
                                                <TabsTrigger value="km">🇰🇭 Khmer</TabsTrigger>
                                            </TabsList>

                                            {/* ─── Tab VI ─── */}
                                            <TabsContent value="vi" className="space-y-4">
                                                <div>
                                                    <Label htmlFor="title_vi" className="mb-1.5 block">
                                                        Tên {isProject ? 'Dự án' : 'Quỹ chung'} (VI) <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="title_vi"
                                                        value={titleVi}
                                                        onChange={(e) => setTitleVi(e.target.value)}
                                                        placeholder="Tên bằng tiếng Việt..."
                                                        required
                                                        className="bg-slate-50"
                                                    />
                                                </div>

                                                <div>
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <Label htmlFor="slug">Đường dẫn tĩnh (Slug)</Label>
                                                        <button
                                                            type="button"
                                                            className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 rounded px-2 py-0.5 hover:bg-blue-100 transition-colors"
                                                            onClick={() => {
                                                                const el = document.getElementById('project-slug') as HTMLInputElement;
                                                                if (el) el.value = generateSlug(titleVi);
                                                            }}
                                                        >
                                                            Tạo tự động từ Tên
                                                        </button>
                                                    </div>
                                                    <Input
                                                        id="project-slug"
                                                        name="slug"
                                                        defaultValue={(project as any)?.slug || ''}
                                                        placeholder="vi-du-ten-du-an"
                                                        className="bg-slate-50 font-mono text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="desc_vi" className="mb-1.5 block">Mô tả ngắn (VI)</Label>
                                                    <Textarea
                                                        id="desc_vi"
                                                        value={descVi}
                                                        onChange={(e) => setDescVi(e.target.value)}
                                                        placeholder="Mô tả ngắn gọn, hiển thị ở thẻ tóm tắt..."
                                                        rows={3}
                                                        className="bg-slate-50"
                                                    />
                                                </div>

                                                {isProject && (
                                                    <div>
                                                        <Label className="mb-1.5 block">Nội dung chi tiết dự án (VI)</Label>
                                                        <div className="min-h-[300px]">
                                                            <RichTextEditor
                                                                content={contentVi}
                                                                onChange={setContentVi}
                                                                placeholder="Nhập nội dung chi tiết về dự án bằng tiếng Việt..."
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </TabsContent>

                                            {/* ─── Tab KM ─── */}
                                            <TabsContent value="km" className="space-y-4">
                                                <div>
                                                    <Label htmlFor="title_km" className="mb-1.5 block">
                                                        ឈ្មោះ{isProject ? 'គម្រោង' : 'មូលនិធិ'} (KM)
                                                    </Label>
                                                    <Input
                                                        id="title_km"
                                                        value={titleKm}
                                                        onChange={(e) => setTitleKm(e.target.value)}
                                                        placeholder="ឈ្មោះគម្រោង / មូលនិធិ..."
                                                        className="bg-slate-50 font-khmer"
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="desc_km" className="mb-1.5 block">សេចក្តីសង្ខេប (KM)</Label>
                                                    <Textarea
                                                        id="desc_km"
                                                        value={descKm}
                                                        onChange={(e) => setDescKm(e.target.value)}
                                                        placeholder="របៀបសង្ខេប..."
                                                        rows={3}
                                                        className="bg-slate-50 font-khmer"
                                                    />
                                                </div>

                                                {isProject && (
                                                    <div>
                                                        <Label className="mb-1.5 block">ខ្លឹមសារលម្អិត (KM)</Label>
                                                        <div className="min-h-[300px]">
                                                            <RichTextEditor
                                                                content={contentKm}
                                                                onChange={setContentKm}
                                                                placeholder="បញ្ចូលខ្លឹមសាររបស់គម្រោង..."
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* ─── Right: Sidebar (1 col) ─── */}
                            <div className="space-y-4">

                                {/* Hidden tenant for single tenant context */}
                                {currentTenantId && tenants.length === 0 && (
                                    <input type="hidden" name="tenant_id" value={currentTenantId} />
                                )}

                                {/* Tenant selector for super admin */}
                                {tenants.length > 0 && (
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <Landmark className="w-4 h-4" />Cơ sở
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Select name="tenant_id" defaultValue={project?.tenant_id || companyTenantId || ''}>
                                                <SelectTrigger className="bg-slate-50 rounded-xl">
                                                    <SelectValue placeholder="Chọn cơ sở quản lý" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={companyTenantId || 'none'}>-- Hệ thống chung --</SelectItem>
                                                    {tenants.map(t => (
                                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Project Progress */}
                                {isProject && (
                                    <Card className="border-blue-100">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-blue-600" />Tiến độ Dự án
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                <Label htmlFor="goal" className="text-xs">Mục tiêu đóng góp quỹ (VNĐ)</Label>
                                                <Input id="goal" name="goal" type="number" defaultValue={project?.goal || 0} className="bg-white mt-1" />
                                            </div>
                                            <div>
                                                <Label htmlFor="current" className="text-xs">Hiện đã quyên được (VNĐ)</Label>
                                                <Input id="current" name="current" type="number" defaultValue={project?.current || 0} className="bg-white mt-1" />
                                                <p className="text-[10px] text-slate-500 mt-1">Thường tự động tăng, nhưng có thể sửa tay.</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* General fund amount */}
                                {!isProject && (
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Số tiền hiện có</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Input id="current" name="current" type="number" defaultValue={project?.current || 0} className="bg-slate-50" />
                                            <p className="text-[10px] text-slate-500 mt-1">Hiển thị tượng trưng trên giao diện.</p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Settings */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Settings className="w-4 h-4" />Cài đặt
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="status" className="text-xs mb-1 block">Trạng thái</Label>
                                            <Select name="status" defaultValue={project?.status || 'ongoing'}>
                                                <SelectTrigger className="bg-slate-50 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ongoing">Đang nhận đóng góp</SelectItem>
                                                    <SelectItem value="completed">Đã hoàn thành</SelectItem>
                                                    <SelectItem value="cancelled">Đã hủy bỏ/Trì hoãn</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="icon" className="text-xs mb-1 block">Icon (Tên Lucide, VD: Heart)</Label>
                                            <Input id="icon" name="icon" defaultValue={project?.icon || 'Heart'} className="bg-slate-50" />
                                        </div>
                                        <div>
                                            <Label htmlFor="order_position" className="text-xs mb-1 block">Thứ tự hiển thị</Label>
                                            <Input id="order_position" name="order_position" type="number" defaultValue={project?.order_position || 10} className="bg-slate-50" />
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t">
                                            <Label htmlFor="is_active_switch" className="cursor-pointer">Hiển thị ra Client</Label>
                                            <Switch id="is_active_switch" checked={isActive} onCheckedChange={setIsActive} />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Bank Account */}
                                <Card className="border-slate-200">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Luồng Chuyển Tiền</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label className="text-xs font-bold text-slate-500 mb-1 block">Tài khoản thụ hưởng</Label>
                                            <Select name="bank_account_id" defaultValue={project?.bank_account_id || 'none'}>
                                                <SelectTrigger className="bg-white rounded-xl">
                                                    <SelectValue placeholder="Chọn tài khoản ngân hàng" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Mặc định (Theo cấu hình hệ thống)</SelectItem>
                                                    {bankAccounts.map(acc => (
                                                        <SelectItem key={acc.id} value={acc.id}>
                                                            <div className="flex flex-col text-left">
                                                                <span className="font-bold">{acc.bank_name} - {acc.account_number}</span>
                                                                <span className="text-[10px] uppercase text-slate-500">{acc.account_name}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label className="text-xs font-bold text-slate-500 mb-1 block">Loại quỹ nhận</Label>
                                            <Select name="recipient_type" defaultValue={project?.recipient_type || 'tenant_fund'}>
                                                <SelectTrigger className="bg-white rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="tenant_fund">Quỹ Thanh toán Tam Bảo</SelectItem>
                                                    <SelectItem value="charity_fund">Quỹ Từ thiện Xã hội</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* ─── Footer Actions ─── */}
                    <div className="flex justify-end gap-3 px-6 py-4 border-t bg-slate-50 flex-shrink-0">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Thoát</Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gold-primary hover:bg-gold-dark text-white px-8 min-w-[140px]"
                        >
                            {loading
                                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                : <Save className="mr-2 h-4 w-4" />
                            }
                            {isEditing ? 'Cập nhật' : 'Lưu Thông Tin'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
