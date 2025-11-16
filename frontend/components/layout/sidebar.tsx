"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  TrendingUp,
  Clock,
  ThumbsUp,
  History,
  PlaySquare,
  Users,
  Film,
  Gamepad2,
  GraduationCap,
  Music,
  Newspaper,
  Trophy,
  Shirt,
  Lightbulb,
  Video,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

const mainNavigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Trending", href: "/trending", icon: TrendingUp },
  {
    name: "Subscriptions",
    href: "/subscriptions",
    icon: Users,
    authRequired: true,
  },
];

const libraryNavigation = [
  { name: "History", href: "/history", icon: History, authRequired: true },
  { name: "Liked Videos", href: "/liked", icon: ThumbsUp, authRequired: true },
  {
    name: "Watch Later",
    href: "/watch-later",
    icon: Clock,
    authRequired: true,
  },
  {
    name: "Your Videos",
    href: "/my-videos",
    icon: PlaySquare,
    authRequired: true,
  },
];

const categories = [
  { name: "Movies", href: "/category/movies", icon: Film },
  { name: "Gaming", href: "/category/gaming", icon: Gamepad2 },
  { name: "Education", href: "/category/education", icon: GraduationCap },
  { name: "Music", href: "/category/music", icon: Music },
  { name: "News", href: "/category/news", icon: Newspaper },
  { name: "Sports", href: "/category/sports", icon: Trophy },
  { name: "Fashion", href: "/category/fashion", icon: Shirt },
  { name: "Technology", href: "/category/technology", icon: Lightbulb },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r flex flex-col">
      {/* Logo Header - Sticky */}
      <SidebarHeader className="sticky top-0 z-10 bg-sidebar border-b">
        <Link href="/" className="flex items-center gap-2 min-h-12">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-linear-to-br from-purple-600 to-pink-600">
            <Video className="size-5 text-white" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-xl">
              UploadIt
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Scrollable Content Area */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <SidebarContent>
            {/* Main Navigation */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mainNavigation.map((item) => {
                    if (item.authRequired && !isAuthenticated) return null;
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.name}
                        >
                          <Link href={item.href}>
                            <Icon className="w-5 h-5" />
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Library - Auth Required */}
            {isAuthenticated && (
              <>
                <SidebarSeparator className="mx-0 w-full" />
                <SidebarGroup>
                  <SidebarGroupLabel>Library</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {libraryNavigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                          <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              tooltip={item.name}
                            >
                              <Link href={item.href}>
                                <Icon className="w-5 h-5" />
                                <span>{item.name}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </>
            )}

            {/* Categories - Available for All */}
            <SidebarSeparator className="mx-0 w-full" />
            <SidebarGroup>
              <SidebarGroupLabel>Categories</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {categories.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.name}
                        >
                          <Link href={item.href}>
                            <Icon className="w-5 h-5" />
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </ScrollArea>
      </div>

      {/* Footer - Sign In Prompt - Sticky at Bottom */}
      {!isLoading && !isAuthenticated && state === "expanded" && (
        <SidebarFooter className="sticky bottom-0 z-10 bg-sidebar border-t">
          <div className="p-4 rounded-lg bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <p className="text-sm text-muted-foreground mb-3">
              Sign in to like videos, comment, and subscribe.
            </p>
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="w-full bg-background hover:bg-accent"
                size="sm"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
