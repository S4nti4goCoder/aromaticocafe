import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  ChevronLeft,
  Coffee,
  Store,
  ChevronDown,
  CreditCard,
  Package,
  Palette,
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
  children?: {
    label: string;
    href: string;
    module: PermissionModule;
  }[];
}

const navItems: NavItem[] = [
  {
    label: "Panel",
    href: "/dashboard",
    icon: LayoutDashboard,
    module: "dashboard",
  },
  {
    label: "Tienda",
    href: "/store",
    icon: Store,
    module: "categories",
    children: [
      { label: "Categorías", href: "/categories", module: "categories" },
      { label: "Productos", href: "/products", module: "products" },
    ],
  },
  {
    label: "Caja",
    href: "/caja",
    icon: CreditCard,
    module: "caja",
  },
  {
    label: "Inventario",
    href: "/inventory",
    icon: Package,
    module: "inventory",
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
    label: "Apariencia",
    href: "/appearance",
    icon: Palette,
    module: "appearance",
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
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["/store"]);

  const canViewModule = (module: PermissionModule | "dashboard"): boolean => {
    if (module === "dashboard") return true;
    if (!profile) return false;
    if (profile.role === "super_admin" || profile.role === "gerente")
      return true;
    if (isLoadingPermissions) return false;
    return permissions?.[module as PermissionModule]?.can_view === true;
  };

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href],
    );
  };

  const visibleItems = navItems.filter((item) => {
    if (item.children) {
      return item.children.some((child) => canViewModule(child.module));
    }
    return canViewModule(item.module);
  });

  return (
    <motion.aside
      animate={{ width: isOpen ? 240 : 64 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground overflow-hidden"
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-3 shrink-0">
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
        {visibleItems.map((item) => {
          const isExpanded = expandedItems.includes(item.href);
          const isChildActive = item.children?.some(
            (c) => location.pathname === c.href,
          );

          if (item.children) {
            const visibleChildren = item.children.filter((c) =>
              canViewModule(c.module),
            );
            if (visibleChildren.length === 0) return null;

            return (
              <div key={item.href}>
                <button
                  onClick={() => isOpen && toggleExpand(item.href)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isChildActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <AnimatePresence>
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        transition={{ duration: 0.15 }}
                        className="whitespace-nowrap flex-1 text-left"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isOpen && (
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-3 w-3 shrink-0" />
                    </motion.div>
                  )}
                </button>

                <AnimatePresence>
                  {isOpen && isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                        {visibleChildren.map((child) => (
                          <NavLink
                            key={child.href}
                            to={child.href}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors",
                                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                isActive
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                  : "text-sidebar-foreground",
                              )
                            }
                          >
                            {child.label}
                          </NavLink>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          return (
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
          );
        })}
      </nav>

      <Separator />

      {/* Toggle button */}
      <div className="p-2 shrink-0">
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
