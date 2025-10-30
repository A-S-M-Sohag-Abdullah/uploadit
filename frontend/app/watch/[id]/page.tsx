import { Suspense } from 'react';
import { WatchPageClient } from './watch-page-client';
import { MainLayout } from '@/components/layout/main-layout';
import { Skeleton } from '@/components/ui/skeleton';

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <MainLayout>
      <Suspense fallback={<WatchPageSkeleton />}>
        <WatchPageClient videoId={id} />
      </Suspense>
    </MainLayout>
  );
}

function WatchPageSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
}
