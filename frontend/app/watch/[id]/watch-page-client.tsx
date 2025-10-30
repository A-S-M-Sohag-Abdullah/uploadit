'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, ThumbsDown, Share2, Eye, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VideoPlayer } from '@/components/video/video-player';
import { VideoCard } from '@/components/video/video-card';
import { videosApi, likesApi, subscriptionsApi, commentsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import type { Comment as CommentType, Video } from '@/types';

interface WatchPageClientProps {
  videoId: string;
}

export function WatchPageClient({ videoId }: WatchPageClientProps) {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const [commentText, setCommentText] = useState('');

  // Fetch video details
  const { data: videoData, isLoading: videoLoading } = useQuery({
    queryKey: ['video', videoId],
    queryFn: () => videosApi.getVideo(videoId),
  });

  // Fetch like status
  const { data: likeStatusData } = useQuery({
    queryKey: ['likeStatus', videoId],
    queryFn: () => likesApi.getLikeStatus(videoId),
    enabled: isAuthenticated,
  });

  // Fetch subscription status
  const { data: subStatusData } = useQuery({
    queryKey: ['subscriptionStatus', videoData?.data.video.owner._id],
    queryFn: () => {
      const ownerId = videoData?.data.video.owner._id;
      if (!ownerId) throw new Error('Owner ID not found');
      return subscriptionsApi.getSubscriptionStatus(ownerId);
    },
    enabled: isAuthenticated && !!videoData?.data.video.owner._id,
  });

  // Fetch comments
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', videoId],
    queryFn: () => commentsApi.getVideoComments(videoId, { limit: 20 }),
  });

  // Fetch recommended videos
  const { data: recommendedData } = useQuery({
    queryKey: ['recommended'],
    queryFn: () => videosApi.getVideos({ limit: 10 }),
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: (type: 'like' | 'dislike') => likesApi.toggleLike(videoId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likeStatus', videoId] });
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
    },
    onError: () => toast.error('Failed to update like status'),
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: () => {
      const ownerId = videoData?.data.video.owner._id;
      if (!ownerId) throw new Error('Owner ID not found');
      return subscriptionsApi.toggleSubscription(ownerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionStatus'] });
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
      toast.success('Subscription updated');
    },
    onError: () => toast.error('Failed to update subscription'),
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: (content: string) =>
      commentsApi.createComment({ content, videoId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
      setCommentText('');
      toast.success('Comment posted');
    },
    onError: () => toast.error('Failed to post comment'),
  });

  if (videoLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const video = videoData?.data.video;
  if (!video) {
    return <div className="text-center py-12">Video not found</div>;
  }

  const getAvatarUrl = (avatar?: string) => {
    if (!avatar) return '';
    return `${process.env.NEXT_PUBLIC_UPLOADS_URL}${avatar}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleComment = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to comment');
      return;
    }
    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    commentMutation.mutate(commentText);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2">
        {/* Video Player */}
        <VideoPlayer videoUrl={video.videoUrl} title={video.title} />

        {/* Video Info */}
        <div className="mt-4 space-y-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {formatNumber(video.views)} views
              </span>
              <span>
                {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
              </span>
              {video.category && <Badge variant="secondary">{video.category}</Badge>}
            </div>
          </div>

          {/* Engagement Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted rounded-full">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-l-full"
                onClick={() => likeMutation.mutate('like')}
                disabled={!isAuthenticated}
              >
                <ThumbsUp
                  className={`w-4 h-4 mr-1 ${
                    likeStatusData?.data.liked ? 'fill-current' : ''
                  }`}
                />
                {formatNumber(video.likes)}
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant="ghost"
                size="sm"
                className="rounded-r-full"
                onClick={() => likeMutation.mutate('dislike')}
                disabled={!isAuthenticated}
              >
                <ThumbsDown
                  className={`w-4 h-4 mr-1 ${
                    likeStatusData?.data.disliked ? 'fill-current' : ''
                  }`}
                />
                {formatNumber(video.dislikes)}
              </Button>
            </div>

            <Button variant="ghost" size="sm" className="rounded-full">
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>

          {/* Channel Info */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <Link
              href={`/channel/${video.owner._id}`}
              className="flex items-center gap-3"
            >
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={getAvatarUrl(video.owner.avatar)}
                  alt={video.owner.channelName}
                />
                <AvatarFallback className="bg-linear-to-br from-purple-600 to-pink-600 text-white">
                  {video.owner.channelName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{video.owner.channelName}</p>
                <p className="text-sm text-muted-foreground">
                  {formatNumber(video.owner.subscriberCount)} subscribers
                </p>
              </div>
            </Link>

            {isAuthenticated && user?._id !== video.owner._id && (
              <Button
                onClick={() => subscribeMutation.mutate()}
                disabled={subscribeMutation.isPending}
                className={
                  subStatusData?.data.subscribed
                    ? 'bg-muted text-foreground hover:bg-muted/80'
                    : 'bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                }
              >
                {subStatusData?.data.subscribed ? 'Subscribed' : 'Subscribe'}
              </Button>
            )}
          </div>

          {/* Description */}
          {video.description && (
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="whitespace-pre-wrap text-sm">{video.description}</p>
            </div>
          )}

          {/* Comments Section */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">
              Comments ({commentsData?.data.pagination.total || 0})
            </h2>

            {/* Add Comment */}
            {isAuthenticated && (
              <div className="flex gap-3 mb-6">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={getAvatarUrl(user?.avatar)} alt={user?.username} />
                  <AvatarFallback className="bg-linear-to-br from-purple-600 to-pink-600 text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={commentMutation.isPending}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCommentText('')}
                      disabled={commentMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleComment}
                      disabled={commentMutation.isPending || !commentText.trim()}
                      className="bg-linear-to-r from-purple-600 to-pink-600"
                    >
                      {commentMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-1" />
                          Comment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            {commentsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {(commentsData?.data.comments as CommentType[] | undefined)?.map((comment) => (
                  <div key={comment._id} className="flex gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={getAvatarUrl(comment.user.avatar)}
                        alt={comment.user.username}
                      />
                      <AvatarFallback className="bg-linear-to-br from-purple-600 to-pink-600 text-white">
                        {comment.user.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{comment.user.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar - Recommended Videos */}
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Recommended</h2>
        <div className="space-y-4">
          {(recommendedData?.data.videos as Video[] | undefined)?.map((recVideo) => (
            <VideoCard key={recVideo._id} video={recVideo} />
          ))}
        </div>
      </div>
    </div>
  );
}
