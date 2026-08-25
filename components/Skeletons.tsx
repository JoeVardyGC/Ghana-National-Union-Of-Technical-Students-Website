'use client';

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-none p-6 shadow-sm border border-gray-200 border-l-4 border-l-gray-300 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-24 bg-gray-200 rounded animate-shimmer"></div>
        <div className="h-5 w-20 bg-gray-200 rounded animate-shimmer"></div>
      </div>
      <div className="h-7 w-3/4 bg-gray-200 rounded animate-shimmer"></div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-200 rounded animate-shimmer"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded animate-shimmer"></div>
        <div className="h-4 w-2/3 bg-gray-200 rounded animate-shimmer"></div>
      </div>
      <div className="pt-4 border-t border-gray-100 flex justify-between">
        <div className="h-4 w-28 bg-gray-200 rounded animate-shimmer"></div>
        <div className="h-4 w-24 bg-gray-200 rounded animate-shimmer"></div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
