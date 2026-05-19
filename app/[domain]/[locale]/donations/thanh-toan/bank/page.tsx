import React from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/constants/transaction';
import { Building2, CheckCircle2, AlertCircle, QrCode, Info, Heart, Star, Sun, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/site-settings';
import { getTenantConfig } from '@/lib/tenant';
import { ConfirmPaymentButton } from '@/components/donations/confirm-payment-button';
import { CopyButton } from '@/components/ui/copy-button';
import { getTransactionPurpose, generateTransferContent } from '@/lib/donations';

export const dynamic = 'force-dynamic';

// ─── Celebration Component (Confetti-like decorations) ──────────────────
const SuccessCelebration = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
        {[...Array(24)].map((_, i) => (
            <div 
                key={i}
                className="absolute animate-bounce opacity-20"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${3 + Math.random() * 3}s`
                }}
            >
                {i % 3 === 0 ? <Heart className="text-red-400 w-4 h-4 fill-current" /> : 
                 i % 3 === 1 ? <Star className="text-yellow-400 w-4 h-4 fill-current" /> : 
                 <Sun className="text-gold-primary w-4 h-4 fill-current" />}
            </div>
        ))}
    </div>
);

export default async function BankPaymentPage({
    params,
    searchParams,
}: {
    params: Promise<{ domain: string, locale: string }>;
    searchParams: Promise<{ id?: string, data?: string }>;
}) {
    const { domain, locale } = await params;
    const { id, data: encodedData } = await searchParams;
    let transactionData: any = null;
    let isConfirmed = false;

    const tenantConfig = await getTenantConfig(domain);
    if (!tenantConfig) notFound();
    const tenantId = tenantConfig.id;
    const isCompany = tenantConfig.tenant_type !== 'tenant';
    const transactionSlug = isCompany ? 'du-an' : 'transactions';

    const supabase = await createClient();

    // ─── Data Loading Logic (Optimized for Guest Access) ────────────────────
    if (id) {
        // Fetch specific transaction by ID (RLS now allows this for everyone)
        const { data } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', id)
            .limit(1)
            .maybeSingle();
            
        if (data) {
            transactionData = data;
            isConfirmed = true;
        }
    } 
    
    // Fallback to encoded data if not found or not yet saved (Initial render)
    if (!isConfirmed && encodedData && typeof encodedData === 'string') {
        try {
            transactionData = JSON.parse(decodeURIComponent(atob(encodedData)));
            transactionData.status = 'pending';
        } catch (e) {
            console.error('Failed to decode transaction data:', e);
        }
    }

    // Safety check
    if (!transactionData || typeof transactionData.amount !== 'number') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                <Card className="max-w-md w-full p-10 text-center space-y-6 shadow-2xl border-none rounded-[3rem]">
                    <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-gray-900">{isCompany ? 'Thông tin không hợp lệ' : 'Thông tin không hợp lệ'}</h1>
                        <p className="text-gray-500 leading-relaxed font-medium">
                            {isCompany ? 'Dữ liệu đóng góp không tìm thấy hoặc đã hết hạn truy cập. Vui lòng quay lại và thử lại.' : 'Dữ liệu giao dịch không tìm thấy hoặc đã hết hạn truy cập. Vui lòng quay lại và thử lại.'}
                        </p>
                    </div>
                    <Button asChild className="w-full bg-slate-900 hover:bg-black h-14 rounded-2xl text-lg font-bold">
                        <Link href={`/${transactionSlug}`}>Quay lại trang chủ</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    // ─── Settings & Bank Info ──────────────────────────────────────────────
    const projectId = transactionData.project_id || transactionData.purpose;
    const purposeDetail = projectId ? await getTransactionPurpose(projectId, tenantId) : null;
    
    const bankSettingsTenantId = tenantConfig.parent_id || (tenantConfig.tenant_type !== 'tenant' ? tenantConfig.id : tenantId);
    const settings = await getSiteSettings(bankSettingsTenantId);

    const recipientType = transactionData.recipient_type || purposeDetail?.recipient_type || 'tenant_fund';
    const bankTransferInfoStr = settings['bank_transfer_info'];
    let bankInfoFromSettings = bankTransferInfoStr ? JSON.parse(bankTransferInfoStr) : null;

    if (bankInfoFromSettings && bankInfoFromSettings[recipientType]) {
        bankInfoFromSettings = bankInfoFromSettings[recipientType];
    }

    const specificBankAccountId = transactionData.bank_account_id || purposeDetail?.bank_account_id;
    let targetBankAccount: any = null;

    if (specificBankAccountId) {
        const { data } = await (supabase as any).from('bank_accounts').select('*').eq('id', specificBankAccountId).single();
        targetBankAccount = data;
    }

    const bankInfo = {
        bankId: targetBankAccount?.bank_code || bankInfoFromSettings?.bank_code || settings['bank.id'] || '970416',
        accountNo: targetBankAccount?.account_number || bankInfoFromSettings?.account_number || settings['bank.account_no'] || '',
        accountName: targetBankAccount?.account_name || bankInfoFromSettings?.account_name || settings['bank.account_name'] || (recipientType === 'charity_fund' ? 'QUY TU THIEN' : (isCompany ? 'QUAN LY DONG GOP' : 'QUAN LY PHUOC DIEN')),
        bankName: targetBankAccount?.bank_name || bankInfoFromSettings?.bank_name || settings['bank.name'] || 'Ngân hàng',
        amount: transactionData.amount,
        content: generateTransferContent({
            donorName: transactionData.donor_name,
            isAnonymous: transactionData.is_anonymous,
            fundKey: recipientType === 'charity_fund' ? 'TT' : 'CD',
            tenantKey: tenantConfig.subdomain || 'MC',
            purposeKey: purposeDetail?.title || 'GEN',
            shortId: (transactionData.id || transactionData.tempId || '').toString().substring(0, 4).toUpperCase(),
        }),
        qrTemplate: settings['bank.qr_template'] || 'compact',
    };

    const qrUrl = `https://img.vietqr.io/image/${bankInfo.bankId}-${bankInfo.accountNo}-${bankInfo.qrTemplate}.png?amount=${bankInfo.amount}&addInfo=${encodeURIComponent(bankInfo.content)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;

    return (
        <div className="container mx-auto px-4 py-8 md:py-20 min-h-screen bg-white">
            <div className="max-w-5xl mx-auto">
                {/* ─── Success Celebration View ────────────────────────────── */}
                {isConfirmed && (
                    <div className="relative mb-20 text-center animate-in fade-in zoom-in duration-1000">
                        <SuccessCelebration />
                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-50 rounded-[2.5rem] mb-8 shadow-inner">
                                <CheckCircle2 className="w-12 h-12 text-green-600" />
                            </div>
                            <h1 className="text-5xl md:text-6xl font-playfair font-black text-gray-900 mb-6 tracking-tight">
                                Xác nhận hoan hỷ!
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-600 font-medium max-w-3xl mx-auto leading-relaxed italic">
                                {isCompany 
                                    ? '"Lòng biết ơn là cội nguồn của mọi giá trị. Trân trọng sự đồng hành của quý vị."'
                                    : '"Giao dịch thù thắng, phước báu vô biên. Nguyện cầu sự an vui và cát tường đến với quý vị."'}
                            </p>
                        </div>
                    </div>
                )}

                {!isConfirmed && (
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-6xl font-playfair font-black text-gray-900 mb-6 tracking-tight">
                            {isCompany ? 'Xác nhận đóng góp' : 'Xác nhận thanh toán'}
                        </h1>
                        <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto italic">
                            {isCompany ? 'Sự đồng hành của bạn giúp kiến tạo những giá trị bền vững cho cộng đồng.' : 'Mỗi phần phát tâm là một hạt giống phước lành được gieo trồng tại nơi cửa Phật.'}
                        </p>
                    </div>
                )}

                <div className={`grid lg:grid-cols-12 gap-10 items-stretch transition-all duration-700 ${isConfirmed ? 'scale-[0.98]' : ''}`}>
                    {/* QR Section */}
                    <div className="lg:col-span-5 flex flex-col">
                        <div className="bg-gray-50 rounded-[3.5rem] p-8 md:p-12 text-center border border-gray-100 shadow-sm flex-1 relative overflow-hidden group">
                            {isConfirmed && <div className="absolute inset-0 bg-white/40 backdrop-blur-[4px] z-10 flex items-center justify-center font-black text-green-700 uppercase tracking-widest text-xs">Biên lai đã được ghi nhận</div>}
                            
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-12">Mã QR Thanh toán nhanh</h3>
                            
                            <div className="relative mx-auto w-full aspect-square max-w-[320px] mb-10">
                                <div className="absolute -inset-6 bg-gold-primary/5 rounded-[3rem] animate-pulse" />
                                <div className="relative bg-white p-5 rounded-[2.5rem] shadow-xl border border-gray-100 h-full w-full flex items-center justify-center transition-transform hover:scale-105 duration-500">
                                    <Image src={qrUrl} alt="VietQR" fill className="object-contain p-4" unoptimized />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isCompany ? 'Số tiền đóng góp' : 'Số tiền phát tâm'}</p>
                                <p className="text-5xl font-black text-gold-primary tracking-tighter tabular-nums">{formatCurrency(transactionData.amount)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Details Section */}
                    <div className="lg:col-span-7 flex flex-col">
                        <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[3.5rem] bg-white flex-1 overflow-hidden relative">
                             <CardContent className="p-10 md:p-14">
                                <div className="flex items-center gap-6 mb-12 pb-10 border-b border-gray-50">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-gold-primary/10 flex items-center justify-center text-gold-primary shrink-0 rotate-3">
                                        <Building2 className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 leading-none">Thông tin thụ hưởng</p>
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none">{bankInfo.accountName}</h2>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="grid grid-cols-2 gap-10">
                                        <div>
                                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Ngân hàng</p>
                                            <p className="text-xl font-black text-gray-900">{bankInfo.bankName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Phạm vi</p>
                                            <p className="text-xl font-black text-gray-900">Liên ngân hàng 24/7</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950 text-white rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 group hover:bg-black transition-colors">
                                        <div className="w-full md:w-auto">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Số tài khoản</p>
                                            <p className="text-3xl md:text-4xl font-mono font-black tracking-tighter leading-none">{bankInfo.accountNo}</p>
                                        </div>
                                        <CopyButton text={bankInfo.accountNo} className="w-full md:w-auto bg-white/10 hover:bg-white/20 text-white border-none rounded-2xl h-14 font-black text-sm px-6" />
                                    </div>

                                    <div className="bg-amber-50/50 rounded-[2rem] p-8 md:p-10 border border-amber-100 relative group overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gold-primary opacity-50" />
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="w-full md:w-auto">
                                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-3">Nội dung xác nhận (Bắt buộc)</p>
                                                <p className="text-2xl md:text-3xl font-mono font-black text-amber-900 tracking-tight leading-none">
                                                    {bankInfo.content}
                                                </p>
                                            </div>
                                            <CopyButton text={bankInfo.content} className="w-full md:w-auto p-4 h-auto text-amber-700 hover:bg-amber-100 border-none transition-colors" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-14 pt-8">
                                    {!isConfirmed ? (
                                        <div className="space-y-6">
                                            <ConfirmPaymentButton transactionData={transactionData} />
                                            <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                                                * Nhấn nút sau khi bạn đã thực hiện lệnh chuyển tiền
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-6 duration-700">
                                            <div className="p-8 bg-green-50 rounded-[2rem] border border-green-100 flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                                    <CheckCircle2 className="w-8 h-8" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-black text-green-900 text-lg">Thông tin đã được lưu trữ.</p>
                                                    <p className="text-sm text-green-700 font-medium">Hệ thống sẽ cập nhật trạng thái trong thời gian sớm nhất.</p>
                                                </div>
                                            </div>
                                            <Button asChild variant="outline" className="h-16 rounded-[1.5rem] border-2 border-gray-100 font-black tracking-widest uppercase text-xs hover:bg-gray-50 flex items-center justify-center gap-2">
                                                <Link href={`/${transactionSlug}`}>
                                                    Quay lại trang chủ <ArrowLeft className="w-4 h-4 ml-1" />
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                             </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="mt-20 text-center">
                     <p className="text-gray-300 text-xs font-black uppercase tracking-[0.3em]">
                        {isCompany ? 'SaaS • Hệ thống Quản trị Doanh nghiệp v2.0' : 'SaaS • Hệ thống Quản trị Nhà chi nhánh v2.0'}
                     </p>
                </div>
            </div>
        </div>
    );
}
