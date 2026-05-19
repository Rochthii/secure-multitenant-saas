'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Hash, Search, Sparkles, Loader2 } from 'lucide-react';
import { getTags, createTag, Tag, suggestTags } from '@/app/actions/admin/tags';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';

interface TagInputProps {
    tenantId: string;
    selectedTagIds: string[];
    onChange: (tagIds: string[]) => void;
    title?: string;
    content?: string;
}

export function TagInput({ tenantId, selectedTagIds, onChange, title, content }: TagInputProps) {
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggesting, setSuggesting] = useState(false);

    useEffect(() => {
        const fetchTags = async () => {
            const tags = await getTags(tenantId);
            setAllTags(tags);
        };
        fetchTags();
    }, [tenantId]);

    const handleSelectTag = (tagId: string) => {
        if (!selectedTagIds.includes(tagId)) {
            onChange([...selectedTagIds, tagId]);
        }
    };

    const handleRemoveTag = (tagId: string) => {
        onChange(selectedTagIds.filter((id) => id !== tagId));
    };

    const handleCreateTag = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        const result = await createTag(searchQuery.trim(), tenantId);
        setLoading(false);
        if (result.success && result.data) {
            const newTag = result.data as Tag;
            setAllTags([...allTags, newTag]);
            onChange([...selectedTagIds, newTag.id]);
            setSearchQuery('');
        } else if (result.error) {
            toast.error(result.error);
        }
    };

    const handleSuggest = async () => {
        if (!title && !content) {
            toast.warning('Vui lòng nhập tiêu đề hoặc nội dung để có thể gợi ý thẻ.');
            return;
        }

        setSuggesting(true);
        try {
            const result = await suggestTags(title || '', content || '', tenantId);
            if (result.success && result.data) {
                const newTagIds = [...selectedTagIds];
                const finalAllTags = [...allTags];

                for (const suggestion of result.data) {
                    if (suggestion.isNew) {
                        // Tự động tạo tag mới nếu nó là tag SEO quan trọng nhưng chưa có trong DB
                        const createResult = await createTag(suggestion.name, tenantId);
                        if (createResult.success && createResult.data) {
                            const newTag = createResult.data as Tag;
                            finalAllTags.push(newTag);
                            newTagIds.push(newTag.id);
                        }
                    } else if (suggestion.id && !newTagIds.includes(suggestion.id)) {
                        newTagIds.push(suggestion.id);
                    }
                }

                setAllTags(finalAllTags);
                onChange(Array.from(new Set(newTagIds)));
            } else if (result.error) {
                toast.error(result.error);
            }
        } catch (error) {
            console.error('Lỗi khi gợi ý thẻ:', error);
        } finally {
            setSuggesting(false);
        }
    };

    const filteredTags = allTags.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !selectedTagIds.includes(tag.id)
    );

    const selectedTags = allTags.filter((tag) => selectedTagIds.includes(tag.id));

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2 min-h-[32px] p-2 bg-stone-50 rounded-lg border border-stone-100">
                {selectedTags.length > 0 ? (
                    selectedTags.map((tag) => (
                        <Badge
                            key={tag.id}
                            variant="secondary"
                            className="bg-gold-primary/10 text-gold-dark hover:bg-gold-primary/20 border-gold-primary/20 pr-1 py-1"
                        >
                            <Hash className="w-3 h-3 mr-1 opacity-50" />
                            {tag.name}
                            <button
                                type="button"
                                onClick={() => handleRemoveTag(tag.id)}
                                className="ml-1 p-0.5 hover:bg-gold-primary/30 rounded-full transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    ))
                ) : (
                    <span className="text-sm text-stone-400 italic py-1">Chưa có chủ đề nào...</span>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 border-stone-200 text-stone-600 hover:border-gold-primary hover:text-gold-primary bg-white shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm chủ đề (Tags)
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-3 shadow-xl" align="start" side="top">
                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
                                <Input
                                    placeholder="Tìm kiếm hoặc thêm mới..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-9"
                                    autoFocus
                                />
                            </div>

                            <div className="max-h-[200px] overflow-y-auto space-y-1 pr-1">
                                {filteredTags.length > 0 ? (
                                    filteredTags.map((tag) => (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => handleSelectTag(tag.id)}
                                            className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-stone-100 flex items-center transition-colors"
                                        >
                                            <Hash className="w-3 h-3 mr-2 text-stone-400" />
                                            {tag.name}
                                        </button>
                                    ))
                                ) : searchQuery.trim() ? (
                                    <div className="py-2 text-center">
                                        <p className="text-xs text-stone-500 mb-2">Không tìm thấy "#{searchQuery}"</p>
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="w-full bg-gold-primary hover:bg-gold-dark text-xs h-8"
                                            onClick={handleCreateTag}
                                            disabled={loading}
                                        >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Tạo thẻ mới này
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="text-xs text-center text-stone-400 py-4">Nhập tên thẻ để tìm kiếm...</p>
                                )}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSuggest}
                    disabled={suggesting}
                    className="h-9 border-gold-primary/30 text-gold-dark hover:bg-gold-primary/10 bg-gold-primary/5 shadow-sm"
                >
                    {suggesting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Sparkles className="w-4 h-4 mr-2 text-gold-primary" />
                    )}
                    Gợi ý SEO Tag
                </Button>
            </div>
        </div>
    );
}
