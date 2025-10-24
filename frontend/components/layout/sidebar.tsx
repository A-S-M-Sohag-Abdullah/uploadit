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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

export function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  const NavItem = ({ item }: { item: (typeof mainNavigation)[0] }) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;

    if (item.authRequired && !isAuthenticated) {
      return null;
    }

    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <aside className="hidden lg:block w-64 border-r bg-background/50 backdrop-blur-sm">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {/* Main Navigation */}
          <div className="space-y-1">
            {mainNavigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>

          {isAuthenticated && (
            <>
              <Separator />

              {/* Library */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Library
                </h3>
                {libraryNavigation.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </div>
            </>
          )}

          {!isAuthenticated && (
            <>
              <Separator />
              <div className="p-4 rounded-lg bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <p className="text-sm text-muted-foreground mb-3">
                  Sign in to like videos, comment, and subscribe.
                </p>
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    className="w-full bg-background hover:bg-accent"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
