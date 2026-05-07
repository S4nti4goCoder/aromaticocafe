import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Coffee, Menu, X, Calendar } from "lucide-react";
import type { CafeSettings } from "@/types";
import type { CafeTheme, NavLink } from "../cafeTheme";

interface NavbarProps {
  settings: CafeSettings | undefined;
  scrolled: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  navLinks: NavLink[];
  onNavClick: (id: string) => void;
  onScrollToTop: () => void;
  onOpenReserva: () => void;
  theme: CafeTheme;
}

export function Navbar({
  settings,
  scrolled,
  mobileMenuOpen,
  setMobileMenuOpen,
  navLinks,
  onNavClick,
  onScrollToTop,
  onOpenReserva,
  theme,
}: NavbarProps) {
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: scrolled ? "rgba(15,13,11,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? `1px solid ${theme.border}` : "none",
        paddingTop: scrolled ? "14px" : "24px",
        paddingBottom: scrolled ? "14px" : "24px",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={onScrollToTop}
          className="flex items-center gap-3 shrink-0 cursor-pointer group"
        >
          {settings?.logo_url ? (
            <img
              src={settings.logo_url}
              alt="Logo"
              decoding="async"
              className="h-9 w-9 rounded-full object-cover transition-all group-hover:opacity-80"
              style={{ border: `2px solid ${theme.borderGold}` }}
            />
          ) : (
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center transition-all group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${theme.gold}, ${theme.amber})`,
              }}
            >
              <Coffee className="h-4 w-4 text-black" />
            </div>
          )}
          <span
            className="font-bold text-sm tracking-wide transition-opacity group-hover:opacity-70"
            style={{ color: theme.text }}
          >
            {settings?.cafe_name ?? "Aromático Café"}
          </span>
        </button>

        {/* Links desktop */}
        {navLinks.length > 0 && (
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavClick(link.id)}
                className="text-sm px-4 py-2 rounded-full transition-all duration-200 font-semibold cursor-pointer hover:text-white"
                style={{ color: theme.text }}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center gap-3 shrink-0">
          {settings?.show_reserve_button !== false && settings?.reservation_whatsapp && (
            <motion.button
              onClick={onOpenReserva}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="hidden sm:flex items-center gap-2 text-xs px-5 py-2.5 rounded-full font-semibold cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${theme.gold}, ${theme.amber})`,
                color: "#0f0d0b",
              }}
            >
              <Calendar className="h-3 w-3" />
              Reservar
            </motion.button>
          )}
          <Link
            to="/login"
            className="text-xs px-5 py-2.5 rounded-full transition-all duration-300 font-medium cursor-pointer"
            style={{
              border: `1px solid ${theme.border}`,
              color: theme.textMuted,
            }}
          >
            Acceder
          </Link>

          {navLinks.length > 0 && (
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2.5 rounded-full transition-all cursor-pointer"
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

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="lg:hidden px-6 pb-5 pt-3 flex flex-col gap-1"
          style={{
            backgroundColor: "rgba(15,13,11,0.97)",
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavClick(link.id)}
              className="text-sm text-left px-4 py-3 rounded-xl transition-all font-medium cursor-pointer hover:text-white"
              style={{ color: theme.textMuted }}
            >
              {link.label}
            </button>
          ))}
          {settings?.show_reserve_button !== false && settings?.reservation_whatsapp && (
            <a
              href={`https://wa.me/${settings.reservation_whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl font-semibold mt-2 cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${theme.gold}, ${theme.amber})`,
                color: "#0f0d0b",
              }}
            >
              <Calendar className="h-4 w-4" />
              Reservar mesa
            </a>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
}
