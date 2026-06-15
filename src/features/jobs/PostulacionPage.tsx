import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  MessageSquare,
  Send,
  CheckCircle2,
  ArrowLeft,
  Star,
  ArrowRight,
  Sparkles,
  Inbox,
} from "lucide-react";
import { useCafeSettings } from "@/hooks/useCafeSettings";
import { useBrandSettings } from "@/hooks/useBrandSettings";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useCreateJobApplication } from "@/hooks/useJobApplications";
import { useActiveHiringPositions } from "@/hooks/useHiringPositions";
import { isLogoImage, logoToFaviconHref } from "@/lib/logo";
import { Coffee } from "lucide-react";
import { Link } from "react-router-dom";
import type {
  CafeSettings,
  HiringPosition,
  JobApplicationFormData,
  JobPosition,
} from "@/types";
import { buildCafeTheme, type NavLink } from "@/features/landing/cafeTheme";
import { Footer } from "@/features/landing/sections/Footer";
import { useMemo } from "react";

const POSITIONS: { value: JobPosition; label: string }[] = [
  { value: "barista", label: "Barista" },
  { value: "mesero", label: "Mesero / Mesera" },
  { value: "cocina", label: "Cocina" },
  { value: "caja", label: "Cajero / Cajera" },
  { value: "gerencia", label: "Gerencia / Administración" },
  { value: "otro", label: "Otro" },
];

