import { setRequestLocale } from 'next-intl/server';
import { BRAND_NAME_VI } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/constants/transaction';
import { Badge } from '@/components/ui/badge';
import { formatDate } from 'date-fns';
import { Activity, ShieldCheck, Database, History } from 'lucide-react';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getTenantConfig } from '@/lib/tenant';
import { notFound } from 'next/navigation';
import { NetworkSection } from '@/components/sections/mcaaron/NetworkSection';
import { motion } from 'framer-motion';
import { Metadata } from 'next';
import { getTenantBaseUrl } from '@/lib/utils/seo';

export const revalidate = 60; // Cache for 60 seconds

export async function generateMetadata({ params }: { params: Promise<{ domain: string; locale: string }> }): Promise<Metadata> {
    const { domain, locale } = await params;
    const tenant = await getTenantConfig(domain);
    const tenantBaseUrl = getTenantBaseUrl(domain);
    const siteName = tenant?.name || BRAND_NAME_VI;

    return {
        title: `Cổng Minh Bạch — Dữ liệu Social Impact | ${siteName}`,
        description: `Toàn bộ dữ liệu đóng góp từ mạng lưới ${siteName} được công khai minh bạch. Xem giao dịch, đối tác và tổng quỹ cộng đồng theo thời gian thực.`,
        alternates: {
            canonical: `${tenantBaseUrl}/${locale}/minh-bach`,
            languages: {
                'vi-VN': `${tenantBaseUrl}/vi/minh-bach`,
                'km-KH': `${tenantBaseUrl}/km/minh-bach`,
                'en-US': `${tenantBaseUrl}/en/minh-bach`,
            },
        },
        openGraph: {
            title: `Cổng Minh Bạch | ${siteName}`,
            description: `Dữ liệu đóng góp xã hội minh bạch từ hệ sinh thái ${siteName}.`,
            url: `${tenantBaseUrl}/${locale}/minh-bach`,
        },
    };
}

