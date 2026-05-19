import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    // Rate limiting: 3 requests per minute per IP
    const rateLimitResult = await checkRateLimit(3, request);

    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': rateLimitResult.reset.toString(),
                },
            }
        );
    }

    try {
        const { email, locale } = await request.json();

        // Validate email
        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Check if email already exists
        const { data: existing } = await supabase
            .from('newsletter_subscribers')
            .select('id')
            .eq('email', email)
            .single();

        if (existing) {
            return NextResponse.json(
                { error: 'Email already subscribed' },
                { status: 409 }
            );
        }

        // Insert new subscriber
        const { error } = await supabase
            .from('newsletter_subscribers')
            .insert([{
                email,
                locale: locale || 'vi',
                subscribed_at: new Date().toISOString(),
            }] as any); // Type assertion for runtime table that may not be in generated types yet

        if (error) {
            console.error('Newsletter subscription error:', error);
            return NextResponse.json(
                { error: 'Failed to subscribe' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Successfully subscribed' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Newsletter API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
