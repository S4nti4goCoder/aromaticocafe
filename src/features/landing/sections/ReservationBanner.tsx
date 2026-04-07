import { motion } from "framer-motion";
import { Calendar, MessageCircle } from "lucide-react";
import type { CafeSettings } from "@/types";
import { CAFE } from "../cafeTheme";

interface ReservationBannerProps {
  settings: CafeSettings;
}

export function ReservationBanner({ settings }: ReservationBannerProps) {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${CAFE.gold}18 0%, ${CAFE.amber}10 50%, ${CAFE.gold}08 100%)`,
          backgroundColor: CAFE.bgLight,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ border: `1px solid ${CAFE.borderGold}` }}
      />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div
            className="inline-flex items-center justify-center p-4 rounded-2xl mb-8"
            style={{
              backgroundColor: `${CAFE.gold}12`,
              border: `1px solid ${CAFE.borderGold}`,
            }}
          >
            <Calendar className="h-8 w-8" style={{ color: CAFE.gold }} />
          </div>
          <h2
            className="text-3xl sm:text-5xl font-black mb-5"
            style={{ color: CAFE.text }}
          >
            {settings.reservation_title}
          </h2>
          {settings.reservation_description && (
            <p
              className="text-lg mb-10 max-w-xl mx-auto leading-relaxed"
              style={{ color: CAFE.textMuted }}
            >
              {settings.reservation_description}
            </p>
          )}
          {settings.reservation_whatsapp && (
            <motion.a
              href={`https://wa.me/${settings.reservation_whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 px-9 py-4 rounded-full font-bold text-sm cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${CAFE.gold}, ${CAFE.amber})`,
                color: "#0f0d0b",
                boxShadow: `0 8px 40px ${CAFE.gold}30`,
              }}
            >
              <MessageCircle className="h-5 w-5" />
              Reservar por WhatsApp
            </motion.a>
          )}
        </motion.div>
      </div>
    </section>
  );
}
