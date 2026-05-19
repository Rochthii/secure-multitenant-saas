import React from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getLocalizedContent } from '@/lib/utils/localized-content';
import { SITE_URL } from '@/lib/constants';
import { extractKeywords, generateTags, getTenantBaseUrl } from '@/lib/utils/seo';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Heart, Calendar, ChevronRight } from 'lucide-react';
import { getTenantConfig } from '@/lib/tenant';

type Project = any;

type Props = {
    params: Promise<{ slug: string; locale: string; domain: string }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, locale, domain } = await params;
    const tenantConfig = await getTenantConfig(domain);
    const tenantId = tenantConfig?.id;

    const supabase = await createClient();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    let query = supabase.from('transaction_projects' as any).select('*');
    if (isUUID) {
        query = query.eq('id', slug);
    } else {
        query = query.eq('slug', slug);
    }

    const { data: companyRecord } = await (supabase as any).from('tenants').select('id').eq('tenant_type', 'company').limit(1).maybeSingle();
    const companyId = companyRecord?.id;

    if (tenantId) {
        if (companyId) {
            query = query.or(`tenant_id.eq.${tenantId},tenant_id.eq.${companyId}`);
        } else {
            query = query.eq('tenant_id', tenantId);
        }
    }

    const { data: project } = await query.maybeSingle() as any;

    if (!project) return { title: 'Dự án không tồn tại' };

    const title = getLocalizedContent(project, locale, 'title');
    const desc = getLocalizedContent(project, locale, 'description');
    const keywords = extractKeywords(title || '', desc || '', 12, tenantConfig?.name, tenantConfig?.tenant_type);
    // Use the canonical slug if it exists, otherwise fallback to the current slug (which might be an ID)
    const canonicalSlug = project.slug || slug;
    const transactionSlug = tenantConfig?.tenant_type !== 'tenant' ? 'du-an' : 'transactions';
    const path = `/${transactionSlug}/hang-muc-du-an/${canonicalSlug}`;
    const tenantBaseUrl = getTenantBaseUrl(domain);

    return {
        title: `${title} | Thanh toán Multi-tenant Ecosystem`,
        description: desc,
        keywords: keywords,
        alternates: {
            canonical: `${tenantBaseUrl}/${locale}${path}`,
            languages: {
                'vi-VN': `${tenantBaseUrl}/vi${path}`,
                'km-KH': `${tenantBaseUrl}/km${path}`,
                'en-US': `${tenantBaseUrl}/en${path}`,
            }
        },
        openGraph: {
            title: title || '',
            description: desc || '',
            images: project.thumbnail_url ? [project.thumbnail_url] : [],
            url: `${tenantBaseUrl}/${locale}${path}`,
        }
    };
}

