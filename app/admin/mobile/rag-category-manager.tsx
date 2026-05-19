'use client';

import React, { useState, useMemo } from 'react';
import { useRagAdmin } from '@/hooks/use-rag-admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Loader2, Plus, Trash2, BookOpen, AlertCircle, 
    CheckCircle2, Search, Edit2, Check, X, ChevronRight, Tags
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props { ragAdmin: ReturnType<typeof import('@/hooks/use-rag-admin').useRagAdmin> }

export function RagCategoryManager({ ragAdmin }: Props) {
    const { categories, isLoadingCategories, createCategory, updateCategory, deleteCategory } = ragAdmin;

    // Search & Filter
    const [searchTerm, setSearchTerm] = useState('');
    
    // Create Form
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Edit Form
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Delete
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Logic xử lý danh sách
    const filteredCategories = useMemo(() => {
        return categories.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    const groupedCategories = useMemo(() => {
        const groups: Record<string, typeof categories> = {};
        const others: typeof categories = [];

        filteredCategories.forEach(cat => {
            const groupName = cat.group_name || (cat.name.includes(' - ') ? cat.name.split(' - ')[0] : null);
            if (groupName && groupName !== 'Khác') {
                if (!groups[groupName]) groups[groupName] = [];
                groups[groupName].push(cat);
            } else {
                others.push(cat);
            }
        });
        return { groups, others };
    }, [filteredCategories]);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setIsCreating(true);
        setError('');
        setSuccess('');
        const result = await createCategory(newName.trim(), newDesc.trim());
        setIsCreating(false);
        if (result.error) {
            setError(result.error);
        } else {
            setSuccess(`Đã thêm chuyên đề "${newName.trim()}" thành công.`);
            setNewName('');
            setNewDesc('');
        }
    };

    const handleUpdate = async () => {
        if (!editingId || !editName.trim()) return;
        setIsUpdating(true);
        const result = await updateCategory(editingId, editName.trim(), editDesc.trim());
        setIsUpdating(false);
        if (result.error) {
            setError(result.error);
        } else {
            setSuccess('Đã cập nhật chuyên đề thành công.');
            setEditingId(null);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        setError('');
        const result = await deleteCategory(deleteTarget.id);
        setIsDeleting(false);
        if (result.error) {
            setError(result.error);
        } else {
            setSuccess(`Đã xóa chuyên đề "${deleteTarget.name}".`);
        }
        setDeleteTarget(null);
    };

    const startEdit = (cat: any) => {
        setEditingId(cat.id);
        setEditName(cat.name);
        setEditDesc(cat.description || '');
        setError('');
        setSuccess('');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Tags className="w-5 h-5 text-purple-600" />
                        Quản lý Chuyên đề (35 Nhóm)
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-medium">
                        Cấu hình phân loại theo chuẩn Tam Tạng Pāli
                    </p>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {success && (
                <Alert className="bg-emerald-50 border-emerald-200 rounded-xl">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <AlertDescription className="text-emerald-700 font-medium">{success}</AlertDescription>
                </Alert>
            )}

            {/* ── Form thêm chuyên đề ── */}
            <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 p-5 space-y-4">
                <h3 className="text-xs font-bold text-stone-600 flex items-center gap-2 uppercase tracking-widest">
                    <Plus className="w-4 h-4 text-emerald-500" /> Thêm chuyên đề mới
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-tight">Tên chuyên đề *</label>
                        <Input
                            placeholder="VD: Kinh Tạng - Trường Bộ"
                            value={newName}
                            onChange={e => { setNewName(e.target.value); setError(''); setSuccess(''); }}
                            className="bg-white border-stone-200 rounded-xl"
                            disabled={isCreating}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-tight">Mô tả chi tiết</label>
                        <Input
                            placeholder="Mô tả nội dung của chuyên đề này..."
                            value={newDesc}
                            onChange={e => setNewDesc(e.target.value)}
                            className="bg-white border-stone-200 rounded-xl"
                            disabled={isCreating}
                        />
                    </div>
                </div>
                <Button
                    onClick={handleCreate}
                    disabled={isCreating || !newName.trim()}
                    className="w-full md:w-auto bg-stone-800 hover:bg-black rounded-xl px-8"
                >
                    {isCreating
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang xử lý...</>
                        : <><Plus className="w-4 h-4 mr-2" /> Tạo Chuyên đề</>
                    }
                </Button>
            </div>

            {/* ── Tìm kiếm ── */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                    placeholder="Tìm nhanh chuyên đề..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-11 h-12 bg-white border-stone-200 rounded-2xl shadow-sm focus:ring-purple-500"
                />
            </div>

            {/* ── Danh sách chuyên đề ── */}
            {isLoadingCategories ? (
                <div className="flex flex-col items-center gap-3 text-stone-400 py-20 justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-200" />
                    <p className="text-sm font-medium">Đang tải tri thức chuyên đề...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Render Groups */}
                    {Object.entries(groupedCategories.groups).map(([groupName, items]) => (
                        <div key={groupName} className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-200 to-transparent"></div>
                                <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                    {groupName}
                                </h4>
                                <div className="h-px flex-1 bg-gradient-to-r from-stone-200 via-stone-200 to-transparent"></div>
                            </div>
                            
                            <div className="grid gap-2">
                                {items.map(cat => (
                                    <CategoryItem 
                                        key={cat.id} 
                                        cat={cat} 
                                        isEditing={editingId === cat.id}
                                        isUpdating={isUpdating}
                                        editName={editName}
                                        editDesc={editDesc}
                                        onEditNameChange={setEditName}
                                        onEditDescChange={setEditDesc}
                                        onStartEdit={() => startEdit(cat)}
                                        onCancelEdit={() => setEditingId(null)}
                                        onUpdate={handleUpdate}
                                        onDelete={() => setDeleteTarget({ id: cat.id, name: cat.name })}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Render Others */}
                    {groupedCategories.others.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] bg-stone-100 px-3 py-1 rounded-full">
                                    Các nhóm khác
                                </h4>
                                <div className="h-px flex-1 bg-stone-100"></div>
                            </div>
                            <div className="grid gap-2">
                                {groupedCategories.others.map(cat => (
                                    <CategoryItem 
                                        key={cat.id} 
                                        cat={cat} 
                                        isEditing={editingId === cat.id}
                                        isUpdating={isUpdating}
                                        editName={editName}
                                        editDesc={editDesc}
                                        onEditNameChange={setEditName}
                                        onEditDescChange={setEditDesc}
                                        onStartEdit={() => startEdit(cat)}
                                        onCancelEdit={() => setEditingId(null)}
                                        onUpdate={handleUpdate}
                                        onDelete={() => setDeleteTarget({ id: cat.id, name: cat.name })}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredCategories.length === 0 && (
                        <div className="text-center py-20 border-2 border-dashed border-stone-100 rounded-3xl">
                            <AlertCircle className="w-10 h-10 mx-auto text-stone-200 mb-2" />
                            <p className="text-stone-400 text-sm">Không tìm thấy chuyên đề phù hợp</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── Dialog Xóa ── */}
            <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
                <AlertDialogContent className="rounded-2xl border-stone-200 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="w-5 h-5" /> Xóa chuyên đề
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-stone-600">
                            Bạn có chắc chắn muốn xóa chuyên đề <strong>"{deleteTarget?.name}"</strong>? 
                            Hành động này sẽ gỡ nhãn chuyên đề khỏi toàn bộ tài liệu liên quan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel disabled={isDeleting} className="rounded-xl">Hủy bỏ</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 rounded-xl px-6"
                        >
                            {isDeleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang xóa...</> : 'Xác nhận xóa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// ── Sub-component cho mỗi item chuyên đề ──
function CategoryItem({ 
    cat, isEditing, isUpdating, editName, editDesc, 
    onEditNameChange, onEditDescChange, onStartEdit, onCancelEdit, onUpdate, onDelete 
}: any) {
    const displayName = cat.name.includes(' - ') ? cat.name.split(' - ')[1] : cat.name;

    return (
        <div className={cn(
            "p-3 rounded-2xl border transition-all duration-300",
            isEditing 
                ? "bg-white border-purple-300 shadow-xl ring-4 ring-purple-50" 
                : "bg-white border-stone-100 hover:border-purple-200 hover:shadow-md"
        )}>
            {isEditing ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input 
                            value={editName} 
                            onChange={e => onEditNameChange(e.target.value)}
                            placeholder="Tên chuyên đề"
                            className="h-10 rounded-xl"
                        />
                        <Input 
                            value={editDesc} 
                            onChange={e => onEditDescChange(e.target.value)}
                            placeholder="Mô tả"
                            className="h-10 rounded-xl"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            size="sm" 
                            className="flex-1 bg-purple-600 hover:bg-purple-700 rounded-xl"
                            onClick={onUpdate}
                            disabled={isUpdating || !editName.trim()}
                        >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1.5" /> Lưu</>}
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-xl px-4" onClick={onCancelEdit}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
                        <BookOpen className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h5 className="font-bold text-stone-800 truncate leading-tight">{displayName}</h5>
                            <span className="text-[10px] font-black text-stone-400 bg-stone-50 px-2 py-0.5 rounded border border-stone-100 shrink-0 uppercase tracking-tighter">
                                {cat.document_count} Docs
                            </span>
                        </div>
                        {cat.description && (
                            <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5 italic">{cat.description}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onStartEdit}
                            className="h-9 w-9 rounded-xl text-stone-400 hover:text-purple-600 hover:bg-purple-50"
                        >
                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onDelete}
                            disabled={cat.document_count > 0}
                            className={cn(
                                "h-9 w-9 rounded-xl transition-all",
                                cat.document_count > 0 ? "text-stone-200" : "text-stone-300 hover:text-red-600 hover:bg-red-50"
                            )}
                            title={cat.document_count > 0 ? `Còn ${cat.document_count} tài liệu` : 'Xóa chuyên đề'}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

