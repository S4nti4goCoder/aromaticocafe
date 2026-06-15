import { motion } from "framer-motion";
import { Coffee, ArrowRight } from "lucide-react";
import type { CafeSettings, Product } from "@/types";
import { useCategories } from "@/hooks/useCategories";
import type { CafeTheme } from "../cafeTheme";

interface FeaturedProductsSectionProps {
  products: Product[];
  settings: CafeSettings | undefined;
  theme: CafeTheme;
  onOpenMenu: () => void;
}

export function FeaturedProductsSection({
  products,
  settings,
  theme,
  onOpenMenu,
}: FeaturedProductsSectionProps) {
  const { data: categories = [] } = useCategories();
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const kicker = settings?.featured_section_kicker || "Selección especial";
  const title = settings?.featured_section_title || "Nuestros Favoritos";

  return (
    <section
      id="menu"
      className="min-h-screen fluid-section-px fluid-section-py flex flex-col justify-center"
      style={{ backgroundColor: theme.bg }}
    >
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-[clamp(1rem,4vh,3rem)]"
        >
          <p
            className="text-xs font-bold tracking-[0.4em] uppercase mb-4"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product, index) => {
            const category = product.category_id
              ? categoryById.get(product.category_id)
              : null;
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer h-[clamp(170px,22vh,260px)]"
                style={{
                  border: `1px solid ${theme.border}`,
                }}
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    style={{ objectPosition: "center 55%" }}
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: theme.bgLight }}
                  >
                    <Coffee
                      className="h-16 w-16 opacity-10"
                      style={{ color: theme.gold }}
                    />
                  </div>
                )}

                {/* Gradient overlay para legibilidad del texto inferior */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 45%, transparent 75%)",
                  }}
                />

                {product.is_new && (
                  <div
                    className="absolute top-4 left-4 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase z-10"
                    style={{
                      backgroundColor: theme.gold,
                      color: theme.bg,
                    }}
                  >
                    Nuevo
                  </div>
                )}
                <div
                  className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold z-10"
                  style={{
                    background: `linear-gradient(135deg, ${theme.gold}, ${theme.amber})`,
                    color: theme.bg,
                  }}
                >
                  ${product.price?.toLocaleString("es-CO")}
                </div>

                {/* Texto superpuesto en la parte inferior de la imagen */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                  {category && (
                    <p
                      className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1.5"
                      style={{ color: theme.gold }}
                    >
                      {category.name}
                    </p>
                  )}
                  <h3
                    className="font-bold text-lg leading-tight"
                    style={{ color: "#ffffff" }}
                  >
                    {product.name}
                  </h3>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-[clamp(1rem,3vh,2.5rem)] flex justify-center"
        >
          <motion.button
            onClick={onOpenMenu}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${theme.gold}, ${theme.amber})`,
              color: theme.bg,
              boxShadow: `0 8px 24px ${theme.gold}40`,
            }}
          >
            Ver menú completo
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
