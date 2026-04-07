import { Coffee } from "lucide-react";
import type { CafeSettings } from "@/types";
import { CAFE, type NavLink } from "../cafeTheme";

interface FooterProps {
  settings: CafeSettings | undefined;
  navLinks: NavLink[];
  onNavClick: (id: string) => void;
  onScrollToTop: () => void;
}

export function Footer({
  settings,
  navLinks,
  onNavClick,
  onScrollToTop,
}: FooterProps) {
  return (
    <footer
      className="py-10 px-6"
      style={{
        backgroundColor: CAFE.bgSection,
        borderTop: `1px solid ${CAFE.border}`,
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onScrollToTop}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div
            className="h-7 w-7 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${CAFE.gold}, ${CAFE.amber})`,
            }}
          >
            <Coffee className="h-3.5 w-3.5 text-black" />
          </div>
          <span
            className="text-sm font-semibold transition-opacity group-hover:opacity-70"
            style={{ color: CAFE.textMuted }}
          >
            {settings?.cafe_name ?? "Aromático Café"}
          </span>
        </button>

        <div className="flex items-center gap-6 flex-wrap justify-center">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavClick(link.id)}
              className="text-xs cursor-pointer transition-colors hover:text-white"
              style={{ color: CAFE.textFaint }}
            >
              {link.label}
            </button>
          ))}
        </div>

        <p className="text-xs" style={{ color: CAFE.textFaint }}>
          © {new Date().getFullYear()} · Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}
