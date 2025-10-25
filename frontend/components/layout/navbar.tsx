import Link from "next/link";
import { Video } from "lucide-react";
import { SearchBar } from "@/components/common/search-bar";
import { UserMenu } from "@/components/common/user-menu";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center px-4 justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 mr-6">
          <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <Video className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            UploadIt
          </span>
        </Link>

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
