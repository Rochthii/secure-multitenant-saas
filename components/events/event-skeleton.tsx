import { Skeleton } from '@/components/ui/skeleton';

export function EventSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    {/* Thumbnail */}
                    <Skeleton className="h-56 w-full rounded-none" />

                    {/* Content */}
                    <div className="p-5 space-y-3">
                        {/* Badge */}
                        <Skeleton className="h-5 w-24" />

                        {/* Title */}
                        <Skeleton className="h-7 w-full" />
                        <Skeleton className="h-7 w-2/3" />

                        {/* Description */}
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />

                        {/* Date/Time/Location */}
                        <div className="space-y-2 pt-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-36" />
                        </div>

                        {/* Button */}
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                </div>
            ))}
        </div>
    );
}
