import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, ArrowUpDown, Image as ImageIcon } from 'lucide-react';
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
                    <h1 className="text-3xl font-bold tracking-tight text-white">Hero Slides</h1>
                    <p className="text-slate-400 mt-1 text-sm">
                        Quản lý các slide hiển thị trên banner trang chủ
                    </p>
                </div>
                <Link href={`/admin/t/${tenantId}/homepage/slides/create`}>
                    <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
                        <Plus className="h-4 w-4 stroke-[3]" />
                        Thêm Slide mới
                    </Button>
                </Link>
            </div>

            <div className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-slate-200">
                        <thead>
                            <tr className="border-b border-white/[0.08] bg-slate-950/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="h-12 px-6 text-left align-middle font-medium">Thứ tự</th>
                                <th className="h-12 px-6 text-left align-middle font-medium">Hình ảnh</th>
                                <th className="h-12 px-6 text-left align-middle font-medium">Tiêu đề (VI)</th>
                                <th className="h-12 px-6 text-left align-middle font-medium">Trạng thái</th>
                                <th className="h-12 px-6 text-left align-middle font-medium">Ngày tạo</th>
                                <th className="h-12 px-6 text-right align-middle font-medium">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.06]">
                            {slides.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500 italic text-sm">
                                        Chưa có slide nào. Hãy tạo mới ngay để làm đẹp trang chủ!
                                    </td>
                                </tr>
                            ) : (
                                slides.map((slide: any) => (
                                    <tr key={slide.id} className="transition-colors hover:bg-white/5">
                                        <td className="p-6 align-middle font-mono font-bold text-amber-500">
                                            {slide.order_position}
                                        </td>
                                        <td className="p-6 align-middle">
                                            <div className="relative h-16 w-28 overflow-hidden rounded-xl border border-white/10 bg-slate-950/60 shadow-sm flex items-center justify-center">
                                                {slide.image_url ? (
                                                    <Image
                                                        src={slide.image_url}
                                                        alt={slide.title_vi}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <ImageIcon className="w-6 h-6 text-slate-600" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6 align-middle">
                                            <div className="font-bold text-slate-200">{slide.title_vi}</div>
                                            <div className="text-xs text-slate-400 line-clamp-1 mt-0.5 max-w-md">{slide.subtitle_vi || 'Không có mô tả phụ'}</div>
                                        </td>
                                        <td className="p-6 align-middle">
                                            <Badge className={slide.is_active 
                                                ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-bold px-2 py-0.5 text-[10px]' 
                                                : 'bg-slate-950/50 border border-white/10 text-slate-400 font-normal px-2 py-0.5 text-[10px]'
                                            }>
                                                {slide.is_active ? 'Hoạt động' : 'Đang ẩn'}
                                            </Badge>
                                        </td>
                                        <td className="p-6 align-middle text-slate-400 text-xs font-mono">
                                            {format(new Date(slide.created_at), 'dd/MM/yyyy', { locale: vi })}
                                        </td>
                                        <td className="p-6 align-middle text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/t/${tenantId}/homepage/slides/${slide.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 bg-slate-950/40 hover:bg-white/5 border border-white/[0.06] text-slate-400 hover:text-white rounded-lg transition-colors" title="Chỉnh sửa slide">
                                                        <Pencil className="h-4 w-4" />
                                                        <span className="sr-only">Sửa</span>
                                                    </Button>
                                                </Link>
                                                <form action={async () => {
                                                    'use server';
                                                    await deleteHeroSlide(tenantId, slide.id);
                                                }}>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 bg-slate-950/40 hover:bg-red-950/30 border border-white/[0.06] text-slate-400 hover:text-red-400 rounded-lg transition-colors" title="Xóa slide">
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
