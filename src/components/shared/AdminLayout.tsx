import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { useUIStore } from "@/store/uiStore";

export function AdminLayout() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
