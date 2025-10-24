# UploadIt Frontend

Modern, professional video streaming platform frontend built with Next.js 15, TypeScript, TanStack Query, and shadcn/ui.

## Features

- 🎨 **Premium UI Design** - Professional, high-class interface with shadcn/ui components
- 🔐 **Authentication** - JWT-based authentication with protected routes
- 📹 **Video Upload** - Drag-and-drop video upload with progress tracking
- 🎬 **Custom Video Player** - Professional video player with full controls
- 💬 **Social Features** - Comments, likes/dislikes, subscriptions
- 🔍 **Advanced Search** - Full-text search with infinite scroll
- 📱 **Responsive Design** - Mobile-first, works on all screen sizes
- ⚡ **Performance Optimized** - TanStack Query for data fetching and caching
- 🎯 **Type-Safe** - Full TypeScript support throughout

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Data Fetching**: TanStack Query (React Query)
- **State Management**: Zustand
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Date Formatting**: date-fns

## Installation

```bash
npm install
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_UPLOADS_URL=http://localhost:5000
```

## Running

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── app/                 # Next.js App Router pages
├── components/          # Reusable components
├── lib/api/            # API client and services
├── providers/          # React providers
├── store/              # Zustand stores
└── types/              # TypeScript types
```

## Key Features

### Video Upload
- Drag-and-drop interface
- Progress tracking
- Privacy settings
- Thumbnail upload

### Video Player
- Custom controls
- Fullscreen support
- Volume control
- Seek functionality

### Social Features
- Comments with replies
- Like/Dislike
- Channel subscriptions
- View counts

## License

ISC
