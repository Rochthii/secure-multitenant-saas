'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    createDharmaTalk,
    updateDharmaTalk,
    deleteDharmaTalk,
    fetchYouTubeInfo,
    submitDharmaTalkForReview,
} from '@/app/actions/admin/dharma-talks';
import { ApproveRejectButtons } from '@/components/admin/approve-reject-buttons';
import { TagInput } from '@/components/admin/tag-input';
import { getItemTags } from '@/app/actions/admin/tags';
import { Badge } from '@/components/ui/badge';
import { Hash, Send, Search, ChevronDown, Check } from 'lucide-react';
import { toast } from 'sonner';
import { TenantBroadcastSelect } from '@/components/admin/tenant-broadcast-select';
import { TenantFilter } from '@/components/admin/tenant-filter';
import { CustomCategorySelect } from '@/components/admin/custom-category-select';
import { useSearchParams } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DharmaTalk {
    id: string;
    title_vi: string;
    title_km: string | null;
    description_vi: string | null;
    media_url: string;
    thumbnail_url: string | null;
    speaker_name_vi: string | null;
    topic_vi: string | null;
    duration_minutes: number | null;
    category_id: string | null;
    is_active: boolean;
    is_featured: boolean;
    order_position: number;
    view_count: number;
    created_at: string;
    published_to?: string[];
    approval_status?: string;
}

