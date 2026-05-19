import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { requireVolunteer } from '@/lib/auth/require-admin';
import { NewsForm } from '@/components/admin/news-form';
import { notFound, redirect } from 'next/navigation';

export default async function VolunteerNewsEditPage({ params }: { params: Promise<{ id: string }> }) {
    // Auth guard
    let volunteerUser;
    try {
        volunteerUser = await requireVolunteer();
    } catch {
        redirect('/login');
    }

    const { id } = await params;
    const supabase = await createClient(); // Use standard client to enforce RLS

    const currentUserRole = ((volunteerUser?.app_metadata?.role ?? volunteerUser?.user_metadata?.role) as string) || 'volunteer';

    // Fetch categories
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('module', 'news')
        .order('name_vi');

    // Create new
    if (id === 'new') {
        return (
            <div className="max-w-6xl mx-auto p-4 md:p-8">
                <NewsForm categories={categories || []} currentUserRole={currentUserRole} />
            </div>
        );
    }

    // Edit existing - RLS will block if the news belongs to someone else and user doesn't have read access
    const { data: news, error } = await supabase
        .from('news')
        .select('*, categories(name_vi)')
        .eq('id', id)
        .single();

    if (!news || error) {
        notFound();
    }

    // Additional check just in case, though RLS should handle this.
    if (currentUserRole === 'volunteer' && news.author_id !== volunteerUser.id) {
        return (
            <div className="max-w-6xl mx-auto p-4 md:p-8 text-center text-red-500 mt-20">
                <h2 className="text-2xl font-bold">Lỗi Quyền Truy Cập</h2>
                <p>Bạn không có quyền chỉnh sửa bài viết của người khác.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <NewsForm news={news} categories={categories || []} currentUserRole={currentUserRole} />
        </div>
    );
}
