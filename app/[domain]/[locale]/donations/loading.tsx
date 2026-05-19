export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 animate-pulse">
            {/* Hero Section Skeleton */}
            <div className="h-[400px] lg:h-[500px] w-full bg-gray-200 relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center pb-20 space-y-4">
                    <div className="h-12 w-64 bg-gray-300 rounded" />
                    <div className="h-6 w-96 bg-gray-300 rounded hidden md:block" />
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="container mx-auto px-4 -mt-20 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-xl h-64 shadow-sm p-6" />
                    ))}
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-20 bg-white rounded-xl w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}
