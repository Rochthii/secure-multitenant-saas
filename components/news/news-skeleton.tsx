import { Skeleton } from '@/components/ui/skeleton';

export function NewsSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    {/* Thumbnail */}
                    <Skeleton className="h-48 w-full rounded-none" />

                    {/* Content */}
                    <div className="p-4 space-y-3">
                        {/* Category badge */}
                        <Skeleton className="h-5 w-20" />

                        {/* Title */}
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-3/4" />

                        {/* Excerpt */}
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />

                        {/* Meta (date, author) */}
                        <div className="flex items-center gap-4 pt-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
