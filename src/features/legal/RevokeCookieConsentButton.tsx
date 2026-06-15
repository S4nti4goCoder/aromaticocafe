import { useEffect, useMemo, useState } from "react";
import { RefreshCw, CheckCircle2, Cookie, ShieldCheck, ShieldOff } from "lucide-react";
import { useCafeSettings } from "@/hooks/useCafeSettings";
import { buildCafeTheme } from "@/features/landing/cafeTheme";

const STORAGE_KEY = "cookie_consent";

type ConsentValue = "accepted" | "rejected" | null;

function readConsent(): ConsentValue {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "accepted" || v === "rejected") return v;
  } catch {
    // ignore
  }
  return null;
}

export function RevokeCookieConsentButton() {
  const { settings } = useCafeSettings();
  const [consent, setConsent] = useState<ConsentValue>(null);
  const [justRevoked, setJustRevoked] = useState(false);

  const theme = useMemo(
    () =>
      buildCafeTheme(
        settings?.theme_mode,
        settings?.primary_color,
        settings?.secondary_color,
      ),
    [settings?.theme_mode, settings?.primary_color, settings?.secondary_color],
  );

  useEffect(() => {
    setConsent(readConsent());
    const onChange = () => setConsent(readConsent());
    window.addEventListener("cookie-consent-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("cookie-consent-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const handleRevoke = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(
        new CustomEvent("cookie-consent-change", { detail: null }),
      );
    } catch {
      // ignore
    }
    setConsent(null);
    setJustRevoked(true);
    setTimeout(() => setJustRevoked(false), 4000);
  };

  // Estado visible al usuario
  const stateConfig = useMemo(() => {
    if (consent === "accepted") {
      return {
        label: "Aceptaste todas las cookies",
        sublabel:
          "Estás permitiendo cookies de preferencias, analíticas y de terceros además de las estrictamente necesarias.",
        badge: "Todas aceptadas",
        Icon: ShieldCheck,
        accentColor: "#22c55e",
        accentBg: "rgba(34,197,94,0.12)",
        accentBorder: "rgba(34,197,94,0.3)",
      };
    }
    if (consent === "rejected") {
      return {
        label: "Solo aceptaste las necesarias",
        sublabel:
          "Únicamente se usan cookies indispensables para el funcionamiento del sitio. No se cargan analíticas ni cookies de terceros opcionales.",
        badge: "Solo necesarias",
        Icon: ShieldOff,
        accentColor: "#f59e0b",
        accentBg: "rgba(245,158,11,0.12)",
        accentBorder: "rgba(245,158,11,0.3)",
      };
    }
    return {
      label: "Aún no has elegido",
      sublabel:
        "El banner de cookies aparecerá la próxima vez que cargues el sitio para que tomes una decisión.",
      badge: "Sin elegir",
      Icon: Cookie,
      accentColor: theme.gold,
      accentBg: `${theme.gold}15`,
      accentBorder: `${theme.gold}40`,
    };
  }, [consent, theme.gold]);

  const { Icon } = stateConfig;

  return (
    <div className="not-prose">
      <div
        className="my-6 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.border}`,
          boxShadow: `0 8px 24px ${theme.gold}10`,
        }}
      >
        {/* Header con badge */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{
            backgroundColor: stateConfig.accentBg,
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <p
            className="text-xs font-bold tracking-[0.2em] uppercase"
            style={{ color: theme.gold }}
          >
            Tu preferencia actual
          </p>
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: stateConfig.accentBg,
              border: `1px solid ${stateConfig.accentBorder}`,
              color: stateConfig.accentColor,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: stateConfig.accentColor }}
            />
            {stateConfig.badge}
          </span>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div
              className="shrink-0 p-3 rounded-xl"
              style={{
                backgroundColor: stateConfig.accentBg,
                border: `1px solid ${stateConfig.accentBorder}`,
              }}
            >
              <Icon
                className="h-6 w-6"
                style={{ color: stateConfig.accentColor }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-base font-bold mb-1.5"
                style={{ color: theme.text }}
              >
                {stateConfig.label}
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: theme.textMuted }}
              >
                {stateConfig.sublabel}
              </p>
            </div>
          </div>

          {consent && (
            <div className="mt-5 pt-5 flex flex-col sm:flex-row sm:items-center gap-3" style={{ borderTop: `1px solid ${theme.border}` }}>
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs"
                  style={{ color: theme.textFaint }}
                >
                  ¿Cambiaste de opinión? Revoca tu decisión y el banner volverá
                  a aparecer para que elijas de nuevo.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRevoke}
                className="inline-flex items-center justify-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full cursor-pointer transition-all hover:scale-105 shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${theme.gold}, ${theme.amber})`,
                  color: theme.bg,
                  boxShadow: `0 4px 12px ${theme.gold}40`,
                }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Revocar consentimiento
              </button>
            </div>
          )}

          {justRevoked && (
            <div
              className="mt-4 flex items-start gap-2 text-sm px-4 py-3 rounded-lg"
              style={{
                backgroundColor: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.3)",
                color: "#22c55e",
              }}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Consentimiento revocado. Recarga la página y el banner volverá
                a aparecer para que elijas de nuevo.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
