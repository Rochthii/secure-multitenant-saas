import React from 'react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { vi, km } from 'date-fns/locale';
import { getVietnamTime } from '@/lib/utils/date';

interface EventCardProps {
    id: string;
    slug?: string | null;
    title: string;
    description: string | null;
    excerpt?: string | null;
    start_date: string;
    start_time: string | null;
    location: string | null;
    thumbnail_url: string | null;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    registration_required: boolean;
    max_participants: number | null;
    current_participants: number;
    locale?: string;
}

const statusConfig = {
    upcoming: { label: 'Sắp diễn ra', color: 'bg-gold-primary text-white' },
    ongoing: { label: 'Đang diễn ra', color: 'bg-green-500 text-white' },
    completed: { label: 'Đã kết thúc', color: 'bg-gray-500 text-white' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-500 text-white' },
};

export function EventCard(props: EventCardProps) {
    const statusInfo = statusConfig[props.status] || { label: 'Sự kiện', color: 'bg-gold-primary text-white' };

    // Safety check for date to avoid "Invalid Date" errors in format()
    const eventDate = props.start_date ? getVietnamTime(new Date(props.start_date)) : getVietnamTime();
    const isInvalidDate = isNaN(eventDate.getTime());

    // Helper to format date safely
    const safeFormat = (date: Date, formatStr: string, options?: any) => {
        try {
            if (isNaN(date.getTime())) return '---';
            return format(date, formatStr, options);
        } catch (e) {
            console.error('[EventCard] Format error:', e);
            return '---';
        }
    };

    return (
        <Link href={`/lich-le/${props.slug || props.id}`}>
            <Card className="group flex flex-row sm:flex-col overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-auto sm:h-full bg-white border-none shadow-sm sm:border-solid sm:border-gray-100 mb-3 sm:mb-0">
                {/* Image */}
                <div className="relative w-[120px] sm:w-full shrink-0 aspect-square sm:aspect-video overflow-hidden bg-gradient-to-br from-gold-primary/10 to-teal-accent/10">
                    {props.thumbnail_url ? (
                        <Image
                            src={props.thumbnail_url}
                            alt={props.title}
                            fill
                            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <Calendar className="h-10 w-10 sm:h-16 sm:w-16" />
                        </div>
                    )}

                    {/* Date Badge - Hidden on mobile, visible on sm+ */}
                    {!isInvalidDate && (
                        <div className="hidden sm:block absolute top-3 right-3">
                            <div className="bg-[#ce1620] text-white text-center px-3 py-2 rounded-lg shadow-lg transform group-hover:scale-110 transition-transform">
                                <div className="text-2xl md:text-3xl font-bold leading-none">
                                    {safeFormat(eventDate, 'dd')}
                                </div>
                                <div className="text-xs md:text-sm font-medium uppercase mt-1">
                                    Tháng {safeFormat(eventDate, 'MM')}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Status Badge - Adjusted for mobile */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                        <Badge className={`${statusInfo.color} text-[10px] sm:text-sm md:text-base px-2 py-0.5 sm:px-3 sm:py-1`}>
                            {statusInfo.label}
                        </Badge>
                    </div>
                </div>

                <CardContent className="flex flex-col flex-1 p-3 sm:p-5 min-w-0 justify-center sm:justify-start">
                    {/* Title */}
                    <h3 className="font-playfair font-bold text-sm sm:text-xl mb-1 sm:mb-3 line-clamp-2 group-hover:text-gold-primary transition-colors pr-2 sm:pr-0 leading-snug">
                        {props.title}
                    </h3>

                    {/* Description / Excerpt Preview - Hidden on mobile */}
                    {(props.excerpt || props.description) && (
                        <p className="hidden sm:block text-gray-600 text-sm mb-4 line-clamp-2">
                            {props.excerpt || props.description}
                        </p>
                    )}

                    {/* Meta */}
                    <div className="space-y-1 sm:space-y-2 text-[10px] sm:text-sm text-gray-600 mb-0 sm:mb-4 mt-1 sm:mt-0">
                        {/* Date & Time */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gold-primary flex-shrink-0" />
                            <span className="truncate">
                                <span className="sm:hidden">{safeFormat(eventDate, 'dd/MM/yyyy')}</span>
                                <span className="hidden sm:inline">
                                    {safeFormat(eventDate, 'EEEE, dd MMMM yyyy', { locale: props.locale === 'km' ? km : (props.locale === 'en' ? undefined : vi) })}
                                </span>
                                {props.start_time && <span className="ml-1 sm:ml-0"> • {props.start_time.slice(0, 5)}</span>}
                            </span>
                        </div>

                        {/* Location - Hidden on very small screens if too cramped, but good to keep */}
                        {props.location && (
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gold-primary flex-shrink-0" />
                                <span className="line-clamp-1">{props.location}</span>
                            </div>
                        )}

                        {/* Participants - Hidden on mobile */}
                        {props.registration_required && (
                            <div className="hidden sm:flex items-center gap-2">
                                <Users className="h-4 w-4 text-gold-primary flex-shrink-0" />
                                <span>
                                    {props.current_participants}
                                    {props.max_participants && `/${props.max_participants}`} người tham gia
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Registration Tag - Hidden on mobile */}
                    {props.registration_required && props.status === 'upcoming' && (
                        <div className="hidden sm:inline-flex items-center gap-1 text-xs text-gold-primary font-semibold mt-auto pt-2">
                            <span>Cần đăng ký</span>
                            <span>→</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
