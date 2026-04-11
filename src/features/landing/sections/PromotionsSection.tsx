import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { Promotion } from "@/types";
import type { CafeTheme } from "../cafeTheme";

interface PromotionsSectionProps {
  promotions: Promotion[];
  theme: CafeTheme;
}

export function PromotionsSection({ promotions, theme }: PromotionsSectionProps) {
  return (
    <section
      id="promociones"
      className="min-h-screen px-6 flex flex-col justify-center py-24"
      style={{ backgroundColor: theme.bgSection }}
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
            Ofertas especiales
          </p>
          <h2
            className="text-4xl sm:text-6xl font-black"
            style={{ color: theme.text }}
          >
            Promociones
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo, index) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="p-7 rounded-2xl relative overflow-hidden"
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-12 translate-x-12 opacity-5"
                style={{ backgroundColor: theme.gold }}
              />
              <div className="relative z-10">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5"
                  style={{
                    backgroundColor: `${theme.gold}12`,
                    border: `1px solid ${theme.borderGold}`,
                    color: theme.gold,
                  }}
                >
                  <Star className="h-3 w-3 fill-current" />
                  {promo.type === "2x1"
                    ? "2x1"
                    : promo.type === "descuento_porcentaje"
                      ? `${promo.value}% OFF`
                      : promo.type === "precio_fijo"
                        ? `$${promo.value?.toLocaleString("es-CO")}`
                        : "Oferta"}
                </div>
                <h3
                  className="font-bold text-xl mb-3"
                  style={{ color: theme.text }}
                >
                  {promo.name}
                </h3>
                {promo.description && (
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: theme.textMuted }}
                  >
                    {promo.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
