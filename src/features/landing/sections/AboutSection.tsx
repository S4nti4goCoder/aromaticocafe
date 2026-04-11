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
      className="min-h-screen px-6 flex flex-col justify-center py-24"
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
              Quiénes somos
            </p>
            <h2
              className="text-4xl sm:text-6xl font-black mb-8 leading-tight"
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
            <div className="grid grid-cols-3 gap-4 mt-10">
              {[
                { value: "6+", label: "Años" },
                { value: "50+", label: "Productos" },
                { value: "1K+", label: "Clientes" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center p-5 rounded-2xl"
                  style={{
                    backgroundColor: theme.bgCard,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <p
                    className="text-3xl font-black"
                    style={{ color: theme.gold }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-xs mt-1 font-medium"
                    style={{ color: theme.textFaint }}
                  >
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
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
