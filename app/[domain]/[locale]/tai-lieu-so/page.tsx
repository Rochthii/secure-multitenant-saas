import React from 'react';
import type { Metadata } from 'next';
import { KhmerHeading } from '@/components/ui/khmer-heading';
import { Link } from '@/i18n/routing';
import { createClient } from '@supabase/supabase-js';
import { 
    getCachedCategoriesTree, 
    getCachedMediaByCategoryGroup, 
    getCachedUncategorizedMedia, 
    getCachedMediaTags, 
    getCachedCategoryItemCounts 
} from '@/lib/cache/queries';
import { getTranslations } from 'next-intl/server';
import { getTenantConfig } from '@/lib/tenant';
import { LibraryContent } from './LibraryContent';
import { Library, ImageIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'navigation' });
    return {
        title: t('documents') || 'Tài Liệu Số | Multi-tenant Ecosystem',
        description: 'Thư viện tài liệu số, kinh sách điện tử và ấn phẩm Phật giáo từ Multi-tenant Ecosystem.',
    };
}

const ITEMS_PER_PAGE = 24;

export default async function DocumentsPage({
    params,
    searchParams,
}: {
    params: Promise<{ domain: string; locale: string }>;
    searchParams: Promise<{ page?: string; category?: string; type?: string; author?: string; tab?: string; search?: string }>;
}) {
    const { domain, locale } = await params;
    const search = await searchParams;
    const currentTab = search.tab || 'documents';
    const currentPage = Math.max(1, Number(search.page) || 1);
    const selectedCategory = search.category || 'all';
    const selectedAuthor = search.author || 'all';
    const selectedType = search.type || 'all';
    const searchQuery = search.search || '';

    const tenantConfig = await getTenantConfig(domain).catch(() => null);
    const tenantId = tenantConfig?.id;
    const isCompany = tenantConfig?.tenant_type !== 'tenant';
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    // 1. Fetch category data and structure
    const categoriesTree = await getCachedCategoriesTree(tenantId, tenantConfig?.tenant_type).catch(() => ({ news: [], dharma: [], documents: [], media: [] }));
    const docCategoriesTree = categoriesTree.documents ?? [];
    
    // 2. Fetch category item counts (for Album stats)
    const categoryCounts = await getCachedCategoryItemCounts(tenantId);

    // 3. Helper to find Breadcrumb path
    const findCategoryPath = (tree: any[], slug: string, path: any[] = []): any[] | null => {
        for (const node of tree) {
            const currentPath = [...path, node];
            if (node.slug === slug) return currentPath;
            if (node.children) {
                const childPath = findCategoryPath(node.children, slug, currentPath);
                if (childPath) return childPath;
            }
        }
        return null;
    };
    const breadcrumbPath = selectedCategory !== 'all' ? findCategoryPath(docCategoriesTree, selectedCategory) : [];

    // 4. Fetch Authors for filter (from recent media) - Limit to realistic number
    const { data: recentAuthors } = await supabase
        .from('media')
        .select('author_name_vi')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(200);
    const authors = Array.from(new Set(recentAuthors?.map(a => a.author_name_vi).filter(Boolean))) as string[];

    // 5. Build Filters for fetching
    const filters = { search: searchQuery, type: selectedType, author: selectedAuthor };

    // 6. Data Fetching based on Tab
    let albums: any[] = [];
    let documents: any[] = [];
    let totalCount = 0;

    if (currentTab === 'albums') {
        const { data: rawAlbums } = await supabase
            .from('categories')
            .select('*')
            .eq('module', 'media')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });
        
        if (rawAlbums) {
            const albumIds = rawAlbums.map(a => a.id);
            const { data: coverImages } = await supabase
                .from('media')
                .select('category_id, url')
                .eq('type', 'image')
                .in('category_id', albumIds)
                .order('created_at', { ascending: true });
            
            const coversMap: Record<string, string> = {};
            coverImages?.forEach(img => { if (!coversMap[img.category_id]) coversMap[img.category_id] = img.url; });
            
            albums = rawAlbums.map(a => ({ 
                ...a, 
                coverUrl: a.image_url || coversMap[a.id] || null,
                _count: categoryCounts[a.id] || 0
            }));
            
            // Apply client-side search for albums if needed, or just let them be
            if (searchQuery) {
                albums = albums.filter(a => a.name_vi?.toLowerCase().includes(searchQuery.toLowerCase()));
            }
            totalCount = albums.length;
            const offset = (currentPage - 1) * ITEMS_PER_PAGE;
            albums = albums.slice(offset, offset + ITEMS_PER_PAGE);
        }
    } else {
        // Documents tab - logic to get category IDs
        let targetCategoryIds: string[] = [];
        if (selectedCategory === 'all') {
            // Include all document categories
            const flatten = (nodes: any[]): string[] => nodes.reduce((acc, node) => [...acc, node.id, ...flatten(node.children || [])], []);
            targetCategoryIds = flatten(docCategoriesTree);
        } else {
            const path = breadcrumbPath || [];
            const targetNode = path.length > 0 ? path[path.length - 1] : null;
            if (targetNode) {
                const flatten = (nodes: any[]): string[] => nodes.reduce((acc, node) => [...acc, node.id, ...flatten(node.children || [])], []);
                targetCategoryIds = [targetNode.id, ...flatten(targetNode.children || [])];
            }
        }

        if (targetCategoryIds.length > 0) {
            const rawDocs = await getCachedMediaByCategoryGroup(targetCategoryIds, 100, tenantId, filters);
            documents = rawDocs || [];
        } else {
            // Uncategorized check if it matches filter
            documents = await getCachedUncategorizedMedia(100, tenantId, filters);
        }

        totalCount = documents.length;
        const offset = (currentPage - 1) * ITEMS_PER_PAGE;
        documents = documents.slice(offset, offset + ITEMS_PER_PAGE);

        // Fetch Tags for visible documents
        if (documents.length > 0) {
            const mediaIds = documents.map(d => d.id);
            const tagsMap = await getCachedMediaTags(mediaIds);
            documents = documents.map(d => ({ ...d, tags: tagsMap[d.id] || [] }));
        }
    }

    const buildHref = (opts: { page?: number; category?: string; author?: string; tab?: string; type?: string; search?: string }) => {
        const p = new URLSearchParams();
        const cat = opts.category !== undefined ? opts.category : selectedCategory;
        const aut = opts.author !== undefined ? opts.author : selectedAuthor;
        const tb = opts.tab !== undefined ? opts.tab : currentTab;
        const tp = opts.type !== undefined ? opts.type : selectedType;
        const sr = opts.search !== undefined ? opts.search : searchQuery;

        if (cat !== 'all') p.set('category', cat);
        if (aut !== 'all') p.set('author', aut);
        if (tb !== 'documents') p.set('tab', tb);
        if (tp !== 'all') p.set('type', tp);
        if (sr) p.set('search', sr);
        if (opts.page && opts.page > 1) p.set('page', opts.page.toString());
        
        const ds = p.toString();
        return ds ? `/tai-lieu-so?${ds}` : '/tai-lieu-so';
    };

    return (
        <div className="min-h-screen bg-stone-50/40 pb-20">
            {/* Header Banner */}
            <div className="relative bg-stone-900 py-16 overflow-hidden border-b-4 border-gold-primary">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0di00aC0ydi00aC00di0ySDI2djJoLTR2NGgtMnY0aDJ2NGg0djJoNHYtMmg0di00aDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30 mix-blend-overlay" />
                <div className="relative z-10 container mx-auto px-4 text-center">
                    <h1 className="text-white font-serif text-4xl lg:text-5xl mb-6 tracking-wide drop-shadow-md">
                        {isCompany ? 'Thư Viện Số' : 'Thư Viện Kinh Sách'}
                    </h1>
                    <div className="w-12 h-[1px] bg-gold-primary mx-auto mb-6" />
                    <p className="text-stone-400 text-sm max-w-xl mx-auto font-serif italic tracking-wide">
                        {isCompany ? 'Lưu trữ tài liệu và tri thức nội bộ.' : 'Tam tạng kinh điển — Ngọn đèn soi sáng bước chân hành giả.'}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 relative z-20 pt-8">
                {/* Tabs */}
                <div className="flex justify-center mb-10 border-b border-stone-200">
                    <div className="flex w-full max-w-md">
                        <Link 
                            href={buildHref({ tab: 'documents', page: 1, category: 'all', author: 'all', type: 'all', search: '' })} 
                            className={`flex flex-1 items-center justify-center gap-2 py-4 font-serif text-sm tracking-widest transition-all border-b-2 ${currentTab === 'documents' ? 'border-gold-primary text-stone-900 font-medium' : 'border-transparent text-stone-400 hover:text-stone-700'}`}
                        >
                            <Library className="w-4 h-4 mb-0.5" /> TÀI LIỆU
                        </Link>
                        <Link 
                            href={buildHref({ tab: 'albums', page: 1, category: 'all', author: 'all', type: 'all', search: '' })} 
                            className={`flex flex-1 items-center justify-center gap-2 py-4 font-serif text-sm tracking-widest transition-all border-b-2 ${currentTab === 'albums' ? 'border-gold-primary text-stone-900 font-medium' : 'border-transparent text-stone-400 hover:text-stone-700'}`}
                        >
                            <ImageIcon className="w-4 h-4 mb-0.5" /> ẢNH & VIDEO
                        </Link>
                    </div>
                </div>

                {/* Library Interactive Content (Client side) */}
                <LibraryContent 
                    currentTab={currentTab}
                    selectedCategory={selectedCategory}
                    breadcrumbPath={breadcrumbPath}
                    authors={authors}
                    albums={albums}
                    documents={documents}
                    totalCount={totalCount}
                    locale={locale}
                />

                {/* Pagination */}
                {totalCount > ITEMS_PER_PAGE && (
                    <div className="mt-16 flex justify-center">
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)}
                            buildHref={buildHref}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

function Pagination({ currentPage, totalPages, buildHref }: { currentPage: number; totalPages: number; buildHref: any }) {
    // Basic pagination UI
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
        <div className="flex gap-2">
            {pages.map(p => (
                <Link 
                    key={p} 
                    href={buildHref({ page: p })}
                    className={`w-10 h-10 flex items-center justify-center font-serif text-sm transition-all ${currentPage === p ? 'border-b-2 border-gold-primary text-stone-900 space-y-0' : 'text-stone-400 hover:text-stone-600'}`}
                >
                    {p}
                </Link>
            ))}
        </div>
    );
}
