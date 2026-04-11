import { motion } from "framer-motion";
import { Coffee } from "lucide-react";
import type { Product } from "@/types";
import type { CafeTheme } from "../cafeTheme";

interface FeaturedProductsSectionProps {
  products: Product[];
  theme: CafeTheme;
}

export function FeaturedProductsSection({
  products,
  theme,
}: FeaturedProductsSectionProps) {
  return (
    <section
      id="menu"
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
            Selección especial
          </p>
          <h2
            className="text-4xl sm:text-6xl font-black leading-tight"
            style={{ color: theme.text }}
          >
            Nuestros <span style={{ color: theme.gold }}>Favoritos</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="group rounded-2xl overflow-hidden cursor-pointer"
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div className="relative h-56 overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: theme.bgLight }}
                  >
                    <Coffee
                      className="h-16 w-16 opacity-10"
                      style={{ color: theme.gold }}
                    />
                  </div>
                )}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(to top, ${theme.bg}90, transparent)`,
                  }}
                />
                <div
                  className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${theme.gold}, ${theme.amber})`,
                    color: "#0f0d0b",
                  }}
                >
                  ${product.price?.toLocaleString("es-CO")}
                </div>
              </div>
              <div className="p-6">
                <h3
                  className="font-bold text-lg mb-2"
                  style={{ color: theme.text }}
                >
                  {product.name}
                </h3>
                {product.description && (
                  <p
                    className="text-sm line-clamp-2 leading-relaxed"
                    style={{ color: theme.textMuted }}
                  >
                    {product.description}
                  </p>
                )}
              </div>
              <div
                className="h-0.5 w-0 group-hover:w-full transition-all duration-500"
                style={{
                  background: `linear-gradient(90deg, ${theme.gold}, ${theme.amber})`,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
