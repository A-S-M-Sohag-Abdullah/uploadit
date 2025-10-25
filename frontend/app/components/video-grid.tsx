'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { VideoCard } from '@/components/video/video-card';
import { VideoCardSkeleton } from '@/components/video/video-card-skeleton';
import { videosApi } from '@/lib/api';
import type { Video } from '@/types';

interface VideoGridProps {
  sort?: string;
}

export function VideoGrid({ sort = '-createdAt' }: VideoGridProps) {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['videos', sort],
    queryFn: ({ pageParam = 1 }) =>
      videosApi.getVideos({
        page: pageParam,
        limit: 12,
        sort,
      }),
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.data.pagination;
      return page < pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <VideoCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load videos. Please try again later.</p>
      </div>
    );
  }

  const videos = data?.pages.flatMap((page) => page.data.videos) || [];

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No videos found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video: Video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>

      {/* Infinite scroll trigger with skeleton cards */}
      {hasNextPage && (
        <div ref={ref}>
          {isFetchingNextPage && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <VideoCardSkeleton key={`loading-${index}`} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
