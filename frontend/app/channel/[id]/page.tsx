"use client";

import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Video as VideoIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from "@/components/layout/main-layout";
import { VideoCard } from "@/components/video/video-card";
import { videosApi, subscriptionsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { apiGet } from "@/lib/api/client";
import type { User, Video } from "@/types";

export default function ChannelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { user: currentUser, isAuthenticated } = useAuthStore();

  // Fetch channel info
  const { data: channelData } = useQuery({
    queryKey: ["channel", id],
    queryFn: () =>
      apiGet<{ success: boolean; data: { user: User } }>(`/auth/me`),
  });

  // Fetch channel videos
  const { data: videosData } = useQuery({
    queryKey: ["channelVideos", id],
    queryFn: () => videosApi.getUserVideos(id, { limit: 20 }),
  });

  // Fetch subscription status
  const { data: subStatusData } = useQuery({
    queryKey: ["subscriptionStatus", id],
    queryFn: () => subscriptionsApi.getSubscriptionStatus(id),
    enabled: isAuthenticated && currentUser?._id !== id,
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: () => subscriptionsApi.toggleSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subscriptionStatus", id],
      });
      toast.success("Subscription updated");
    },
    onError: () => toast.error("Failed to update subscription"),
  });

  const channel = channelData?.data.user;
  const videos = (videosData?.data.videos as Video[] | undefined) || [];

  const getAvatarUrl = (avatar?: string) => {
    if (!avatar) return "";
    return `${process.env.NEXT_PUBLIC_UPLOADS_URL}${avatar}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <MainLayout>
      <div className="max-w-[1800px] mx-auto">
        {/* Channel Header */}
        <div className="bg-linear-to-r from-purple-600/10 to-pink-600/10 rounded-lg p-8 mb-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-32 h-32">
              <AvatarImage
                src={getAvatarUrl(channel?.avatar)}
                alt={channel?.channelName}
              />
              <AvatarFallback className="bg-linear-to-br from-purple-600 to-pink-600 text-white text-4xl">
                {channel?.channelName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {channel?.channelName}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {formatNumber(channel?.subscriberCount || 0)} subscribers
                </span>
                <span className="flex items-center gap-1">
                  <VideoIcon className="w-4 h-4" />
                  {videos.length} videos
                </span>
              </div>

              {channel?.channelDescription && (
                <p className="text-muted-foreground mb-4 max-w-2xl">
                  {channel.channelDescription}
                </p>
              )}

              {isAuthenticated && currentUser?._id !== id && (
                <Button
                  onClick={() => subscribeMutation.mutate()}
                  disabled={subscribeMutation.isPending}
                  className={
                    subStatusData?.data.subscribed
                      ? "bg-muted text-foreground hover:bg-muted/80"
                      : "bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  }
                >
                  {subStatusData?.data.subscribed ? "Subscribed" : "Subscribe"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Channel Content */}
        <Tabs defaultValue="videos">
          <TabsList>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-6">
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                This channel has no videos yet.
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground">
                    {channel?.channelDescription || "No description available."}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Stats</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      {formatNumber(channel?.subscriberCount || 0)} subscribers
                    </p>
                    <p>{videos.length} videos</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
