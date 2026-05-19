import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';
import { KhmerHeading } from '@/components/ui/khmer-heading';
import dynamic from 'next/dynamic';
import { getVietnamTime } from '@/lib/utils/date';

// Lazy load calendar grid as it's a heavy component
const CalendarGrid = dynamic(
    () => import('@/components/ui/calendar-grid').then(mod => ({ default: mod.CalendarGrid })),
    {
        loading: () => (
            <div className="h-96 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                <div className="text-gray-400">Loading calendar...</div>
            </div>
        ),
    }
);

type Event = Database['public']['Tables']['events']['Row'];

export async function UpcomingEventsSection() {
    try {
        const t = await getTranslations('home.events');
        const supabase = await createClient();

        // 1. Lấy thời gian hiện tại (đã được fix ở lib/utils/date)
        const today = getVietnamTime();
        
        // 2. Tính toán ngày bắt đầu hiển thị (đầu tháng trước để bao phủ lịch hiện tại)
        const startOfPeriod = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const startDateString = !isNaN(startOfPeriod.getTime()) 
            ? startOfPeriod.toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

        // 3. Truy vấn dữ liệu với error handling
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('approval_status', 'approved')
            .gte('start_date', startDateString)
            .order('start_date', { ascending: true })
            .limit(100);

        if (error) {
            console.error('[UpcomingEventsSection] Supabase error:', error);
        }

        const events: Event[] = (data as Event[]) || [];

        return (
            <section className="py-16 bg-ivory">
                <div className="container mx-auto px-4">
                    <KhmerHeading level={2} withDivider className="text-center mb-12">
                        {t('title')}
                    </KhmerHeading>

                    {/* Full Calendar Grid Component */}
                    <CalendarGrid events={events as any[]} />
                </div>
            </section>
        );
    } catch (e) {
        console.error('[UpcomingEventsSection] Critical render error:', e);
        // Trả về fallback UI thay vì crash 500
        return (
            <section className="py-16 bg-ivory">
                <div className="container mx-auto px-4 text-center">
                    <CalendarGrid events={[]} />
                </div>
            </section>
        );
    }
}
