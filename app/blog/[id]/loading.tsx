import Skeleton from '@/components/Skeleton';

export default function ArticleLoading() {
  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans pb-24">
      {/* Header Banner Skeleton */}
      <div className="bg-[#014900] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-4 w-48 bg-white/20" />
          <Skeleton className="h-10 sm:h-12 w-full bg-white/30" />
          <div className="flex gap-4 pt-2">
            <Skeleton className="h-4 w-32 bg-white/20" />
            <Skeleton className="h-4 w-24 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Article Content Skeleton */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        <div className="bg-white p-6 sm:p-10 rounded-xl shadow-md space-y-6">
          <Skeleton className="w-full h-80 sm:h-[450px] rounded-lg" />
          <div className="space-y-3 pt-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-11/12" />
          </div>
          <div className="space-y-3 pt-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        </div>
      </main>
    </div>
  );
}
