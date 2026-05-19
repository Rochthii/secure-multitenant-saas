import { requireTenantAccess, isGlobalAdmin } from '@/lib/permissions';
import { getSiteSettings } from '@/lib/site-settings';
import { ThemeSettingsClient } from '@/app/admin/tenants/[id]/theme/theme-settings-client';
import { Palette, LayoutDashboard, ImageIcon, ExternalLink } from 'lucide-react';
import { getLayoutBlocks } from '@/app/actions/admin/layout-blocks';
import { getTenant } from '@/app/actions/admin/tenants';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDesignerClient } from '@/components/admin/layout-designer-client';

export default async function HomepageManagerPage({
    params,
}: {
    params: Promise<{ tenant_id: string }>;
}) {
    const { tenant_id } = await params;
    await requireTenantAccess(tenant_id);

    const blocks = await getLayoutBlocks(tenant_id);
    const { tenant } = await getTenant(tenant_id);
    const showThemeTab = await isGlobalAdmin();
    const settings = showThemeTab ? await getSiteSettings(tenant_id) : {};

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-slate-900 p-8 rounded-3xl text-white mb-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-playfair font-black tracking-tight">Thiết kế & Kiến trúc Trang chủ</h1>
                    <p className="text-slate-400 mt-1.5 text-sm max-w-xl">
                        Tùy biến cấu trúc hiển thị, sắp xếp các khối chức năng (Bento Grid, Impact Stats) và quản trị trải nghiệm người dùng cuối.
                    </p>
                </div>
                <Link href="/" target="_blank" className="relative z-10">
                    <Button variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl transition-all">
                        <ExternalLink className="h-4 w-4" />
                        Preview Portal
                    </Button>
                </Link>
            </div>

            <Tabs defaultValue="layout" className="w-full">
                <TabsList className="bg-slate-100 p-1 rounded-xl h-12">
                    <TabsTrigger value="layout" className="gap-2 px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                        <LayoutDashboard className="h-4 w-4" />
                        Cấu trúc Layout
                    </TabsTrigger>
                    <TabsTrigger value="slides" className="gap-2 px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                        <ImageIcon className="h-4 w-4" />
                        Banner quảng bá
                    </TabsTrigger>
                    {showThemeTab && (
                        <TabsTrigger value="theme" className="gap-2 px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                            <Palette className="h-4 w-4" />
                            Nhận diện thương hiệu
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* Tab 1: Layout Designer */}
                <TabsContent value="layout" className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                            <CardTitle className="text-xl font-black flex items-center gap-3 text-slate-900">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                                    <LayoutDashboard className="h-5 w-5" />
                                </div>
                                Sắp xếp các phân vùng nội dung
                            </CardTitle>
                            <p className="text-sm text-slate-500 mt-1">
                                Kéo thả để thay đổi trình tự hiển thị • Bật/Tắt các Module doanh nghiệp
                            </p>
                        </CardHeader>
                        <CardContent className="p-8">
                            <LayoutDesignerClient
                                tenantId={tenant_id}
                                tenantType={(tenant as any)?.tenant_type}
                                initialBlocks={blocks}
                                initialThemeColors={tenant?.theme_colors}
                                isSuperAdmin={showThemeTab}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 3: Hero Slides Quick Link */}
                <TabsContent value="slides" className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                            <CardTitle className="text-xl font-black text-slate-900">Banner & Media Header</CardTitle>
                        </CardHeader>
                        <CardContent className="p-12">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner border border-indigo-100">
                                    <ImageIcon className="h-10 w-10" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-3">Quản trị Marketing Banners</h3>
                                <p className="text-slate-500 mb-8 max-w-lg leading-relaxed">
                                    Thiết lập các slides trình chiếu tại vị trí quan trọng nhất của Portal. 
                                    Hỗ trợ Call-to-Action (CTA), Tiêu đề động và Hình ảnh chất lượng cao.
                                </p>
                                <Link href={`/admin/t/${tenant_id}/homepage/slides`}>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 px-8 py-6 h-auto text-base font-bold gap-3">
                                        <ImageIcon className="h-5 w-5" />
                                        Mở trình quản lý Banner
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                {/* Tab 4: Theme Settings (Super Admin Only) */}
                {showThemeTab && (
                    <TabsContent value="theme" className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                                <CardTitle className="text-xl font-black flex items-center gap-3 text-slate-900">
                                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                                        <Palette className="h-5 w-5" />
                                    </div>
                                    Thiết lập Visual Identity
                                </CardTitle>
                                <p className="text-sm text-slate-500 mt-1">
                                    Cấu hình Palette màu sắc hệ thống và quy chuẩn thiết kế thương hiệu
                                </p>
                            </CardHeader>
                            <CardContent className="p-8">
                                <ThemeSettingsClient 
                                    initialSettings={settings} 
                                    tenantId={tenant_id} 
                                    tenantName={tenant?.name || ''} 
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
