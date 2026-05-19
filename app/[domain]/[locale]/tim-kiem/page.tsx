import React from 'react';
import type { Metadata } from 'next';
import { Search, Newspaper, Calendar, FileText, FolderOpen, ArrowLeft, Headphones, Video, Hash, Play } from 'lucide-react';
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
        title: q ? `Tìm kiếm "${q}" | Multi-tenant Ecosystem` : 'Tìm kiếm | Multi-tenant Ecosystem',
        robots: { index: false },
    };
}

// --- Highlight matching matching matching ---
function highlightText(text: string, query: string): React.ReactNode {
    if (!query || !text) return text;
    const nText = removeVietnameseDiacritics(text.toLowerCase());
    const nQuery = removeVietnameseDiacritics(query.toLowerCase());
    const idx = nText.indexOf(nQuery);
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <mark className="bg-gold-primary/30 text-gold-dark font-bold not-italic rounded-sm px-0.5">
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

const SUGGESTED_TEMPLE = ['Kinh Pháp Cú', 'Đại lễ Kattina', 'Pháp thoại', 'An cư kiết hạ', 'Văn hóa Khmer', 'Từ thiện'];
const SUGGESTED_COMPANY = ['Chuyển đổi số', 'Báo cáo tác động', 'Giải pháp công nghệ', 'Dự án cộng đồng', 'Minh bạch tài chính', 'Đối tác'];

const BADGE_CONFIG: Record<string, any> = {
    news: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-100', icon: <Newspaper className="w-4 h-4" /> },
    event: { color: 'text-green-700', bg: 'bg-green-50 border-green-100', icon: <Calendar className="w-4 h-4" /> },
    category: { color: 'text-purple-700', bg: 'bg-purple-50 border-purple-100', icon: <FolderOpen className="w-4 h-4" /> },
    dharma_talk: { color: 'text-orange-700', bg: 'bg-orange-50 border-orange-100', icon: <Play className="w-4 h-4" /> },
    tag: { color: 'text-teal-700', bg: 'bg-teal-50 border-teal-100', icon: <Hash className="w-4 h-4" /> },
};

const MEDIA_LABELS: Record<string, string> = {
    document: 'Tài liệu', book: 'Kinh sách', sutra: 'Kinh văn',
    audio: 'Pháp âm', video: 'Video', image: 'Hình ảnh', external_link: 'Liên kết',
};

const MEDIA_LABELS_COMPANY: Record<string, string> = {
    document: 'Tài liệu', book: 'Ấn phẩm', sutra: 'Nghiên cứu',
    audio: 'Podcast', video: 'Video', image: 'Hình ảnh', external_link: 'Liên kết',
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
    const isCompany = tenantConfig?.tenant_type !== 'tenant';
    const SUGGESTED = isCompany ? SUGGESTED_COMPANY : SUGGESTED_TEMPLE;

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
                const isAudio = r.badge === 'Pháp âm';
                const isVideo = r.badge === 'Video';
                config = {
                    color: isAudio ? 'text-purple-700' : isVideo ? 'text-red-700' : 'text-amber-700',
                    bg: isAudio ? 'bg-purple-50 border-purple-100' : isVideo ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100',
                    icon: isAudio ? <Headphones className="w-4 h-4" /> : isVideo ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />,
                };
            }
            return {
                ...r,
                badgeColor: config?.color || 'text-gray-600',
                badgeBg: config?.bg || 'bg-gray-50 border-gray-100',
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
        <div className="min-h-screen bg-gray-50">
            {/* Header Search Bar */}
            <div className="bg-white border-b border-gray-100 shadow-sm">
                <div className="container mx-auto px-4 py-6 max-w-4xl">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gold-dark transition-colors mb-5">
                        <ArrowLeft className="w-4 h-4" />
                        Về trang chủ
                    </Link>

                    <form method="GET" action="">
                        <div className="flex items-center gap-3 bg-white border-2 border-gold-primary/30 focus-within:border-gold-primary rounded-2xl px-5 py-3.5 shadow-sm transition-all">
                            <Search className="w-5 h-5 text-gold-primary shrink-0" />
                            <input
                                type="text"
                                name="q"
                                defaultValue={query}
                                placeholder={isCompany ? "Tìm kiếm tin tức, sự kiện, tài liệu, dự án..." : "Tìm kiếm tin tức, sự kiện, tài liệu, pháp thoại..."}
                                className="flex-1 text-base text-gray-900 outline-none placeholder-gray-400 bg-transparent"
                                autoComplete="off"
                                autoFocus={!query}
                            />
                            <button type="submit"
                                className="bg-gold-primary hover:bg-gold-dark text-white px-5 py-2 rounded-xl font-semibold text-sm transition-colors shrink-0">
                                Tìm
                            </button>
                        </div>
                    </form>

                    {query ? (
                        <p className="mt-3 text-sm text-gray-500">
                            {total > 0
                                ? <>Tìm thấy <strong className="text-coffee-dark">{total}</strong> kết quả cho <strong className="text-gold-dark">&ldquo;{query}&rdquo;</strong></>
                                : <>Không tìm thấy kết quả cho <strong className="text-gold-dark">&ldquo;{query}&rdquo;</strong></>
                            }
                        </p>
                    ) : (
                        <p className="mt-3 text-sm text-gray-400">{isCompany ? 'Tìm kiếm toàn bộ nội dung: tin tức, sự kiện, tài liệu, dự án...' : 'Tìm kiếm toàn bộ nội dung chi nhánh: tin tức, sự kiện, tài liệu, danh mục...'}</p>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Suggested (empty state) */}
                {!query && (
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Gợi ý tìm kiếm</p>
                        <div className="flex flex-wrap gap-2">
                            {SUGGESTED.map(s => (
                                <Link key={s} href={`?q=${encodeURIComponent(s)}` as any}
                                    className="text-sm bg-white border border-gray-200 hover:border-gold-primary hover:text-gold-dark text-gray-600 px-4 py-2 rounded-full transition-all shadow-sm">
                                    {s}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* No results */}
                {query && total === 0 && (
                    <div className="text-center py-20">
                        <p className="text-5xl mb-4">🔍</p>
                        <h2 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy kết quả</h2>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
                            Không có nội dung nào phù hợp với &ldquo;{query}&rdquo;. Hãy thử từ khóa khác hoặc nhập không dấu tiếng Việt.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {SUGGESTED.slice(0, 5).map(s => (
                                <Link key={s} href={`?q=${encodeURIComponent(s)}` as any}
                                    className="text-sm bg-amber-50 border border-gold-primary/20 hover:border-gold-primary text-gold-dark px-3 py-1.5 rounded-full transition-all">
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
                                <section key={type}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold border ${first.badgeColor} ${first.badgeBg}`}>
                                            {first.icon}
                                            {first.badge}
                                        </div>
                                        <span className="text-sm text-gray-400">{group.length} kết quả</span>
                                    </div>

                                    <div className="space-y-3">
                                        {group.map(result => (
                                            <Link
                                                key={result.id}
                                                href={result.url as any}
                                                target={result.type === 'media' && result.url.startsWith('http') ? '_blank' : undefined}
                                                rel={result.type === 'media' ? 'noopener noreferrer' : undefined}
                                                className="flex items-start gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-gold-primary/40 hover:shadow-md transition-all group"
                                            >
                                                {result.imageUrl ? (
                                                    <div className="w-16 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-100 relative">
                                                        <Image src={result.imageUrl} alt="" fill sizes="64px" className="object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${result.badgeBg} ${result.badgeColor}`}>
                                                        {result.icon}
                                                    </div>
                                                )}

                                                <div className="flex-1 min-w-0">
                                                    <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 border ${result.badgeColor} ${result.badgeBg}`}>
                                                        {result.badge}
                                                    </span>
                                                    <h3 className="font-bold text-gray-900 group-hover:text-gold-dark transition-colors text-base leading-tight truncate">
                                                        {highlightText(result.title, query)}
                                                    </h3>
                                                    {result.description && (
                                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                                            {highlightText(result.description, query)}
                                                        </p>
                                                    )}
                                                </div>

                                                <span className="text-gray-300 group-hover:text-gold-primary transition-colors shrink-0 mt-1 text-lg">→</span>
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
