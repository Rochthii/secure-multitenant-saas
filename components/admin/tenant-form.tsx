'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTenant, updateTenant, Tenant } from '@/app/actions/admin/tenants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, Globe, Tag, Save, Loader2, LayoutTemplate, Check, Info, MapPin, User, ScrollText, Sunrise, Bell, Shield, Layers, Leaf, Eye } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface TenantFormProps {
    mode: 'create' | 'edit';
    tenant?: Tenant;
    role?: string;
    formMode?: 'app-only' | 'default';
}

export function TenantForm({ mode, tenant, role, formMode }: TenantFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [layoutStyle, setLayoutStyle] = useState(tenant?.layout_style || 'saas_violet');
    const [tenantType, setTenantType] = useState<string>(tenant?.tenant_type || 'company');
    const [domainValue, setDomainValue] = useState(tenant?.domain || '');
    const [hasWebFrontend, setHasWebFrontend] = useState(tenant?.has_web_frontend !== false);

    const isCustomDomain = domainValue && !domainValue.endsWith('.vercel.app') && domainValue !== 'localhost';

    // ── LAYOUT OPTIONS ──
    // Redesigned to be 100% professional B2B Enterprise layouts
    const LAYOUT_OPTIONS = [
        { 
            id: 'saas_violet', 
            name: 'Violet Premium', 
            icon: Layers, 
            bg: 'bg-slate-950', 
            border: 'border-violet-600', 
            text: 'text-violet-400', 
            desc: 'Phong cách SaaS công nghệ cao, hiện đại và đột phá.' 
        },
        { 
            id: 'corp_navy', 
            name: 'Corporate Navy', 
            icon: Shield, 
            bg: 'bg-slate-900', 
            border: 'border-blue-600', 
            text: 'text-blue-400', 
            desc: 'Xanh Navy truyền thống, uy tín và chuyên nghiệp cho tập đoàn.' 
        },
        { 
            id: 'charity_green', 
            name: 'Social Green', 
            icon: Leaf, 
            bg: 'bg-zinc-950', 
            border: 'border-emerald-600', 
            text: 'text-emerald-400', 
            desc: 'Thân thiện, tối ưu cho các tổ chức xã hội, NGO bền vững.' 
        },
        { 
            id: 'creative_amber', 
            name: 'Creative Amber', 
            icon: Sunrise, 
            bg: 'bg-stone-950', 
            border: 'border-amber-600', 
            text: 'text-amber-400', 
            desc: 'Tone màu ấm cúng, phù hợp cho doanh nghiệp dịch vụ và sáng tạo.' 
        },
        { 
            id: 'minimal_white', 
            name: 'Clean Minimalist', 
            icon: Eye, 
            bg: 'bg-white', 
            border: 'border-slate-800', 
            text: 'text-slate-900', 
            desc: 'Trắng/Đen tối giản tối đa, tập trung vào hiệu suất và nội dung.' 
        },
    ];

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.set('layout_style', layoutStyle);
        formData.set('tenant_type', tenantType);
        formData.set('has_web_frontend', String(hasWebFrontend));

        const result = mode === 'create'
            ? await createTenant(formData)
            : await updateTenant(tenant!.id, formData);

        if (result.success) {
            toast.success(mode === 'create' ? 'Đã khởi tạo Workspace mới thành công!' : 'Đã cập nhật thông tin Workspace!');
            router.push('/admin/tenants');
            router.refresh();
        } else {
            toast.error(result.error || 'Có lỗi xảy ra, vui lòng thử lại.');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card className="border-white/[0.08] bg-slate-900/60 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Building2 className="w-5 h-5 text-violet-400" />
                        {mode === 'create' ? 'Đăng ký Workspace mới' : 'Cập nhật cấu hình Workspace'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 text-slate-300">
                    {/* Tên Workspace */}
                    <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-slate-200 font-bold">
                            Tên Workspace / Doanh nghiệp <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                <Building2 className="h-4 w-4" />
                            </div>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={tenant?.name || ''}
                                placeholder="VD: Acme Corporation"
                                required
                                className="pl-9 bg-slate-950/50 border-white/10 text-white focus:ring-violet-500 placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    {/* Domain */}
                    <div className="space-y-1.5">
                        <Label htmlFor="domain" className="text-slate-200 font-bold">
                            Tên miền (Domain) <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                <Globe className="h-4 w-4" />
                            </div>
                            <Input
                                id="domain"
                                name="domain"
                                defaultValue={tenant?.domain || ''}
                                onChange={(e) => setDomainValue(e.target.value)}
                                placeholder="VD: acme.com hoặc acme.saas.app"
                                required
                                className="pl-9 bg-slate-950/50 border-white/10 text-white focus:ring-violet-500 placeholder:text-slate-600"
                            />
                        </div>
                        <p className="text-xs text-slate-500">
                            Hệ thống dùng tên miền này để tự động nhận dạng Workspace tương ứng khi truy cập.
                        </p>

                        {/* DNS Guidance */}
                        {isCustomDomain && (
                            <Alert className="bg-violet-950/40 border-violet-500/30 mt-2 text-violet-200">
                                <Info className="h-4 w-4 text-violet-400" />
                                <AlertTitle className="text-violet-300 text-sm font-bold flex items-center gap-2">
                                    Cấu hình DNS cho tên miền riêng
                                </AlertTitle>
                                <AlertDescription className="text-violet-400/90 text-xs space-y-2 mt-1">
                                    <p>Để tên miền <strong>{domainValue}</strong> hoạt động chuẩn xác, vui lòng cấu hình DNS:</p>
                                    <div className="bg-slate-950/60 p-3 rounded border border-white/10 font-mono text-[10px] space-y-1 text-slate-300">
                                        <div className="flex justify-between items-center">
                                            <span>Type: <strong>A</strong></span>
                                            <span>Value: <strong>76.76.21.21</strong></span>
                                        </div>
                                        <div className="border-t border-white/5 pt-1 flex justify-between items-center">
                                            <span>Type: <strong>CNAME</strong></span>
                                            <span>Value: <strong>cname.vercel-dns.com</strong></span>
                                        </div>
                                    </div>
                                    <p className="italic opacity-80">* Sau khi lưu, tên miền sẽ tự động được liên kết và thiết lập SSL Certificate.</p>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Subdomain */}
                    <div className="space-y-1.5">
                        <Label htmlFor="subdomain" className="text-slate-200 font-bold">
                            Subdomain Định danh
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                <Tag className="h-4 w-4" />
                            </div>
                            <Input
                                id="subdomain"
                                name="subdomain"
                                defaultValue={tenant?.subdomain || ''}
                                placeholder="VD: acme"
                                className="pl-9 bg-slate-950/50 border-white/10 text-white focus:ring-violet-500 placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    {/* Tenant Type */}
                    <div className="space-y-1.5 pt-2">
                        <Label htmlFor="tenant_type" className="text-slate-200 font-bold">
                            Mô hình Hoạt động <span className="text-red-500">*</span>
                        </Label>
                        <select
                            id="tenant_type"
                            name="tenant_type"
                            value={tenantType}
                            onChange={(e) => setTenantType(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                            required
                        >
                            <option value="company" className="bg-slate-900">Doanh nghiệp / Công ty</option>
                            <option value="ngo" className="bg-slate-900">Tổ chức Phi lợi nhuận (NGO) / Cộng đồng</option>
                            <option value="tenant" className="bg-slate-900">Đơn vị thành viên / Workspace nội bộ</option>
                        </select>
                        <p className="text-xs text-slate-500">
                            Xác định các phân hệ tính năng và quyền hạn mặc định tối ưu nhất cho tổ chức.
                        </p>
                    </div>

                    {/* Mobile Ecosystem Config - Super Admin Only */}
                    {role === 'super_admin' && (
                        <div className="space-y-4 pt-4 p-5 bg-violet-950/20 rounded-2xl border border-violet-500/20 shadow-sm">
                             <div className="flex items-center gap-2 mb-2">
                                 <div className="p-1.5 bg-violet-500/10 rounded-lg">
                                     <Globe className="w-4 h-4 text-violet-400" />
                                 </div>
                                 <Label className="text-base font-bold text-violet-300">
                                     Tích hợp Tọa độ & Định vị Địa lý
                                 </Label>
                                 <Badge variant="outline" className="ml-auto bg-violet-500/10 border-violet-500/30 text-violet-400 text-[10px] uppercase font-bold tracking-wider">
                                     Super Admin Only
                                 </Badge>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="latitude" className="text-xs font-semibold text-slate-300">
                                        Vĩ độ (Latitude)
                                    </Label>
                                    <Input
                                        id="latitude"
                                        name="latitude"
                                        type="number"
                                        step="any"
                                        defaultValue={tenant?.latitude || ''}
                                        placeholder="VD: 10.7769"
                                        className="bg-slate-950/50 border-white/10 text-white focus:ring-violet-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="longitude" className="text-xs font-semibold text-slate-300">
                                        Kinh độ (Longitude)
                                    </Label>
                                    <Input
                                        id="longitude"
                                        name="longitude"
                                        type="number"
                                        step="any"
                                        defaultValue={tenant?.longitude || ''}
                                        placeholder="VD: 106.7009"
                                        className="bg-slate-950/50 border-white/10 text-white focus:ring-violet-500"
                                    />
                                </div>
                             </div>

                             {/* Specialized Fields */}
                             <div className="space-y-4 pt-2 border-t border-white/5">
                                <div className="space-y-1.5">
                                    <Label htmlFor="abbot" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-violet-400" />
                                        Người đại diện pháp luật / Giám đốc điều hành (CEO)
                                    </Label>
                                    <Input
                                        id="abbot"
                                        name="abbot"
                                        defaultValue={tenant?.contact_info?.abbot || ''}
                                        placeholder="VD: Nguyễn Văn A"
                                        className="bg-slate-950/50 border-white/10 text-white focus:ring-violet-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="history" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                        <ScrollText className="w-3.5 h-3.5 text-violet-400" />
                                        Giới thiệu doanh nghiệp ngắn (About Overview)
                                    </Label>
                                    <Textarea
                                        id="history"
                                        name="history"
                                        defaultValue={tenant?.contact_info?.history || ''}
                                        placeholder="VD: Được thành lập với mục tiêu cung cấp giải pháp chuyển đổi số toàn diện..."
                                        className="bg-slate-950/50 border-white/10 text-white focus:ring-violet-500 min-h-[100px] placeholder:text-slate-600"
                                    />
                                </div>
                             </div>
                        </div>
                    )}

                    {/* Layout Style Selector */}
                    <div className="space-y-3 pt-2">
                        <Label className="text-base font-bold flex items-center gap-2 text-white">
                            <LayoutTemplate className="w-5 h-5 text-violet-400" />
                            Giao diện Trang chủ & Theme hệ thống
                        </Label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {LAYOUT_OPTIONS.map((style) => {
                                const StyleIcon = style.icon;
                                return (
                                    <button
                                        key={style.id}
                                        type="button"
                                        onClick={() => setLayoutStyle(style.id)}
                                        className={`
                                            relative flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-200 text-left w-full
                                            bg-slate-950/60 border-white/5 text-slate-300 hover:border-white/10
                                            ${layoutStyle === style.id
                                                ? `ring-2 ring-violet-500/50 ${style.border} bg-slate-900 shadow-xl scale-[1.01]`
                                                : 'opacity-70 hover:opacity-100'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <StyleIcon className={`w-5 h-5 shrink-0 ${layoutStyle === style.id ? style.text : 'text-slate-400'}`} />
                                            <span className="font-bold text-sm uppercase tracking-wide text-white">{style.name}</span>
                                            {layoutStyle === style.id && (
                                                <div className="absolute top-2 right-2 bg-violet-600 text-white rounded-full p-0.5 shadow-sm">
                                                    <Check className="w-3.5 h-3.5" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 line-clamp-2">{style.desc}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex gap-3">
                        <Button type="submit" disabled={loading} className="gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-6">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {mode === 'create' ? 'Khởi tạo Workspace' : 'Lưu thay đổi'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/admin/tenants')}
                            disabled={loading}
                            className="bg-transparent border-white/10 text-slate-300 hover:bg-white/5"
                        >
                            Hủy
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* SYNC OPTIONS CARD */}
            <Card className="mt-5 border-violet-500/20 bg-violet-950/10">
                <CardHeader className="py-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-violet-300">
                        <Bell className="w-4 h-4 text-violet-400" />
                        Đồng bộ dữ liệu nền tảng
                    </CardTitle>
                </CardHeader>
                <CardContent className="py-2 pb-5 space-y-4 text-slate-400">
                    <p className="text-xs leading-relaxed italic text-slate-500">
                        Lưu ý: Bật các tùy chọn này để tự động cập nhật và phân phối các thông cáo báo chí, văn bản hướng dẫn nghiệp vụ chung từ Tổng công ty sang Workspace mới.
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-3 p-3 bg-slate-950/30 rounded-lg border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
                            <input type="checkbox" name="sync_news" value="true" className="w-4 h-4 accent-violet-500 rounded" />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-200">Đồng bộ Tin tức & Truyền thông hệ thống</span>
                                <span className="text-[10px] text-slate-500 italic">Áp dụng cho toàn bộ thông cáo và tin tức hoạt động chung.</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-slate-950/30 rounded-lg border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
                            <input type="checkbox" name="sync_dharma" value="true" className="w-4 h-4 accent-violet-500 rounded" />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-200">Đồng bộ Tài liệu & Quy trình vận hành (SOP)</span>
                                <span className="text-[10px] text-slate-500 italic">Áp dụng cho các tài liệu hướng dẫn và đào tạo chuẩn hóa.</span>
                            </div>
                        </label>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
