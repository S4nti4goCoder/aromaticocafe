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
  ChevronDown,
  CreditCard,
  Package,
  Tag,
  ShoppingBag,
  BarChart2,
  Percent,
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

interface NavChild {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  module: PermissionModule | "dashboard";
  children?: NavChild[];
}

const navItems: NavItem[] = [
  {
    label: "Panel",
    href: "/dashboard",
    icon: LayoutDashboard,
    module: "dashboard",
  },
  {
    label: "Inventario",
    href: "/inventory",
    icon: Package,
    module: "inventory",
    children: [
      { label: "Categorías", href: "/inventory/categories", icon: Tag },
      { label: "Productos", href: "/inventory/products", icon: ShoppingBag },
      { label: "Stock", href: "/inventory/stock", icon: BarChart2 },
      { label: "Promociones", href: "/inventory/promotions", icon: Percent },
    ],
  },
  {
    label: "Caja",
    href: "/caja",
    icon: CreditCard,
    module: "caja",
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
    children: [
      { label: "Apariencia", href: "/settings/appearance", icon: Palette },
      { label: "Ajustes", href: "/settings/general", icon: Settings },
    ],
  },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { data: profile } = useProfile();
  const { data: permissions, isLoading: isLoadingPermissions } =
    useMyPermissions();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["/inventory"]);

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

  const visibleItems = navItems.filter((item) => canViewModule(item.module));

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
          const isChildActive = item.children?.some((c) =>
            location.pathname.startsWith(c.href),
          );

          if (item.children) {
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
                        {item.children.map((child) => (
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
                            <child.icon className="h-3 w-3 shrink-0" />
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

      {/* Toggle */}
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
