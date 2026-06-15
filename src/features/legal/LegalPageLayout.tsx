import { useMemo, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Coffee } from "lucide-react";
import { useCafeSettings } from "@/hooks/useCafeSettings";
import { useBrandSettings } from "@/hooks/useBrandSettings";
import { usePageMeta } from "@/hooks/usePageMeta";
import { isLogoImage, logoToFaviconHref } from "@/lib/logo";
import type { CafeSettings } from "@/types";
import { buildCafeTheme, type NavLink } from "@/features/landing/cafeTheme";
import { Footer } from "@/features/landing/sections/Footer";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  const { settings } = useCafeSettings();
  const { settings: systemSettings } = useBrandSettings();
  const navigate = useNavigate();

  const effectiveSettings = useMemo(() => {
    if (!settings) return undefined;
    return {
      ...settings,
      cafe_name: systemSettings?.cafe_name ?? settings.cafe_name ?? "Aromático Café",
      logo_url: systemSettings?.logo_url ?? settings.logo_url ?? null,
    } as CafeSettings;
  }, [settings, systemSettings]);

  const theme = useMemo(
    () =>
      buildCafeTheme(
        effectiveSettings?.theme_mode,
        effectiveSettings?.primary_color,
        effectiveSettings?.secondary_color,
      ),
    [
      effectiveSettings?.theme_mode,
      effectiveSettings?.primary_color,
      effectiveSettings?.secondary_color,
    ],
  );

  usePageMeta(
    `${title} · ${effectiveSettings?.cafe_name ?? "Aromático Café"}`,
    logoToFaviconHref(effectiveSettings?.logo_url),
  );

  // Footer props — los navLinks no se usan en el footer simplificado,
  // pero la interface los requiere.
  const navLinks: NavLink[] = [];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Header simplificado */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md"
        style={{
          backgroundColor: `${theme.bg}eb`,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-3 cursor-pointer group"
          >
            {isLogoImage(effectiveSettings?.logo_url) ? (
              <img
                src={effectiveSettings!.logo_url!}
                alt="Logo"
                decoding="async"
                className="h-9 w-9 rounded-full object-cover transition-all group-hover:opacity-80"
              />
            ) : effectiveSettings?.logo_url ? (
              <span
                className="text-2xl leading-none transition-all group-hover:scale-105"
                style={{ color: theme.text }}
              >
                {effectiveSettings.logo_url}
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
              style={{ color: theme.text }}
            >
              {effectiveSettings?.cafe_name ?? "Aromático Café"}
            </span>
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer hover:opacity-70"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
              color: theme.textMuted,
            }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
          <header className="mb-10 pb-8" style={{ borderBottom: `1px solid ${theme.border}` }}>
            <p
              className="text-xs font-bold tracking-[0.3em] uppercase mb-4"
              style={{ color: theme.gold }}
            >
              Legal
            </p>
            <h1
              className="font-black leading-tight mb-4"
              style={{
                color: theme.text,
                fontSize: "clamp(2rem, 4vw + 0.5rem, 3.5rem)",
              }}
            >
              {title}
            </h1>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Última actualización: {lastUpdated}
            </p>
          </header>

          <div
            className="legal-content space-y-8"
            style={{ color: theme.textMuted }}
          >
            {children}
          </div>
        </article>
      </main>

      <Footer
        settings={effectiveSettings}
        navLinks={navLinks}
        onNavClick={() => navigate("/")}
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onOpenReserva={() => navigate("/?reservar=1")}
        theme={theme}
      />
    </div>
  );
}
