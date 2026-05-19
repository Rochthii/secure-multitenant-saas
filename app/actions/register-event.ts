'use server';

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { registrationSchema, type RegistrationFormData } from '@/lib/validations/registration';
import { sendEmail } from '@/lib/email/client';
import { RegistrationConfirmation } from '@/lib/email/templates/registration-confirmation';
import { getSiteSettings } from '@/lib/site-settings';
import { DEFAULT_SITE_NAME } from '@/lib/constants';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { headers } from 'next/headers';
import { createAuditLog } from '@/lib/audit';
import { RateLimit } from '@/lib/security/rate-limit';

export async function registerForEvent(formData: RegistrationFormData) {
    try {
        // 0. Rate Limit Check (5 registrations per hour)
        const { allowed, message } = await RateLimit.check('registration', 5, 3600);
        if (!allowed) {
            return { success: false, error: message };
        }

        // 1. Validate data
        const validated = registrationSchema.parse(formData);

        const supabase = await createAdminClient();

        // 2. Check if event exists and is valid
        const { data: event, error: eventError } = await (supabase as any)
            .from('events')
            .select('*')
            .eq('id', validated.event_id)
            .single();

        if (eventError || !event) {
            return { success: false, error: 'Sự kiện không tồn tại' };
        }

        // 3. Check if event is in the past
        const eventDate = new Date((event as any).start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (eventDate < today) {
            return { success: false, error: 'Sự kiện đã kết thúc' };
        }

        // 4. Check if event is cancelled
        if ((event as any).status === 'cancelled') {
            return { success: false, error: 'Sự kiện đã bị hủy' };
        }

        // 5. Check capacity if registration is required
        if ((event as any).registration_required && (event as any).max_participants) {
            const { count } = await supabase
                .from('event_registrations')
                .select('*', { count: 'exact', head: true })
                .eq('event_id', validated.event_id)
                .eq('status', 'confirmed');

            const currentCount = count || 0;

            if (currentCount >= (event as any).max_participants) {
                return { success: false, error: 'Sự kiện đã đầy, không thể đăng ký thêm' };
            }

            // Check if adding this registration would exceed capacity
            if (currentCount + validated.num_participants > (event as any).max_participants) {
                return {
                    success: false,
                    error: `Chỉ còn ${(event as any).max_participants - currentCount} chỗ trống`,
                };
            }
        }

        // 6. Insert registration
        const { error: insertError } = await supabase
            .from('event_registrations')
            .insert({
                event_id: validated.event_id,
                full_name: validated.full_name,
                phone: validated.phone,
                email: validated.email || null,
                num_participants: validated.num_participants,
                note: validated.note || null,
                status: 'confirmed',
                // created_at handled by DB default
            } as any);

        if (insertError) {
            console.error('Registration insert error:', insertError);
            return { success: false, error: 'Có lỗi xảy ra khi lưu đăng ký. Vui lòng thử lại.' };
        }

        // Audit Log for Guest Registration
        const headerList = await headers();
        const ipAddress = headerList.get('x-forwarded-for') || '127.0.0.1';
        const userAgent = headerList.get('user-agent') || 'Unknown';

        await createAuditLog({
            user: null, // Guest
            action: 'create',
            tableName: 'event_registrations',
            tenantId: (event as any).tenant_id,
            newData: {
                event_title: (event as any).title_vi,
                full_name: validated.full_name,
                num_participants: validated.num_participants,
                email: validated.email,
            },
            ipAddress,
            userAgent,
        });

        // 7. Update current_participants count in events table
        // This is crucial for accurate capacity tracking
        // @ts-ignore - RPC function added manually, types not yet updated
        const { error: updateError } = await supabase.rpc('increment_participants', {
            row_id: validated.event_id,
            count: validated.num_participants
        });

        if (updateError) {
            console.error('Failed to increment participants:', updateError);
            // Don't fail the request, just log it. The exact count can be recalculated from registrations table.
        }

        // 8. Send confirmation email (if email provided)
        if (validated.email) {
            try {
                const settings = await getSiteSettings((event as any).tenant_id || '55555555-5555-5555-5555-555555555555');
                const siteName = settings['site_name_vi'] || DEFAULT_SITE_NAME;
                const fallbackLocation = settings['address'] ? `${siteName}, ${settings['address']}` : siteName;

                await sendEmail({
                    to: validated.email,
                    subject: `Xác nhận đăng ký - ${(event as any).title_vi}`,
                    react: RegistrationConfirmation({
                        name: validated.full_name,
                        eventTitle: (event as any).title_vi,
                        eventDate: format(new Date((event as any).start_date), 'dd/MM/yyyy', { locale: vi }),
                        eventTime: (event as any).start_time || undefined,
                        eventLocation: (event as any).location || fallbackLocation,
                        numParticipants: validated.num_participants,
                        contactEmail: settings['contact_email'] || 'contact@example.com',
                        contactPhone: settings['contact_phone'] || '(028) 1234 5678',
                        siteName: siteName,
                        siteSubtitle: settings['site_description_vi'] || 'Ngôi Chi nhánh Khmer Nam Tông',
                    }),
                });
            } catch (emailError) {
                // Log email error but don't fail registration
                console.error('Failed to send confirmation email:', emailError);
            }
        }

        return { success: true, message: 'Đăng ký thành công!' };
    } catch (error) {
        console.error('Registration error:', error);
        if (error instanceof z.ZodError) {
            return { success: false, error: 'Dữ liệu không hợp lệ' };
        }
        return { success: false, error: 'Có lỗi xảy ra. Vui lòng thử lại.' };
    }
}
