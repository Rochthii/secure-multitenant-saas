import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/constants/transaction';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Calendar, Target, CheckCircle2 } from 'lucide-react';
import { formatDate } from 'date-fns';
import { vi, km } from 'date-fns/locale';

import { getTenantConfig } from '@/lib/tenant';
import { notFound } from 'next/navigation';

// force-dynamic: trang render theo tenant host nên phải dynamic.
export const dynamic = 'force-dynamic';

export default async function HangMucDaHoanThanhPage({ params }: { params: Promise<{ domain: string; locale: string }> }) {
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
        .eq('status', 'completed')
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

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
                        {isCompany ? 'Thành Tựu Dự Án' : 'Thành Tựu Phước Báu'}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-4">
                        {isCompany ? 'Các Dự Án Đã Hoàn Thành' : 'Các Công Trình Đã Viên Mãn'}
                    </h1>
                    <p className="text-gray-200 text-lg max-w-2xl mx-auto">
                        {isCompany 
                            ? 'Trân trọng cảm ơn sự đồng hành và hỗ trợ quý báu của các đối tác, khách hàng đã giúp hoàn thiện các mục tiêu cộng đồng.'
                            : 'Thành tâm tri ân giao dịch vô lượng của thập phương Nhân sự đã chung tay góp sức hoàn thành các chướng ngại đóng góp quỹ.'
                        }
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {error || !projects ? (
                    <div className="text-center py-20 text-gray-500">
                        {error ? 'Có lỗi xảy ra khi tải dữ liệu' : 'Chưa có dự án nào đã hoàn thành.'}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {isCompany ? 'Chưa có dự án hoàn thành nào' : 'Chưa có công trình hoàn thiện được ghi nhận'}
                        </h3>
                        <p className="text-gray-500">
                            {isCompany ? 'Hãy cùng đồng hành cùng các dự án đang thực hiện.' : 'Hãy cùng theo dõi các hạng mục đang được triển khai.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project) => {
                            const title = locale === 'km' && project.title_km ? project.title_km : project.title_vi;
                            const description = locale === 'km' && project.description_km ? project.description_km : project.description_vi;

                            return (
                                <Card key={project.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-none bg-white opacity-95">
                                    <div className="relative h-56 overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                        <Image
                                            src={project.thumbnail_url || '/images/buddha-statue.jpg'}
                                            alt={title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 left-4 z-20">
                                            <Badge className="bg-green-600/90 text-white font-bold hover:bg-green-700 border-none shadow-md">
                                                {isCompany ? 'Dự Án Hoàn Thành' : 'Hoàn Thành Viên Mãn'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardContent className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-gold-primary transition-colors">
                                            <Link href={`/transactions/hang-muc-du-an/${project.slug || project.id}`}>
                                                {title}
                                            </Link>
                                        </h3>
                                        <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                                            {description}
                                        </p>

                                        <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-xl">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 font-medium">
                                                    {isCompany ? 'Nguyện vọng đạt được:' : 'Tổng kinh phí:'}
                                                </span>
                                                <span className="text-gold-primary font-bold">{formatCurrency(project.current_amount || project.target_amount)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                                            {project.start_date && (
                                                <div className="flex items-center gap-1">
                                                    <span>{isCompany ? 'Bắt đầu:' : 'Khởi công:'} {formatDate(new Date(project.start_date), 'dd/MM/yyyy')}</span>
                                                </div>
                                            )}
                                            {project.end_date && (
                                                <div className="flex items-center gap-1 font-medium text-green-600">
                                                    <span>{isCompany ? 'Kết thúc:' : 'Khánh thành:'} {formatDate(new Date(project.end_date), 'dd/MM/yyyy')}</span>
                                                </div>
                                            )}
                                        </div>
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
