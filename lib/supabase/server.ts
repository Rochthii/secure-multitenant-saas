import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    } catch (error) {
                        // Server Component - cookies can only be modified in Server Actions
                    }
                },
            },
        }
    );
}

/**
 * Admin client dùng SERVICE_ROLE_KEY.
 * QUAN TRỌNG: phải dùng createClient từ @supabase/supabase-js (KHÔNG phải @supabase/ssr).
 * Lý do: @supabase/ssr sẽ đính kèm cookie auth → Supabase vẫn chạy dưới authenticated role
 * thay vì service_role → gây "permission denied for table users".
 * Client thuần không có cookie nên Supabase nhận đúng service_role và bypass toàn bộ RLS.
 */
export async function createAdminClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined. Please add it to your .env.local file.');
    }

    return createSupabaseClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}

