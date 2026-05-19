import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { getSiteSettings } from '@/lib/site-settings';
import { getTenantConfig } from '@/lib/tenant';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, HeartHandshake, Info } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// force-dynamic: trang dùng searchParams để lọc theo dự án nên phải dynamic.
export const dynamic = 'force-dynamic';

export default async function CungDuongPage({
    params,
    searchParams
}: {
    params: Promise<{ locale: string, domain: string }>,
    searchParams: Promise<{ project?: string }>
}) {
    const { locale, domain } = await params;
    setRequestLocale(locale);

    // Fetch settings and specific project if provided
    const tenantConfig = await getTenantConfig(domain);
    if (tenantConfig?.modules_config?.transactions === false) {
        notFound();
    }
    const tenantId = tenantConfig?.id;
    
    // Always fetch bank settings from Global (Company) Admin to centralize finance.
    const globalSettings = await getSiteSettings('55555555-5555-5555-5555-555555555555');
    const resolvedParams = await searchParams;
    const projectId = resolvedParams?.project;

    let projectContext = null;
    if (projectId) {
        const supabase = await createClient();
        // Hỗ trợ cả slug lẫn UUID để tương thích mọi trường hợp
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);
        const { data } = await supabase
            .from('transaction_projects' as any)
            .select('title_vi, title_km, slug')
            .eq(isUUID ? 'id' : 'slug', projectId)
            .maybeSingle();

        const projData: any = data;
        if (projData) {
            projectContext = locale === 'km' && projData.title_km ? projData.title_km : projData.title_vi;
        }
    }

    // Force ALL bank transfers to Global Company account as requested
    const bankId = globalSettings['bank.id'] || '970416'; // ACB default
    const accountNo = globalSettings['bank.account_no'] || '';
    const accountName = globalSettings['bank.account_name'] || '';
    const bankName = globalSettings['bank.name'] || '';
    const template = globalSettings['bank.qr_template'] || 'compact2';

    const isCompany = tenantConfig?.tenant_type !== 'tenant';
    const transactionSlug = isCompany ? 'du-an' : 'transactions';

    // Generate Transfer Content Note
    const transferNote = projectContext 
        ? (isCompany ? `DONG GOP ${projectContext}` : `CUNG DUONG ${projectContext}`)
        : (isCompany ? 'DONG GOP CONG DONG' : 'CUNG DUONG TAM BAO');

    // Generate VietQR URL
    const qrUrl = accountNo
        ? `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=0&addInfo=${encodeURIComponent(transferNote)}&accountName=${encodeURIComponent(accountName)}`
        : null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <section className="relative h-[30vh] min-h-[250px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-coffee-dark/90 z-10" />
                <div
                    className="absolute inset-0 bg-[url('/images/pattern-bg.png')] bg-cover bg-center opacity-20 mix-blend-overlay z-0"
                />
                <div className="relative z-20 text-center text-white px-4 max-w-3xl mx-auto mt-12">
                    <h1 className="text-3xl md:text-4xl font-playfair font-bold mb-4 flex items-center justify-center gap-3">
                        <HeartHandshake className="w-8 h-8 text-gold-primary" />
                        {isCompany ? 'Đóng Góp Dự Án' : 'Phát Tâm Đóng góp'}
                    </h1>
                    <p className="text-gray-300 text-lg">
                        {isCompany
                            ? 'Sự đồng hành của quý vị là nguồn động lực to lớn để chúng tôi tiếp tục thực hiện các dự án ý nghĩa.'
                            : 'Gieo duyên lành nơi Tam Bảo, tích tạo phước báu vô lượng cho hiện tại và vị lai.'
                        }
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-10 relative z-30">
                <Card className="shadow-2xl border-none overflow-hidden rounded-2xl">
                    <CardContent className="p-0">
                        <div className="grid md:grid-cols-2">
                            {/* QR Code Column */}
                            <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 font-playfair text-center">
                                    Quét mã QR (VietQR)
                                </h3>

                                {qrUrl ? (
                                    <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-[280px]">
                                        <Image
                                            src={qrUrl}
                                            alt="Mã QR Chuyển khoản"
                                            width={280}
                                            height={280}
                                            className="w-full h-auto object-contain"
                                            unoptimized
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-white p-8 rounded-xl shadow-inner w-full text-center text-gray-500 border border-dashed border-gray-300">
                                        Chưa có thông tin mã QR
                                    </div>
                                )}

                                <p className="text-sm text-gray-500 mt-6 text-center max-w-xs">
                                    Mở ứng dụng Ngân hàng trên điện thoại và chọn quét mã QR để điền tự động thông tin.
                                </p>
                            </div>

                            {/* Bank Info Column */}
                            <div className="p-8 bg-white flex flex-col justify-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 font-playfair">
                                    Chuyển khoản thủ công
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">Ngân hàng thụ hưởng</label>
                                        <div className="font-bold text-lg text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100 uppercase">
                                            {bankName || 'Chưa cập nhật'}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">Tên tài khoản</label>
                                        <div className="font-bold text-lg text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100 uppercase text-gold-primary">
                                            {accountName || 'Chưa cập nhật'}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">Số tài khoản</label>
                                        <div className="flex items-center gap-2">
                                            <div className="font-bold text-2xl tracking-wider text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100 flex-1">
                                                {accountNo || '---'}
                                            </div>
                                            {/* Note: In a real app, this copy button would need Client Component logic or inline script */}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">Nội dung chuyển khoản (Gợi ý)</label>
                                        <div className="font-medium text-gray-700 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                                            {transferNote}
                                        </div>
                                    </div>
                                </div>

                                {projectContext && (
                                    <div className="mt-8 bg-gold-primary/10 border border-gold-primary/30 p-4 rounded-xl flex items-start gap-3">
                                        <Info className="w-5 h-5 text-gold-primary shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-700">
                                            {isCompany
                                                ? <>Quý vị đang thực hiện đóng góp cho dự án: <strong className="text-gold-dark">{projectContext}</strong>. Trân trọng cảm ơn!</>
                                                : <>Quý Nhân sự đang thực hiện thanh toán cho công trình: <strong className="text-gold-dark">{projectContext}</strong>. Giao dịch vô lượng!</>
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 text-center">
                    <Link href={`/${transactionSlug}/cong-duc-ghi-danh`}>
                        <Button variant="outline" className="text-gold-primary border-gold-primary hover:bg-gold-primary hover:text-white transition-colors">
                            {isCompany ? 'Xem danh sách khách hàng' : 'Xem danh sách ghi nhận giao dịch'}
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
