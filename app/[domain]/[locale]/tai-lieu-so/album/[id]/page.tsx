import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { KhmerHeading } from '@/components/ui/khmer-heading';
import { AlbumDetailClient } from '@/components/gallery/album-detail-client';
import { ArrowLeft, Calendar, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ id: string, locale: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data } = await supabase.from('categories').select('name_vi').eq('id', id).single();

    return {
        title: data ? `${data.name_vi} | Thư Viện Ảnh` : 'Album Ảnh',
    };
}

export default async function AlbumPage({
    params,
}: {
    params: Promise<{ id: string, locale: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    // Lấy thông tin Album
    const { data: album } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .eq('module', 'media')
        .single();

    if (!album) {
        notFound();
    }

    // Lấy danh sách ảnh
    const { data: images } = await supabase
        .from('media')
        .select('*')
        .eq('category_id', id)
        .eq('type', 'image')
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-stone-50/40">
            {/* ── Header Banner ── */}
            <div className="relative bg-coffee-dark py-16 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0di00aC0ydi00aC00di0ySDI2djJoLTR2NGgtMnY0aDJ2NGg0djJoNHYtMmg0di00aDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
                <div className="relative z-10 container mx-auto px-4 text-center">
                    <KhmerHeading level={1} className="!text-white !text-3xl lg:!text-5xl mb-4 uppercase tracking-tighter" withDivider={false}>
                        {album.name_vi}
                    </KhmerHeading>
                    <div className="w-16 h-1 bg-gold-primary mx-auto mb-6" />
                    <div className="flex items-center justify-center gap-4 text-stone-300/80 text-sm font-medium">
                        <span className="flex items-center gap-1.5"><ImageIcon className="w-4 h-4 text-gold-primary" /> {images?.length || 0} ảnh</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-600" />
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gold-primary" /> {new Date(album.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 relative z-20">
                <Link
                    href="/tai-lieu-so?tab=albums"
                    className="inline-flex items-center gap-2 text-stone-500 hover:text-gold-dark font-medium text-sm transition-colors mb-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-stone-100"
                >
                    <ArrowLeft className="w-4 h-4" /> Quay lại Thư Viện Ảnh
                </Link>

                <AlbumDetailClient images={images || []} />
            </div>

            <div className="py-20" />
        </div>
    );
}