export default async function ProjectDetailSlugPage({ params }: Props) {
    const { slug, locale, domain } = await params;
    const tenantConfig = await getTenantConfig(domain);
    if (tenantConfig?.modules_config?.transactions === false) {
        notFound();
    }
    const tenantId = tenantConfig?.id;

    const supabase = await createClient();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    let query = supabase.from('transaction_projects' as any).select('*');
    if (isUUID) {
        query = query.eq('id', slug);
    } else {
        query = query.eq('slug', slug);
    }

    const { data: companyRecord } = await (supabase as any).from('tenants').select('id').eq('tenant_type', 'company').limit(1).maybeSingle();
    const companyId = companyRecord?.id;

    if (tenantId) {
        if (companyId) {
            query = query.or(`tenant_id.eq.${tenantId},tenant_id.eq.${companyId}`);
        } else {
            query = query.eq('tenant_id', tenantId);
        }
    }

    const { data: project } = await query.maybeSingle() as any;

    if (!project) notFound();

    if (isUUID && project.slug) {
        // We import redirect dynamically as it's not present at the top yet
        const { redirect } = await import('next/navigation');
        const transactionSlug = tenantConfig?.tenant_type !== 'tenant' ? 'du-an' : 'transactions';
        redirect(`/${transactionSlug}/hang-muc-du-an/${project.slug}`);
    }

    const title = getLocalizedContent(project, locale, 'title');
    const content = getLocalizedContent(project, locale, 'content') || getLocalizedContent(project, locale, 'description');
    const progress = (project.current_amount / project.target_amount) * 100;

    return (
        <main className="min-h-screen bg-stone-50 pb-20">
            {/* Hero Section */}
            <div className="relative h-[40vh] min-h-[300px] w-full bg-stone-900 overflow-hidden">
                {project.thumbnail_url && (
                    <Image
                        src={project.thumbnail_url}
                        alt={title || ''}
                        fill
                        className="object-cover opacity-60"
                        priority
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 py-12">
                    <div className="container mx-auto px-4">
                        <nav className="flex items-center space-x-2 text-stone-300 text-sm mb-4">
                            <Link href="/" className="hover:text-gold-primary">Trang chủ</Link>
                            <ChevronRight className="w-4 h-4" />
                            <Link 
                                href={tenantConfig?.tenant_type !== 'tenant' ? '/du-an' : '/transactions'} 
                                className="hover:text-gold-primary"
                            >
                                {tenantConfig?.tenant_type !== 'tenant' ? 'Dự án' : 'Thanh toán'}
                            </Link>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-white line-clamp-1">{title}</span>
                        </nav>
                        <h1 className="text-3xl md:text-5xl font-playfair font-bold text-white max-w-4xl">
                            {title}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
                            <div
                                className="prose prose-lg max-w-none prose-stone prose-headings:font-playfair prose-headings:text-coffee-dark prose-p:text-stone-600 prose-img:rounded-xl"
                                dangerouslySetInnerHTML={{ __html: content || '' }}
                            />

                            {/* Tags Section */}
                            <div className="mt-12 pt-8 border-t border-stone-100">
                                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Mục lục liên quan</h3>
                                <div className="flex flex-wrap gap-2">
                                    {generateTags(title || '', 'Xây dựng Chi nhánh').map((tag, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-stone-50 text-stone-500 text-xs rounded-full border border-stone-100 hover:border-gold-primary hover:text-gold-primary transition-all">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Funding Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 sticky top-24">
                            <h3 className="text-xl font-playfair font-bold text-coffee-dark mb-6">Thông tin gieo duyên</h3>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-stone-500">Đã nhận được</span>
                                        <span className="font-bold text-gold-primary">{project.current_amount?.toLocaleString()} VNĐ</span>
                                    </div>
                                    <Progress value={progress} className="h-2 bg-stone-100" />
                                    <div className="flex justify-between text-xs mt-2">
                                        <span className="text-stone-400">Mục tiêu: {project.target_amount?.toLocaleString()} VNĐ</span>
                                        <span className="text-stone-600 font-medium">{progress.toFixed(1)}%</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-stone-600">
                                    <div className="p-2 bg-stone-50 rounded-lg">
                                        <Calendar className="w-5 h-5 text-gold-primary" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Thời gian bắt đầu</div>
                                        <div className="text-xs">{new Date(project.start_date || project.created_at).toLocaleDateString('vi-VN')}</div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Link href={tenantConfig?.tenant_type !== 'tenant' 
                                        ? `/du-an?purpose=${project.id}`
                                        : `/transactions?purpose=${project.id}`}>
                                        <Button className="w-full h-14 text-lg bg-gold-primary hover:bg-gold-dark text-white rounded-xl shadow-lg shadow-gold-primary/20 transition-all active:scale-[0.98]">
                                            <Heart className="w-5 h-5 mr-2 fill-current" />
                                            {tenantConfig?.tenant_type !== 'tenant' ? 'Đóng góp dự án' : 'Phát Tâm Đóng góp'}
                                        </Button>
                                    </Link>
                                    <p className="text-[10px] text-center text-stone-400 mt-3 italic">
                                        "Một giọt nước rơi vào biển cả sẽ không bao giờ cạn"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
