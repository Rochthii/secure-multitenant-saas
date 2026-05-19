import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/constants/transaction';
import { Badge } from '@/components/ui/badge';
import { formatDate } from 'date-fns';
import { vi, km } from 'date-fns/locale';
import { Heart, ScrollText, CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/routing';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

import { getTenantConfig } from '@/lib/tenant';
import { notFound } from 'next/navigation';

export default async function CongDucGhiDanhPage({
    params
}: {
    params: Promise<{ locale: string; domain: string }>
}) {
    const { locale, domain } = await params;
    setRequestLocale(locale);

    const tenantConfig = await getTenantConfig(domain);
    if (!tenantConfig) notFound();
    if (tenantConfig.modules_config?.transactions === false) {
        notFound();
    }
    const tenantId = tenantConfig.id;
    const isCompany = tenantConfig.tenant_type !== 'tenant';
    const transactionSlug = isCompany ? 'du-an' : 'transactions';

    // Dùng Anon key cho trang public để tránh lỗi cookie/session của Next.js Server Components
    const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch completed transactions filtered by tenant
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
            id,
            donor_name,
            is_anonymous,
            amount,
            project_id,
            created_at
        `)
        .eq('status', 'confirmed')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(100);

    // Fetch transaction projects filtered by tenant
    const { data: purposes } = await supabase
        .from('transaction_projects')
        .select('id, title_vi')
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <section className="relative h-[35vh] min-h-[250px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-coffee-dark/90 z-10" />
                <div
                    className="absolute inset-0 bg-[url('/images/pattern-bg.png')] bg-cover bg-center opacity-20 mix-blend-overlay z-0"
                />
                <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto mt-16">
                    <span className="text-gold-primary font-bold tracking-wider uppercase text-sm mb-4 block">
                        {isCompany ? 'Sổ vàng ghi ơn' : 'Sổ vàng lưu danh'}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-4 flex items-center justify-center gap-3">
                        <ScrollText className="w-8 h-8 text-gold-primary hidden md:block" />
                        {isCompany ? 'Danh Sách khách hàng' : 'Thành tích Ghi Danh'}
                    </h1>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                        {isCompany
                            ? 'Trân trọng cảm ơn sự đồng hành và hỗ trợ quý báu của các khách hàng, đối tác đã cùng chúng tôi kiến tạo giá trị cho cộng đồng.'
                            : 'Thành kính tri ân giao dịch của toàn thể Thiện nam Tín nữ, Nhân sự xa gần đã phát tâm thanh toán Tam Bảo.'
                        }
                    </p>
                </div>
            </section>

            {/* List Section */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-8 relative z-20">
                <Card className="shadow-2xl border border-gray-100 overflow-hidden rounded-2xl">
                    <CardContent className="p-0">
                        {error ? (
                            <div className="text-center py-20 text-gray-500">
                                Có lỗi xảy ra khi tải danh sách. Vui lòng thử lại sau.
                            </div>
                        ) : !transactions || transactions.length === 0 ? (
                            <div className="text-center py-20">
                                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa có bản ghi nào</h3>
                                <p className="text-gray-500">
                                    {isCompany ? 'Danh sách đóng góp sẽ được cập nhật tại đây.' : 'Danh sách giao dịch sẽ được cập nhật tại đây.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gold-primary/10 text-coffee-dark">
                                            <th className="py-4 px-6 font-bold uppercase text-sm w-16">STT</th>
                                            <th className="py-4 px-6 font-bold uppercase text-sm">
                                                {isCompany ? 'Họ và tên khách hàng' : 'Họ và tên thí chủ'}
                                            </th>
                                            <th className="py-4 px-6 font-bold uppercase text-sm">
                                                {isCompany ? 'Số tiền đồng hành' : 'Số tiền thanh toán'}
                                            </th>
                                            <th className="py-4 px-6 font-bold uppercase text-sm hidden md:table-cell">
                                                {isCompany ? 'Dự án' : 'Mục đích'}
                                            </th>
                                            <th className="py-4 px-6 font-bold uppercase text-sm hidden sm:table-cell text-right">Ngày ghi nhận</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {transactions.map((d, index) => {
                                            const purposeTitle = (purposes as any[])?.find(p => p.id === d.project_id)?.title_vi
                                                ?? (d.project_id === null ? (isCompany ? 'Đóng góp chung' : 'Thanh toán Tam Bảo') : (isCompany ? 'Khác' : 'Giao dịch khác'));

                                            return (
                                                <tr key={d.id} className="hover:bg-gray-50/80 transition-colors group">
                                                    <td className="py-4 px-6 text-gray-400 font-mono text-sm">
                                                        {(index + 1).toString().padStart(3, '0')}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="font-bold text-gray-900 group-hover:text-gold-primary transition-colors flex items-center gap-2">
                                                            {d.is_anonymous ? (isCompany ? 'khách hàng ẩn danh' : 'Nhân sự ẩn danh') : d.donor_name}
                                                            {d.is_anonymous && (
                                                                <Badge variant="outline" className="text-[10px] bg-gray-100 text-gray-500 border-none font-normal">Ẩn danh</Badge>
                                                            )}
                                                        </div>
                                                        {/* Mobile purpose view */}
                                                        <div className="md:hidden text-xs text-gray-500 mt-1">
                                                            {purposeTitle}
                                                            <span className="mx-2">•</span>
                                                            {formatDate(new Date(d.created_at), 'dd/MM/yyyy')}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="font-bold text-gold-primary">
                                                            {formatCurrency(d.amount)}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 hidden md:table-cell">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                            {purposeTitle}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 hidden sm:table-cell text-right text-sm text-gray-500">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                            {formatDate(new Date(d.created_at), 'dd/MM/yyyy', { locale: locale === 'km' ? km : vi })}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="mt-12 text-center space-y-4">
                    <p className="text-gray-500 italic">{isCompany ? 'Danh sách hiển thị 100 giao dịch đồng hành gần đây nhất.' : 'Danh sách hiển thị 100 giao dịch giao dịch gần đây nhất.'}</p>
                    <Link href={`/${transactionSlug}`} className="inline-flex items-center justify-center px-10 py-4 text-sm font-bold text-white transition-all duration-300 bg-coffee-dark rounded-sm hover:bg-gold-primary hover:shadow-xl uppercase tracking-widest shadow-lg">
                        {isCompany ? 'Đóng Góp Ngay' : 'Phát Tâm Đóng góp'}
                    </Link>
                </div>

            </section>
        </div>
    );
}
