import React from 'react';
import type { Metadata } from 'next';
import { Search, Newspaper, Calendar, FileText, FolderOpen, ArrowLeft, Headphones, Video, Hash, Play, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import { performGlobalSearch, removeVietnameseDiacritics, SearchResult } from '@/lib/search';
import { getTenantConfig } from '@/lib/tenant';

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
    const { q } = await searchParams;
    return {
        title: q ? `Tìm kiếm "${q}" | McAaron B2B SaaS` : 'Tìm kiếm tri thức | McAaron B2B SaaS',
        robots: { index: false },
    };
}

// --- Highlight matching text ---
function highlightText(text: string, query: string): React.ReactNode {
    if (!query || !text) return text;
    const nText = removeVietnameseDiacritics(text.toLowerCase());
    const nQuery = removeVietnameseDiacritics(query.toLowerCase());
    const idx = nText.indexOf(nQuery);
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <mark className="bg-violet-100 text-violet-750 font-bold not-italic rounded-sm px-0.5 dark:bg-violet-950/45 dark:text-violet-400">
                {text.slice(idx, idx + query.length)}
            </mark>
            {text.slice(idx + query.length)}
        </>
    );
}

interface ExtendedSearchResult extends SearchResult {
    badgeColor: string;
    badgeBg: string;
    icon: React.ReactNode;
}

const SUGGESTED_COMPANY = [
    'Quy trình SOP',
    'Báo cáo tài chính',
    'Chính sách nhân sự',
    'Tài liệu đào tạo',
    'Chỉ số tác động KPI',
    'Giải pháp AI RAG',
    'Lộ trình phát triển'
];

