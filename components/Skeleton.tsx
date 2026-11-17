import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export default function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]';

  let shapeClasses = 'rounded-md';
  if (variant === 'circular') shapeClasses = 'rounded-full';
  if (variant === 'text') shapeClasses = 'rounded h-4 w-full';

  return <div className={`${baseClasses} ${shapeClasses} ${className}`} />;
}

export function NewsCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full h-64 sm:h-[380px] lg:h-[400px] bg-gray-200" />
      {/* Content Skeleton */}
      <div className="p-6 flex flex-col justify-between flex-grow space-y-4">
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function ExecutiveCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col animate-pulse">
      <div className="w-full aspect-[4/5] bg-gray-200" />
      <div className="p-4 text-center space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto" />
        <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
        <div className="flex justify-center gap-2 pt-3">
          <div className="w-4 h-4 bg-gray-200 rounded-full" />
          <div className="w-4 h-4 bg-gray-200 rounded-full" />
          <div className="w-4 h-4 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}
