import { motion } from "framer-motion";
import { Coffee, Users } from "lucide-react";
import type { CafeSettings } from "@/types";
import type { CafeTheme } from "../cafeTheme";

interface AboutSectionProps {
  settings: CafeSettings;
  theme: CafeTheme;
}

export function AboutSection({ settings, theme }: AboutSectionProps) {
  return (
    <section
      id="nosotros"
      className="min-h-screen fluid-section-px fluid-section-py flex flex-col justify-center"
      style={{ backgroundColor: theme.bgSection }}
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p
              className="text-xs font-bold tracking-[0.4em] uppercase mb-5"
              style={{ color: theme.gold }}
            >
              {settings.about_kicker || "Quiénes somos"}
            </p>
            <h2
              className="fluid-h2 font-black mb-6 lg:mb-8"
              style={{ color: theme.text }}
            >
              {settings.about_title}
            </h2>
            <div
              className="h-px w-16 mb-8"
              style={{
                background: `linear-gradient(90deg, ${theme.gold}, transparent)`,
              }}
            />
            <p
              className="leading-relaxed text-base"
              style={{ color: theme.textMuted }}
            >
              {settings.about_description}
            </p>
          </motion.div>

          {settings.about_image_url ? (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img
                src={settings.about_image_url}
                alt="Sobre nosotros"
                loading="lazy"
                decoding="async"
                className="w-full h-125 object-cover rounded-3xl"
                style={{ border: `1px solid ${theme.border}` }}
              />
              <div
                className="absolute -bottom-5 -right-5 p-5 rounded-2xl shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${theme.gold}, ${theme.amber})`,
                }}
              >
                <Users className="h-6 w-6 text-black" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-100 rounded-3xl flex items-center justify-center"
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.border}`,
              }}
            >
              <Coffee
                className="h-24 w-24 opacity-10"
                style={{ color: theme.gold }}
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
