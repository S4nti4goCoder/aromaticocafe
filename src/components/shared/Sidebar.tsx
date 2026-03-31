import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  BookOpen,
  Settings,
  ChevronLeft,
  Coffee,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useMyPermissions } from "@/hooks/useMyPermissions";
import { useProfile } from "@/hooks/useProfile";
import type { PermissionModule } from "@/types";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  module: PermissionModule | "dashboard";
}

const navItems: NavItem[] = [
  {
    label: "Panel",
    href: "/dashboard",
    icon: LayoutDashboard,
    module: "dashboard",
  },
  {
    label: "Categorías",
    href: "/categories",
    icon: Tag,
    module: "categories",
  },
  {
    label: "Productos",
    href: "/products",
    icon: ShoppingBag,
    module: "products",
  },
  {
    label: "Trabajadores",
    href: "/workers",
    icon: Users,
    module: "workers",
  },
  {
    label: "Contabilidad",
    href: "/accounting",
    icon: BookOpen,
    module: "accounting",
  },
  {
    label: "Configuración",
    href: "/settings",
    icon: Settings,
    module: "settings",
  },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { data: profile } = useProfile();
  const { data: permissions, isLoading: isLoadingPermissions } =
    useMyPermissions();

  const visibleItems = navItems.filter((item) => {
    if (item.module === "dashboard") return true;
    if (!profile) return false;
    if (profile.role === "super_admin" || profile.role === "gerente")
      return true;
    if (isLoadingPermissions) return false;
    return permissions?.[item.module as PermissionModule]?.can_view === true;
  });

  return (
    <motion.aside
      animate={{ width: isOpen ? 240 : 64 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground"
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-3">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <Coffee className="h-6 w-6 text-primary shrink-0" />
              <span className="font-bold text-sm whitespace-nowrap">
                Aromático Café
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && <Coffee className="h-6 w-6 text-primary mx-auto" />}
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground",
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.15 }}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      <Separator />

      {/* Toggle button */}
      <div className="p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="w-full"
        >
          <motion.div
            animate={{ rotate: isOpen ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.div>
        </Button>
      </div>
    </motion.aside>
  );
}
