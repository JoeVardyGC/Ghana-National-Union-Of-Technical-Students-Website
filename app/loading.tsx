import Skeleton, { NewsCardSkeleton, ExecutiveCardSkeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-[#f8f9fa] flex flex-col font-sans animate-in fade-in duration-300">
      {/* 1. Hero Slider Skeleton */}
      <section className="relative h-[520px] sm:h-[580px] lg:h-[620px] w-full bg-slate-900 overflow-hidden flex items-center">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full space-y-6">
          <Skeleton className="h-12 sm:h-16 w-3/4 max-w-2xl bg-white/20" />
          <Skeleton className="h-6 w-1/2 max-w-lg bg-white/15" />
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-12 w-36 bg-[#014900]/40 rounded-2xl" />
            <Skeleton className="h-12 w-36 bg-white/20 rounded-2xl" />
          </div>
        </div>
      </section>

      {/* 2. Stats Bar Skeleton */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 -mt-14 sm:-mt-12 z-30 mb-12 w-full">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <div className="space-y-2 flex-grow">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <div className="space-y-2 flex-grow">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section Title & Grid Skeletons */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 py-12 w-full">
        {/* Union Pillars Skeleton */}
        <div className="space-y-8">
          <div className="space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-200 space-y-4 shadow-sm">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        </div>

        {/* News Grid Skeleton */}
        <div className="space-y-8">
          <div className="flex justify-between items-end">
            <div className="space-y-3">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-80" />
            </div>
            <Skeleton className="h-6 w-28" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <NewsCardSkeleton />
            <NewsCardSkeleton />
            <NewsCardSkeleton />
          </div>
        </div>

        {/* Executive Grid Skeleton */}
        <div className="space-y-8">
          <div className="space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <ExecutiveCardSkeleton />
            <ExecutiveCardSkeleton />
            <ExecutiveCardSkeleton />
            <ExecutiveCardSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
}
