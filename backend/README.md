# UploadIt Backend

Backend API for UploadIt video streaming platform built with Node.js, Express, TypeScript, and MongoDB.

## Features

- 🔐 JWT-based authentication
- 📹 Video upload with FFmpeg processing
- 💬 Comments system with replies
- 👍 Like/Dislike functionality
- 🔔 Channel subscriptions
- 📊 Video analytics (views, likes, etc.)
- 🔍 Search and filtering
- 📄 Swagger API documentation
- 🛡️ Security with Helmet and rate limiting
- 📁 Local file storage (easy migration to cloud)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Video Processing**: FFmpeg (fluent-ffmpeg)
- **API Documentation**: Swagger (swagger-jsdoc, swagger-ui-express)
- **Security**: Helmet, CORS, express-rate-limit
- **Validation**: express-validator

## Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher) running locally
- **FFmpeg** installed on your system

### Installing FFmpeg

#### Windows
```bash
# Using Chocolatey
choco install ffmpeg

# Or download from: https://ffmpeg.org/download.html
```

#### macOS
```bash
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg
```

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # Copy .env.example to .env
   cp .env.example .env

   # Edit .env with your configuration
   ```

3. **Configure MongoDB**
   Make sure MongoDB is running locally on `mongodb://localhost:27017`

   Or update `MONGODB_URI` in `.env` to point to your MongoDB instance

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/uploadit

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=524288000
UPLOAD_PATH=./uploads

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## API Documentation

Once the server is running, access the Swagger API documentation at:

```
http://localhost:5000/api-docs
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/profile` - Update user profile (Protected)

### Videos
- `POST /api/videos/upload` - Upload video (Protected)
- `GET /api/videos` - Get all videos (with filters)
- `GET /api/videos/:id` - Get video by ID
- `PUT /api/videos/:id` - Update video (Protected)
- `DELETE /api/videos/:id` - Delete video (Protected)
- `GET /api/videos/user/:userId` - Get user's videos

### Comments
- `POST /api/comments` - Create comment (Protected)
- `GET /api/comments/video/:videoId` - Get video comments
- `GET /api/comments/:commentId/replies` - Get comment replies
- `PUT /api/comments/:id` - Update comment (Protected)
- `DELETE /api/comments/:id` - Delete comment (Protected)

### Likes
- `POST /api/likes/video/:videoId` - Toggle like/dislike (Protected)
- `GET /api/likes/video/:videoId/status` - Get like status (Protected)

### Subscriptions
- `POST /api/subscriptions/:channelId` - Toggle subscription (Protected)
- `GET /api/subscriptions/:channelId/status` - Check subscription status (Protected)
- `GET /api/subscriptions/my-subscriptions` - Get user's subscriptions (Protected)
- `GET /api/subscriptions/channel/:channelId/subscribers` - Get channel subscribers

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (database, swagger)
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware (auth, upload, error handling)
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── types/           # TypeScript interfaces and types
│   ├── utils/           # Utility functions (jwt, ffmpeg, response)
│   └── server.ts        # Entry point
├── uploads/             # Local file storage
│   ├── videos/
│   ├── thumbnails/
│   └── avatars/
├── .env                 # Environment variables
├── .env.example         # Environment variables template
├── tsconfig.json        # TypeScript configuration
└── package.json
```

## Database Models

### User
- username, email, password
- avatar, channelName, channelDescription
- subscriberCount

### Video
- title, description, videoUrl, thumbnailUrl
- duration, views, likes, dislikes
- privacy (public, private, unlisted)
- status (processing, ready, failed)
- category, tags, owner

### Comment
- content, video, user
- parentComment (for replies)
- likes

### Like
- user, video
- type (like/dislike)

### Subscription
- subscriber, channel

### ViewHistory
- user, video
- watchedAt, watchDuration

## Security Features

- **Helmet**: Secure HTTP headers
- **CORS**: Cross-Origin Resource Sharing
- **Rate Limiting**: Prevent abuse
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for password security
- **Input Validation**: express-validator

## File Upload

- **Maximum file size**: 500MB (configurable)
- **Supported video formats**: All formats supported by FFmpeg
- **Thumbnail generation**: Automatic thumbnail extraction from video
- **Storage**: Local file system (uploads/ directory)

## Video Processing

- **Duration extraction**: Automatically extract video duration
- **Thumbnail generation**: Generate thumbnails at 00:00:01
- **Quality conversion**: Ready for multi-quality support (360p, 720p, 1080p)

## Future Enhancements

- [ ] Video transcoding for multiple qualities
- [ ] Cloud storage migration (AWS S3/Cloudinary)
- [ ] Real-time notifications (Socket.io)
- [ ] Video streaming optimization (HLS/DASH)
- [ ] Advanced search with Elasticsearch
- [ ] Caching with Redis
- [ ] Video recommendations algorithm
- [ ] Analytics dashboard
- [ ] Monetization features

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running locally:
```bash
# Windows (if installed as service)
net start MongoDB

# macOS/Linux
mongod
```

### FFmpeg Not Found Error
```
Error: ffprobe exited with code 1
```
**Solution**: Install FFmpeg and ensure it's in your system PATH

### File Upload Error
```
Error: ENOENT: no such file or directory
```
**Solution**: Make sure uploads directories exist. They should be created automatically, but you can create them manually:
```bash
mkdir -p uploads/videos uploads/thumbnails uploads/avatars
```

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.