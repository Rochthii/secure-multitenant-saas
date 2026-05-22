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
            <div className="min-h-[300px] w-full flex items-center justify-center bg-slate-950 border border-white/10 rounded-xl">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                <span className="ml-2 text-sm text-slate-400">Đang tải trình soạn thảo...</span>
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
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                        <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-[30%]">Tên hạng mục</th>
                        <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Loại</th>
                        <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thực tế / Mục tiêu (VNĐ)</th>
                        <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                        <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hiển thị</th>
                        <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="text-center text-slate-500 py-16">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="bg-slate-900/60 p-4 rounded-full border border-white/[0.08]">
                                        <Landmark className="h-8 w-8 text-slate-500" />
                                    </div>
                                    <p className="text-base font-bold text-white">Chưa có hạng mục đóng góp nào</p>
                                </div>
                            </td>
                        </tr>
                    ) : data.map((c) => (
                        <tr key={c.id} className="hover:bg-white/[0.02] group transition-colors">
                            <td className="px-6 py-4 font-medium">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">{c.title}</span>
                                    <span className="text-xs text-slate-500 mt-1">{(c as any).tenants?.name || 'Hệ thống'}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {c.type === 'specific_project' ? (
                                    <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 gap-1 rounded-full px-2.5 py-0.5 font-bold"><TrendingUp className="w-3.5 h-3.5 mr-1"/>Dự án</Badge>
                                ) : (
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 gap-1 rounded-full px-2.5 py-0.5 font-bold"><Heart className="w-3.5 h-3.5 mr-1"/>Quỹ chung</Badge>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                {c.type === 'specific_project' && c.goal > 0 ? (
                                    <div className="flex flex-col gap-1.5 w-40">
                                        <div className="text-xs flex justify-between font-mono text-slate-400">
                                            <span className="text-amber-400 font-bold">{Math.min(100, Math.round((c.current / c.goal) * 100))}%</span>
                                            <span>{formatCurrency(c.current)} / {formatCurrency(c.goal)}</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (c.current / c.goal) * 100)}%` }}></div>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-emerald-400 font-bold font-mono">{formatCurrency(c.current)}</span>
                                )}
                            </td>
                            <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <Switch checked={c.is_active} onCheckedChange={() => handleToggleActive(c.id, c.is_active)} disabled={!canUpdate} />
                                    <span className={`text-xs font-semibold ${c.is_active ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        {c.is_active ? 'Hiển thị' : 'Ẩn'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                    {canUpdate && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-amber-400 hover:bg-white/5 rounded-xl transition-colors" onClick={() => handleEdit(c)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {canDelete && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-8 w-8 rounded-xl transition-colors ${confirmingDelete === c.id ? "text-red-400 bg-red-500/10 border border-red-500/20" : "text-slate-400 hover:text-red-400 hover:bg-white/5"}`}
                                            onClick={() => handleDelete(c.id)}
                                            title={confirmingDelete === c.id ? "Click lần nữa để xóa" : "Xóa"}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <Card className="border-white/[0.08] bg-slate-900/40 backdrop-blur-xl overflow-hidden rounded-2xl shadow-none">
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-amber-400" />
                    Danh sách hạng mục
                </CardTitle>
                {canUpdate && (
                    <Button onClick={handleCreate} className="bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 px-5">
                        <Plus className="mr-2 h-4 w-4" /> Thêm Hạng mục
                    </Button>
                )}
            </CardHeader>
            <CardContent className="p-0">
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="bg-slate-950/60 border-b border-white/[0.08] w-full justify-start rounded-none p-1 h-auto flex gap-1">
                        <TabsTrigger value="all" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:font-bold text-slate-400 hover:text-white rounded-lg px-6 py-2.5 text-sm transition-all border-none shadow-none">Tất cả</TabsTrigger>
                        <TabsTrigger value="projects" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:font-bold text-slate-400 hover:text-white rounded-lg px-6 py-2.5 text-sm transition-all border-none shadow-none">1. Các Dự án Cụ thể</TabsTrigger>
                        <TabsTrigger value="general" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:font-bold text-slate-400 hover:text-white rounded-lg px-6 py-2.5 text-sm transition-all border-none shadow-none">2. Quỹ Thanh toán Chung</TabsTrigger>
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
        case 'ongoing': return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 gap-1 rounded-full px-2.5 py-0.5 font-bold">Đang nhận</Badge>;
        case 'completed': return <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 gap-1 rounded-full px-2.5 py-0.5 font-bold">Hoàn thành</Badge>;
        case 'cancelled': return <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 gap-1 rounded-full px-2.5 py-0.5 font-bold">Tạm dừng/Hủy</Badge>;
        default: return <Badge variant="outline" className="border-white/10 text-slate-400">{status}</Badge>;
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
            toast.success(res.error ? 'Cảnh báo: ' + res.error : (isEditing ? 'Đã cập nhật' : 'Đã lưu Hạng mục'));
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
            <DialogContent className="max-w-5xl w-full bg-slate-950 border border-white/[0.08] p-0 overflow-hidden flex flex-col max-h-[90vh] text-slate-300">
                {/* ─── Header ─── */}
                <DialogHeader className="px-6 py-4 border-b border-white/5 flex-shrink-0 bg-white/[0.02]">
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <Landmark className="w-5 h-5 text-amber-400" />
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
                                <div className="flex items-center gap-3 p-4 bg-purple-950/20 rounded-xl border border-purple-500/20">
                                    <Switch id="type_toggle" checked={isProject} onCheckedChange={setIsProject} />
                                    <div>
                                        <Label htmlFor="type_toggle" className="font-bold text-purple-300 cursor-pointer">Đây là một Dự án cụ thể</Label>
                                        <p className="text-xs text-purple-400/80 mt-0.5">Bật nếu cần đặt mục tiêu số tiền, theo dõi thanh tiến độ và viết bài giới thiệu chi tiết.</p>
                                    </div>
                                </div>

                                {/* Bilingual Content */}
                                <Card className="border-white/[0.08] bg-slate-900/40 backdrop-blur-xl overflow-hidden rounded-2xl">
                                    <CardHeader className="pb-2 border-b border-white/5 bg-white/[0.02]">
                                        <CardTitle className="text-base font-bold text-white">Nội dung Đa ngôn ngữ</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <Tabs defaultValue="vi" className="w-full">
                                            <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-950 border border-white/10 p-1 h-auto rounded-xl">
                                                <TabsTrigger value="vi" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:font-bold text-slate-400 hover:text-white rounded-lg py-2 text-sm transition-all">🇻🇳 Tiếng Việt</TabsTrigger>
                                                <TabsTrigger value="km" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:font-bold text-slate-400 hover:text-white rounded-lg py-2 text-sm transition-all">🇰🇭 Khmer</TabsTrigger>
                                            </TabsList>

                                            {/* ─── Tab VI ─── */}
                                            <TabsContent value="vi" className="space-y-4">
                                                <div>
                                                    <Label htmlFor="title_vi" className="mb-1.5 block text-slate-200 font-bold">
                                                        Tên {isProject ? 'Dự án' : 'Quỹ chung'} (VI) <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="title_vi"
                                                        value={titleVi}
                                                        onChange={(e) => setTitleVi(e.target.value)}
                                                        placeholder="Tên bằng tiếng Việt..."
                                                        required
                                                        className="bg-slate-900 border-white/10 text-white rounded-xl focus:border-amber-500"
                                                    />
                                                </div>

                                                <div>
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <Label htmlFor="slug" className="text-slate-200">Đường dẫn tĩnh (Slug)</Label>
                                                        <button
                                                            type="button"
                                                            className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded px-2 py-0.5 hover:bg-blue-500/20 transition-colors"
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
                                                        className="bg-slate-900 border-white/10 text-white rounded-xl font-mono text-sm focus:border-amber-500"
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="desc_vi" className="mb-1.5 block text-slate-200">Mô tả ngắn (VI)</Label>
                                                    <Textarea
                                                        id="desc_vi"
                                                        value={descVi}
                                                        onChange={(e) => setDescVi(e.target.value)}
                                                        placeholder="Mô tả ngắn gọn, hiển thị ở thẻ tóm tắt..."
                                                        rows={3}
                                                        className="bg-slate-900 border-white/10 text-white rounded-xl focus:border-amber-500"
                                                    />
                                                </div>

                                                {isProject && (
                                                    <div>
                                                        <Label className="mb-1.5 block text-slate-200">Nội dung chi tiết dự án (VI)</Label>
                                                        <div className="min-h-[300px] rounded-xl overflow-hidden border border-white/10 bg-slate-950">
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
                                                    <Label htmlFor="title_km" className="mb-1.5 block text-slate-200">
                                                        ឈ្មោះ{isProject ? 'គម្រោង' : 'មូលនិធិ'} (KM)
                                                    </Label>
                                                    <Input
                                                        id="title_km"
                                                        value={titleKm}
                                                        onChange={(e) => setTitleKm(e.target.value)}
                                                        placeholder="ឈ្មោះគម្រោង / មូលនិធិ..."
                                                        className="bg-slate-900 border-white/10 text-white rounded-xl font-khmer focus:border-amber-500"
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="desc_km" className="mb-1.5 block text-slate-200">សេចក្តីសង្ខេប (KM)</Label>
                                                    <Textarea
                                                        id="desc_km"
                                                        value={descKm}
                                                        onChange={(e) => setDescKm(e.target.value)}
                                                        placeholder="របៀបសង្ខេប..."
                                                        rows={3}
                                                        className="bg-slate-900 border-white/10 text-white rounded-xl font-khmer focus:border-amber-500"
                                                    />
                                                </div>

                                                {isProject && (
                                                    <div>
                                                        <Label className="mb-1.5 block text-slate-200">ខ្លឹមសារលម្អិត (KM)</Label>
                                                        <div className="min-h-[300px] rounded-xl overflow-hidden border border-white/10 bg-slate-950">
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
                                    <Card className="border-white/[0.08] bg-slate-900/40 backdrop-blur-xl overflow-hidden rounded-2xl shadow-none">
                                        <CardHeader className="pb-2 border-b border-white/5 bg-white/[0.02]">
                                            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                                                <Landmark className="w-4 h-4 text-amber-400" />Cơ sở
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <Select name="tenant_id" defaultValue={project?.tenant_id || companyTenantId || ''}>
                                                <SelectTrigger className="bg-slate-900 border-white/10 text-white rounded-xl">
                                                    <SelectValue placeholder="Chọn cơ sở quản lý" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
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
                                    <Card className="border-white/[0.08] bg-slate-900/40 backdrop-blur-xl overflow-hidden rounded-2xl shadow-none">
                                        <CardHeader className="pb-2 border-b border-white/5 bg-white/[0.02]">
                                            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-blue-400" />Tiến độ Dự án
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3 pt-4">
                                            <div>
                                                <Label htmlFor="goal" className="text-xs text-slate-300">Mục tiêu đóng góp quỹ (VNĐ)</Label>
                                                <Input id="goal" name="goal" type="number" defaultValue={project?.goal || 0} className="bg-slate-900 border-white/10 text-white mt-1 rounded-xl focus:border-amber-500" />
                                            </div>
                                            <div>
                                                <Label htmlFor="current" className="text-xs text-slate-300">Hiện đã quyên được (VNĐ)</Label>
                                                <Input id="current" name="current" type="number" defaultValue={project?.current || 0} className="bg-slate-900 border-white/10 text-white mt-1 rounded-xl focus:border-amber-500" />
                                                <p className="text-[10px] text-slate-500 mt-1">Thường tự động tăng, nhưng có thể sửa tay.</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* General fund amount */}
                                {!isProject && (
                                    <Card className="border-white/[0.08] bg-slate-900/40 backdrop-blur-xl overflow-hidden rounded-2xl shadow-none">
                                        <CardHeader className="pb-2 border-b border-white/5 bg-white/[0.02]">
                                            <CardTitle className="text-sm font-bold text-white">Số tiền hiện có</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <Input id="current" name="current" type="number" defaultValue={project?.current || 0} className="bg-slate-900 border-white/10 text-white rounded-xl focus:border-amber-500" />
                                            <p className="text-[10px] text-slate-500 mt-1">Hiển thị tượng trưng trên giao diện.</p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Settings */}
                                <Card className="border-white/[0.08] bg-slate-900/40 backdrop-blur-xl overflow-hidden rounded-2xl shadow-none">
                                    <CardHeader className="pb-2 border-b border-white/5 bg-white/[0.02]">
                                        <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                                            <Settings className="w-4 h-4 text-slate-400" />Cài đặt
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-4">
                                        <div>
                                            <Label htmlFor="status" className="text-xs mb-1 block text-slate-300">Trạng thái</Label>
                                            <Select name="status" defaultValue={project?.status || 'ongoing'}>
                                                <SelectTrigger className="bg-slate-900 border-white/10 text-white rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                                                    <SelectItem value="ongoing">Đang nhận đóng góp</SelectItem>
                                                    <SelectItem value="completed">Đã hoàn thành</SelectItem>
                                                    <SelectItem value="cancelled">Đã hủy bỏ/Trì hoãn</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="icon" className="text-xs mb-1 block text-slate-300">Icon (Tên Lucide, VD: Heart)</Label>
                                            <Input id="icon" name="icon" defaultValue={project?.icon || 'Heart'} className="bg-slate-900 border-white/10 text-white rounded-xl focus:border-amber-500" />
                                        </div>
                                        <div>
                                            <Label htmlFor="order_position" className="text-xs mb-1 block text-slate-300">Thứ tự hiển thị</Label>
                                            <Input id="order_position" name="order_position" type="number" defaultValue={project?.order_position || 10} className="bg-slate-900 border-white/10 text-white rounded-xl focus:border-amber-500" />
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                            <Label htmlFor="is_active_switch" className="cursor-pointer text-slate-300">Hiển thị ra Client</Label>
                                            <Switch id="is_active_switch" checked={isActive} onCheckedChange={setIsActive} />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Bank Account */}
                                <Card className="border-white/[0.08] bg-slate-900/40 backdrop-blur-xl overflow-hidden rounded-2xl shadow-none">
                                    <CardHeader className="pb-2 border-b border-white/5 bg-white/[0.02]">
                                        <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                                            <Landmark className="w-4 h-4 text-emerald-400" />Luồng Chuyển Tiền
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-4">
                                        <div>
                                            <Label className="text-xs font-bold text-slate-400 mb-1 block">Tài khoản thụ hưởng</Label>
                                            <Select name="bank_account_id" defaultValue={project?.bank_account_id || 'none'}>
                                                <SelectTrigger className="bg-slate-900 border-white/10 text-white rounded-xl">
                                                    <SelectValue placeholder="Chọn tài khoản ngân hàng" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
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
                                            <Label className="text-xs font-bold text-slate-400 mb-1 block">Loại quỹ nhận</Label>
                                            <Select name="recipient_type" defaultValue={project?.recipient_type || 'tenant_fund'}>
                                                <SelectTrigger className="bg-slate-900 border-white/10 text-white rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
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
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/5 bg-white/[0.02] flex-shrink-0">
                        <Button type="button" variant="outline" className="border-white/10 hover:bg-white/5 text-slate-300 hover:text-white rounded-xl" onClick={() => onOpenChange(false)}>Thoát</Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 px-8 min-w-[140px]"
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
