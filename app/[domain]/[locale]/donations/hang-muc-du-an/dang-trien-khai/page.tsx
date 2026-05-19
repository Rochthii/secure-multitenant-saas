import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/constants/transaction';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { ArrowRight, Calendar, Target } from 'lucide-react';
import { formatDate } from 'date-fns';
import { vi, km } from 'date-fns/locale';

import { getTenantConfig } from '@/lib/tenant';
import { notFound } from 'next/navigation';

// force-dynamic: trang render theo tenant host nên phải dynamic.
export const dynamic = 'force-dynamic';

export default async function HangMucDangTrienKhaiPage({ params }: { params: Promise<{ domain: string; locale: string }> }) {
    const { domain, locale } = await params;
    setRequestLocale(locale);

    const tenantConfig = await getTenantConfig(domain);
    if (tenantConfig?.modules_config?.transactions === false) {
        notFound();
    }
    const tenantId = tenantConfig?.id;
    const isCompany = tenantConfig?.tenant_type !== 'tenant';

    // Server component fetching
    const supabase = await createClient();
    let query = supabase
        .from('transaction_projects' as any)
        .select('*')
        .eq('type', 'specific_project')
        .eq('status', 'ongoing')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    const { data: companyRecord } = await (supabase as any).from('tenants').select('id').eq('tenant_type', 'company').limit(1).maybeSingle();
    const companyId = companyRecord?.id;

    if (tenantId) {
        if (companyId) {
            query = query.or(`tenant_id.eq.${tenantId},tenant_id.eq.${companyId}`);
        } else {
            query = query.eq('tenant_id', tenantId);
        }
    }

    const { data, error } = await query as any;

    const projects: any[] | null = data;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-coffee-dark/80 z-10" />
                <div
                    className="absolute inset-0 bg-[url('/images/pattern-bg.png')] bg-cover bg-center opacity-30 mix-blend-overlay z-0"
                />
                <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto mt-16">
                    <span className="text-gold-primary font-bold tracking-wider uppercase text-sm mb-4 block">
                        {isCompany ? 'Hạng Mục Dự Án' : 'Hạng Mục Thanh toán'}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-4">
                        {isCompany ? 'Các Dự Án Đang Thực Hiện' : 'Các Công Trình Đang Kiến Tạo'}
                    </h1>
                    <p className="text-gray-200 text-lg max-w-2xl mx-auto">
                        {isCompany 
                            ? 'Cùng chung tay góp sức thực hiện các dự án cộng đồng, mang lại giá trị bền vững cho xã hội.'
                            : 'Cùng chung tay góp sức xây dựng và tôn tạo các công trình tâm linh, mang lại phước báu cho hiện tại và muôn đời sau.'
                        }
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {error || !projects ? (
                    <div className="text-center py-20 text-gray-500">
                        {error ? 'Có lỗi xảy ra khi tải dữ liệu' : 'Chưa có dự án nào đang triển khai.'}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {isCompany ? 'Hiện chưa có dự án mới' : 'Hiện chưa có dự án kêu gọi mới'}
                        </h3>
                        <p className="text-gray-500">
                            {isCompany ? 'Xin vui lòng quay lại sau.' : 'Xin hoan hỷ theo dõi và quay lại sau.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project) => {
                            const title = locale === 'km' && project.title_km ? project.title_km : project.title_vi;
                            const description = locale === 'km' && project.description_km ? project.description_km : project.description_vi;
                            const progress = project.target_amount > 0
                                ? Math.min(100, (project.current_amount / project.target_amount) * 100)
                                : 0;

                            return (
                                <Card key={project.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-none bg-white">
                                    <div className="relative h-56 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                        <Image
                                            src={project.thumbnail_url || '/images/buddha-statue.jpg'}
                                            alt={title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 left-4 z-20">
                                            <Badge className="bg-gold-primary text-coffee-dark font-bold hover:bg-gold-dark border-none shadow-md">
                                                Đang Kêu Gọi
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardContent className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-gold-primary transition-colors">
                                            {title}
                                        </h3>
                                        <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                                            {description}
                                        </p>

                                        {/* Progress Bar */}
                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span className="text-gray-600">Đã nhận: <span className="text-gold-primary font-bold">{formatCurrency(project.current_amount || 0)}</span></span>
                                                <span className="text-gray-500">{progress.toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-gold-primary to-orange-500 h-2 rounded-full relative"
                                                    style={{ width: `${progress}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400 text-right">
                                                Mục tiêu: {formatCurrency(project.target_amount || 0)}
                                            </div>
                                        </div>

                                        {project.start_date && (
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 border-t pt-4">
                                                <Calendar className="w-4 h-4 text-gold-primary" />
                                                <span>Khởi công: {formatDate(new Date(project.start_date), 'dd/MM/yyyy', { locale: locale === 'km' ? km : vi })}</span>
                                            </div>
                                        )}

                                        <Link href={`/transactions/hang-muc-du-an/${project.slug || project.id}`} className="block">
                                            <Button className="w-full bg-coffee-dark hover:bg-gold-primary hover:text-coffee-dark text-white font-bold transition-colors group/btn">
                                                {isCompany ? 'Xem Chi Tiết Dự Án' : 'Xem Chi Tiết Dự Án'}
                                                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
