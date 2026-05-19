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

    const indentClass = level === 1 ? 'ml-8 border-l-2 border-gray-200 pl-4' : level === 2 ? 'ml-16 border-l-2 border-gray-200 pl-4' : '';
    const isVisible = node.is_visible !== false;

    return (
        <React.Fragment>
            <div
                ref={setNodeRef}
                style={style}
                className={`p-4 hover:bg-gray-50 flex items-center justify-between border-t border-gray-100 relative ${indentClass} ${isDragging ? 'shadow-lg border-2 border-gold-primary rounded-md bg-white' : isVisible ? 'bg-white' : 'bg-gray-50'}`}
            >
                <div className="flex items-center gap-3">
                    <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-700 p-1">
                        <GripVertical className="h-5 w-5" />
                    </div>
                    {level === 0 ? (
                        <FolderTree className={`h-5 w-5 ${isVisible ? 'text-gold-primary' : 'text-gray-300'}`} />
                    ) : (
                        <CornerDownRight className="h-4 w-4 text-gray-400" />
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${isVisible ? 'text-gray-900' : 'text-gray-400 line-through'} ${level === 0 ? 'text-base' : 'text-sm'}`}>
                                {node.name_vi}
                            </h3>
                            {!isVisible && (
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <EyeOff className="h-2.5 w-2.5" /> Đã ẩn
                                </span>
                            )}
                            {node.image_url && (
                                <div className="relative h-6 w-10 rounded border border-gray-200 overflow-hidden bg-gray-50">
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
                        {node.name_en && <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">EN</span>}
                        {node.name_km && <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded">KM</span>}
                    </div>

                    {/* Toggle Ẩn/Hiện nhanh */}
                    <div className="flex items-center gap-1.5 mr-2 border border-gray-200 rounded-md px-2 py-1 bg-white">
                        {isVisible
                            ? <Eye className="h-3.5 w-3.5 text-green-600" />
                            : <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                        }
                        <Switch
                            checked={isVisible}
                            onCheckedChange={(val) => onVisibilityChange(node.id, val)}
                            className="scale-75"
                        />
                    </div>

                    <Link href={tenantId ? `/admin/t/${tenantId}/categories/${node.id}` : `/admin/t/${node.tenant_id || 'system'}/categories/${node.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" type="button">
                            <Edit className="h-4 w-4 text-gray-500 hover:text-gold-primary" />
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

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {modules.map(moduleType => {
                const moduleCats = categories.filter(c => c.module === moduleType);
                const roots = moduleCats.filter(c => !c.parent_id);

                return (
                    <div key={moduleType} className="mb-8 last:mb-0">
                        <h2 className="text-lg font-bold text-coffee-dark mb-3 uppercase tracking-wider pl-2 border-l-4 border-gold-primary">
                            Phân hệ: {moduleType}
                        </h2>
                        <Card className="rounded-xl overflow-hidden shadow-sm">
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
