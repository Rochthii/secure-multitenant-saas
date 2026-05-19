'use client';

import { useState, useEffect, useCallback } from 'react';

// =====================================================
// TYPES
// =====================================================
export interface RagCategory {
    id: string;
    name: string;
    description: string | null;
    group_name?: string;
    created_at: string;
    document_count: number;
}

export interface RagDocument {
    id: string;
    title: string;
    tenant_id: string;
    source_metadata: Record<string, any> | null;
    created_at: string;
    category: { id: string; name: string } | null;
    chunk_count: number;
}

export interface RagStats {
    total_documents: number;
    total_vectors: number;
    total_categories: number;
    category_distribution: { id: string; name: string; count: number }[];
}

// =====================================================
// HOOK
// =====================================================
export function useRagAdmin() {
    const [categories, setCategories]           = useState<RagCategory[]>([]);
    const [documents, setDocuments]             = useState<RagDocument[]>([]);
    const [stats, setStats]                     = useState<RagStats | null>(null);
    const [totalDocs, setTotalDocs]             = useState(0);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [isLoadingDocuments, setIsLoadingDocuments]   = useState(false);
    const [isLoadingStats, setIsLoadingStats]           = useState(false);
    const [filterCategoryId, setFilterCategoryId]       = useState<string>('');
    const [page, setPage]                               = useState(1);
    const LIMIT = 20;

    // ── Fetch categories ──────────────────────────────
    const fetchCategories = useCallback(async () => {
        setIsLoadingCategories(true);
        try {
            const res = await fetch('/api/admin/ai/categories');
            const data = await res.json();
            if (data.success) setCategories(data.categories);
        } finally {
            setIsLoadingCategories(false);
        }
    }, []);

    // ── fetchDocuments với dependencies rõ ràng ─────────
    const fetchDocuments = useCallback(async (catId?: string, p?: number) => {
        setIsLoadingDocuments(true);
        try {
            const effectiveCat  = catId  !== undefined ? catId  : filterCategoryId;
            const effectivePage = p      !== undefined ? p      : page;
            const params = new URLSearchParams({
                page:  String(effectivePage),
                limit: String(LIMIT),
            });
            if (effectiveCat) params.set('category_id', effectiveCat);

            const res = await fetch(`/api/admin/ai/documents?${params}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            if (data.success) {
                setDocuments(data.documents);
                setTotalDocs(data.total);
            }
        } finally {
            setIsLoadingDocuments(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Không phụ thuộc state để tránh re-create liên tục

    // ── Fetch stats ───────────────────────────────────
    const fetchStats = useCallback(async () => {
        setIsLoadingStats(true);
        try {
            const res = await fetch('/api/admin/ai/stats');
            const data = await res.json();
            if (data.success) setStats(data.stats);
        } finally {
            setIsLoadingStats(false);
        }
    }, []);

    // ── Init load: chỉ fetch categories + stats
    // fetchDocuments được cover bởi useEffect bên dưới (chạy ngay với page=1, filter='')
    useEffect(() => {
        fetchCategories();
        fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Fetch documents khi filter hoặc page thay đổi (và lần đầu mount) ──
    useEffect(() => {
        fetchDocuments(filterCategoryId, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterCategoryId, page]);

    // ── Create category ───────────────────────────────
    const createCategory = useCallback(async (name: string, description: string): Promise<{ error?: string }> => {
        const res = await fetch('/api/admin/ai/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description }),
        });
        const data = await res.json();
        if (!res.ok) return { error: data.error };

        // Optimistic update
        setCategories(prev => [...prev, data.category].sort((a, b) => a.name.localeCompare(b.name)));
        fetchStats();
        return {};
    }, [fetchStats]);

    // ── Update category ───────────────────────────────
    const updateCategory = useCallback(async (id: string, name: string, description: string): Promise<{ error?: string }> => {
        const res = await fetch('/api/admin/ai/categories', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, name, description }),
        });
        const data = await res.json();
        if (!res.ok) return { error: data.error };

        // Optimistic update
        setCategories(prev => prev.map(c => c.id === id ? { ...c, name, description } : c).sort((a, b) => a.name.localeCompare(b.name)));
        return {};
    }, []);

    // ── Delete category ───────────────────────────────
    const deleteCategory = useCallback(async (id: string): Promise<{ error?: string }> => {
        const res = await fetch('/api/admin/ai/categories', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        const data = await res.json();
        if (!res.ok) return { error: data.error };

        // Optimistic update
        setCategories(prev => prev.filter(c => c.id !== id));
        fetchStats();
        return {};
    }, [fetchStats]);


    // ── Delete document ───────────────────────────────
    const deleteDocument = useCallback(async (id: string): Promise<{ error?: string; deleted_chunks?: number }> => {
        // Optimistic update trước — rollback nếu lỗi
        const prev = documents;
        setDocuments(d => d.filter(doc => doc.id !== id));

        const res = await fetch('/api/admin/ai/documents', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        const data = await res.json();

        if (!res.ok) {
            setDocuments(prev); // rollback
            return { error: data.error };
        }

        setTotalDocs(t => Math.max(0, t - 1));
        fetchCategories(); // cập nhật document_count
        fetchStats();
        return { deleted_chunks: data.deleted_chunks };
    }, [documents, fetchCategories, fetchStats]);

    // ── Preview document chunks ───────────────────────
    const previewDocument = useCallback(async (id: string): Promise<{ chunks: any[]; error?: string }> => {
        const res = await fetch(`/api/admin/ai/documents/${id}/preview`);
        const data = await res.json();
        if (!res.ok) return { chunks: [], error: data.error };
        return { chunks: data.chunks };
    }, []);

    return {
        // State
        categories, documents, stats, totalDocs,
        isLoadingCategories, isLoadingDocuments, isLoadingStats,
        filterCategoryId, page, LIMIT,
        // Setters
        setFilterCategoryId, setPage,
        // Actions
        createCategory, updateCategory, deleteCategory, deleteDocument, previewDocument,

        // Refetch
        refetchAll: useCallback(() => {
            fetchCategories();
            fetchDocuments();
            fetchStats();
        }, [fetchCategories, fetchDocuments, fetchStats]),
    };
}
