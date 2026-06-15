import { motion } from "framer-motion";
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  AtSign,
  ExternalLink,
  MessageCircle,
  Navigation,
} from "lucide-react";
import type { CafeSettings } from "@/types";
import type { CafeTheme } from "../cafeTheme";
import { isSafeMapsEmbedUrl } from "@/lib/maps";

interface ContactSectionProps {
  settings: CafeSettings | undefined;
  theme: CafeTheme;
}

// Parse "7:00 AM - 5:00 PM" or "07:00 - 17:00" into 24h-decimal {open, close}.
function parseHourRange(
  rangeStr: string | null | undefined,
): { open: number; close: number } | null {
  if (!rangeStr || rangeStr.trim().toLowerCase() === "cerrado") return null;
  const m = rangeStr.match(
    /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*[-–—a]+\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
  );
  if (!m) return null;
  const toDecimal = (h: string, min: string | undefined, ap: string | undefined) => {
    let hh = parseInt(h, 10);
    const mm = min ? parseInt(min, 10) : 0;
    const period = ap?.toLowerCase();
    if (period === "pm" && hh < 12) hh += 12;
    if (period === "am" && hh === 12) hh = 0;
    return hh + mm / 60;
  };
  const open = toDecimal(m[1], m[2], m[3]);
  const close = toDecimal(m[4], m[5], m[6]);
  if (isNaN(open) || isNaN(close)) return null;
  return { open, close };
}

