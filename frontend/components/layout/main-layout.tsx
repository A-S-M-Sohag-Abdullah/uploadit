import { Navbar } from "./navbar";
import { AppSidebar } from "./sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full">
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-1">
        <header className="flex-none sticky top-0 z-50">
          <Navbar />
        </header>
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <main className="p-6">{children}</main>
          </ScrollArea>
        </div>
      </SidebarInset>
    </div>
  );
}
