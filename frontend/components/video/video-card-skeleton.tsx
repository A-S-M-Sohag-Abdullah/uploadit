import { Skeleton } from "@/components/ui/skeleton";

export function VideoCardSkeleton() {
  return (
    <div className="group rounded-xl overflow-hidden dark:bg-foreground/5">
      {/* Thumbnail Skeleton */}
      <div className="relative aspect-video rounded-t-xl overflow-hidden bg-muted mb-3 animate-pulse">
        <Skeleton className="w-full h-full" />
        {/* Duration Badge Skeleton */}
        <div className="absolute bottom-2 right-2">
          <Skeleton className="h-5 w-12 rounded" />
        </div>
      </div>

      {/* Video Info Skeleton */}
      <div className="flex gap-3 p-3 pt-0">
        {/* Channel Avatar Skeleton */}
        <Skeleton className="w-9 h-9 rounded-full shrink-0" />

        {/* Video Details Skeleton */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title Skeleton */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />

          {/* Channel Name Skeleton */}
          <Skeleton className="h-3 w-24" />

          {/* Stats Skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
