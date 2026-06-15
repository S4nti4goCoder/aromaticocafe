import {
  Coffee,
  AtSign,
  ExternalLink,
  Clock,
  Mail,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { CafeSettings } from "@/types";
import { isLogoImage } from "@/lib/logo";
import type { CafeTheme, NavLink } from "../cafeTheme";

interface FooterProps {
  settings: CafeSettings | undefined;
  navLinks: NavLink[];
  onNavClick: (id: string) => void;
  onScrollToTop: () => void;
  onOpenReserva?: () => void;
  theme: CafeTheme;
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z" />
    </svg>
  );
}

export function Footer({
  settings,
  onScrollToTop,
  onOpenReserva,
  theme,
}: FooterProps) {
  const socialLinks = [
    settings?.instagram_url && {
      href: settings.instagram_url,
      label: "Instagram",
      Icon: AtSign,
    },
    settings?.facebook_url && {
      href: settings.facebook_url,
      label: "Facebook",
      Icon: ExternalLink,
    },
    settings?.tiktok_url && {
      href: settings.tiktok_url,
      label: "TikTok",
      Icon: TikTokIcon,
    },
  ].filter(Boolean) as {
    href: string;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
  }[];

  const legalLinks = [
    { label: "Términos y condiciones", href: "/terminos" },
    { label: "Política de privacidad", href: "/privacidad" },
    { label: "Política de cookies", href: "/cookies" },
  ];

  const interestLinks: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
  }> = [
    { label: "Reservar mesa", onClick: onOpenReserva },
    { label: "Trabaja con nosotros", href: "/trabaja-con-nosotros" },
  ];

  const whatsappHref = settings?.whatsapp
    ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`
    : null;

  const hours = [
    { label: "Lun — Vie", value: settings?.monday_friday },
    { label: "Sábado", value: settings?.saturday },
    { label: "Domingo", value: settings?.sunday },
  ].filter((h) => h.value);

  return (
    <footer
      style={{
        backgroundColor: theme.bgSection,
        borderTop: `1px solid ${theme.border}`,
      }}
    >
      {/* Main footer: 4 columnas */}
      <div className="max-w-7xl mx-auto fluid-section-px py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Columna 1 — Marca */}
          <div>
            <button
              onClick={onScrollToTop}
              className="flex items-center gap-3 shrink-0 cursor-pointer group mb-5"
            >
              {isLogoImage(settings?.logo_url) ? (
                <img
                  src={settings!.logo_url!}
                  alt="Logo"
                  decoding="async"
                  className="h-11 w-11 rounded-full object-cover transition-all group-hover:opacity-80"
                />
              ) : settings?.logo_url ? (
                <span
                  className="text-3xl leading-none transition-all group-hover:scale-105"
                  style={{ color: theme.text }}
                >
                  {settings.logo_url}
                </span>
              ) : (
                <Coffee
                  className="h-8 w-8 transition-all group-hover:scale-105"
                  style={{ color: theme.gold }}
                  strokeWidth={1.75}
                />
              )}
              <span
                className="font-bold text-base tracking-wide transition-opacity group-hover:opacity-70"
                style={{ color: theme.text }}
              >
                {settings?.cafe_name ?? "Aromático Café"}
              </span>
            </button>

            {settings?.slogan && (
              <p
                className="text-sm leading-relaxed mb-6 max-w-xs"
                style={{ color: theme.textMuted }}
              >
                {settings.slogan}
              </p>
            )}

            {socialLinks.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-6">
                {socialLinks.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 w-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      backgroundColor: theme.bgCard,
                      border: `1px solid ${theme.border}`,
                      color: theme.textMuted,
                    }}
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}

            {/* Trust badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.border}`,
              }}
            >
              <ShieldCheck
                className="h-4 w-4 shrink-0"
                style={{ color: theme.gold }}
              />
              <span
                className="text-[10px] font-bold tracking-wider uppercase leading-tight"
                style={{ color: theme.textMuted }}
              >
                Calidad
                <br />
                garantizada
              </span>
            </div>
          </div>

          {/* Columna 2 — Información (legal) */}
          <div>
            <h3
              className="text-xs font-bold tracking-[0.2em] uppercase mb-5"
              style={{ color: theme.gold }}
            >
              Información
            </h3>
            <ul className="flex flex-col gap-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("/") ? (
                    <Link
                      to={link.href}
                      className="text-sm transition-colors hover:underline"
                      style={{ color: theme.textMuted }}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm transition-colors hover:underline"
                      style={{ color: theme.textMuted }}
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3 — Enlaces de interés */}
          <div>
            <h3
              className="text-xs font-bold tracking-[0.2em] uppercase mb-5"
              style={{ color: theme.gold }}
            >
              Enlaces de interés
            </h3>
            <ul className="flex flex-col gap-3">
              {interestLinks.map((link) =>
                link.onClick ? (
                  <li key={link.label}>
                    <button
                      onClick={link.onClick}
                      className="text-sm cursor-pointer transition-colors hover:underline text-left"
                      style={{ color: theme.textMuted }}
                    >
                      {link.label}
                    </button>
                  </li>
                ) : link.href?.startsWith("/") ? (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm transition-colors hover:underline"
                      style={{ color: theme.textMuted }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ) : (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors hover:underline"
                      style={{ color: theme.textMuted }}
                    >
                      {link.label}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Columna 4 — Atención al cliente */}
          <div>
            <h3
              className="text-xs font-bold tracking-[0.2em] uppercase mb-5"
              style={{ color: theme.gold }}
            >
              Atención al cliente
            </h3>
            <div className="flex flex-col gap-4">
              {hours.length > 0 && (
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                    style={{ color: theme.text }}
                  >
                    <Clock
                      className="h-3.5 w-3.5"
                      style={{ color: theme.gold }}
                    />
                    Horario
                  </p>
                  <ul className="flex flex-col gap-1">
                    {hours.map((h, i) => (
                      <li
                        key={i}
                        className="text-xs leading-relaxed"
                        style={{ color: theme.textMuted }}
                      >
                        <span className="font-medium">{h.label}:</span>{" "}
                        {h.value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {settings?.email && (
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
                    style={{ color: theme.text }}
                  >
                    <Mail className="h-3.5 w-3.5" style={{ color: theme.gold }} />
                    Escríbenos
                  </p>
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-xs transition-colors hover:underline break-all"
                    style={{ color: theme.textMuted }}
                  >
                    {settings.email}
                  </a>
                </div>
              )}

              {whatsappHref && (
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
                    style={{ color: theme.text }}
                  >
                    <MessageCircle
                      className="h-3.5 w-3.5"
                      style={{ color: theme.gold }}
                    />
                    Línea WhatsApp
                  </p>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs transition-colors hover:underline"
                    style={{ color: theme.textMuted }}
                  >
                    {settings?.whatsapp}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-footer: copyright + créditos */}
      <div className="border-t" style={{ borderColor: theme.border }}>
        <div className="max-w-7xl mx-auto fluid-section-px py-5 flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
          <p className="text-xs" style={{ color: theme.textFaint }}>
            Colombia © {new Date().getFullYear()}{" "}
            {settings?.cafe_name ?? "Aromático Café"}. Derechos reservados.
          </p>
          <span
            className="hidden sm:inline text-xs"
            style={{ color: theme.textFaint, opacity: 0.5 }}
          >
            ·
          </span>
          <p className="text-xs" style={{ color: theme.textFaint }}>
            Desarrollado por{" "}
            <a
              href="https://santiagocoder.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold transition-opacity hover:opacity-70"
              style={{ color: theme.gold }}
            >
              Santiago Quintero
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
