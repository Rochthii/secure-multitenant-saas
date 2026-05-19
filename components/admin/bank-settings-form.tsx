'use client';

import React from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateBankSettings } from '@/app/actions/admin/site-settings';
import { toast } from 'sonner';
import { Loader2, Save, ShieldAlert } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getBanks, Bank } from '@/lib/vietqr';

interface BankSettingsFormProps {
    settings: Record<string, string>;
    contextTenantId: string;
}

export function BankSettingsForm({ settings, contextTenantId }: BankSettingsFormProps) {
    const params = useParams();
    const [isCentralized, setIsCentralized] = React.useState(false);
    const [isLoadingConfigs, setIsLoadingConfigs] = React.useState(true);
    const [banks, setBanks] = React.useState<Bank[]>([]);
    const [selectedBankBin, setSelectedBankBin] = React.useState(settings['bank.id'] || '970416');

    React.useEffect(() => {
        const checkCentralized = async () => {
            const supabase = createClient();
            const { data } = await (supabase as any)
                .from('tenants')
                .select('parent_id, centralized_finance')
                .eq('id', contextTenantId)
                .single();
            
            if (data && (data.parent_id || data.centralized_finance)) {
                setIsCentralized(true);
            }
            setIsLoadingConfigs(false);
        };
        checkCentralized();

        // Fetch banks
        const fetchBanks = async () => {
            const data = await getBanks();
            setBanks(data);
        };
        fetchBanks();
    }, [contextTenantId]);

    const defaultValues = {
        'bank.id': settings['bank.id'] || '970416',
        'bank.account_no': settings['bank.account_no'] || '',
        'bank.account_name': settings['bank.account_name'] || '',
        'bank.name': settings['bank.name'] || '',
        'bank.qr_template': settings['bank.qr_template'] || 'compact2',
    };

    // Preview QR logic
    const [previewUrl, setPreviewUrl] = React.useState<string>('');
    const formRef = React.useRef<HTMLFormElement>(null);

    const updatePreview = () => {
        if (!formRef.current) return;
        const formData = new FormData(formRef.current);
        const bankId = formData.get('bank.id');
        const accountNo = formData.get('bank.account_no');
        const template = formData.get('bank.qr_template');

        if (bankId && accountNo) {
            setPreviewUrl(`https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=100000&addInfo=DEMO TRANSLFER&accountName=${encodeURIComponent(formData.get('bank.account_name') as string)}`);
        }
    };

    React.useEffect(() => {
        updatePreview();
    }, []); // Initial preview

    async function clientAction(formData: FormData) {
        formData.append('tenant_id', contextTenantId);
        const res = await updateBankSettings(formData);
        if (res.success) {
            toast.success('Đã cập nhật thông tin ngân hàng');
        } else {
            toast.error(res.error || 'Có lỗi xảy ra');
        }
    }

    const [qrTemplate, setQrTemplate] = React.useState(defaultValues['bank.qr_template']);

    if (isLoadingConfigs) {
        return (
            <div className="flex items-center justify-center p-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    if (isCentralized) {
        return (
            <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-800">
                        <ShieldAlert className="w-5 h-5 text-amber-600" />
                        Quản lý Tài chính Tập trung
                    </CardTitle>
                    <CardDescription className="text-amber-700">
                        Thông tin tài khoản ngân hàng của đơn vị này hiện đang được quản lý tập trung bởi Doanh nghiệp Xã hội liên kết.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="p-4 bg-white rounded-xl border border-amber-100 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Ngân hàng:</span>
                            <span className="font-bold text-gray-900">{defaultValues['bank.name']}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Số tài khoản:</span>
                            <span className="font-mono font-bold text-gray-900 text-lg">****{defaultValues['bank.account_no'].slice(-4)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Chủ tài khoản:</span>
                            <span className="font-bold text-gray-900 uppercase">{defaultValues['bank.account_name']}</span>
                        </div>
                        <div className="pt-4 border-t border-dashed border-amber-100 flex items-center gap-2 text-xs text-amber-600 font-medium italic">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Vui lòng liên hệ Admin Doanh nghiệp nếu cần thay đổi thông tin này.
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <form ref={formRef} action={clientAction} onChange={updatePreview} className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin tài khoản</CardTitle>
                    <CardDescription>
                        Cấu hình thông tin tài khoản nhận thanh toán. Thông tin này sẽ hiển thị và tạo mã QR cho người dùng.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="bank.select">Ngân hàng</Label>
                        <Select 
                            value={selectedBankBin} 
                            onValueChange={(bin) => {
                                setSelectedBankBin(bin);
                                const bank = banks.find(b => b.bin === bin);
                                if (bank && formRef.current) {
                                    // Update hidden fields or visible fields
                                    const nameInput = formRef.current.querySelector('[name="bank.name"]') as HTMLInputElement;
                                    const idInput = formRef.current.querySelector('[name="bank.id"]') as HTMLInputElement;
                                    if (nameInput) nameInput.value = bank.shortName || bank.name;
                                    if (idInput) idInput.value = bank.bin;
                                    updatePreview();
                                }
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn ngân hàng" />
                            </SelectTrigger>
                            <SelectContent>
                                {banks.map((bank) => (
                                    <SelectItem key={bank.bin} value={bank.bin}>
                                        <div className="flex items-center gap-2">
                                            {bank.logo && (
                                                <div className="relative w-8 h-4">
                                                    <Image src={bank.logo} alt={bank.shortName} fill className="object-contain" unoptimized />
                                                </div>
                                            )}
                                            <span>{bank.shortName} - {bank.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="bank.name">Tên hiển thị</Label>
                        <Input id="bank.name" name="bank.name" defaultValue={defaultValues['bank.name']} placeholder="Ngân hàng ACB" required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="bank.id">Mã ngân hàng (BinID)</Label>
                        <Input id="bank.id" name="bank.id" defaultValue={defaultValues['bank.id']} placeholder="970416" required readOnly className="bg-gray-50" />
                        <p className="text-xs text-gray-500">Mã này dùng để tạo VietQR (Tự động cập nhật khi chọn ngân hàng)</p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="bank.account_no">Số tài khoản</Label>
                        <Input id="bank.account_no" name="bank.account_no" defaultValue={defaultValues['bank.account_no']} placeholder="123456789" required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="bank.account_name">Tên chủ tài khoản</Label>
                        <Input id="bank.account_name" name="bank.account_name" defaultValue={defaultValues['bank.account_name']} placeholder="NGUYEN VAN A" required />
                        <p className="text-xs text-gray-500">Nhập tiếng Việt không dấu, in hoa</p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="bank.qr_template">Mẫu QR Code</Label>
                        <Select name="bank.qr_template_select" value={qrTemplate} onValueChange={(val) => {
                            setQrTemplate(val);
                            setTimeout(updatePreview, 100);
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn mẫu" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="compact">Compact (Nhỏ gọn)</SelectItem>
                                <SelectItem value="compact2">Compact 2 (Đẹp)</SelectItem>
                                <SelectItem value="qr_only">QR Only (Chỉ mã)</SelectItem>
                                <SelectItem value="print">Print (In ấn)</SelectItem>
                            </SelectContent>
                        </Select>
                        {/* Hidden input for Select */}
                        <input type="hidden" name="bank.qr_template" value={qrTemplate} />
                    </div>

                    <div className="pt-4">
                        <SubmitButton />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Xem trước mã QR</CardTitle>
                    <CardDescription>
                        Mã QR sẽ hiển thị như thế này khi người dùng thanh toán.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center min-h-[300px] bg-gray-50 rounded-lg">
                    {previewUrl ? (
                        <div className="relative w-full max-w-xs aspect-square">
                            <Image
                                src={previewUrl}
                                alt="QR Preview"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                    ) : (
                        <p className="text-gray-400">Nhập thông tin để xem trước</p>
                    )}
                    <p className="mt-4 text-sm text-gray-500 text-center">
                        Đây là ảnh xem trước tạo tự động từ VietQR API dựa trên thông tin bạn nhập.
                    </p>
                </CardContent>
            </Card>
        </form>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending} className="w-full bg-gold-primary hover:bg-gold-dark">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                </>
            ) : (
                <>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu cấu hình
                </>
            )}
        </Button>
    );
}
