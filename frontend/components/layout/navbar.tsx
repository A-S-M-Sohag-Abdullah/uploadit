import Link from "next/link";
import { Video } from "lucide-react";
import { SearchBar } from "@/components/common/search-bar";
import { UserMenu } from "@/components/common/user-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center px-4 justify-between">
        {/* Sidebar Toggle & Logo (small screens) */}
        <div className="flex items-center gap-3 mr-6">
          {/* Custom Sidebar Trigger with Menu Icon */}
          <SidebarTrigger></SidebarTrigger>

          {/* Logo - visible on small screens only */}
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 bg-linear-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              UploadIt
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        <SearchBar />

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