const BADGE_CONFIG: Record<string, any> = {
    news: { color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30', icon: <Newspaper className="w-4 h-4" /> },
    event: { color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 border-green-100 dark:bg-green-950/20 dark:border-green-900/30', icon: <Calendar className="w-4 h-4" /> },
    category: { color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/30', icon: <FolderOpen className="w-4 h-4" /> },
    dharma_talk: { color: 'text-violet-700 dark:text-violet-400', bg: 'bg-violet-50 border-violet-100 dark:bg-violet-950/20 dark:border-violet-900/30', icon: <Play className="w-4 h-4" /> },
    tag: { color: 'text-teal-700 dark:text-teal-400', bg: 'bg-teal-50 border-teal-100 dark:bg-teal-950/20 dark:border-teal-900/30', icon: <Hash className="w-4 h-4" /> },
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function SearchPage({
    params,
    searchParams,
}: {
    params: Promise<{ domain: string; locale: string }>;
    searchParams: Promise<{ q?: string }>;
}) {
    const { domain } = await params;
    const { q } = await searchParams;
    const query = (q || '').trim();
    
    const supabase = await createClient();

    // 1. Resolve Tenant by Domain
    const tenantConfig = await getTenantConfig(domain);
    const SUGGESTED = SUGGESTED_COMPANY;

    const { data: tenant } = await (supabase
        .from('tenants' as any)
        .select('id')
        .eq('domain', domain)
        .single() as any);
    
    const tenantId = tenant?.id as string | undefined;

    let results: ExtendedSearchResult[] = [];
    if (tenantId && query.length >= 2) {
        const rawResults = await performGlobalSearch(supabase, query, tenantId, 50);
        results = rawResults.map(r => {
            let config = BADGE_CONFIG[r.type];
            if (r.type === 'media') {
                const isAudio = r.badge === 'Pháp âm' || r.badge === 'Podcast';
                const isVideo = r.badge === 'Video';
                config = {
                    color: isAudio ? 'text-purple-700 dark:text-purple-450' : isVideo ? 'text-red-700 dark:text-red-450' : 'text-violet-700 dark:text-violet-450',
                    bg: isAudio 
                        ? 'bg-purple-50 border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/30' 
                        : isVideo 
                            ? 'bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/30' 
                            : 'bg-violet-50 border-violet-100 dark:bg-violet-950/20 dark:border-violet-900/30',
                    icon: isAudio ? <Headphones className="w-4 h-4" /> : isVideo ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />,
                };
            }
            // Sửa hiển thị badge sang chuẩn doanh nghiệp
            let displayBadge = r.badge;
            if (displayBadge === 'Pháp thoại') displayBadge = 'Tài liệu SOP Video';
            if (displayBadge === 'Pháp âm') displayBadge = 'Podcast';
            if (displayBadge === 'Kinh sách' || displayBadge === 'Kinh văn') displayBadge = 'Văn bản hệ thống';

            return {
                ...r,
                badge: displayBadge,
                badgeColor: config?.color || 'text-slate-650 dark:text-zinc-400',
                badgeBg: config?.bg || 'bg-slate-50 border-slate-100 dark:bg-zinc-900/50 dark:border-zinc-800',
                icon: config?.icon || <FileText className="w-4 h-4" />,
            };
        });
    }

    const total = results.length;

    // Group by type
    const groups: Record<string, ExtendedSearchResult[]> = {};
    for (const r of results) {
        if (!groups[r.type]) groups[r.type] = [];
        groups[r.type].push(r);
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950">
            {/* Header Search Bar */}
            <div className="bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 shadow-sm pt-28">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors mb-5 font-medium">
                        <ArrowLeft className="w-4 h-4" />
                        Về trang chủ
                    </Link>

                    <form method="GET" action="">
                        <div className="flex items-center gap-3 bg-white dark:bg-zinc-950 border-2 border-violet-500/10 focus-within:border-violet-600 dark:focus-within:border-violet-500 rounded-2xl px-5 py-4 shadow-sm transition-all">
                            <Search className="w-5 h-5 text-violet-600 dark:text-violet-450 shrink-0" />
                            <input
                                type="text"
                                name="q"
                                defaultValue={query}
                                placeholder="Tìm kiếm tài liệu, SOP, tin tức, KPI hoặc giải pháp..."
                                className="flex-1 text-base text-slate-900 dark:text-zinc-100 outline-none placeholder-slate-400 dark:placeholder-zinc-650 bg-transparent"
                                autoComplete="off"
                                autoFocus={!query}
                            />
                            <button type="submit"
                                className="bg-violet-600 hover:bg-violet-550 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shrink-0 shadow-sm shadow-violet-900/10">
                                Tìm kiếm
                            </button>
                        </div>
                    </form>

                    {query ? (
                        <p className="mt-3.5 text-sm text-slate-500 dark:text-zinc-450">
                            {total > 0
                                ? <>Tìm thấy <strong className="text-slate-800 dark:text-zinc-200">{total}</strong> kết quả cho <strong className="text-violet-600 dark:text-violet-400">&ldquo;{query}&rdquo;</strong></>
                                : <>Không tìm thấy kết quả phù hợp cho <strong className="text-violet-600 dark:text-violet-400">&ldquo;{query}&rdquo;</strong></>
                            }
                        </p>
                    ) : (
                        <p className="mt-3.5 text-sm text-slate-400 dark:text-zinc-500">
                            Công cụ tra cứu thông tin tích hợp. Tìm kiếm tài liệu quy trình, báo cáo hoạt động và tin tức truyền thông doanh nghiệp.
                        </p>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 py-10 max-w-4xl">
                {/* Suggested (empty state) */}
                {!query && (
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm">
                        <p className="text-xs font-bold text-slate-450 dark:text-zinc-550 uppercase tracking-widest mb-5">Gợi ý từ khóa hàng đầu</p>
                        <div className="flex flex-wrap gap-2.5">
                            {SUGGESTED.map(s => (
                                <Link key={s} href={`?q=${encodeURIComponent(s)}` as any}
                                    className="text-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 hover:border-violet-600 hover:text-violet-600 dark:hover:border-violet-500 dark:hover:text-violet-400 text-slate-650 dark:text-zinc-350 px-4 py-2.5 rounded-xl transition-all font-medium">
                                    {s}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* No results */}
                {query && total === 0 && (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm">
                        <AlertCircle className="w-12 h-12 text-slate-350 dark:text-zinc-650 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-200 mb-2">Không tìm thấy kết quả phù hợp</h2>
                        <p className="text-slate-500 dark:text-zinc-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                            Chúng tôi không tìm thấy kết quả nào phù hợp với từ khóa &ldquo;{query}&rdquo;. Vui lòng thử lại với cụm từ khác hoặc kiểm tra tính chính tả.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                            {SUGGESTED.slice(0, 5).map(s => (
                                <Link key={s} href={`?q=${encodeURIComponent(s)}` as any}
                                    className="text-sm bg-violet-50 dark:bg-violet-950/20 border border-violet-500/10 hover:border-violet-600 text-violet-600 dark:text-violet-450 px-3.5 py-1.5 rounded-lg transition-all font-medium">
                                    {s}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Grouped results */}
                {total > 0 && (
                    <div className="space-y-10">
                        {(['tag', 'news', 'event', 'dharma_talk', 'media', 'category'] as const).map(type => {
                            const group = groups[type];
                            if (!group || group.length === 0) return null;
                            const first = group[0];

                            return (
                                <section key={type} className="space-y-4">
                                    <div className="flex items-center gap-3 border-b border-slate-200/60 dark:border-zinc-800/60 pb-2">
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${first.badgeColor} ${first.badgeBg}`}>
                                            {first.icon}
                                            {first.badge}
                                        </div>
                                        <span className="text-xs text-slate-400">{group.length} kết quả</span>
                                    </div>

                                    <div className="space-y-3">
                                        {group.map(result => (
                                            <Link
                                                key={result.id}
                                                href={result.url as any}
                                                target={result.type === 'media' && result.url.startsWith('http') ? '_blank' : undefined}
                                                rel={result.type === 'media' ? 'noopener noreferrer' : undefined}
                                                className="flex items-start gap-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-250/60 dark:border-zinc-800/80 p-4 hover:border-violet-600/40 hover:shadow-md transition-all group"
                                            >
                                                {result.imageUrl ? (
                                                    <div className="w-16 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-zinc-800 relative">
                                                        <Image src={result.imageUrl} alt="" fill sizes="64px" className="object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${result.badgeBg} ${result.badgeColor}`}>
                                                        {result.icon}
                                                    </div>
                                                )}

                                                <div className="flex-1 min-w-0">
                                                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 border ${result.badgeColor} ${result.badgeBg}`}>
                                                        {result.badge}
                                                    </span>
                                                    <h3 className="font-bold text-slate-800 dark:text-zinc-200 group-hover:text-violet-600 dark:group-hover:text-violet-450 transition-colors text-base leading-snug truncate">
                                                        {highlightText(result.title, query)}
                                                    </h3>
                                                    {result.description && (
                                                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                                                            {highlightText(result.description, query)}
                                                        </p>
                                                    )}
                                                </div>

                                                <span className="text-slate-350 dark:text-zinc-650 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors shrink-0 mt-1.5 text-lg">→</span>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
