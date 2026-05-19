import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';
import { KhmerHeading } from '@/components/ui/khmer-heading';
import { RegistrationForm } from '@/components/events/registration-form';
import { getTenantConfig } from '@/lib/tenant';

type Event = Database['public']['Tables']['events']['Row'];

export default async function EventRegistrationSlugPage({
    params,
}: {
    params: Promise<{ domain: string; slug: string; locale: string }>;
}) {
    const { domain, slug } = await params;
    const supabase = await createClient();
    const tenant = await getTenantConfig(domain);
    const tenantId = tenant?.id;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    // Fetch event by slug or ID
    let query = supabase.from('events').select('*');
    if (isUUID) {
        query = query.eq('id', slug);
    } else {
        query = query.eq('slug', slug);
    }

    if (tenantId) {
        query = query.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
    }

    const { data } = await query.maybeSingle();
    const event = data as Event | null;

    if (!event) {
        notFound();
    }

    if (isUUID && event.slug) {
        redirect(`/dang-ky-su-kien/${event.slug}`);
    }

    // Check if event allows registration
    if (!event.registration_required) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto text-center">
                    <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-4">
                        Sự kiện này không yêu cầu đăng ký
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Bạn có thể tham gia sự kiện mà không cần đăng ký trước.
                    </p>
                </div>
            </div>
        );
    }

    // Get current registration count
    const { count } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .eq('status', 'confirmed');

    const currentParticipants = count || 0;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <KhmerHeading level={1} withDivider>
                    Đăng ký tham gia sự kiện
                </KhmerHeading>
                <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                    {event.title_vi}
                </p>
            </div>

            <RegistrationForm
                event={{
                    id: event.id,
                    title_vi: event.title_vi,
                    start_date: event.start_date,
                    start_time: event.start_time,
                    location: event.location,
                    max_participants: event.max_participants,
                    current_participants: currentParticipants,
                }}
            />
        </div>
    );
}
