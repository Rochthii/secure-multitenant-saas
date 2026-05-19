'use server';

import { createClient } from '@/lib/supabase/server';

type FAQ = {
    id: string;
    question_vi: string;
    question_km?: string | null;
    question_en?: string | null;
    answer_vi: string;
    answer_km?: string | null;
    answer_en?: string | null;
    category: string;
    display_order: number;
    is_published: boolean;
    created_at: string;
    updated_at: string;
};

export async function getFAQs(category?: string): Promise<FAQ[]> {
    const supabase = await createClient();

    let query = supabase
        .from('faqs')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true });

    if (category) {
        query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching FAQs:', error);
        return [];
    }

    return (data as FAQ[]) || [];
}
