'use client';

import React, { useState, useTransition } from 'react';
import { bulkUpdateMediaMetadata, bulkDeleteMedia } from '@/app/actions/admin/media';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CategoryNode } from '@/lib/cache/queries';
import { CustomCategorySelect } from '@/components/admin/custom-category-select';
import { TenantBroadcastSelect } from '@/components/admin/tenant-broadcast-select';

interface BulkMediaActionsBarProps {
    tenantId: string | undefined;
    selectedIds: string[];
    onClearSelection: () => void;
    onRefresh: () => void;
    categoriesTree: CategoryNode[];
    tenants?: any[];
    mainTab: string;
}

const flattenCategories = (nodes: CategoryNode[], level = 0): { id: string; name: string; level: number; module: string | null; isGlobal: boolean }[] => {
    let result: { id: string; name: string; level: number; module: string | null; isGlobal: boolean }[] = [];
    const GLOBAL_TENANT_ID = '55555555-5555-5555-5555-555555555555';
    nodes.forEach(node => {
        result.push({ 
            id: node.id, 
            name: node.name_vi, 
            level, 
            module: node.module,
            isGlobal: node.tenant_id === GLOBAL_TENANT_ID
        });
        if (node.children && node.children.length > 0) {
            result = result.concat(flattenCategories(node.children, level + 1));
        }
    });
    return result;
};

export function BulkMediaActionsBar({ tenantId, selectedIds, onClearSelection, onRefresh, categoriesTree, tenants, mainTab }: BulkMediaActionsBarProps) {
    const [isPending, startTransition] = useTransition();

    // Modals
    const [catOpen, setCatOpen] = useState(false);
    const [pubOpen, setPubOpen] = useState(false);
    const [delOpen, setDelOpen] = useState(false);

    // Form states
    const [newCategoryId, setNewCategoryId] = useState<string>('');
    const [newPublishTenants, setNewPublishTenants] = useState<string[]>([]);

    if (selectedIds.length === 0) return null;

    const targetModule = mainTab === 'images' ? 'media' : 'documents';
    const flatCategories = flattenCategories(categoriesTree).filter(cat => cat.module === targetModule);
    const localCats = flatCategories.filter(cat => !cat.isGlobal).map(c => ({...c, name_vi: c.name}));
    const globalCats = flatCategories.filter(cat => cat.isGlobal).map(c => ({...c, name_vi: c.name}));

    const handleUpdateCategory = async () => {
        if (!newCategoryId) {
            toast.error('Vui lòng chọn một danh mục');
            return;
        }
        startTransition(async () => {
            const res = await bulkUpdateMediaMetadata(tenantId, selectedIds, { category_id: newCategoryId });
            if (res.success) {
                toast.success(`Đã cập nhật danh mục cho ${res.successCount} mục`);
                setCatOpen(false);
                onClearSelection();
                onRefresh();
            } else {
                toast.error(res.error || 'Có lỗi xảy ra');
            }
        });
    };

    const handleUpdatePublish = async () => {
        startTransition(async () => {
            const res = await bulkUpdateMediaMetadata(tenantId, selectedIds, { published_to: newPublishTenants });
            if (res.success) {
                toast.success(`Đã cập nhật quyền xuất bản cho ${res.successCount} mục`);
                setPubOpen(false);
                onClearSelection();
                onRefresh();
            } else {
                toast.error(res.error || 'Có lỗi xảy ra');
            }
        });
    };

    const handleDelete = async () => {
        startTransition(async () => {
            const res = await bulkDeleteMedia(tenantId, selectedIds);
            if (res.success) {
                toast.success(`Đã xóa ${res.successCount} mục` + (res.failCount ? ` (${res.failCount} mục thất bại)` : ''));
                setDelOpen(false);
                onClearSelection();
                onRefresh();
            } else {
                toast.error(res.error || 'Có lỗi xảy ra');
            }
        });
    };

    return (
        <>
            {/* Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 transform transition-transform duration-300 translate-y-0">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-gold-primary/10 text-gold-dark px-4 py-2 rounded-full font-bold text-sm">
                            Đã chọn {selectedIds.length} mục
                        </div>
                        <button onClick={onClearSelection} className="text-sm text-gray-500 hover:text-gray-900 font-medium underline-offset-4 hover:underline">
                            Bỏ chọn
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={() => setCatOpen(true)} className="border-gold-primary text-gold-dark hover:bg-gold-primary/5">
                            Sửa Danh mục
                        </Button>
                        {tenants && tenants.length > 0 && !tenantId && (
                            <Button variant="outline" size="sm" onClick={() => setPubOpen(true)} className="border-blue-500 text-blue-700 hover:bg-blue-50">
                                Cấp xuất bản
                            </Button>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => setDelOpen(true)}>
                            Xóa hàng loạt
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Dialog open={catOpen} onOpenChange={setCatOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thay đổi danh mục</DialogTitle>
                        <DialogDescription>Chọn danh mục mới để áp dụng chung cho {selectedIds.length} mục đã chọn.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <CustomCategorySelect
                            value={newCategoryId}
                            onChange={(val) => setNewCategoryId(val)}
                            localCategories={localCats}
                            globalCategories={globalCats}
                            placeholder="Chọn danh mục..."
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCatOpen(false)}>Hủy</Button>
                        <Button onClick={handleUpdateCategory} disabled={isPending} className="bg-gold-primary hover:bg-gold-dark text-white">
                            {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={pubOpen} onOpenChange={setPubOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Gán quyền xuất bản</DialogTitle>
                        <DialogDescription>Chọn các chi nhánh mả bạn muốn cho phép hiển thị {selectedIds.length} mục này.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {tenants && (
                            <TenantBroadcastSelect
                                tenants={tenants}
                                selectedTenantIds={newPublishTenants}
                                onChange={setNewPublishTenants}
                            />
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPubOpen(false)}>Hủy</Button>
                        <Button onClick={handleUpdatePublish} disabled={isPending} className="bg-gold-primary hover:bg-gold-dark text-white">
                            {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={delOpen} onOpenChange={setDelOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Xóa vĩnh viễn {selectedIds.length} mục?</DialogTitle>
                        <DialogDescription>Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa khỏi hệ thống hoàn toàn.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDelOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                            {isPending ? 'Đang xóa...' : 'Xác nhận xóa'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
