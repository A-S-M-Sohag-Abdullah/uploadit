import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

/**
 * Get video duration using FFmpeg
 */
export const getVideoDuration = (videoPath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata.format.duration || 0);
      }
    });
  });
};

/**
 * Generate thumbnail from video
 */
export const generateThumbnail = (
  videoPath: string,
  thumbnailPath: string,
  timestamp: string = '00:00:01'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: [timestamp],
        filename: path.basename(thumbnailPath),
        folder: path.dirname(thumbnailPath),
        size: '1280x720',
      })
      .on('end', () => {
        resolve(thumbnailPath);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

/**
 * Convert video to different qualities (for future use)
 */
export const convertVideoQuality = (
  inputPath: string,
  outputPath: string,
  quality: '360p' | '720p' | '1080p'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const resolutions: Record<string, string> = {
      '360p': '640x360',
      '720p': '1280x720',
      '1080p': '1920x1080',
    };

    ffmpeg(inputPath)
      .output(outputPath)
      .size(resolutions[quality])
      .videoCodec('libx264')
      .audioCodec('aac')
      .on('end', () => {
        resolve(outputPath);
      })
      .on('error', (err) => {
        reject(err);
      })
      .run();
  });
};

/**
 * Delete file helper
 */
export const deleteFile = (filePath: string): void => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
