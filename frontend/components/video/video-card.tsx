'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Video } from '@/types';

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const getThumbnailUrl = (url: string) => {
    return `${process.env.NEXT_PUBLIC_UPLOADS_URL}${url}`;
  };

  const getAvatarUrl = (avatar?: string) => {
    if (!avatar) return '';
    return `${process.env.NEXT_PUBLIC_UPLOADS_URL}${avatar}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <div className="group cursor-pointer">
      <Link href={`/watch/${video._id}`}>
        {/* Thumbnail */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-3">
          <Image
            src={getThumbnailUrl(video.thumbnailUrl)}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>

          {/* Privacy Badge */}
          {video.privacy !== 'public' && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 bg-black/80 text-white capitalize"
            >
              {video.privacy}
            </Badge>
          )}
        </div>

        {/* Video Info */}
        <div className="flex gap-3">
          {/* Channel Avatar */}
          <Link
            href={`/channel/${video.owner._id}`}
            className="shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar className="w-9 h-9">
              <AvatarImage src={getAvatarUrl(video.owner.avatar)} alt={video.owner.channelName} />
              <AvatarFallback className="bg-linear-to-br from-purple-600 to-pink-600 text-white text-sm">
                {video.owner.channelName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* Video Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
              {video.title}
            </h3>

            <Link
              href={`/channel/${video.owner._id}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {video.owner.channelName}
            </Link>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatViews(video.views)} views
              </span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}