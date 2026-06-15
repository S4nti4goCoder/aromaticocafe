import { motion } from "framer-motion";
import { Coffee, ArrowRight } from "lucide-react";
import type { CafeSettings, Category, Product } from "@/types";
import type { CafeTheme } from "../cafeTheme";

interface CategoriesSectionProps {
  categories: Category[];
  products: Product[];
  settings: CafeSettings | undefined;
  theme: CafeTheme;
  onSelectCategory: (categoryId: string) => void;
  onOpenMenu: () => void;
}

export function CategoriesSection({
  categories,
  products,
  settings,
  theme,
  onSelectCategory,
  onOpenMenu,
}: CategoriesSectionProps) {
  const kicker = settings?.categories_section_kicker || "Nuestro menú";
  const title = settings?.categories_section_title || "Explora por categoría";

  // Only show categories that have at least one active product, with a count.
  const activeProducts = products.filter((p) => p.is_active);
  const categoriesWithCount = categories
    .filter((c) => c.is_active)
    .map((c) => ({
      ...c,
      productCount: activeProducts.filter((p) => p.category_id === c.id).length,
    }))
    .filter((c) => c.productCount > 0);

  if (categoriesWithCount.length === 0) return null;

  return (
    <section
      id="categorias"
      className="min-h-screen fluid-section-px fluid-section-py flex flex-col justify-center"
      style={{ backgroundColor: theme.bgSection }}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categoriesWithCount.map((cat, index) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              whileHover={{ y: -4 }}
              onClick={() => onSelectCategory(cat.id)}
              className="group relative overflow-hidden rounded-2xl cursor-pointer text-left h-[clamp(150px,20vh,240px)]"
              style={{
                border: `1px solid ${theme.border}`,
              }}
            >
              {cat.image_url ? (
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: theme.bgLight }}
                >
                  <Coffee
                    className="h-14 w-14 opacity-10"
                    style={{ color: theme.gold }}
                  />
                </div>
              )}

              {/* Gradient overlay para legibilidad */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 45%, transparent 75%)",
                }}
              />

              <div
                className="absolute top-3 right-3 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-10"
                style={{
                  backgroundColor: theme.gold,
                  color: theme.bg,
                }}
              >
                <ArrowRight className="h-4 w-4" />
              </div>

              {/* Texto superpuesto en la parte inferior */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                <p
                  className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1.5"
                  style={{ color: theme.gold }}
                >
                  {cat.productCount}{" "}
                  {cat.productCount === 1 ? "producto" : "productos"}
                </p>
                <h3
                  className="font-black leading-tight text-lg truncate"
                  style={{ color: "#ffffff" }}
                >
                  {cat.name}
                </h3>
              </div>
            </motion.button>
          ))}
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
