'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTenant, updateTenant, Tenant } from '@/app/actions/admin/tenants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, Globe, Tag, Save, Loader2, LayoutTemplate, Check, Info, Copy, ExternalLink, MapPin, User, ScrollText, Moon, FileText, Sunrise, Bell, Bot } from 'lucide-react';
import { LotusIcon, DharmaWheelIcon } from '@/components/ui/khmer-icons';
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
    const [layoutStyle, setLayoutStyle] = useState(tenant?.layout_style || 'traditional');
    const [tenantType, setTenantType] = useState<string>(tenant?.tenant_type || 'tenant');
    const [domainValue, setDomainValue] = useState(tenant?.domain || (formMode === 'app-only' ? `mobile-only-${Date.now()}.app` : ''));
    const [hasWebFrontend, setHasWebFrontend] = useState(formMode === 'app-only' ? false : (tenant?.has_web_frontend !== false)); // Default false for app-only

    const isCustomDomain = domainValue && !domainValue.endsWith('.vercel.app') && domainValue !== 'localhost';

    const LAYOUT_OPTIONS = [
        { id: 'traditional', name: 'Truyền Thống', icon: Building2, bg: 'bg-[#FEF9F3]', border: 'border-[#F59E0B]', text: 'text-[#2C1810]', desc: 'Mặc định, trang nghiêm.' },
        { id: 'modern', name: 'Ánh Trăng Rằm', icon: Moon, bg: 'bg-[#0D1B2A]', border: 'border-[#C8B560]', text: 'text-[#E8E4D9]', desc: 'Hiện đại, huyền bí.' },
        { id: 'minimal', name: 'Vedanā', icon: FileText, bg: 'bg-[#FAFAF8]', border: 'border-[#B8860B]', text: 'text-[#1C1C1A]', desc: 'Tối giản, tinh tế.' },
        { id: 'lotus', name: 'Champa Neak', icon: LotusIcon, bg: 'bg-[#FDF6EE]', border: 'border-[#C73B2A]', text: 'text-[#2D1A0E]', desc: 'Văn hóa Khmer.' },
        { id: 'angkor', name: 'Prasat Khmer', icon: DharmaWheelIcon, bg: 'bg-[#2C1A0A]', border: 'border-[#D4A843]', text: 'text-[#F0E8D0]', desc: 'Kiến trúc đền đài.' },
        { id: 'zen', name: 'Anapanasati', icon: LotusIcon, bg: 'bg-[#F2F7F0]', border: 'border-[#2D6A4F]', text: 'text-[#1B4332]', desc: 'Xanh tịnh, an yên.' },
        { id: 'sunrise', name: 'Bình Minh Mekong', icon: Sunrise, bg: 'bg-[#FFF8F0]', border: 'border-[#E05C1A]', text: 'text-[#2A1506]', desc: 'Rạng rỡ Mekong.' },
        { id: 'festival', name: 'Bon Khmer', icon: Bell, bg: 'bg-[#12023A]', border: 'border-[#FFD700]', text: 'text-[#FFF8E7]', desc: 'Lễ hội rực rỡ.' },
        { id: 'ai_portal', name: 'Dharma Chat AI', icon: Bot, bg: 'bg-[#FDFAF3]', border: 'border-[#D4A843]', text: 'text-[#2C1810]', desc: 'Standalone AI Portal (Super Admin only).', superAdminOnly: true },
    ];

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.set('layout_style', layoutStyle);
        formData.set('tenant_type', tenantType);
        formData.set('has_web_frontend', String(hasWebFrontend));

        // Note: latitude/longitude are picked up directly from Input name fields unless we override them
        
        const result = mode === 'create'
            ? await createTenant(formData)
            : await updateTenant(tenant!.id, formData);

        if (result.success) {
            toast.success(mode === 'create' ? 'Đã thêm chi nhánh mới thành công!' : 'Đã cập nhật thông tin chi nhánh!');
            router.push('/admin/tenants');
            router.refresh();
        } else {
            toast.error(result.error || 'Có lỗi xảy ra, vui lòng thử lại.');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-gold-primary" />
                        {formMode === 'app-only' ? 'Khởi tạo Chi nhánh lên App (App-Only)' : (mode === 'create' ? 'Đăng ký chi nhánh mới' : 'Cập nhật thông tin chi nhánh')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    {/* Tên Chi nhánh */}
                    <div className="space-y-1.5">
                        <Label htmlFor="name">
                            Tên Chi nhánh <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Building2 className="h-4 w-4" />
                            </div>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={tenant?.name || ''}
                                placeholder="VD: Chi nhánh Kh'leang"
                                required
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* Domain - BẮT BUỘC */}
                    <div className="space-y-1.5">
                        <Label htmlFor="domain">
                            Domain (Tên miền) <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Globe className="h-4 w-4" />
                            </div>
                            <Input
                                id="domain"
                                name="domain"
                                defaultValue={tenant?.domain || ''}
                                onChange={(e) => setDomainValue(e.target.value)}
                                placeholder="VD: chuakhleang.vercel.app hoặc chuakhleang.com"
                                required
                                className="pl-9"
                            />
                        </div>
                        <p className="text-xs text-gray-400">
                            Domain chính xác mà người dùng truy cập. Hệ thống dùng giá trị này để nhận biết chi nhánh.
                        </p>

                        {/* DNS GUIDANCE */}
                        {isCustomDomain && (
                            <Alert className="bg-blue-50 border-blue-200 mt-2">
                                <Info className="h-4 w-4 text-blue-600" />
                                <AlertTitle className="text-blue-800 text-sm font-bold flex items-center gap-2">
                                    Cấu hình DNS cho tên miền riêng
                                </AlertTitle>
                                <AlertDescription className="text-blue-700 text-xs space-y-2 mt-1">
                                    <p>Để tên miền <strong>{domainValue}</strong> hoạt động, bạn cần cấu hình DNS như sau:</p>
                                    <div className="bg-white/50 p-2 rounded border border-blue-100 font-mono text-[10px] space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span>Type: <strong>A</strong></span>
                                            <span>Value: <strong>76.76.21.21</strong></span>
                                        </div>
                                        <div className="border-t border-blue-50 pt-1 flex justify-between items-center">
                                            <span>Type: <strong>CNAME</strong></span>
                                            <span>Value: <strong>cname.vercel-dns.com</strong></span>
                                        </div>
                                    </div>
                                    <p className="italic opacity-80">* Sau khi lưu, hệ thống sẽ tự động đăng ký tên miền này lên Vercel API cho bạn.</p>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Subdomain */}
                    <div className="space-y-1.5">
                        <Label htmlFor="subdomain">
                            Subdomain <span className="text-gray-400 font-normal text-xs">(tùy chọn — nếu dùng subdomain riêng)</span>
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Tag className="h-4 w-4" />
                            </div>
                            <Input
                                id="subdomain"
                                name="subdomain"
                                defaultValue={tenant?.subdomain || ''}
                                placeholder="VD: khleang"
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* Tenant Type */}
                    <div className="space-y-1.5 pt-2">
                        <Label htmlFor="tenant_type">
                            Loại Tổ chức <span className="text-red-500">*</span>
                        </Label>
                        <select
                            id="tenant_type"
                            name="tenant_type"
                            value={tenantType}
                            onChange={(e) => setTenantType(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        >
                            <option value="tenant">Chi nhánh / Tự viện</option>
                            <option value="company">Doanh nghiệp / Công ty</option>
                            <option value="ngo">Tổ chức Phi lợi nhuận (NGO) / Cộng đồng</option>
                        </select>
                        <p className="text-xs text-gray-400">
                            Xác định tính năng và giao diện mặc định phù hợp với loại tổ chức.
                        </p>
                    </div>

                    {/* Mobile Ecosystem Configuration - Super Admin Only */}
                    {role === 'super_admin' && (
                        <div className="space-y-4 pt-4 p-5 bg-amber-50/50 rounded-2xl border border-amber-200/50 shadow-sm transition-all animate-in fade-in slide-in-from-top-2">
                             <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-amber-100 rounded-lg">
                                    <Globe className="w-4 h-4 text-amber-700" />
                                </div>
                                <Label className="text-base font-bold text-amber-900">
                                    Cấu hình Hệ sinh thái Mobile
                                </Label>
                                <Badge variant="outline" className="ml-auto bg-amber-100/50 border-amber-200 text-amber-700 text-[10px] uppercase font-bold tracking-wider">
                                    Super Admin Only
                                </Badge>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="latitude" className="text-xs font-semibold text-amber-800">
                                        Vĩ độ (Latitude)
                                    </Label>
                                    <Input
                                        id="latitude"
                                        name="latitude"
                                        type="number"
                                        step="any"
                                        defaultValue={tenant?.latitude || ''}
                                        placeholder="VD: 10.7769"
                                        className="bg-white border-amber-200 focus:ring-amber-500"
                                        required={formMode === 'app-only'}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="longitude" className="text-xs font-semibold text-amber-800">
                                        Kinh độ (Longitude)
                                    </Label>
                                    <Input
                                        id="longitude"
                                        name="longitude"
                                        type="number"
                                        step="any"
                                        defaultValue={tenant?.longitude || ''}
                                        placeholder="VD: 106.7009"
                                        className="bg-white border-amber-200 focus:ring-amber-500"
                                        required={formMode === 'app-only'}
                                    />
                                </div>
                             </div>

                             {/* Specialized App-Only Fields: Abbot & History */}
                             <div className="space-y-4 pt-2 border-t border-amber-100">
                                <div className="space-y-1.5">
                                    <Label htmlFor="abbot" className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" />
                                        Giám đốc / Trưởng chi nhánh
                                    </Label>
                                    <Input
                                        id="abbot"
                                        name="abbot"
                                        defaultValue={tenant?.contact_info?.abbot || ''}
                                        placeholder="VD: Nguyễn Văn A"
                                        className="bg-white border-amber-200 focus:ring-amber-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="history" className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                                        <ScrollText className="w-3.5 h-3.5" />
                                        Lịch sử tóm tắt (Brief History)
                                    </Label>
                                    <Textarea
                                        id="history"
                                        name="history"
                                        defaultValue={tenant?.contact_info?.history || ''}
                                        placeholder="VD: Chi nhánh được thành lập vào năm 1940..."
                                        className="bg-white border-amber-200 focus:ring-amber-500 min-h-[100px]"
                                    />
                                </div>
                             </div>

                            <div className="flex items-center justify-between pt-2 border-t border-amber-100">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold text-amber-900 pointer-events-none">
                                        Chỉ hiển thị trên Mobile App
                                    </Label>
                                    <p className="text-[11px] text-amber-700 leading-tight">
                                        (App-Only Tenant) Cột has_web_frontend = false. <br/>
                                        Không tạo Website, ẩn khỏi Agency Admin.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setHasWebFrontend(!hasWebFrontend)}
                                    className={`
                                        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
                                        ${!hasWebFrontend ? 'bg-amber-600' : 'bg-slate-200'}
                                    `}
                                >
                                    <span
                                        className={`
                                            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                            ${!hasWebFrontend ? 'translate-x-5' : 'translate-x-0'}
                                        `}
                                    />
                                </button>
                                <input type="hidden" name="has_web_frontend" value={String(hasWebFrontend)} />
                            </div>
                        </div>
                    )}

                    {/* Hiển thị trên Web (Agency Admin Control - Disabled for App-Only) */}
                    {role !== 'super_admin' && (
                        <div className="space-y-3 pt-2 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-blue-500" />
                                        Chế độ hiển thị Web công khai
                                    </Label>
                                    <p className="text-xs text-gray-500">
                                        Nếu tắt, chi nhánh này sẽ bị ẩn khỏi danh sách của Đại lý (Agency Admin).
                                    </p>
                                </div>
                                <Badge variant="secondary" className="bg-slate-200 text-slate-600">
                                    {hasWebFrontend ? 'Đang bật' : 'Đang tắt'}
                                </Badge>
                            </div>
                        </div>
                    )}

                    {/* Layout Style */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold flex items-center gap-2">
                            <LayoutTemplate className="w-5 h-5 text-gold-primary" />
                            Kiểu trang chủ và Chủ đề màu sắc
                        </Label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {LAYOUT_OPTIONS.filter(style => !style.superAdminOnly || role === 'super_admin').map((style) => {
                                const StyleIcon = style.icon;
                                return (
                                    <button
                                        key={style.id}
                                    type="button"
                                    onClick={() => setLayoutStyle(style.id)}
                                    className={`
                                        relative flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-200 text-left
                                        ${style.bg} ${style.text}
                                        ${layoutStyle === style.id
                                            ? `ring-2 ring-offset-2 ring-gold-primary ${style.border} shadow-lg scale-[1.02]`
                                            : 'border-transparent opacity-80 hover:opacity-100 hover:scale-[1.01] grayscale-[0.3] hover:grayscale-0'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <StyleIcon className="w-5 h-5 shrink-0" />
                                        <span className="font-bold text-sm uppercase tracking-wide">{style.name}</span>
                                        {layoutStyle === style.id && (
                                            <div className="absolute top-2 right-2 bg-gold-primary text-white rounded-full p-0.5 shadow-sm">
                                                <Check className="w-3.5 h-3.5" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs opacity-80 line-clamp-1">{style.desc}</p>

                                    {/* Gradient overlay for premium feel */}
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-black/5 pointer-events-none" />
                                </button>
                                );
                            })}
                        </div>
                        <p className="text-xs text-gray-500 italic mt-2">
                            * Lưu ý: Khi đổi Kiểu trang chủ, các Palette màu sắc tương ứng sẽ được áp dụng tự động để đảm bảo tính thẩm mỹ cao nhất.
                        </p>
                    </div>

                    {/* Submit */}
                    <div className="pt-2 flex gap-3">
                        <Button type="submit" disabled={loading} className="gap-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {mode === 'create' ? 'Đăng ký chi nhánh' : 'Lưu thay đổi'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/admin/tenants')}
                            disabled={loading}
                        >
                            Hủy
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* SYNC OPTIONS CARD - NEW SECTION */}
            <Card className="mt-5 border-blue-100 bg-blue-50/20">
                <CardHeader className="py-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-800">
                        <Bell className="w-4 h-4" />
                        Đồng bộ nội dung từ Hệ thống
                    </CardTitle>
                </CardHeader>
                <CardContent className="py-2 pb-5 space-y-4">
                    <p className="text-xs text-blue-700/80 leading-relaxed italic">
                        Lưu ý: Khi bật các tùy chọn này, hệ thống sẽ tự động &quot;phát&quot; (broadcast) các thông báo/tài liệu hiện có từ Hội sở chính sang chi nhánh này.
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-50 transition-colors">
                            <input type="checkbox" name="sync_news" value="true" className="w-4 h-4 accent-blue-600" />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-800">Đồng bộ Tin tức</span>
                                <span className="text-[10px] text-slate-500 italic">Áp dụng cho tất cả tin tức đang hiển thị của Hội sở chính.</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-50 transition-colors">
                            <input type="checkbox" name="sync_dharma" value="true" className="w-4 h-4 accent-blue-600" />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-800">Đồng bộ E-Learning</span>
                                <span className="text-[10px] text-slate-500 italic">Áp dụng cho toàn bộ danh sách tài liệu hệ thống.</span>
                            </div>
                        </label>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
