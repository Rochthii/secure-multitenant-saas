'use client';

import React, { useState } from 'react';
import { BankAccount, createBankAccount, updateBankAccount, deleteBankAccount } from '@/app/actions/admin/finance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, Landmark, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface BankAccountsManagerProps {
    initialAccounts: BankAccount[];
    companyTenantId: string;
    canUpdate?: boolean;
}

export function BankAccountsManager({ initialAccounts, companyTenantId, canUpdate = false }: BankAccountsManagerProps) {
    const [accounts, setAccounts] = useState<BankAccount[]>(initialAccounts);
    const [editingAccount, setEditingAccount] = useState<Partial<BankAccount> | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.append('tenant_id', companyTenantId);

        try {
            const res = editingAccount?.id 
                ? await updateBankAccount(editingAccount.id, formData)
                : await createBankAccount(formData);

            if (res.success) {
                toast.success('Đã lưu tài khoản ngân hàng');
                setEditingAccount(null);
                if (res.data) {
                    setAccounts((prev) => {
                        const exists = prev.find((a) => a.id === res.data!.id);
                        if (exists) {
                            return prev.map((a) => a.id === res.data!.id ? res.data! : a);
                        }
                        return [res.data!, ...prev];
                    });
                }
            } else {
                toast.error(res.error || 'Có lỗi xảy ra');
            }
        } catch (err) {
            toast.error('Lỗi server');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) return;
        setLoading(true);
        try {
            const res = await deleteBankAccount(id);
            if (res.success) {
                toast.success('Đã xóa tài khoản');
                setAccounts(accounts.filter(a => a.id !== id));
            } else {
                toast.error(res.error || 'Lỗi khi xóa');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold font-playfair">Danh sách Tài khoản Thụ hưởng</h2>
                    <p className="text-sm text-gray-500">Quản lý các tài khoản ngân hàng dùng để tiếp nhận thanh toán toàn hệ thống.</p>
                </div>
                {canUpdate && (
                    <Button onClick={() => setEditingAccount({ bank_code: '970416', qr_template: 'compact2', is_active: true })} className="bg-slate-900 hover:bg-slate-800 rounded-xl gap-2">
                        <Plus className="w-4 h-4" /> Thêm tài khoản
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {accounts.map(account => (
                    <Card key={account.id} className="border-0 shadow-md group hover:shadow-lg transition-all ring-1 ring-slate-100">
                        <CardHeader className="pb-3 border-b border-slate-50">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                                        <Landmark className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm font-bold text-slate-900">{account.bank_name}</CardTitle>
                                        <CardDescription className="text-xs font-mono font-medium">{account.bank_code}</CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    {canUpdate && (
                                        <>
                                            <Button variant="ghost" size="icon" onClick={() => setEditingAccount(account)} className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                                <Plus className="w-4 h-4 rotate-45" /> {/* Use as edit icon for now */}
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(account.id)} className="h-8 w-8 text-red-300 hover:text-red-500 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Số tài khoản</span>
                                <span className="text-base font-black text-slate-900 font-mono tracking-widest">{account.account_number}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Chủ tài khoản</span>
                                <span className="text-sm font-bold text-slate-700 uppercase">{account.account_name}</span>
                            </div>
                            <div className="pt-2 flex gap-2">
                                {account.is_default && <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px] font-bold">Mặc định</Badge>}
                                {account.is_active ? (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] font-bold">Đang hoạt động</Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-red-100 text-red-700 text-[10px] font-bold">Ngừng nhận tiền</Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal-like Overlay for Adding/Editing */}
            {editingAccount && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg shadow-2xl border-0 ring-1 ring-slate-200 animate-in fade-in zoom-in-95 duration-200 bg-white">
                        <form onSubmit={handleSave}>
                            <CardHeader className="bg-slate-50 border-b">
                                <CardTitle className="text-lg font-bold">{editingAccount.id ? 'Cấu hình Tài khoản' : 'Thêm tài khoản mới'}</CardTitle>
                                <CardDescription>Nhập thông tin tài khoản ngân hàng thụ hưởng tại VietQR.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bank_name" className="text-xs font-bold uppercase text-slate-500">Tên ngân hàng</Label>
                                        <Input name="bank_name" defaultValue={editingAccount.bank_name} placeholder="ACB" required className="rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bank_code" className="text-xs font-bold uppercase text-slate-500">Mã VietQR (BIN)</Label>
                                        <Input name="bank_code" defaultValue={editingAccount.bank_code} placeholder="970416" required className="rounded-xl font-mono" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="account_number" className="text-xs font-bold uppercase text-slate-500">Số tài khoản</Label>
                                    <Input name="account_number" defaultValue={editingAccount.account_number} placeholder="12345678" required className="rounded-xl text-lg font-bold tracking-widest font-mono" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="account_name" className="text-xs font-bold uppercase text-slate-500">Chủ tài khoản (Không dấu)</Label>
                                    <Input name="account_name" defaultValue={editingAccount.account_name} placeholder="CONG TY DNXH AB" required className="rounded-xl uppercase font-bold" />
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-bold">Tài khoản mặc định</Label>
                                        <p className="text-xs text-slate-500">Sử dụng cho các danh mục chưa cài đặt STK riêng</p>
                                    </div>
                                    <input type="hidden" name="is_default" value={editingAccount.is_default?.toString() || 'false'} />
                                    <Switch defaultChecked={editingAccount.is_default} onCheckedChange={(val) => {
                                         const input = document.getElementsByName('is_default')[0] as HTMLInputElement;
                                         if (input) input.value = val.toString();
                                    }} />
                                </div>

                                <input type="hidden" name="is_active" value="true" />
                            </CardContent>
                            <div className="p-6 border-t bg-slate-50 flex gap-3">
                                <Button type="button" variant="outline" className="flex-1 rounded-xl font-bold" onClick={() => setEditingAccount(null)}>Hủy</Button>
                                <Button type="submit" disabled={loading} className="flex-1 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 gap-2">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Lưu tài khoản
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
