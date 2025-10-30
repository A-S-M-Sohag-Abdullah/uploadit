import { cookies } from "next/headers";
import { Navbar } from "./navbar";
import { AppSidebar } from "./sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

export async function MainLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
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
    </SidebarProvider>
  );
}
