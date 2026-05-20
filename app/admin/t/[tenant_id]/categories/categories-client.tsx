'use client';

import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FolderTree, CornerDownRight, Edit, GripVertical, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { DeleteCategoryButton } from '@/components/admin/delete-category-button';
import { toast } from 'sonner';
import { updateCategoriesOrder, toggleCategoryVisibility } from '@/app/actions/admin/category';

interface Category {
    id: string;
    name_vi: string;
    name_km?: string;
    name_en?: string;
    slug: string;
    parent_id?: string | null;
    module: string;
    image_url?: string;
    order_position: number;
    is_visible?: boolean;
    tenant_id?: string;
}

interface SortableCategoryItemProps {
    node: Category;
    level: number;
    childrenNodes: Category[];
    tenantId: string;
    allCategories: Category[];
    onVisibilityChange: (id: string, newValue: boolean) => void;
}

function SortableCategoryItem({ node, level, childrenNodes, tenantId, allCategories, onVisibilityChange }: SortableCategoryItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: node.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1 : 0,
    };

    const indentClass = level === 1 ? 'ml-8 border-l-2 border-slate-200 dark:border-slate-800 pl-4' : level === 2 ? 'ml-16 border-l-2 border-slate-200 dark:border-slate-800 pl-4' : '';
    const isVisible = node.is_visible !== false;

    return (
        <React.Fragment>
            <div
                ref={setNodeRef}
                style={style}
                className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 relative ${indentClass} ${isDragging ? 'shadow-lg border-2 border-amber-500 rounded-md bg-white dark:bg-slate-800' : isVisible ? 'bg-white dark:bg-slate-900/40 text-slate-800 dark:text-slate-100' : 'bg-slate-50 dark:bg-slate-900/10 text-slate-400 dark:text-slate-600'}`}
            >
                <div className="flex items-center gap-3">
                    <div {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1">
                        <GripVertical className="h-5 w-5" />
                    </div>
                    {level === 0 ? (
                        <FolderTree className={`h-5 w-5 ${isVisible ? 'text-amber-500' : 'text-slate-300 dark:text-slate-700'}`} />
                    ) : (
                        <CornerDownRight className="h-4 w-4 text-slate-400 dark:text-slate-600" />
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${isVisible ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600 line-through'} ${level === 0 ? 'text-base' : 'text-sm'}`}>
                                {node.name_vi}
                            </h3>
                            {!isVisible && (
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <EyeOff className="h-2.5 w-2.5" /> Đã ẩn
                                </span>
                            )}
                            {node.image_url && (
                                <div className="relative h-6 w-10 rounded border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900">
                                    <img
                                        src={node.image_url}
                                        alt=""
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-400">/{node.slug}</p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="flex gap-1 mr-2">
                        {node.name_en && <span className="text-[10px] bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-900/50">EN</span>}
                        {node.name_km && <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-900/50">KM</span>}
                    </div>

                    {/* Toggle Ẩn/Hiện nhanh */}
                    <div className="flex items-center gap-1.5 mr-2 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 bg-white dark:bg-slate-900/50">
                        {isVisible
                            ? <Eye className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            : <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                        }
                        <Switch
                            checked={isVisible}
                            onCheckedChange={(val) => onVisibilityChange(node.id, val)}
                            className="scale-75"
                        />
                    </div>

                    <Link href={tenantId ? `/admin/t/${tenantId}/categories/${node.id}` : `/admin/t/${node.tenant_id || 'system'}/categories/${node.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" type="button">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Link>
                    <DeleteCategoryButton id={node.id} hasChildren={childrenNodes.length > 0} />
                </div>
            </div>

            {/* Render children sub-list with its own SortableContext */}
            {childrenNodes.length > 0 && (
                <SortableCategoryList
                    items={childrenNodes}
                    parentId={node.id}
                    level={level + 1}
                    tenantId={tenantId}
                    allCategories={allCategories}
                    onVisibilityChange={onVisibilityChange}
                />
            )}
        </React.Fragment>
    );
}

function SortableCategoryList({
    items, parentId, level, tenantId, allCategories, onVisibilityChange
}: {
    items: Category[], parentId: string | null, level: number, tenantId: string, allCategories: Category[],
    onVisibilityChange: (id: string, newValue: boolean) => void
}) {
    if (items.length === 0) return null;
    const sortedItems = [...items].sort((a, b) => (a.order_position || 0) - (b.order_position || 0));

    return (
        <SortableContext items={sortedItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col">
                {sortedItems.map(item => {
                    const children = allCategories.filter(c => c.parent_id === item.id);
                    return (
                        <SortableCategoryItem
                            key={item.id}
                            node={item}
                            level={level}
                            childrenNodes={children}
                            tenantId={tenantId}
                            allCategories={allCategories}
                            onVisibilityChange={onVisibilityChange}
                        />
                    );
                })}
            </div>
        </SortableContext>
    );
}

export function CategoriesClient({ initialCategories, tenantId }: { initialCategories: Category[]; tenantId: string }) {
    const [categories, setCategories] = useState<Category[]>(initialCategories);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor)
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeItem = categories.find(c => c.id === active.id);
        const overItem = categories.find(c => c.id === over.id);
        if (!activeItem || !overItem) return;
        if (activeItem.parent_id !== overItem.parent_id) return;

        const parentId = activeItem.parent_id;
        const siblings = categories.filter(c => c.parent_id === parentId).sort((a, b) => (a.order_position || 0) - (b.order_position || 0));

        const oldIndex = siblings.findIndex(s => s.id === active.id);
        const newIndex = siblings.findIndex(s => s.id === over.id);
        const newSiblingsOrder = arrayMove(siblings, oldIndex, newIndex);

        const updates = newSiblingsOrder.map((item, index) => ({
            id: item.id,
            order_position: index
        }));

        setCategories(prev => {
            const next = [...prev];
            updates.forEach(update => {
                const idx = next.findIndex(n => n.id === update.id);
                if (idx !== -1) next[idx] = { ...next[idx], order_position: update.order_position };
            });
            return next;
        });

        const res = await updateCategoriesOrder(updates);
        if (!res.success) {
            toast.error(res.error || 'Lỗi khi lưu vị trí');
            window.location.reload();
        } else {
            toast.success('Đã lưu thứ tự danh mục');
        }
    };

    const handleVisibilityChange = async (id: string, newValue: boolean) => {
        // Optimistic update
        setCategories(prev => prev.map(c => c.id === id ? { ...c, is_visible: newValue } : c));

        const res = await toggleCategoryVisibility(id, newValue);
        if (!res.success) {
            // Revert
            setCategories(prev => prev.map(c => c.id === id ? { ...c, is_visible: !newValue } : c));
            toast.error(res.error || 'Lỗi khi thay đổi trạng thái hiển thị');
        } else {
            toast.success(newValue ? 'Đã bật hiển thị danh mục' : 'Đã ẩn danh mục khỏi menu');
        }
    };

    const modules = Array.from(new Set(categories.map(c => c.module).filter(Boolean)));

    const getModuleLabel = (mod: string) => {
        switch (mod) {
            case 'news':
                return 'Tin tức';
            case 'dharma':
                return 'Tài liệu / Video Quy Trình SOP';
            case 'documents':
                return 'Tài liệu số';
            case 'events':
                return 'Sự kiện';
            case 'media':
                return 'Thư viện Media (Album)';
            default:
                return mod.toUpperCase();
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {modules.map(moduleType => {
                const moduleCats = categories.filter(c => c.module === moduleType);
                const roots = moduleCats.filter(c => !c.parent_id);

                return (
                    <div key={moduleType} className="mb-8 last:mb-0">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3 uppercase tracking-wider pl-2 border-l-4 border-amber-500">
                            Phân hệ: {getModuleLabel(moduleType)}
                        </h2>
                        <Card className="rounded-[1.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900/60 backdrop-blur-xl">
                            <CardContent className="p-0 flex flex-col">
                                <SortableCategoryList
                                    items={roots}
                                    parentId={null}
                                    level={0}
                                    tenantId={tenantId}
                                    allCategories={moduleCats}
                                    onVisibilityChange={handleVisibilityChange}
                                />
                            </CardContent>
                        </Card>
                    </div>
                );
            })}
        </DndContext>
    );
}
