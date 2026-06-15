import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { useCafeSettings } from "@/hooks/useCafeSettings";
import { buildCafeTheme } from "@/features/landing/cafeTheme";

const STORAGE_KEY = "cookie_consent";
type Consent = "accepted" | "rejected";

// Rutas privadas (admin/login) donde no se muestra el banner
const PRIVATE_PATH_PREFIXES = [
  "/dashboard",
  "/workers",
  "/inventory",
  "/caja",
  "/reservations",
  "/customers",
  "/sales",
  "/purchases",
  "/accounting",
  "/settings",
  "/profile",
  "/change-password",
  "/login",
];

function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function readStoredConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "accepted" || v === "rejected") return v;
  } catch {
    // localStorage no disponible (modo privado, ssr, etc.)
  }
  return null;
}

function storeConsent(value: Consent) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
    // Disparar evento custom para que otros componentes puedan reaccionar
    window.dispatchEvent(
      new CustomEvent("cookie-consent-change", { detail: value }),
    );
  } catch {
    // ignore
  }
}

export function CookieBanner() {
  const location = useLocation();
  const { settings } = useCafeSettings();
  const [consent, setConsent] = useState<Consent | null>(readStoredConsent);
  const [showAfterDelay, setShowAfterDelay] = useState(false);

  // Mostrar después de 800ms para no estorbar la primera impresión
  useEffect(() => {
    if (consent !== null) return;
    const t = setTimeout(() => setShowAfterDelay(true), 800);
    return () => clearTimeout(t);
  }, [consent]);

  const theme = useMemo(
    () =>
      buildCafeTheme(
        settings?.theme_mode,
        settings?.primary_color,
        settings?.secondary_color,
      ),
    [settings?.theme_mode, settings?.primary_color, settings?.secondary_color],
  );

  const handleAccept = () => {
    storeConsent("accepted");
    setConsent("accepted");
  };

  const handleReject = () => {
    storeConsent("rejected");
    setConsent("rejected");
  };

  const onPrivatePath = isPrivatePath(location.pathname);
  const visible = consent === null && showAfterDelay && !onPrivatePath;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 280 }}
          className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-6 z-[60] max-w-3xl mx-auto"
          role="dialog"
          aria-live="polite"
          aria-label="Aviso de uso de cookies"
        >
          <div
            className="rounded-2xl p-5 sm:p-6 shadow-2xl"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px ${theme.borderGold}30`,
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              {/* Icono + texto */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className="shrink-0 p-2.5 rounded-xl"
                  style={{
                    backgroundColor: `${theme.gold}15`,
                    border: `1px solid ${theme.borderGold}`,
                  }}
                >
                  <Cookie
                    className="h-5 w-5"
                    style={{ color: theme.gold }}
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-sm font-bold mb-1"
                    style={{ color: theme.text }}
                  >
                    Usamos cookies
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: theme.textMuted }}
                  >
                    Las cookies nos ayudan a mejorar tu experiencia y a entender
                    cómo usas el sitio. Lee nuestra{" "}
                    <Link
                      to="/cookies"
                      className="underline font-semibold"
                      style={{ color: theme.gold }}
                    >
                      política de cookies
                    </Link>{" "}
                    para más detalles.
                  </p>
                </div>
              </div>

              {/* Botones */}
              <div className="flex items-center gap-2 sm:shrink-0">
                <button
                  type="button"
                  onClick={handleReject}
                  className="flex-1 sm:flex-none text-xs font-semibold px-4 py-2.5 rounded-full cursor-pointer transition-all hover:opacity-70"
                  style={{
                    backgroundColor: "transparent",
                    border: `1px solid ${theme.border}`,
                    color: theme.textMuted,
                  }}
                >
                  Solo necesarias
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="flex-1 sm:flex-none text-xs font-bold px-5 py-2.5 rounded-full cursor-pointer transition-all hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${theme.gold}, ${theme.amber})`,
                    color: theme.bg,
                    boxShadow: `0 4px 12px ${theme.gold}40`,
                  }}
                >
                  Aceptar todas
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  aria-label="Cerrar y rechazar opcionales"
                  className="hidden sm:flex shrink-0 p-2 rounded-full cursor-pointer transition-all hover:opacity-70"
                  style={{
                    color: theme.textFaint,
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
