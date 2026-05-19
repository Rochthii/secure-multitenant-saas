import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getVietnamTime } from '@/lib/utils/date';
import { getLocalizedContent } from '@/lib/utils/localized-content';

interface NewsCardProps {
    slug: string;
    title: string;
    excerpt: string | null;
    image_url: string | null;
    published_at: string;
    author: string | null;
    category?: any;
    locale?: string;
    /** Pass true for the first 3 cards (above-fold) to trigger priority loading */
    priority?: boolean;
    /** Explicit sizes attribute — default matches 1/2/3-column grid */
    sizes?: string;
    className?: string;
    isCompany?: boolean;
}

export function NewsCard({
    slug,
    title,
    excerpt,
    image_url,
    published_at,
    author,
    category,
    locale = 'vi',
    priority = false,
    sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
    isCompany = false,
}: NewsCardProps) {
    const displayDate = published_at ? getVietnamTime(new Date(published_at)) : null;

    return (
        <Link href={`/tin-tuc/${slug}`}>
            <Card className={cn(
                "group flex flex-row sm:flex-col overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-auto sm:h-full bg-white mb-3 sm:mb-0",
                isCompany 
                    ? "border border-slate-100 shadow-sm" 
                    : "border-none shadow-sm sm:border-solid sm:border-gray-100"
            )}>
                {/* Featured Image */}
                <div className="relative w-[120px] sm:w-full shrink-0 aspect-square sm:aspect-video overflow-hidden bg-gradient-to-br from-gold-primary/10 to-teal-accent/10">
                    {image_url ? (
                        <Image
                            src={image_url}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes={sizes}
                            priority={priority}
                            loading={priority ? undefined : 'lazy'}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <span className="text-3xl sm:text-4xl">📰</span>
                        </div>
                    )}

                    {/* Date Badge — hidden on mobile to save space, visible on sm and up */}
                    {displayDate && (
                        <div className="hidden sm:block absolute top-3 right-3">
                            <div className={cn(
                                "text-center px-3 py-2 rounded-lg shadow-lg transform group-hover:scale-110 transition-transform",
                                isCompany 
                                    ? "bg-slate-900/90 text-white border border-white/20"
                                    : "bg-coffee-dark text-gold-light border border-gold-primary/30"
                            )}>
                                <div className="text-2xl md:text-3xl font-bold leading-none">
                                    {format(displayDate, 'dd')}
                                </div>
                                <div className="text-xs md:text-sm font-medium uppercase mt-1 opacity-80">
                                    Tháng {format(displayDate, 'MM')}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Category Badge - Adjusted for mobile */}
                    {category && (
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                            <Badge className={cn(
                                "text-white shadow-md text-[10px] sm:text-sm md:text-base px-2 py-0.5 sm:px-3 sm:py-1 max-w-[90%] truncate",
                                isCompany ? "bg-sky-500" : "bg-gold-primary"
                            )}>
                                {getLocalizedContent(category, locale, 'name')}
                            </Badge>
                        </div>
                    )}
                </div>

                <CardContent className="flex flex-col flex-1 p-4 sm:p-5 min-w-0 justify-center sm:justify-start bg-white z-10">
                    {/* Title */}
                    <h3 className={cn(
                        "font-bold text-sm sm:text-lg md:text-xl mb-1 sm:mb-3 line-clamp-3 sm:line-clamp-2 leading-snug transition-colors pr-1 sm:pr-0",
                        isCompany 
                            ? "font-sans text-slate-900 group-hover:text-sky-600" 
                            : "font-playfair text-slate-800 group-hover:text-gold-primary"
                    )}>
                        {title}
                    </h3>


                    {/* Excerpt - Hidden on mobile */}
                    {excerpt && (
                        <p className="hidden sm:block text-gray-600 text-sm mb-4 line-clamp-3">
                            {excerpt}
                        </p>
                    )}

                    {/* Meta - Date simplified on mobile */}
                    <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-500 sm:mb-4 mt-1 sm:mt-0">
                        {displayDate && (
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                <span>{format(displayDate, 'dd/MM/yyyy', { locale: vi })}</span>
                            </div>
                        )}
                        {/* Author - Hidden on very small screens */}
                        {author && (
                            <div className="hidden sm:flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                <span>{author}</span>
                            </div>
                        )}
                    </div>

                    {/* Read More - Hidden on mobile */}
                    <div className={cn(
                        "hidden sm:flex items-center gap-2 font-semibold text-sm group-hover:gap-3 transition-all mt-auto pt-2",
                        isCompany ? "text-sky-600" : "text-gold-primary"
                    )}>
                        <span>{isCompany ? "Tìm hiểu thêm" : "Đọc thêm"}</span>
                        <ArrowRight className="h-4 w-4" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
