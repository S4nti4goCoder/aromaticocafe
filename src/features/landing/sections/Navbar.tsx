import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Menu, X, Calendar } from "lucide-react";
import type { CafeSettings } from "@/types";
import { isLogoImage } from "@/lib/logo";
import type { CafeTheme, NavLink } from "../cafeTheme";

interface NavbarProps {
  settings: CafeSettings | undefined;
  scrolled: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  navLinks: NavLink[];
  activeSection: string;
  onNavClick: (id: string) => void;
  onScrollToTop: () => void;
  onOpenReserva: () => void;
  theme: CafeTheme;
  topOffset?: number;
}

export function Navbar({
  settings,
  scrolled,
  mobileMenuOpen,
  setMobileMenuOpen,
  navLinks,
  activeSection,
  onNavClick,
  onScrollToTop,
  onOpenReserva,
  theme,
  topOffset = 0,
}: NavbarProps) {
  // Over the hero (not scrolled) the navbar is transparent on top of a dark
  // cover image → text must be light. Once scrolled it sits on theme.bg →
  // follow the theme's own text colors.
  const navText = scrolled ? theme.text : "#f5f0e8";

  // Close the mobile drawer when the user presses ESC.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed left-0 right-0 z-50 transition-all duration-500"
      style={{
        top: `${topOffset}px`,
        backgroundColor: scrolled ? `${theme.bg}eb` : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? `1px solid ${theme.border}` : "none",
        paddingTop: scrolled ? "14px" : "24px",
        paddingBottom: scrolled ? "14px" : "24px",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <button
          onClick={onScrollToTop}
          className="flex items-center gap-3 shrink-0 cursor-pointer group"
        >
          {isLogoImage(settings?.logo_url) ? (
            <img
              src={settings!.logo_url!}
              alt="Logo"
              decoding="async"
              className="h-9 w-9 rounded-full object-cover transition-all group-hover:opacity-80"
            />
          ) : settings?.logo_url ? (
            <span
              className="text-2xl leading-none transition-all group-hover:scale-105"
              style={{ color: theme.text }}
            >
              {settings.logo_url}
            </span>
          ) : (
            <Coffee
              className="h-7 w-7 transition-all group-hover:scale-105"
              style={{ color: theme.gold }}
              strokeWidth={1.75}
            />
          )}
          <span
            className="font-bold text-sm tracking-wide transition-opacity group-hover:opacity-70"
            style={{ color: navText }}
          >
            {settings?.cafe_name ?? "Aromático Café"}
          </span>
        </button>

        {/* Links desktop */}
        {navLinks.length > 0 && (
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavClick(link.id)}
                  className="relative text-sm px-4 py-2 rounded-full transition-all duration-200 font-semibold cursor-pointer hover:opacity-70"
                  style={{ color: isActive ? theme.gold : navText }}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="active-nav-underline"
                      className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${theme.gold}, ${theme.amber})`,
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {settings?.show_reserve_button !== false && settings?.reservation_whatsapp && (
            <motion.button
              onClick={onOpenReserva}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="hidden sm:flex items-center gap-2 text-xs px-5 py-2.5 rounded-full font-semibold cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${theme.gold}, ${theme.amber})`,
                color: theme.bg,
                boxShadow: `0 8px 24px ${theme.gold}40, 0 4px 12px ${theme.gold}30`,
              }}
            >
              <Calendar className="h-3 w-3" />
              Reservar
            </motion.button>
          )}
          {navLinks.length > 0 && (
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 sm:p-2.5 rounded-full transition-all cursor-pointer"
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.border}`,
                color: theme.textMuted,
              }}
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 z-40"
              style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            />
            {/* Drawer panel */}
            <motion.aside
              key="drawer-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-90 flex flex-col"
              style={{
                backgroundColor: theme.bg,
                borderLeft: `1px solid ${theme.border}`,
              }}
            >
              {/* Drawer header */}
              <div
                className="flex items-center justify-between px-6 py-5"
                style={{ borderBottom: `1px solid ${theme.border}` }}
              >
                <span
                  className="font-bold text-sm tracking-wide"
                  style={{ color: theme.text }}
                >
                  {settings?.cafe_name ?? "Aromático Café"}
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full cursor-pointer transition-all hover:opacity-70"
                  style={{
                    backgroundColor: theme.bgCard,
                    border: `1px solid ${theme.border}`,
                    color: theme.textMuted,
                  }}
                  aria-label="Cerrar menú"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer nav links */}
              <nav className="flex-1 flex flex-col gap-1 px-4 py-6 overflow-y-auto">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => onNavClick(link.id)}
                      className="text-base text-left px-4 py-3 rounded-xl transition-all font-medium cursor-pointer"
                      style={{
                        color: isActive ? theme.gold : theme.textMuted,
                        backgroundColor: isActive ? `${theme.gold}10` : "transparent",
                      }}
                    >
                      {link.label}
                    </button>
                  );
                })}
              </nav>

              {/* Drawer CTA */}
              {settings?.show_reserve_button !== false && settings?.reservation_whatsapp && (
                <div
                  className="px-6 py-5"
                  style={{ borderTop: `1px solid ${theme.border}` }}
                >
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenReserva();
                    }}
                    className="w-full flex items-center justify-center gap-2 text-sm px-5 py-3 rounded-full font-semibold cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${theme.gold}, ${theme.amber})`,
                      color: theme.bg,
                      boxShadow: `0 8px 24px ${theme.gold}40`,
                    }}
                  >
                    <Calendar className="h-4 w-4" />
                    Reservar mesa
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
