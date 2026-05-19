import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import { getHeroSlides, deleteHeroSlide } from '@/app/actions/admin/hero-slides';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { requireTenantAccess } from '@/lib/permissions';

export default async function HeroSlidesPage({ params }: { params: Promise<{ tenant_id: string }> }) {
    const { tenant_id: tenantId } = await params;
    await requireTenantAccess(tenantId);
    const slides = await getHeroSlides(tenantId);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Hero Slides</h1>
                    <p className="text-muted-foreground mt-1">
                        Quản lý các slide hiển thị trên trang chủ
                    </p>
                </div>
                <Link href={`/admin/t/${tenantId}/homepage/slides/create`}>
                    <Button className="bg-gold-primary hover:bg-gold-dark">
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm Slide mới
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-white">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Order</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Hình ảnh</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tiêu đề (VI)</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Trạng thái</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Ngày tạo</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {slides.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                        Chưa có slide nào. Hãy tạo mới ngay!
                                    </td>
                                </tr>
                            ) : (
                                slides.map((slide: any) => (
                                    <tr key={slide.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{slide.order_position}</td>
                                        <td className="p-4 align-middle">
                                            <div className="relative h-16 w-28 overflow-hidden rounded-md border bg-muted">
                                                <Image
                                                    src={slide.image_url}
                                                    alt={slide.title_vi}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="font-medium">{slide.title_vi}</div>
                                            <div className="text-xs text-muted-foreground line-clamp-1">{slide.subtitle_vi}</div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <Badge variant={slide.is_active ? 'default' : 'secondary'}>
                                                {slide.is_active ? 'Hoạt động' : 'Ẩn'}
                                            </Badge>
                                        </td>
                                        <td className="p-4 align-middle">
                                            {format(new Date(slide.created_at), 'dd/MM/yyyy', { locale: vi })}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/t/${tenantId}/homepage/slides/${slide.id}`}>
                                                    <Button variant="ghost" size="icon">
                                                        <Pencil className="h-4 w-4" />
                                                        <span className="sr-only">Sửa</span>
                                                    </Button>
                                                </Link>
                                                <form action={async () => {
                                                    'use server';
                                                    await deleteHeroSlide(tenantId, slide.id);
                                                }}>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Xóa</span>
                                                    </Button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
