import { motion, type MotionValue } from "framer-motion";
import { Coffee, ChevronDown } from "lucide-react";
import type { CafeSettings } from "@/types";
import type { CafeTheme } from "../cafeTheme";

interface HeroSectionProps {
  settings: CafeSettings | undefined;
  heroOpacity: MotionValue<number>;
  heroScale: MotionValue<number>;
  onOpenMenu: () => void;
  theme: CafeTheme;
}

export function HeroSection({
  settings,
  heroOpacity,
  heroScale,
  onOpenMenu,
  theme,
}: HeroSectionProps) {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <motion.div className="absolute inset-0" style={{ scale: heroScale }}>
        {settings?.cover_url ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${settings.cover_url})` }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: theme.bgLight }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  radial-gradient(ellipse at 20% 50%, ${theme.gold}10 0%, transparent 60%),
                  radial-gradient(ellipse at 80% 20%, ${theme.amber}08 0%, transparent 50%)
                `,
              }}
            />
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{
            background: settings?.cover_url
              ? "linear-gradient(to bottom, rgba(15,13,11,0.55) 0%, rgba(15,13,11,0.3) 40%, rgba(15,13,11,0.85) 100%)"
              : "transparent",
          }}
        />
      </motion.div>

      <motion.div
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        style={{ opacity: heroOpacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{
              backgroundColor: `${theme.gold}15`,
              border: `1px solid ${theme.borderGold}`,
              color: theme.gold,
            }}
          >
            <Coffee className="h-3 w-3" />
            Bienvenidos
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="font-black tracking-tight leading-none mb-6"
          style={{
            color: theme.white,
            fontSize: "clamp(3rem, 10vw, 8rem)",
            textShadow: "0 4px 40px rgba(0,0,0,0.5)",
          }}
        >
          {settings?.cafe_name ?? "Aromático Café"}
        </motion.h1>

        {settings?.slogan && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed"
            style={{ color: "rgba(245,240,232,0.75)" }}
          >
            {settings.slogan}
          </motion.p>
        )}

        {settings?.show_menu_button !== false && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <motion.button
              onClick={onOpenMenu}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${theme.gold}, ${theme.amber})`,
                color: "#0f0d0b",
                boxShadow: `0 8px 32px ${theme.gold}30`,
              }}
            >
              <Coffee className="h-4 w-4" />
              Ver menú
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
      >
        <span
          className="text-xs tracking-[0.3em] uppercase font-medium"
          style={{ color: theme.textFaint }}
        >
          Scroll
        </span>
        <ChevronDown className="h-4 w-4" style={{ color: theme.textFaint }} />
      </motion.div>
    </section>
  );
}
