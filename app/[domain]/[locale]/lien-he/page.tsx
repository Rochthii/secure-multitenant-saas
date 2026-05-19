import React from 'react';
import type { Metadata } from 'next';
import { KhmerHeading } from '@/components/ui/khmer-heading';
import { Card } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { getSiteSettings } from '@/lib/site-settings';
import { getTenantConfig } from '@/lib/tenant';
import { ContactForm } from '@/components/contact/ContactForm';
import { getTenantBaseUrl } from '@/lib/utils/seo';

export async function generateMetadata({ params }: { params: Promise<{ domain: string; locale: string }> }): Promise<Metadata> {
    const { domain, locale } = await params;
    const tenant = await getTenantConfig(domain);
    const tenantBaseUrl = getTenantBaseUrl(domain);
    const siteName = tenant?.name || 'Chi nhánh';
    const settings = await getSiteSettings(tenant?.id || '');

    return {
        title: `Liên hệ ${siteName} — Địa chỉ, Điện thoại & Bản đồ`,
        description: `Thông tin liên hệ ${siteName}: địa chỉ ${settings['address'] || ''}, điện thoại, email và bản đồ chỉ đường. Gửi tin nhắn trực tiếp qua form liên hệ.`,
        alternates: {
            canonical: `${tenantBaseUrl}/${locale}/lien-he`,
            languages: {
                'vi-VN': `${tenantBaseUrl}/vi/lien-he`,
                'km-KH': `${tenantBaseUrl}/km/lien-he`,
                'en-US': `${tenantBaseUrl}/en/lien-he`,
            },
        },
        openGraph: {
            title: `Liên hệ ${siteName}`,
            description: `Gọi điện, gửi email hoặc ghé thăm ${siteName}. Xem bản đồ chỉ đường.`,
            url: `${tenantBaseUrl}/${locale}/lien-he`,
        },
    };
}
export default async function ContactPage({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params;
    // Kéo cấu hình từ CSDL
    const tenantConfig = await getTenantConfig(domain);
    const settings = await getSiteSettings(tenantConfig?.id || '55555555-5555-5555-5555-555555555555');

    // Mapping variables with defaults
    const address = settings['address'] || 'Quận 3, TP. Hồ Chí Minh';
    const rawPhone = settings['contact_phone'] || settings['site_phone'] || '(028) 1234 5678';
    const phoneDisplay = rawPhone;
    const phoneLink = rawPhone.replace(/\s+/g, '');
    const email = settings['contact_email'] || settings['site_email'] || 'contact@example.com';
    const openingHours = settings['opening_hours'] || 'Hằng ngày: 5:00 - 18:00';

    // Ưu tiên: map_embed_url (iframe embed) > tự tạo từ địa chỉ
    const mapEmbedUrl = settings['map_embed_url'] ||
        `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

    return (
        <section className="min-h-screen bg-[#FAF7F2]/60 py-12 md:py-20 relative overflow-hidden">
            {/* Decorative background pattern - consistent with home sections */}
            <div className="absolute inset-0 bg-[url('/patterns/khmer-pattern-light.png')] opacity-5 pointer-events-none" />
            
            <div className="container mx-auto px-4 relative z-10">
                <KhmerHeading level={1} withDivider className="text-center">
                    Liên hệ
                </KhmerHeading>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-8">
                    {/* Contact Info (Server Rendered) */}
                    <div>
                        <Card className="p-6 h-full border-transparent shadow-none bg-transparent">
                            <h2 className="text-2xl font-semibold mb-6 font-playfair text-gold-darker uppercase tracking-wide">
                                Thông tin liên hệ
                            </h2>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gold-primary/10 flex items-center justify-center shrink-0">
                                        <MapPin className="h-5 w-5 text-gold-primary" />
                                    </div>
                                    <div className="mt-1 flex-1">
                                        <p className="font-semibold text-gray-900 leading-none mb-1">Địa chỉ</p>
                                        <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed mb-2">
                                            {address}
                                        </p>
                                        <a
                                            href={settings['map_direction_url'] || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gold-primary hover:text-gold-dark text-sm font-medium flex items-center gap-1 transition-colors"
                                        >
                                            <span>📍</span>
                                            <span>Click để xem bản đồ & chỉ đường</span>
                                        </a>
                                    </div>
                                </div>

                                <a href={`tel:${phoneLink}`} className="flex items-start gap-4 group transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-gold-primary/10 flex items-center justify-center shrink-0 group-hover:bg-gold-primary/20 transition-colors">
                                        <Phone className="h-5 w-5 text-gold-primary" />
                                    </div>
                                    <div className="mt-1">
                                        <p className="font-semibold text-gray-900 leading-none mb-1 group-hover:text-gold-primary transition-colors">Điện thoại</p>
                                        <p className="text-gray-600 text-sm">{phoneDisplay}</p>
                                    </div>
                                </a>

                                <a href={`mailto:${email}`} className="flex items-start gap-4 group transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-gold-primary/10 flex items-center justify-center shrink-0 group-hover:bg-gold-primary/20 transition-colors">
                                        <Mail className="h-5 w-5 text-gold-primary" />
                                    </div>
                                    <div className="mt-1">
                                        <p className="font-semibold text-gray-900 leading-none mb-1 group-hover:text-gold-primary transition-colors">Email</p>
                                        <p className="text-gray-600 text-sm break-all">{email}</p>
                                    </div>
                                </a>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gold-primary/10 flex items-center justify-center shrink-0">
                                        <Clock className="h-5 w-5 text-gold-primary" />
                                    </div>
                                    <div className="mt-1">
                                        <p className="font-semibold text-gray-900 leading-none mb-1">Giờ mở cửa</p>
                                        <p className="text-gray-600 text-sm">{openingHours}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Google Maps Embed */}
                            <div className="mt-8 h-64 bg-gray-200 rounded-xl overflow-hidden shadow-inner border border-gray-100">
                                <iframe
                                    src={mapEmbedUrl}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="rounded-xl filter contrast-100"
                                    title="Bản đồ địa chỉ"
                                />
                            </div>
                        </Card>
                    </div>

                    {/* Contact Form (Client Rendered) */}
                    <div>
                        <ContactForm tenantId={tenantConfig?.id} />
                    </div>
                </div>
            </div>
        </section>
    );
}