// Returns true/false if we can confidently say, or null if hours are unknown.
function isOpenNow(settings: CafeSettings | undefined): boolean | null {
  if (!settings) return null;
  const now = new Date();
  const day = now.getDay();
  let rangeStr: string | null | undefined;
  if (day === 0) rangeStr = settings.sunday;
  else if (day === 6) rangeStr = settings.saturday;
  else rangeStr = settings.monday_friday;
  if (!rangeStr) return null;
  if (rangeStr.trim().toLowerCase() === "cerrado") return false;
  const range = parseHourRange(rangeStr);
  if (!range) return null;
  const current = now.getHours() + now.getMinutes() / 60;
  return current >= range.open && current < range.close;
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

export function ContactSection({ settings, theme }: ContactSectionProps) {
  const kicker = settings?.contact_section_kicker || "Encuéntranos";
  const title = settings?.contact_section_title || "Visítanos";
  const hoursSubtitle =
    settings?.contact_section_hours_subtitle || "Siempre listos para servirte";
  const contactSubtitle =
    settings?.contact_section_contact_subtitle || "Con gusto te atendemos";

  const openStatus = isOpenNow(settings);
  const whatsappHref = settings?.whatsapp
    ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`
    : null;
  const directionsHref = settings?.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        settings.address,
      )}`
    : null;

  return (
    <section
      id="contacto"
      className="min-h-screen fluid-section-px fluid-section-py flex flex-col justify-center"
      style={{ backgroundColor: theme.bg }}
    >
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-[clamp(1rem,3vh,2rem)]"
        >
          <p
            className="text-xs font-bold tracking-[0.4em] uppercase mb-[clamp(0.5rem,1.5vh,1rem)]"
            style={{ color: theme.gold }}
          >
            {kicker}
          </p>
          <h2
            className="fluid-h2 font-black"
            style={{ color: theme.text }}
          >
            {title}
          </h2>
        </motion.div>

        {whatsappHref && (
          <motion.a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.01, y: -2 }}
            className="flex items-center justify-between gap-4 p-6 rounded-2xl mb-6 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #25D366, #128C7E)",
              color: "#ffffff",
            }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-lg leading-tight">
                  Chatea con nosotros
                </p>
                <p className="text-sm opacity-90">{settings?.whatsapp}</p>
              </div>
            </div>
            <ExternalLink className="h-5 w-5 shrink-0" />
          </motion.a>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[clamp(0.75rem,2vh,1.5rem)] mb-[clamp(0.75rem,2vh,2rem)]">
          {/* Opening hours */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-2xl p-[clamp(1rem,2.5vh,1.5rem)]"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div className="flex items-center justify-between gap-4 mb-[clamp(0.75rem,2vh,1.25rem)] flex-wrap">
              <div className="flex items-center gap-4">
                <div
                  className="p-3 rounded-xl"
                  style={{
                    backgroundColor: `${theme.gold}10`,
                    border: `1px solid ${theme.borderGold}`,
                  }}
                >
                  <Clock className="h-5 w-5" style={{ color: theme.gold }} />
                </div>
                <div>
                  <h3
                    className="font-bold text-lg"
                    style={{ color: theme.text }}
                  >
                    Horarios
                  </h3>
                  <p className="text-xs" style={{ color: theme.textFaint }}>
                    {hoursSubtitle}
                  </p>
                </div>
              </div>
              {openStatus !== null && (
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: openStatus
                      ? "rgba(34,197,94,0.12)"
                      : "rgba(220,38,38,0.12)",
                    color: openStatus ? "#22c55e" : "#ef4444",
                    border: `1px solid ${
                      openStatus ? "rgba(34,197,94,0.25)" : "rgba(220,38,38,0.25)"
                    }`,
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: openStatus ? "#22c55e" : "#ef4444",
                    }}
                  />
                  {openStatus ? "Abierto ahora" : "Cerrado ahora"}
                </div>
              )}
            </div>
            {[
              { label: "Lunes — Viernes", value: settings?.monday_friday },
              { label: "Sábado", value: settings?.saturday },
              { label: "Domingo", value: settings?.sunday },
            ]
              .filter((h) => h.value)
              .map((horario, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-4"
                  style={{ borderBottom: `1px solid ${theme.border}` }}
                >
                  <span className="text-sm" style={{ color: theme.textMuted }}>
                    {horario.label}
                  </span>
                  <span
                    className="text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        horario.value?.toLowerCase() === "cerrado"
                          ? "rgba(220,38,38,0.1)"
                          : `${theme.gold}10`,
                      color:
                        horario.value?.toLowerCase() === "cerrado"
                          ? "#ef4444"
                          : theme.gold,
                      border: `1px solid ${
                        horario.value?.toLowerCase() === "cerrado"
                          ? "rgba(220,38,38,0.2)"
                          : theme.borderGold
                      }`,
                    }}
                  >
                    {horario.value}
                  </span>
                </div>
              ))}
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-2xl p-[clamp(1rem,2.5vh,1.5rem)]"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div className="flex items-center gap-4 mb-[clamp(0.75rem,2vh,1.25rem)]">
              <div
                className="p-3 rounded-xl"
                style={{
                  backgroundColor: `${theme.gold}10`,
                  border: `1px solid ${theme.borderGold}`,
                }}
              >
                <Phone className="h-5 w-5" style={{ color: theme.gold }} />
              </div>
              <div>
                <h3
                  className="font-bold text-lg"
                  style={{ color: theme.text }}
                >
                  Contacto
                </h3>
                <p className="text-xs" style={{ color: theme.textFaint }}>
                  {contactSubtitle}
                </p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              {settings?.address && (
                <div
                  className="flex items-start gap-4 p-4 rounded-xl"
                  style={{
                    backgroundColor: theme.bgLight,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <MapPin
                    className="h-4 w-4 mt-0.5 shrink-0"
                    style={{ color: theme.gold }}
                  />
                  <span className="text-sm" style={{ color: theme.textMuted }}>
                    {settings.address}
                  </span>
                </div>
              )}
              {settings?.phone && (
                <motion.a
                  href={`tel:${settings.phone}`}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer"
                  style={{
                    backgroundColor: theme.bgLight,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <Phone
                    className="h-4 w-4 shrink-0"
                    style={{ color: theme.gold }}
                  />
                  <span className="text-sm" style={{ color: theme.textMuted }}>
                    {settings.phone}
                  </span>
                </motion.a>
              )}
              {settings?.email && (
                <motion.a
                  href={`mailto:${settings.email}`}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer"
                  style={{
                    backgroundColor: theme.bgLight,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <Mail
                    className="h-4 w-4 shrink-0"
                    style={{ color: theme.gold }}
                  />
                  <span className="text-sm" style={{ color: theme.textMuted }}>
                    {settings.email}
                  </span>
                </motion.a>
              )}
            </div>
            {(settings?.instagram_url ||
              settings?.facebook_url ||
              settings?.tiktok_url) && (
              <div
                className="pt-5"
                style={{ borderTop: `1px solid ${theme.border}` }}
              >
                <p
                  className="text-xs uppercase tracking-widest mb-4 font-medium"
                  style={{ color: theme.textFaint }}
                >
                  Síguenos
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {settings?.instagram_url && (
                    <motion.a
                      href={settings.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.06, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium cursor-pointer"
                      style={{
                        backgroundColor: theme.bgLight,
                        border: `1px solid ${theme.border}`,
                        color: theme.textMuted,
                      }}
                    >
                      <AtSign className="h-3.5 w-3.5" />
                      Instagram
                    </motion.a>
                  )}
                  {settings?.facebook_url && (
                    <motion.a
                      href={settings.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.06, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium cursor-pointer"
                      style={{
                        backgroundColor: theme.bgLight,
                        border: `1px solid ${theme.border}`,
                        color: theme.textMuted,
                      }}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Facebook
                    </motion.a>
                  )}
                  {settings?.tiktok_url && (
                    <motion.a
                      href={settings.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.06, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium cursor-pointer"
                      style={{
                        backgroundColor: theme.bgLight,
                        border: `1px solid ${theme.border}`,
                        color: theme.textMuted,
                      }}
                    >
                      <TikTokIcon className="h-3.5 w-3.5" />
                      TikTok
                    </motion.a>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Map */}
        {settings?.maps_embed_url &&
          isSafeMapsEmbedUrl(settings.maps_embed_url) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-2xl overflow-hidden relative"
            style={{
              border: `1px solid ${theme.border}`,
              height: "clamp(200px, 28vh, 360px)",
            }}
          >
            <iframe
              src={settings.maps_embed_url}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            {directionsHref && (
              <motion.a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="absolute bottom-5 right-5 inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold shadow-lg cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${theme.gold}, ${theme.amber})`,
                  color: theme.bg,
                  boxShadow: `0 8px 24px ${theme.gold}50`,
                }}
              >
                <Navigation className="h-4 w-4" />
                Cómo llegar
              </motion.a>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