interface Props {
    initialTalks: DharmaTalk[];
    categories: any[];
    tenants: any[];
    contextTenantId: string;
    currentUserRole: string;
    isCompany?: boolean;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconYT = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500">
        <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
    </svg>
);
const IconPlus = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
const IconEdit = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const IconTrash = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
);
const IconClose = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const IconLoader = () => (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
);
const IconEye = ({ active }: { active: boolean }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 ${active ? 'text-green-600' : 'text-gray-400'}`}>
        {active
            ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
            : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
        }
    </svg>
);

// ─── Form Modal ───────────────────────────────────────────────────────────────
function TalkFormModal({
    talk,
    categories,
    tenants,
    contextTenantId,
    currentUserRole,
    onClose,
    onSaved,
    isCompany,
}: {
    talk: DharmaTalk | null;
    categories: any[];
    tenants: any[];
    contextTenantId: string;
    currentUserRole: string;
    onClose: () => void;
    onSaved: () => void;
    isCompany?: boolean;
}) {
    const isEdit = !!talk;
    const [isPending, startTransition] = useTransition();
    const [submitLoading, setSubmitLoading] = useState(false);

    const canPublish = ['admin', 'super_admin'].includes(currentUserRole);
    const isPublished = talk?.approval_status === 'published';
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');

    const [url, setUrl] = useState(talk?.media_url || '');
    const [title, setTitle] = useState(talk?.title_vi || '');
    const [description, setDescription] = useState(talk?.description_vi || '');
    const [speaker, setSpeaker] = useState(talk?.speaker_name_vi || 'Multi-tenant Ecosystem');
    const [topic, setTopic] = useState(talk?.topic_vi || '');
    const [thumbnail, setThumbnail] = useState(talk?.thumbnail_url || '');
    const [categoryId, setCategoryId] = useState(talk?.category_id || '');
    const [isFeatured, setIsFeatured] = useState(talk?.is_featured ?? true);
    const [isActive, setIsActive] = useState(talk?.is_active ?? true);
    const [orderPos, setOrderPos] = useState(talk?.order_position ?? 99);
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [publishedTo, setPublishedTo] = useState<string[]>(talk?.published_to || []);

    useEffect(() => {
        if (isEdit && talk) {
            const fetchTags = async () => {
                const tags = await getItemTags('dharma_talk_tags', talk.id, contextTenantId);
                setSelectedTagIds(tags.map((t: any) => t.id));
            };
            fetchTags();
        }
    }, [isEdit, talk, contextTenantId]);

    // Xây dựng cây danh mục để hiển thị Select Box (thụt lề cấp bậc)
    const categoryGroups = React.useMemo(() => {
        const buildTree = (cats: any[]) => {
            const options: any[] = [];
            const roots = cats.filter(c => !c.parent_id);
            const getChildren = (parentId: string) => cats.filter(c => c.parent_id === parentId);

            const traverse = (node: any, level: number) => {
                options.push({ ...node, level });
                const children = getChildren(node.id);
                children.forEach(child => traverse(child, level + 1));
            };

            roots.forEach(root => traverse(root, 0));
            return options;
        };

        const localCats = categories.filter(c => !c.isGlobal);
        const globalCats = categories.filter(c => c.isGlobal);

        return {
            local: buildTree(localCats),
            global: buildTree(globalCats)
        };
    }, [categories]);

    // Auto-fetch YouTube info khi URL thay đổi
    const handleUrlBlur = async () => {
        if (!url || isEdit) return; // Khi edit không auto-fetch để tránh ghi đè
        const ytPattern = /youtu/i;
        if (!ytPattern.test(url)) return;

        setFetching(true);
        try {
            const info = await fetchYouTubeInfo(url);
            if (info) {
                if (!title) setTitle(info.title);
                if (!thumbnail) setThumbnail(info.thumbnail_url);
                if (!speaker && info.author_name) setSpeaker(info.author_name);
            }
        } finally {
            setFetching(false);
        }
    };

    const handleFetchNow = async () => {
        if (!url) return;
        setFetching(true);
        try {
            const info = await fetchYouTubeInfo(url);
            if (info) {
                setTitle(info.title || title);
                setThumbnail(info.thumbnail_url);
            }
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url || !title || !categoryId) {
            setError('URL YouTube, Tiêu đề và Danh mục là bắt buộc');
            return;
        }
        setError('');

        startTransition(async () => {
            const submitterAction = (e.nativeEvent as any).submitter?.getAttribute('data-action');
            let targetStatus = 'draft';
            if (submitterAction === 'submit_review') {
                targetStatus = 'pending_review';
            } else if (isPublished && canPublish) {
                targetStatus = 'published';
            } else if (isPublished && !canPublish) {
                targetStatus = 'pending_review';
            } else if (canPublish) { // If not published yet, but user can publish, default to published
                targetStatus = 'published';
            }

            const payload: any = {
                title_vi: title,
                description_vi: description || null,
                media_url: url,
                thumbnail_url: thumbnail || null,
                speaker_name_vi: speaker || null,
                topic_vi: topic || null,
                is_featured: isFeatured,
                is_active: isActive,
                order_position: orderPos,
                category_id: categoryId || null,
                published_to: publishedTo.length > 0 ? publishedTo : null,
                tenant_id: contextTenantId || (talk as any)?.tenant_id || (categories.find(c => c.id === categoryId)?.tenant_id) || null,
                approval_status: targetStatus,
            };

            const result = isEdit
                ? await updateDharmaTalk(talk!.id, payload, selectedTagIds)
                : await createDharmaTalk(payload as any, selectedTagIds);

            if (result.success) {
                onSaved();
                onClose();
            } else {
                setError(result.error || 'Có lỗi xảy ra');
            }
        });
    };

    const handleSubmitForReview = async () => {
        if (!talk?.id) return;
        setSubmitLoading(true);
        const result = await submitDharmaTalkForReview(talk.id);
        setSubmitLoading(false);
        if (result.success) {
            toast.success('Đã gửi pháp thoại để duyệt thành công!');
            onSaved();
            onClose();
        } else {
            toast.error(result.error || 'Có lỗi khi gửi duyệt');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-slate-900">
                        {isEdit 
                            ? (isCompany ? 'Cập nhật nội dung đào tạo' : 'Chỉnh sửa Pháp Thoại') 
                            : (isCompany ? 'Thêm tài liệu E-Learning' : 'Thêm Pháp Thoại mới')}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <IconClose />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* YouTube URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Link YouTube <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                onBlur={handleUrlBlur}
                                placeholder="https://youtu.be/... hoặc https://youtube.com/watch?v=..."
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600"
                                required
                            />
                            <button
                                type="button"
                                onClick={handleFetchNow}
                                disabled={fetching || !url}
                                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                                {fetching ? <IconLoader /> : <IconYT />}
                                {fetching ? 'Đang lấy...' : 'Lấy thông tin'}
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Dán link YouTube → nhấn "Lấy thông tin" để tự điền tiêu đề và ảnh</p>
                    </div>

                    {/* Thumbnail preview */}
                    {thumbnail && (
                        <div className="relative h-40 rounded-xl overflow-hidden bg-gray-100">
                            <Image src={thumbnail} alt="Thumbnail" fill className="object-cover" unoptimized />
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tiêu đề <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Tiêu đề bài pháp thoại"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder={isCompany ? "Mô tả nội dung đào tạo..." : "Mô tả nội dung bài pháp thoại..."}
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 resize-none"
                        />
                    </div>

                    {/* Speaker */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{isCompany ? 'Người trình bày' : 'Người thuyết pháp'}</label>
                        <input
                            type="text"
                            value={speaker}
                            onChange={e => setSpeaker(e.target.value)}
                            placeholder="Multi-tenant Ecosystem"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-primary/50 focus:border-gold-primary"
                        />
                    </div>

                    {/* Category + Topic */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Danh mục <span className="text-red-500">*</span>
                            </label>
                            <CustomCategorySelect
                                value={categoryId}
                                onChange={setCategoryId}
                                localCategories={categoryGroups.local}
                                globalCategories={categoryGroups.global}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Chủ đề (Tag phụ)</label>
                            <input
                                type="text"
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                placeholder="Tùy chọn nhập thêm tag..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-primary/50 focus:border-gold-primary"
                            />
                        </div>
                    </div>

                    {/* Order + Toggles */}
                    <div className="flex items-center gap-6 pt-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
                            <input
                                type="number"
                                value={orderPos}
                                onChange={e => setOrderPos(Number(e.target.value))}
                                min={1}
                                className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-primary/50"
                            />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <div
                                onClick={() => setIsFeatured(!isFeatured)}
                                className={`relative w-10 h-5 rounded-full transition-colors ${isFeatured ? 'bg-gold-primary' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isFeatured ? 'translate-x-5' : ''}`} />
                            </div>
                            <span className="text-sm text-gray-700">Nổi bật (hiện trang chủ)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <div
                                onClick={() => setIsActive(!isActive)}
                                className={`relative w-10 h-5 rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-5' : ''}`} />
                            </div>
                            <span className="text-sm text-gray-700">Hiển thị</span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Thẻ chủ đề (Tags)</label>
                        <TagInput
                            tenantId={contextTenantId}
                            selectedTagIds={selectedTagIds}
                            onChange={setSelectedTagIds}
                        />
                    </div>

                    {/* Broadcasting (Platform Admins only) */}
                    {tenants && tenants.length > 0 && (
                        <div className="pt-2 border-t">
                            <TenantBroadcastSelect
                                tenants={tenants}
                                selectedTenantIds={publishedTo}
                                onChange={setPublishedTo}
                                ownerTenantId={contextTenantId}
                            />
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>

                        {canPublish ? (
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex-1 py-2.5 bg-coffee-dark text-white rounded-xl text-sm font-medium hover:bg-coffee-dark/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {isPending && <IconLoader />}
                                {isEdit ? 'Lưu cập nhật' : 'Thêm Pháp Thoại'}
                            </button>
                        ) : (
                            <>
                                <button
                                    type="submit"
                                    data-action="draft"
                                    disabled={isPending || submitLoading}
                                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {isPending && <IconLoader />}
                                    Lưu Nháp
                                </button>
                                <button
                                    type="submit"
                                    data-action="submit_review"
                                    disabled={isPending || submitLoading}
                                    className="flex-1 py-2.5 bg-gold-primary text-white rounded-xl text-sm font-medium hover:bg-gold-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {isPending ? <IconLoader /> : <Send className="w-4 h-4" />}
                                    Gửi Duyệt
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Main Client Component ────────────────────────────────────────────────────
export function DharmaTalksClient({ initialTalks, categories, tenants, contextTenantId, currentUserRole, isCompany }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const filterTenantId = searchParams.get('tenantId') || '';

    // Filter talks by tenant if in global mode and filter is active
    const filteredTalks = React.useMemo(() => {
        if (!contextTenantId && filterTenantId) {
            return initialTalks.filter((t: any) => t.tenant_id === filterTenantId);
        }
        return initialTalks;
    }, [initialTalks, contextTenantId, filterTenantId]);

    const [talks, setTalks] = useState<DharmaTalk[]>(filteredTalks);

    // Sync talks when filteredTalks changes (e.g. when search params change)
    useEffect(() => {
        setTalks(filteredTalks);
    }, [filteredTalks]);
    const [showForm, setShowForm] = useState(false);
    const [editingTalk, setEditingTalk] = useState<DharmaTalk | null>(null);
    const [isPending, startTransition] = useTransition();
    const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

    const handleSaved = () => {
        router.refresh();
        toast.success('Đã lưu thành công');
    };

    const handleDelete = (id: string) => {
        if (confirmingDelete !== id) {
            setConfirmingDelete(id);
            setTimeout(() => setConfirmingDelete(null), 3000);
            return;
        }

        startTransition(async () => {
            const result = await deleteDharmaTalk(id);
            if (result.success) {
                setTalks(prev => prev.filter(t => t.id !== id));
                toast.success('Đã xóa thành công');
            } else {
                toast.error(result.error || 'Có lỗi xảy ra');
            }
            setConfirmingDelete(null);
        });
    };

    const handleToggleActive = (talk: DharmaTalk) => {
        startTransition(async () => {
            const payload = { is_active: !talk.is_active };
            const result = await updateDharmaTalk(talk.id, payload);
            if (result.success) {
                setTalks(prev => prev.map(t => t.id === talk.id ? { ...t, is_active: !t.is_active } : t));
                toast.success('Đã cập nhật trạng thái');
            } else {
                toast.error(result.error || 'Có lỗi');
            }
        });
    };

    const handleToggleFeatured = (talk: DharmaTalk) => {
        startTransition(async () => {
            const payload = { is_featured: !talk.is_featured };
            const result = await updateDharmaTalk(talk.id, payload);
            if (result.success) {
                setTalks(prev => prev.map(t => t.id === talk.id ? { ...t, is_featured: !t.is_featured } : t));
                toast.success('Đã cập nhật tin nổi bật');
            } else {
                toast.error(result.error || 'Có lỗi');
            }
        });
    };

    return (
        <div className="space-y-6">


            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-playfair font-bold text-gray-900">Quản lý Pháp Thoại</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {talks.filter(t => t.is_featured).length} bài nổi bật · {talks.filter(t => t.is_active).length} đang hiển thị
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Tenant Filter (Only for Global Admin) */}
                    {!contextTenantId && tenants && tenants.length > 0 && (
                        <TenantFilter tenants={tenants} />
                    )}
                    <button
                        onClick={() => { setEditingTalk(null); setShowForm(true); }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                        <IconPlus />
                        {isCompany ? 'Thêm tài liệu đào tạo' : 'Thêm Pháp Thoại'}
                    </button>
                </div>
            </div>

            {/* Info banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <strong>💡 Hướng dẫn:</strong> Dán link YouTube → nhấn "Lấy thông tin" → hệ thống tự điền tiêu đề và ảnh thumbnail.
                Bật <strong>Nổi bật</strong> để hiện trên trang chủ (tối đa 3 bài đầu tiên theo thứ tự).
            </div>

            {/* Talks list */}
            {talks.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="text-4xl mb-3">🎧</div>
                    <p className="text-gray-500 font-medium">Chưa có bài pháp thoại nào</p>
                    <p className="text-sm text-gray-400 mt-1">Nhấn "Thêm Pháp Thoại" để bắt đầu</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {talks.map((talk) => (
                        <div
                            key={talk.id}
                            className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${!talk.is_active ? 'opacity-60' : ''}`}
                        >
                            <div className="flex gap-4 p-4">
                                {/* Thumbnail */}
                                <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                    {talk.thumbnail_url ? (
                                        <Image
                                            src={talk.thumbnail_url}
                                            alt={talk.title_vi}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                            <IconYT />
                                        </div>
                                    )}
                                    {/* Play overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <div className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center">
                                            <svg className="w-3.5 h-3.5 text-red-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate">{talk.title_vi}</h3>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{talk.media_url}</p>
                                                {!contextTenantId && (talk as any).tenant_id && tenants && (
                                                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1 rounded border border-amber-200">
                                                        {tenants.find(t => t.id === (talk as any).tenant_id)?.name || 'Hệ thống'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {/* Featured badge */}
                                            {talk.is_featured && (
                                                <span className="px-2 py-0.5 bg-gold-primary/10 text-gold-dark text-xs font-medium rounded-full border border-gold-primary/20">
                                                    Trang chủ
                                                </span>
                                            )}
                                            {/* Order */}
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                                                #{talk.order_position}
                                            </span>
                                        </div>
                                    </div>

                                    {talk.description_vi && (
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{talk.description_vi}</p>
                                    )}

                                    <div className="flex items-center gap-4 mt-2">
                                        {talk.speaker_name_vi && (
                                            <span className="text-xs text-gray-400">🙏 {talk.speaker_name_vi}</span>
                                        )}
                                        {talk.topic_vi && (
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{talk.topic_vi}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 flex-shrink-0">
                                    {/* Toggle active */}
                                    <button
                                        onClick={() => handleToggleActive(talk)}
                                        title={talk.is_active ? 'Đang hiển thị — nhấn để ẩn' : 'Đang ẩn — nhấn để hiện'}
                                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <IconEye active={talk.is_active} />
                                    </button>
                                    {/* Toggle featured */}
                                    <button
                                        onClick={() => handleToggleFeatured(talk)}
                                        title={talk.is_featured ? 'Đang nổi bật — nhấn để bỏ' : 'Nhấn để đặt nổi bật'}
                                        className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm ${talk.is_featured ? 'text-gold-primary' : 'text-gray-300'}`}
                                    >
                                        ★
                                    </button>
                                    {/* Edit */}
                                    <button
                                        onClick={() => { setEditingTalk(talk); setShowForm(true); }}
                                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                                        title="Chỉnh sửa"
                                    >
                                        <IconEdit />
                                    </button>
                                    {/* Delete */}
                                    <button
                                        onClick={() => handleDelete(talk.id)}
                                        disabled={isPending && confirmingDelete === talk.id}
                                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${confirmingDelete === talk.id ? 'bg-red-100 text-red-700 font-bold' : 'hover:bg-red-50 text-red-500'}`}
                                        title={confirmingDelete === talk.id ? 'Nhấn lần nữa để xóa' : 'Xóa'}
                                    >
                                        {isPending && confirmingDelete === talk.id ? <IconLoader /> : <IconTrash />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <TalkFormModal
                    talk={editingTalk}
                    categories={categories}
                    tenants={tenants}
                    contextTenantId={contextTenantId}
                    currentUserRole={currentUserRole}
                    onClose={() => { setShowForm(false); setEditingTalk(null); }}
                    onSaved={handleSaved}
                    isCompany={isCompany}
                />
            )}
        </div>
    );
}
