'use client';

import { useRouter } from 'next/navigation';
import { User, LogOut, Settings, Upload, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/auth-store';
import { ThemeToggle } from '@/components/common/theme-toggle';

export function UserMenu() {
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  const getAvatarUrl = (avatar?: string) => {
    if (!avatar) return '';
    return `${process.env.NEXT_PUBLIC_UPLOADS_URL}${avatar}`;
  };

  if (!isAuthenticated) {
    return (
      <>
        {/* Theme Toggle */}
        <ThemeToggle />

        <Button variant="ghost" onClick={() => router.push('/auth/login')}>
          Sign In
        </Button>
        <Button
          onClick={() => router.push('/auth/register')}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          Get Started
        </Button>
      </>
    );
  }

  return (
    <>
      {/* Upload Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push('/upload')}
        className="relative"
      >
        <Upload className="w-5 h-5" />
      </Button>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </Button>

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="w-8 h-8">
              <AvatarImage src={getAvatarUrl(user?.avatar)} alt={user?.username} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                {user?.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center space-x-2 p-2">
            <Avatar className="w-10 h-10">
              <AvatarImage src={getAvatarUrl(user?.avatar)} alt={user?.username} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                {user?.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push(`/channel/${user?._id}`)}>
            <User className="w-4 h-4 mr-2" />
            Your Channel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/settings')}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
