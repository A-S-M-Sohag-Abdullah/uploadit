'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2, Search as SearchIcon } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { VideoCard } from '@/components/video/video-card';
import { videosApi } from '@/lib/api';
import type { Video } from '@/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['search', query],
    queryFn: ({ pageParam = 1 }) =>
      videosApi.getVideos({
        page: pageParam,
        limit: 12,
        search: query,
      }),
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.data.pagination;
      return page < pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!query,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const videos = data?.pages.flatMap((page) => page.data.videos as Video[]) || [];

  return (
    <MainLayout>
      <div className="max-w-[1800px] mx-auto">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Search Results</h1>
          <p className="text-muted-foreground">
            {query ? `Results for "${query}"` : 'Enter a search query'}
          </p>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : videos.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video: Video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>

            {/* Infinite scroll trigger */}
            {hasNextPage && (
              <div ref={ref} className="flex items-center justify-center py-8">
                {isFetchingNextPage && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
              </div>
            )}
          </div>
        ) : query ? (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No results found</h2>
            <p className="text-muted-foreground">
              Try different keywords or remove search filters
            </p>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <SearchIcon className="w-16 h-16 mx-auto mb-4" />
            <p>Start searching for videos</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    }>
      <SearchContent />
    </Suspense>
  );
}
