'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Organization, createOrganization, updateOrganization, deleteOrganization } from '@/app/actions/admin/organizations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, Trash2, AlertCircle, Building2, CheckCircle2, Loader2, DollarSign } from 'lucide-react';
import { BRAND_NAME_VI } from '@/lib/constants';

interface OrganizationFormProps {
    mode: 'create' | 'edit';
    organization?: Organization;
    tenantId?: string;
}

export function OrganizationForm({ mode, organization, tenantId }: OrganizationFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData(e.currentTarget);
        
        try {
            const result = mode === 'create' 
                ? await createOrganization(formData)
                : await updateOrganization(organization!.id, formData);

            if (result.success) {
                setSuccess(true);
                const redirectPath = tenantId 
                    ? `/admin/t/${tenantId}/organizations` 
                    : '/admin/organizations';
                
                setTimeout(() => {
                    router.push(redirectPath);
                    router.refresh();
                }, 1500);
            } else {
                setError(result.error || 'Đã xảy ra lỗi không xác định');
            }
        } catch (err: any) {
            setError(err.message || 'Lỗi server khi lưu tổ chức');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!organization || !confirm('Bạn có chắc chắn muốn xóa tổ chức này? Hành động này không thể hoàn tác.')) return;
        
        setLoading(true);
        try {
            const result = await deleteOrganization(organization.id);
            if (result.success) {
                const redirectPath = tenantId 
                    ? `/admin/t/${tenantId}/organizations` 
                    : '/admin/organizations';
                router.push(redirectPath);
                router.refresh();
            } else {
                setError(result.error || 'Lỗi khi xóa tổ chức');
            }
        } catch (err: any) {
            setError(err.message || 'Lỗi server khi xóa');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/10 backdrop-blur-md ring-1 ring-slate-200 rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-xl font-bold font-serif flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-purple-600" />
                        Thông tin Tổ chức
                    </CardTitle>
                    <CardDescription>Cấu hình các thông tin cơ bản của doanh nghiệp hoặc đối tác.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    {/* Status & Type Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="org_type" className="text-sm font-bold text-slate-700">Loại Tổ chức</Label>
                            <Select name="org_type" defaultValue={organization?.org_type || 'partner'}>
                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-purple-500">
                                    <SelectValue placeholder="Chọn loại tổ chức" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="enterprise">🏢 Doanh nghiệp Xã hội</SelectItem>
                                    <SelectItem value="ngo">🌍 Phi lợi nhuận/NGO</SelectItem>
                                    <SelectItem value="partner">🤝 Đối tác đồng hành</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold text-slate-700">Trạng thái hoạt động</Label>
                                <p className="text-xs text-slate-500">Cho phép tổ chức hiển thị trên cổng minh bạch</p>
                            </div>
                            <input type="hidden" name="is_active" value={organization?.is_active?.toString() || 'true'} />
                            <input type="hidden" name="tenant_id" value={organization?.tenant_id || tenantId || ''} />
                            <Switch 
                                defaultChecked={organization?.is_active ?? true}
                                onCheckedChange={(checked) => {
                                    const input = document.getElementsByName('is_active')[0] as HTMLInputElement;
                                    if (input) input.value = checked.toString();
                                }}
                            />
                        </div>
                    </div>

                    {/* Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-bold text-slate-700">Tên Tổ chức <span className="text-red-500">*</span></Label>
                            <Input 
                                id="name" 
                                name="name" 
                                defaultValue={organization?.name} 
                                required 
                                placeholder="VD: CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ" 
                                className="rounded-xl border-slate-200 focus:ring-purple-500 py-6"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="total_donated" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                Tổng tiền Đóng góp / Tài trợ (VNĐ)
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-slate-500 sm:text-sm font-bold">₫</span>
                                </div>
                                <Input 
                                    id="total_donated" 
                                    name="total_donated" 
                                    type="number"
                                    min="0"
                                    step="1000"
                                    defaultValue={organization?.total_donated || 0} 
                                    placeholder="0" 
                                    className="rounded-xl border-slate-200 focus:ring-purple-500 py-6 pl-8"
                                />
                            </div>
                            <p className="text-xs text-slate-500">Số tiền này sẽ được cộng dồn vào Quỹ Vì Cộng Đồng trên trang chủ.</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-bold text-slate-700">Mô tả ngắn</Label>
                        <Textarea 
                            id="description" 
                            name="description" 
                            defaultValue={organization?.description || ''} 
                            placeholder="Giới thiệu ngắn về mục tiêu và sứ mệnh của tổ chức..." 
                            className="rounded-xl border-slate-200 focus:ring-purple-500 min-h-[100px]"
                        />
                    </div>

                    {/* URLs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="logo_url" className="text-sm font-bold text-slate-700">Logo URL</Label>
                            <Input 
                                id="logo_url" 
                                name="logo_url" 
                                defaultValue={organization?.logo_url || ''} 
                                placeholder="https://example.com/logo.png" 
                                className="rounded-xl border-slate-200 focus:ring-purple-500 font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website_url" className="text-sm font-bold text-slate-700">Website URL</Label>
                            <Input 
                                id="website_url" 
                                name="website_url" 
                                defaultValue={organization?.website_url || ''} 
                                placeholder="https://example.com" 
                                className="rounded-xl border-slate-200 focus:ring-purple-500 font-mono text-sm"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error/Success Alerts */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {success && (
                <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">Đã lưu thông tin tổ chức thành công!</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-4 pt-4">
                {mode === 'edit' && (
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={handleDelete}
                        disabled={loading}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl gap-2 font-bold"
                    >
                        <Trash2 className="w-4 h-4" />
                        Xóa tổ chức
                    </Button>
                )}
                
                <div className="flex items-center gap-3 ml-auto">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => router.back()}
                        disabled={loading}
                        className="rounded-xl font-bold"
                    >
                        Hủy
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 rounded-xl px-8 gap-2 font-bold"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {mode === 'create' ? 'Tạo mới Tổ chức' : 'Cập nhật Thay đổi'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
