# UploadIt - Video Streaming Platform

A full-stack, professional video streaming platform similar to YouTube, built with modern technologies.

## Features

### Core Features
- 🔐 **User Authentication** - JWT-based authentication with user profiles
- 📹 **Video Upload & Management** - Upload, edit, delete videos with FFmpeg processing
- 🎬 **Custom Video Player** - Professional player with full controls
- 💬 **Comments System** - Comments with threaded replies
- 👍 **Engagement** - Like/Dislike videos, view counts
- 🔔 **Subscriptions** - Subscribe to channels
- 🔍 **Search & Discovery** - Full-text search with filters
- 📊 **Privacy Controls** - Public, Unlisted, Private videos
- 🎨 **Premium UI** - Modern, responsive design with shadcn/ui

### Technical Features
- 📄 **API Documentation** - Auto-generated Swagger docs
- 🚀 **Performance** - Optimized with TanStack Query caching
- 🎯 **Type-Safe** - Full TypeScript throughout
- 📱 **Responsive** - Mobile-first design
- 🔒 **Secure** - Helmet, CORS, rate limiting, input validation

## Tech Stack

### Backend
- **Runtime**: Node.js + Express.js
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer (local storage)
- **Video Processing**: FFmpeg (fluent-ffmpeg)
- **API Docs**: Swagger (swagger-jsdoc)
- **Security**: Helmet, CORS, rate limiting

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Data Fetching**: TanStack Query
- **State Management**: Zustand
- **Icons**: Lucide React

## Project Structure

```
uploadit/
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── config/       # Database, Swagger config
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Auth, upload, error handling
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── types/        # TypeScript types
│   │   ├── utils/        # Helper functions
│   │   └── server.ts     # Entry point
│   ├── uploads/      # Local file storage
│   └── package.json
│
└── frontend/         # Next.js frontend
    ├── app/              # App Router pages
    ├── components/       # React components
    ├── lib/api/         # API client
    ├── providers/       # React providers
    ├── store/           # State management
    └── package.json
```

## Prerequisites

Before running this project, ensure you have:

- **Node.js** (v18+)
- **MongoDB** (v4.4+) running locally
- **FFmpeg** installed and in PATH

### Installing FFmpeg

**Windows:**
```bash
choco install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

## Quick Start

### 1. Clone Repository
```bash
cd uploadit
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

Backend runs on [http://localhost:5000](http://localhost:5000)

API Documentation: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

### 3. Frontend Setup
```bash
cd frontend
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Frontend runs on [http://localhost:3000](http://localhost:3000)

## Environment Variables

### Backend (`.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/uploadit
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
MAX_FILE_SIZE=524288000
CORS_ORIGIN=http://localhost:3000
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_UPLOADS_URL=http://localhost:5000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)

### Videos
- `POST /api/videos/upload` - Upload video (Protected)
- `GET /api/videos` - Get all videos
- `GET /api/videos/:id` - Get single video
- `PUT /api/videos/:id` - Update video (Protected)
- `DELETE /api/videos/:id` - Delete video (Protected)
- `GET /api/videos/user/:userId` - Get user's videos

### Comments
- `POST /api/comments` - Create comment (Protected)
- `GET /api/comments/video/:videoId` - Get video comments
- `GET /api/comments/:commentId/replies` - Get replies
- `PUT /api/comments/:id` - Update comment (Protected)
- `DELETE /api/comments/:id` - Delete comment (Protected)

### Likes
- `POST /api/likes/video/:videoId` - Toggle like/dislike (Protected)
- `GET /api/likes/video/:videoId/status` - Get like status (Protected)

### Subscriptions
- `POST /api/subscriptions/:channelId` - Toggle subscription (Protected)
- `GET /api/subscriptions/:channelId/status` - Check status (Protected)
- `GET /api/subscriptions/my-subscriptions` - Get subscriptions (Protected)
- `GET /api/subscriptions/channel/:channelId/subscribers` - Get subscribers

## Database Models

- **User** - User accounts and channel info
- **Video** - Video metadata and file references
- **Comment** - Comments and replies
- **Like** - Like/Dislike records
- **Subscription** - Channel subscriptions
- **ViewHistory** - Watch history tracking

## Features Roadmap

### MVP (Current)
- [x] User authentication
- [x] Video upload and playback
- [x] Comments system
- [x] Likes and subscriptions
- [x] Search functionality
- [x] Channel pages

### Future Enhancements
- [ ] Dark mode
- [ ] Video transcoding (multiple qualities)
- [ ] Cloud storage (AWS S3/Cloudinary)
- [ ] Real-time notifications
- [ ] Watch history
- [ ] Playlists
- [ ] Video recommendations
- [ ] Analytics dashboard
- [ ] Monetization features
- [ ] Live streaming

## Development

### Backend Development
```bash
cd backend
npm run dev      # Development with hot reload
npm run build    # Build TypeScript
npm start        # Production server
```

### Frontend Development
```bash
cd frontend
npm run dev      # Development server
npm run build    # Production build
npm start        # Production server
npm run lint     # Run ESLint
```

## Production Deployment

### Backend
1. Build the TypeScript code: `npm run build`
2. Set environment variables for production
3. Start with: `npm start`
4. Use PM2 or similar for process management

### Frontend
1. Build the Next.js app: `npm run build`
2. Set environment variables
3. Start with: `npm start`
4. Deploy to Vercel, Netlify, or similar

## Security

- JWT authentication with httpOnly cookies (ready to implement)
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Helmet for security headers
- File upload restrictions

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.

## Credits

Built with ❤️ using modern web technologies.