export default async function TransparencyPortalPage({
    params
}: {
    params: Promise<{ locale: string; domain: string }>
}) {
    const { locale, domain } = await params;
    setRequestLocale(locale);

    const tenantConfig = await getTenantConfig(domain);
    if (!tenantConfig) notFound();

    // Dùng Anon key cho trang public
    const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch toàn bộ giao dịch từ TẤT CẢ các tenant
    const { data: globalTransactions, error } = await supabase
        .from('transactions')
        .select(`
            id,
            donor_name,
            is_anonymous,
            amount,
            project_id,
            created_at,
            tenant_id
        `)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
        .limit(200);

    // Fetch Project Titles for mapping
    const { data: projects } = await supabase
        .from('transaction_projects')
        .select('id, title_vi');

    const projectTitles = projects?.reduce((acc, curr) => {
        acc[curr.id] = curr.title_vi;
        return acc;
    }, {} as Record<string, string>) || {};

    // Fetch thông tin các tổ chức (Organizations) - Nguồn dữ liệu chính chủ từ Admin
    const { data: organizations } = await supabase
        .from('organizations')
        .select('id, name, logo_url, tenant_id, org_type, total_donated')
        .eq('is_active', true);

    const orgNamesByTenant = organizations?.reduce((acc, curr) => {
        if (curr.tenant_id) acc[curr.tenant_id] = curr.name;
        return acc;
    }, {} as Record<string, string>) || {};

    // Vẫn fetch tenants để fallback hoặc lấy tenant_type nếu cần
    const { data: activeTenants } = await supabase
        .from('tenants')
        .select('id, name, tenant_type');

    const tenantNames = activeTenants?.reduce((acc, curr) => {
        acc[curr.id] = curr.name;
        return acc;
    }, {} as Record<string, string>) || {};

    const tenantTypes = activeTenants?.reduce((acc, curr) => {
        acc[curr.id] = curr.tenant_type;
        return acc;
    }, {} as Record<string, string>) || {};

    // Chỉ hiện các khoản đóng góp từ doanh nghiệp/NGO (Social Enterprise Impact)
    // Lọc bỏ các khoản thanh toán tâm linh tại các Chi nhánh (vì đó là dữ liệu riêng tư của Chi nhánh)
    const socialTransactions = globalTransactions?.filter(d => {
        const type = tenantTypes[d.tenant_id];
        return type !== 'tenant';
    }) || [];

    const totalIndividualTransactions = socialTransactions.reduce((sum, d) => sum + Number(d.amount), 0);
    const totalOrgTransactions = organizations?.reduce((sum, org) => sum + Number((org as any).total_donated || 0), 0) || 0;
    const totalGlobalTransactions = totalIndividualTransactions + totalOrgTransactions;

    return (
        <div className="min-h-screen bg-[#FAF8F5] pb-24">
            {/* Minimal Corporate Hero */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-white border-b border-gray-100">
                <div className="absolute inset-0 bg-grid-stone-100/[0.04] bg-[size:20px_20px]" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/30 rounded-full blur-[100px] opacity-50 pointer-events-none" />

                <div className="container mx-auto px-4 max-w-6xl relative z-10 text-center">
                    <div className="flex flex-col items-center">
                        <Badge variant="outline" className="mb-6 border-blue-200/50 bg-blue-50/50 text-blue-700 uppercase tracking-widest px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md relative overflow-hidden group">
                            <span className="relative z-10 flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Cổng Thông Tin Minh Bạch Doanh Nghiệp Xã Hội
                            </span>
                        </Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#002B5B] mb-6 leading-tight">
                            Dữ Liệu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D2FF] to-[#002B5B]">Social Impact</span>
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Toàn bộ dữ liệu đóng góp từ các đối tác và tổ chức liên kết được tự động tổng hợp trực tiếp từ mạng lưới hệ sinh thái ${BRAND_NAME_VI}.
                            <span className="block text-sm mt-3 text-gray-400 font-normal italic font-serif">
                                * Các khoản thanh toán tâm linh tại các Chi nhánh là dữ liệu riêng tư và không hiển thị tại đây.
                            </span>
                        </p>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 max-w-6xl -mt-10 relative z-20 mb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tổng Quỹ Cộng Đồng</CardTitle>
                            <Database className="w-4 h-4 text-[#FFD700]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-[#002B5B]">
                                {formatCurrency(totalGlobalTransactions)}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Đã kiểm chứng bởi hệ thống</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Giao Dịch Đã Ghi Nhận</CardTitle>
                            <Activity className="w-4 h-4 text-[#00D2FF]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-[#002B5B]">
                                {socialTransactions.length}+
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Giao dịch qua mạng lưới xã hội</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Đối Tác Đồng Hành</CardTitle>
                            <ShieldCheck className="w-4 h-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-[#002B5B]">
                                {organizations?.length || 0}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Tổ chức xã hội & đối tác đã xác minh</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <NetworkSection />

            {/* Global Logs Section */}
            <section className="container mx-auto px-4 max-w-6xl relative z-20">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-[#002B5B] flex items-center gap-2">
                            <History className="w-6 h-6 text-[#FFD700]" />
                            Sổ Phụ Lõi (Ledger)
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Dữ liệu thô truyền trực tiếp từ các điểm kết nối đối tác.</p>
                    </div>
                </div>

                <Card className="shadow-lg border-0 overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl">
                    <CardContent className="p-0">
                        {error ? (
                            <div className="text-center py-20 text-red-500">
                                Lỗi kết nối đến Ledger Node. Vui lòng thử lại.
                            </div>
                        ) : !socialTransactions || socialTransactions.length === 0 ? (
                            <div className="text-center py-20 text-gray-500">
                                Chưa có dữ liệu đóng góp xã hội được ghi nhận.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                                            <th className="py-4 px-6 font-bold uppercase text-xs w-24">TxID</th>
                                            <th className="py-4 px-6 font-bold uppercase text-xs">Node Nguồn</th>
                                            <th className="py-4 px-6 font-bold uppercase text-xs">Phát Sinh</th>
                                            <th className="py-4 px-6 font-bold uppercase text-xs">Chiến dịch / Hạng mục</th>
                                            <th className="py-4 px-6 font-bold uppercase text-xs">Khối Lượng</th>
                                            <th className="py-4 px-6 font-bold uppercase text-xs text-right hidden sm:table-cell">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100/50">
                                        {socialTransactions.map((d) => {
                                            const projectTitle = projectTitles[d.project_id as string] || 'Hạng mục chung';
                                            return (
                                                <tr key={d.id} className="hover:bg-blue-50/30 transition-colors group">
                                                    <td className="py-4 px-6 text-gray-400 font-mono text-[10px]">
                                                        {d.id.split('-')[0].toUpperCase()}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <Badge variant="outline" className="text-xs bg-blue-50/50 text-[#002B5B] border-blue-100 font-medium whitespace-nowrap">
                                                            {orgNamesByTenant[d.tenant_id] || tenantNames[d.tenant_id] || 'Tổ chức Đối tác'}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm">
                                                        <div className="font-semibold text-gray-900">
                                                            {d.is_anonymous ? 'Người dùng ẩn danh' : d.donor_name}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-xs text-gray-600">
                                                        {projectTitle}
                                                    </td>
                                                    <td className="py-4 px-6 font-mono font-medium text-[#002B5B]">
                                                        {formatCurrency(d.amount)}
                                                    </td>
                                                    <td className="py-4 px-6 text-right text-xs text-gray-500 hidden sm:table-cell font-mono">
                                                        {formatDate(new Date(d.created_at), 'yyyy/MM/dd HH:mm:ss')}
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
            </section>
        </div>
    );
}