export function PostulacionPage() {
  const { settings } = useCafeSettings();
  const { settings: systemSettings } = useBrandSettings();
  const navigate = useNavigate();
  const createApplication = useCreateJobApplication();

  const effectiveSettings = useMemo(() => {
    if (!settings) return undefined;
    return {
      ...settings,
      cafe_name:
        systemSettings?.cafe_name ?? settings.cafe_name ?? "Aromático Café",
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

  const cafeName = effectiveSettings?.cafe_name ?? "Aromático Café";
  usePageMeta(
    `Trabaja con nosotros · ${cafeName}`,
    logoToFaviconHref(effectiveSettings?.logo_url),
  );

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState<JobPosition>("barista");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Vacantes activas + ref del formulario para el "Aplicar a esta vacante"
  const { data: activePositions = [], isLoading: loadingPositions } =
    useActiveHiringPositions();
  const formRef = useRef<HTMLFormElement>(null);

  const handleApplyToPosition = (pos: HiringPosition) => {
    setPosition(pos.position);
    // Scroll suave al formulario, deja un offset para el header sticky
    requestAnimationFrame(() => {
      const el = formRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (fullName.trim().length < 3) {
      setError("El nombre completo es obligatorio (mínimo 3 caracteres).");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError("El correo electrónico no es válido.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 7) {
      setError("El teléfono no es válido.");
      return;
    }

    const payload: JobApplicationFormData = {
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      position,
      message: message.trim() || undefined,
    };

    try {
      await createApplication.mutateAsync(payload);
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No pudimos enviar tu postulación. Inténtalo de nuevo.",
      );
    }
  };

  const inputStyle = {
    backgroundColor: theme.bgLight,
    border: `1px solid ${theme.border}`,
    color: theme.text,
    borderRadius: "12px",
    padding: "12px 16px",
    fontSize: "14px",
    outline: "none",
    width: "100%",
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: 600,
    color: theme.textMuted,
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const navLinks: NavLink[] = [];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md"
        style={{
          backgroundColor: `${theme.bg}eb`,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
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
              {cafeName}
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

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
          {submitted ? (
            <ConfirmationView
              fullName={fullName}
              cafeName={cafeName}
              theme={theme}
              onReset={() => {
                setFullName("");
                setEmail("");
                setPhone("");
                setPosition("barista");
                setMessage("");
                setSubmitted(false);
              }}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Header */}
              <header
                className="mb-10 pb-8"
                style={{ borderBottom: `1px solid ${theme.border}` }}
              >
                <p
                  className="text-xs font-bold tracking-[0.3em] uppercase mb-4"
                  style={{ color: theme.gold }}
                >
                  Trabaja con nosotros
                </p>
                <h1
                  className="font-black leading-tight mb-4"
                  style={{
                    color: theme.text,
                    fontSize: "clamp(2rem, 4vw + 0.5rem, 3.5rem)",
                  }}
                >
                  ¿Quieres ser parte del equipo?
                </h1>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: theme.textMuted }}
                >
                  En {cafeName} estamos siempre buscando personas que amen el
                  café y el buen servicio. Cuéntanos quién eres, qué te
                  apasiona y nos pondremos en contacto contigo.
                </p>
              </header>

              {/* Vacantes activas */}
              {!loadingPositions && (
                <VacanciesSection
                  positions={activePositions}
                  selectedPosition={position}
                  onApply={handleApplyToPosition}
                  theme={theme}
                />
              )}

              {/* Form */}
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="space-y-5 scroll-mt-24"
              >
                {/* Name */}
                <div>
                  <label style={labelStyle}>
                    <User className="h-3.5 w-3.5" />
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    placeholder="Tu nombre completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>
                      <Mail className="h-3.5 w-3.5" />
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      placeholder="tu@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={inputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      <Phone className="h-3.5 w-3.5" />
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      placeholder="3001234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>

                {/* Position */}
                <div>
                  <label style={labelStyle}>
                    <Briefcase className="h-3.5 w-3.5" />
                    Cargo de interés *
                  </label>
                  <select
                    value={position}
                    onChange={(e) =>
                      setPosition(e.target.value as JobPosition)
                    }
                    style={inputStyle}
                    required
                  >
                    {POSITIONS.map((p) => (
                      <option
                        key={p.value}
                        value={p.value}
                        style={{ backgroundColor: theme.bgCard }}
                      >
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label style={labelStyle}>
                    <MessageSquare className="h-3.5 w-3.5" />
                    Cuéntanos sobre ti (opcional)
                  </label>
                  <textarea
                    placeholder="Experiencia previa, disponibilidad, por qué quieres trabajar con nosotros..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    style={{
                      ...inputStyle,
                      resize: "none",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                {/* Error */}
                {error && (
                  <p
                    className="text-xs px-4 py-3 rounded-xl"
                    style={{
                      backgroundColor: "rgba(220,38,38,0.1)",
                      border: "1px solid rgba(220,38,38,0.2)",
                      color: "#ef4444",
                    }}
                  >
                    {error}
                  </p>
                )}

                {/* Submit */}
                <div className="pt-2">
                  <motion.button
                    type="submit"
                    disabled={createApplication.isPending}
                    whileHover={{
                      scale: createApplication.isPending ? 1 : 1.02,
                    }}
                    whileTap={{ scale: createApplication.isPending ? 1 : 0.98 }}
                    className="w-full py-3.5 rounded-xl text-sm font-bold cursor-pointer flex items-center justify-center gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${theme.gold}, ${theme.amber})`,
                      color: theme.bg,
                      opacity: createApplication.isPending ? 0.5 : 1,
                    }}
                  >
                    <Send className="h-4 w-4" />
                    {createApplication.isPending
                      ? "Enviando..."
                      : "Enviar postulación"}
                  </motion.button>
                  <p
                    className="text-xs text-center mt-3"
                    style={{ color: theme.textFaint }}
                  >
                    Te contactaremos lo antes posible al correo o teléfono que
                    nos dejes.
                  </p>
                </div>
              </form>
            </motion.div>
          )}
        </div>
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

interface ConfirmationViewProps {
  fullName: string;
  cafeName: string;
  theme: ReturnType<typeof buildCafeTheme>;
  onReset: () => void;
}

function ConfirmationView({
  fullName,
  cafeName,
  theme,
  onReset,
}: ConfirmationViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center text-center gap-5 py-10"
    >
      <div
        className="rounded-full p-4"
        style={{
          backgroundColor: "rgba(34,197,94,0.15)",
          border: "1px solid rgba(34,197,94,0.35)",
        }}
      >
        <CheckCircle2
          className="h-14 w-14"
          style={{ color: "#22c55e" }}
        />
      </div>
      <h2
        className="font-black"
        style={{
          color: theme.text,
          fontSize: "clamp(1.75rem, 3vw + 0.5rem, 2.5rem)",
        }}
      >
        ¡Postulación recibida!
      </h2>
      <p
        className="text-base leading-relaxed max-w-md"
        style={{ color: theme.textMuted }}
      >
        Gracias <strong style={{ color: theme.text }}>{fullName}</strong>, tu
        postulación llegó a {cafeName}. Estaremos revisándola en los próximos
        días y te contactaremos por el correo o teléfono que nos dejaste.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${theme.gold}, ${theme.amber})`,
            color: theme.bg,
          }}
        >
          Volver al inicio
        </Link>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold cursor-pointer transition-all hover:opacity-70"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.border}`,
            color: theme.textMuted,
          }}
        >
          Enviar otra postulación
        </button>
      </div>
    </motion.div>
  );
}

// ── Sección de vacantes activas ─────────────────────────────────────────

const POSITION_LABELS: Record<JobPosition, string> = {
  barista: "Barista",
  mesero: "Mesero / Mesera",
  cocina: "Cocina",
  caja: "Cajero / Cajera",
  gerencia: "Gerencia / Administración",
  otro: "Otro",
};

interface VacanciesSectionProps {
  positions: HiringPosition[];
  selectedPosition: JobPosition;
  onApply: (position: HiringPosition) => void;
  theme: ReturnType<typeof buildCafeTheme>;
}

function VacanciesSection({
  positions,
  selectedPosition,
  onApply,
  theme,
}: VacanciesSectionProps) {
  const hasVacancies = positions.length > 0;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <Sparkles className="h-5 w-5" style={{ color: theme.gold }} />
        <h2
          className="text-xl font-black"
          style={{ color: theme.text }}
        >
          {hasVacancies
            ? `Vacantes abiertas (${positions.length})`
            : "Postulación general"}
        </h2>
      </div>

      {!hasVacancies ? (
        // Sin vacantes activas
        <div
          className="rounded-xl p-6 flex items-start gap-4"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px dashed ${theme.border}`,
          }}
        >
          <div
            className="shrink-0 p-3 rounded-xl"
            style={{
              backgroundColor: `${theme.gold}15`,
              border: `1px solid ${theme.borderGold}`,
            }}
          >
            <Inbox className="h-5 w-5" style={{ color: theme.gold }} />
          </div>
          <div>
            <p
              className="text-sm font-bold mb-1"
              style={{ color: theme.text }}
            >
              No tenemos vacantes abiertas en este momento
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: theme.textMuted }}
            >
              Pero si crees que puedes aportar al equipo, llena el formulario y
              guardaremos tu información para cuando abramos posiciones.
            </p>
          </div>
        </div>
      ) : (
        // Lista de vacantes
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {positions.map((pos, index) => {
              const isSelected = selectedPosition === pos.position;
              const title =
                pos.title_custom?.trim() || POSITION_LABELS[pos.position];
              return (
                <motion.div
                  key={pos.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: theme.bgCard,
                    border: `1.5px solid ${isSelected ? theme.gold : theme.border}`,
                    boxShadow: isSelected
                      ? `0 8px 24px ${theme.gold}30`
                      : "none",
                    transition: "all 0.25s ease",
                  }}
                >
                  {pos.is_featured && (
                    <div
                      className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${theme.gold}22`,
                        border: `1px solid ${theme.borderGold}`,
                        color: theme.gold,
                      }}
                    >
                      <Star className="h-3 w-3 fill-current" />
                      Destacada
                    </div>
                  )}

                  <div className="p-5">
                    <p
                      className="text-[11px] font-bold tracking-[0.15em] uppercase mb-2"
                      style={{ color: theme.gold }}
                    >
                      {POSITION_LABELS[pos.position]}
                    </p>
                    <h3
                      className="font-black text-base leading-tight mb-2 pr-20"
                      style={{ color: theme.text }}
                    >
                      {title}
                    </h3>
                    {pos.description?.trim() && (
                      <p
                        className="text-sm leading-relaxed mb-3"
                        style={{ color: theme.textMuted }}
                      >
                        {pos.description}
                      </p>
                    )}
                    {pos.requirements?.trim() && (
                      <div className="mb-4">
                        <p
                          className="text-[10px] font-bold tracking-wider uppercase mb-1.5"
                          style={{ color: theme.textFaint }}
                        >
                          Requisitos
                        </p>
                        <p
                          className="text-xs leading-relaxed whitespace-pre-line"
                          style={{ color: theme.textMuted }}
                        >
                          {pos.requirements}
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => onApply(pos)}
                      className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full cursor-pointer transition-all hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${theme.gold}, ${theme.amber})`,
                        color: theme.bg,
                        boxShadow: `0 4px 12px ${theme.gold}40`,
                      }}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Cargo seleccionado
                        </>
                      ) : (
                        <>
                          Aplicar a esta vacante
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {hasVacancies && (
        <p
          className="text-xs text-center mt-4"
          style={{ color: theme.textFaint }}
        >
          También puedes postularte a otro cargo más abajo aunque no aparezca
          aquí — guardaremos tu información.
        </p>
      )}
    </section>
  );
}
