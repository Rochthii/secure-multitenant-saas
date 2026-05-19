'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { MapPin, Clock, Map } from 'lucide-react';
import { HandsPrayerIcon, DharmaWheelIcon, OmIcon } from '@/components/ui/khmer-icons';

export function LocationContactSection({ settings = {} }: { settings?: Record<string, string> }) {
    const locale = useLocale();

    const translations = {
        vi: {
            title: 'Địa Điểm & Liên Hệ',
            subtitle: 'Đến thăm và kết nối với chúng tôi',
            address: 'Địa chỉ',
            addressValue: settings['address'] || '',
            hours: 'Giờ mở cửa',
            morning: settings['opening_hours_open'] ? `${settings['opening_hours_open']} - 12:00` : '04:00 - 12:00',
            evening: settings['opening_hours_close'] ? `17:00 - ${settings['opening_hours_close']}` : '17:00 - 22:00',
            directions: 'Chỉ đường',
            note: 'Chi nhánh tọa lạc gần kênh Nhiêu Lộc, khu vực Phường 7, Quận 3',
        },
        km: {
            title: 'ទីតាំង និងទំនាក់ទំនង',
            subtitle: 'មកទស្សនា និងតភ្ជាប់ជាមួយយើង',
            address: 'អាសយដ្ឋាន',
            addressValue: '164/235 ផ្លូវ Trần Quốc Thảo, សង្កាត់7, ស្រុក3, ទីក្រុងហូជីមិញ',
            hours: 'ម៉ោងបើក',
            morning: '04:00 - 12:00',
            evening: '17:00 - 22:00',
            directions: 'ណែនាំផ្លូវ',
            note: 'វត្តនេះស្ថិតនៅជិតព្រែក Nhiêu Lộc តំបន់សង្កាត់7 ស្រុក3',
        },
        en: {
            title: 'Location & Contact',
            subtitle: 'Visit and connect with us',
            address: 'Address',
            addressValue: settings['address'] || '164/235 Tran Quoc Thao St., Ward 7, District 3, Ho Chi Minh City',
            hours: 'Opening Hours',
            morning: '04:00 AM - 12:00 PM',
            evening: '05:00 PM - 10:00 PM',
            directions: 'Get Directions',
            note: 'Tenant located near Nhieu Loc Canal, Ward 7, District 3',
        },
    };

    // Override address value with settings if available (applies to all locales for now unless translations exist in settings)
    if (settings['address']) {
        translations.vi.addressValue = settings['address'];
        translations.km.addressValue = settings['address'];
        translations.en.addressValue = settings['address'];
    }

    const t = translations[locale as keyof typeof translations] || translations.vi;

    return (
        <section className="py-16 bg-page-surface">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-playfair font-bold text-coffee-dark mb-4">
                        {t.title}
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-gold-primary to-gold-dark mx-auto" />
                    <p className="text-stone-600 mt-4 max-w-2xl mx-auto">
                        {t.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Contact Info */}
                    <div className="bg-gradient-to-br from-ivory to-white rounded-2xl shadow-lg p-8 space-y-6">
                        {/* Address */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-gold-primary/10 rounded-full flex items-center justify-center text-gold-primary">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-coffee-dark mb-2">{t.address}</h3>
                                <p className="text-stone-600 leading-relaxed">
                                    {t.addressValue}
                                </p>
                                <p className="text-sm text-stone-500 mt-2 italic">
                                    {t.note}
                                </p>
                            </div>
                        </div>

                        {/* Opening Hours */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-gold-primary/10 rounded-full flex items-center justify-center text-gold-primary">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-coffee-dark mb-2">{t.hours}</h3>
                                <div className="space-y-1">
                                    <p className="text-stone-600">
                                        <span className="font-medium">Sáng:</span> {t.morning}
                                    </p>
                                    <p className="text-stone-600">
                                        <span className="font-medium">Chiều:</span> {t.evening}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Directions Button */}
                        <div className="pt-4">
                            <a
                                href={settings['map_direction_url'] || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.addressValue)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-gold-primary hover:bg-gold-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                            >
                                <span><Map className="w-5 h-5" /></span>
                                <span>{t.directions}</span>
                            </a>
                        </div>

                        {/* Decorative Elements */}
                        <div className="pt-6 border-t border-stone-200">
                            <div className="flex items-center justify-center gap-6 text-gold-primary opacity-30">
                                <HandsPrayerIcon className="w-8 h-8" />
                                <DharmaWheelIcon className="w-8 h-8" />
                                <OmIcon className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    {/* Map */}
                    <div className="rounded-2xl overflow-hidden shadow-lg h-[400px] lg:h-auto">
                        <iframe
                            src={settings['map_embed_url'] || `https://maps.google.com/maps?q=${encodeURIComponent(t.addressValue)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                            width="100%"
                            height="100%"
                            style={{ border: 0, minHeight: '400px' }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={locale === 'vi' ? 'Bản đồ Chi nhánh' : locale === 'km' ? 'ផែនទីវត្ត' : 'Pagoda Map'}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
