import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <ScrollArea className="flex-1">
          <main className="p-6">{children}</main>
        </ScrollArea>
      </div>
    </div>
  );
}
