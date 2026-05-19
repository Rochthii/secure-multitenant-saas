'use client';

import React, { useState, useTransition } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Plus, FolderTree, CornerDownRight, GripVertical, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DeleteAboutSectionButton } from '@/components/admin/about/delete-section-button';
import { reorderAboutSections } from '@/app/actions/admin/about-sections';
import { toast } from 'sonner';

interface AboutSection {
    id: string;
    key: string;
    title_vi: string;
    title_en?: string | null;
    title_km?: string | null;
    is_active: boolean;
    display_order: number;
    tenant_id?: string | null;
}

interface SortableAboutItemProps {
    node: AboutSection;
    level: number;
    tenantId: string;
    children?: React.ReactNode;
}

const SortableAboutItem = ({ node, level, tenantId, children }: SortableAboutItemProps) => {
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
        zIndex: isDragging ? 10 : 0,
        opacity: isDragging ? 0.5 : 1,
    };

    const indentClass = level === 1 ? 'ml-8 border-l-2 border-gray-200 pl-4' : level >= 2 ? `ml-${8 + level * 8} border-l-2 border-gray-200 pl-4` : '';

    return (
        <div ref={setNodeRef} style={style} className="group">
            <div className={`p-4 hover:bg-gray-50 flex items-center justify-between border-t border-gray-100 bg-white ${indentClass}`}>
                <div className="flex items-center gap-3">
                    <button
                        {...attributes}
                        {...listeners}
                        className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Kéo để sắp xếp"
                    >
                        <GripVertical className="h-4 w-4" />
                    </button>
                    {level === 0 ? (
                        <FolderTree className="h-5 w-5 text-gold-primary" />
                    ) : (
                        <CornerDownRight className="h-4 w-4 text-gray-400" />
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${!node.is_active ? 'text-gray-400 line-through' : 'text-gray-900'} ${level === 0 ? 'text-base' : 'text-sm'}`}>
                                {node.title_vi}
                            </h3>
                            {!node.is_active && (
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Ẩn</span>
                            )}
                        </div>
                        <p className="text-xs text-gray-400">/{node.key}</p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="flex gap-1 mr-4">
                        {node.title_en && <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">EN</span>}
                        {node.title_km && <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded">KM</span>}
                    </div>
                    <Link href={`/admin/t/${tenantId}/about/new?parent=${node.key}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Thêm mục con">
                            <Plus className="h-4 w-4 text-blue-500 hover:text-blue-700" />
                        </Button>
                    </Link>
                    <Link href={`/admin/t/${tenantId}/about/${node.key}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Chỉnh sửa">
                            <Pencil className="h-4 w-4 text-gray-500 hover:text-gold-primary" />
                        </Button>
                    </Link>
                    <DeleteAboutSectionButton sectionKey={node.key} hasChildren={!!children} tenantId={tenantId} />
                </div>
            </div>
            {children}
        </div>
    );
};

export function AboutSectionList({ initialSections, tenantId }: { initialSections: AboutSection[], tenantId: string }) {
    const [sections, setSections] = useState(initialSections);
    const [isPending, startTransition] = useTransition();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const getParentKey = (key: string) => {
        const parts = key.split('/');
        if (parts.length <= 1) return null;
        return parts.slice(0, -1).join('/');
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const activeSection = sections.find(s => s.id === active.id);
            const overSection = sections.find(s => s.id === over.id);

            if (!activeSection || !overSection) return;

            // Chỉ cho phép reorder nếu cùng parent
            if (getParentKey(activeSection.key) !== getParentKey(overSection.key)) {
                toast.error('Chỉ có thể sắp xếp các mục cùng cấp');
                return;
            }

            const oldIndex = sections.indexOf(activeSection);
            const newIndex = sections.indexOf(overSection);

            const newSections = arrayMove(sections, oldIndex, newIndex);
            
            // Cập nhật display_order dựa trên vị trí mới trong mảng (chỉ tính cho các siblings)
            const parentKey = getParentKey(activeSection.key);
            const siblings = newSections.filter(s => getParentKey(s.key) === parentKey);
            
            const updatedItems = siblings.map((s, idx) => ({
                id: s.id,
                display_order: idx,
            }));

            // Cập nhật UI local trước
            setSections(newSections);

            // Lưu vào DB
            startTransition(async () => {
                const result = await reorderAboutSections(updatedItems, tenantId);
                if (result.success) {
                    toast.success('Đã cập nhật thứ tự');
                } else {
                    toast.error(result.error || 'Lỗi khi lưu thứ tự');
                    setSections(initialSections); // Rollback
                }
            });
        }
    };

    const renderTree = (parentKey: string | null = null, level: number = 0) => {
        const siblings = sections.filter(s => {
            const pk = getParentKey(s.key);
            // Root logic: if pk is null or pk doesn't exist in our keyset
            if (parentKey === null) {
                const existingKeys = new Set(sections.map(sec => sec.key));
                return !pk || !existingKeys.has(pk);
            }
            return pk === parentKey;
        });

        if (siblings.length === 0) return null;

        return (
            <SortableContext
                items={siblings.map(s => s.id)}
                strategy={verticalListSortingStrategy}
            >
                {siblings.map(node => (
                    <SortableAboutItem
                        key={node.id}
                        node={node}
                        level={level}
                        tenantId={tenantId}
                    >
                        {renderTree(node.key, level + 1)}
                    </SortableAboutItem>
                ))}
            </SortableContext>
        );
    };

    return (
        <div className="relative">
            {isPending && (
                <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center rounded-xl">
                    <Loader2 className="h-8 w-8 animate-spin text-gold-primary" />
                </div>
            )}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="flex flex-col">
                    {renderTree(null, 0)}
                </div>
            </DndContext>
        </div>
    );
}
