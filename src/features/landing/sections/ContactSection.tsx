import { motion } from "framer-motion";
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  AtSign,
  ExternalLink,
} from "lucide-react";
import type { CafeSettings } from "@/types";
import type { CafeTheme } from "../cafeTheme";

interface ContactSectionProps {
  settings: CafeSettings | undefined;
  theme: CafeTheme;
}

export function ContactSection({ settings, theme }: ContactSectionProps) {
  return (
    <section
      id="contacto"
      className="min-h-screen px-6 flex flex-col justify-center py-24"
      style={{ backgroundColor: theme.bg }}
    >
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p
            className="text-xs font-bold tracking-[0.4em] uppercase mb-4"
            style={{ color: theme.gold }}
          >
            Encuéntranos
          </p>
          <h2
            className="text-4xl sm:text-6xl font-black"
            style={{ color: theme.text }}
          >
            Visítanos
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Horarios */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-2xl p-8"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div className="flex items-center gap-4 mb-8">
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
                  Siempre listos para servirte
                </p>
              </div>
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

          {/* Contacto */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-2xl p-8"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div className="flex items-center gap-4 mb-8">
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
                  Con gusto te atendemos
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
            {(settings?.instagram_url || settings?.facebook_url) && (
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
                <div className="flex items-center gap-3">
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
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Mapa */}
        {settings?.maps_embed_url && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-2xl overflow-hidden"
            style={{
              border: `1px solid ${theme.border}`,
              height: "400px",
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
          </motion.div>
        )}
      </div>
    </section>
  );
}
