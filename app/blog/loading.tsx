import Skeleton, { NewsCardSkeleton } from '@/components/Skeleton';

export default function BlogLoading() {
  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans pb-24">
      {/* Header Banner Skeleton */}
      <div className="relative bg-[#014900] text-white py-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-4">
          <Skeleton className="h-4 w-32 bg-white/20" />
          <Skeleton className="h-10 w-96 bg-white/30" />
          <Skeleton className="h-5 w-2/3 bg-white/20" />
        </div>
      </div>

      {/* News Cards Grid Skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <NewsCardSkeleton />
          <NewsCardSkeleton />
          <NewsCardSkeleton />
          <NewsCardSkeleton />
          <NewsCardSkeleton />
          <NewsCardSkeleton />
        </div>
      </main>
    </div>
  );
}
