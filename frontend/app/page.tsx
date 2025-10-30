import { MainLayout } from '@/components/layout/main-layout';
import { VideoGrid } from '@/components/video/video-grid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  return (
    <MainLayout>
      <div className="max-w-[1800px] mx-auto">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Welcome to UploadIt
          </h1>
          <p className="text-muted-foreground">
            Discover amazing videos from creators around the world
          </p>
        </div>

        {/* Tabs for content filtering */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <VideoGrid />
          </TabsContent>

          <TabsContent value="trending" className="mt-6">
            <VideoGrid sort="-views" />
          </TabsContent>

          <TabsContent value="recent" className="mt-6">
            <VideoGrid sort="-createdAt" />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}