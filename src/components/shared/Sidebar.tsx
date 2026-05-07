import { useEffect, useState } from "react";
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
  X,
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
import { useUIStore } from "@/store/uiStore";
import type { PermissionModule } from "@/types";

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

export function Sidebar() {
  const { data: profile } = useProfile();
  const { data: permissions, isLoading: isLoadingPermissions } =
    useMyPermissions();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["/inventory"]);
  const {
    sidebarOpen,
    toggleSidebar,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useUIStore();

  // Track desktop viewport so we only animate width on lg+ (on mobile the
  // drawer is always full-width when shown).
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1024px)").matches
      : true,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Auto-close the mobile drawer when navigating to a different route.
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname, setMobileSidebarOpen]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (mobileSidebarOpen && !isDesktop) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [mobileSidebarOpen, isDesktop]);

  // On desktop, the sidebar width animates between expanded (240) and
  // collapsed (64). On mobile the drawer is always full 240 when visible.
  const expanded = isDesktop ? sidebarOpen : true;

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
      animate={{ width: expanded ? 240 : 64 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        // Common
        "flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground overflow-hidden",
        // Mobile/tablet: fixed overlay drawer
        "fixed inset-y-0 left-0 z-50 transition-transform duration-300",
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop: in-flow, no transform
        "lg:relative lg:translate-x-0 lg:transition-none",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-3 shrink-0">
        <AnimatePresence>
          {expanded && (
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
        {!expanded && <Coffee className="h-6 w-6 text-primary mx-auto" />}

        {/* Close button — mobile drawer only */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden cursor-pointer shrink-0"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </Button>
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
                  onClick={() => expanded && toggleExpand(item.href)}
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
                    {expanded && (
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
                  {expanded && (
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-3 w-3 shrink-0" />
                    </motion.div>
                  )}
                </button>

                <AnimatePresence>
                  {expanded && isExpanded && (
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
                {expanded && (
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

      {/* Toggle (desktop collapse/expand) — hidden on mobile drawer */}
      <div className="hidden lg:block p-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="w-full"
        >
          <motion.div
            animate={{ rotate: sidebarOpen ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.div>
        </Button>
      </div>
    </motion.aside>
  );
}
