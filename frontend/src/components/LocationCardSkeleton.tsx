'use client';

interface LocationCardSkeletonProps {
  count?: number;
}

function SingleSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="flex">
        {/* Thumbnail skeleton */}
        <div className="flex-shrink-0 p-3">
          <div className="w-16 h-16 rounded-xl skeleton-shimmer" />
        </div>

        {/* Content skeleton */}
        <div className="flex-1 min-w-0 py-3 pr-4">
          {/* Header skeleton */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full skeleton-shimmer" />
            <div className="h-5 w-32 rounded skeleton-shimmer" />
          </div>

          {/* Description skeleton */}
          <div className="space-y-1.5">
            <div className="h-4 w-full rounded skeleton-shimmer" />
            <div className="h-4 w-3/4 rounded skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LocationCardSkeleton({ count = 3 }: LocationCardSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="opacity-0 animate-stagger-fade-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <SingleSkeleton />
        </div>
      ))}
    </div>
  );
}
