import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Coffee, Search } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";

const CAFE = {
  bg: "#0f0d0b",
  bgCard: "#1a1612",
  bgSection: "#141210",
  bgLight: "#1f1a15",
  border: "#2a2318",
  borderGold: "#8b6914",
  gold: "#d4a847",
  amber: "#c8864a",
  text: "#f5f0e8",
  textMuted: "#a89880",
  textFaint: "#5a4f42",
  white: "#ffffff",
};

interface MenuModalProps {
  open: boolean;
  onClose: () => void;
  cafeName?: string;
}

export function MenuModal({ open, onClose, cafeName }: MenuModalProps) {
  const { data: allProducts = [] } = useProducts();
  const { data: allCategories = [] } = useCategories();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Solo productos activos
  const activeProducts = allProducts.filter((p) => p.is_active);

  // Solo categorías que tienen al menos un producto activo
  const categoriesWithProducts = allCategories.filter((cat) =>
    activeProducts.some((p) => p.category_id === cat.id),
  );

  // Filtrar productos por categoría y búsqueda
  const filteredProducts = activeProducts.filter((p) => {
    const matchesCategory =
      activeCategory === "all" || p.category_id === activeCategory;
    const matchesSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden pointer-events-auto"
              style={{
                backgroundColor: CAFE.bg,
                border: `1px solid ${CAFE.border}`,
                boxShadow: `0 25px 80px rgba(0,0,0,0.8), 0 0 0 1px ${CAFE.borderGold}20`,
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-8 py-6 shrink-0"
                style={{ borderBottom: `1px solid ${CAFE.border}` }}
              >
                <div>
                  <p
                    className="text-xs font-bold tracking-[0.3em] uppercase mb-1"
                    style={{ color: CAFE.gold }}
                  >
                    Carta
                  </p>
                  <h2
                    className="text-2xl font-black"
                    style={{ color: CAFE.text }}
                  >
                    {cafeName ?? "Nuestro Menú"}
                  </h2>
                </div>

                <button
                  onClick={onClose}
                  className="p-2.5 rounded-full cursor-pointer transition-all hover:opacity-70"
                  style={{
                    backgroundColor: CAFE.bgLight,
                    border: `1px solid ${CAFE.border}`,
                    color: CAFE.textMuted,
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Buscador */}
              <div
                className="px-8 py-4 shrink-0"
                style={{ borderBottom: `1px solid ${CAFE.border}` }}
              >
                <div className="relative max-w-sm">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                    style={{ color: CAFE.textFaint }}
                  />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{
                      backgroundColor: CAFE.bgLight,
                      border: `1px solid ${CAFE.border}`,
                      color: CAFE.text,
                    }}
                  />
                </div>
              </div>

              {/* Tabs de categorías */}
              <div
                className="px-8 py-3 shrink-0 flex items-center gap-2 overflow-x-auto menu-modal-scroll"
                style={{ borderBottom: `1px solid ${CAFE.border}` }}
              >
                {/* Tab "Todos" */}
                <button
                  onClick={() => setActiveCategory("all")}
                  className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all"
                  style={{
                    backgroundColor:
                      activeCategory === "all" ? CAFE.gold : CAFE.bgLight,
                    color:
                      activeCategory === "all" ? "#0f0d0b" : CAFE.textMuted,
                    border: `1px solid ${activeCategory === "all" ? CAFE.gold : CAFE.border}`,
                  }}
                >
                  Todos
                </button>

                {categoriesWithProducts.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all"
                    style={{
                      backgroundColor:
                        activeCategory === cat.id ? CAFE.gold : CAFE.bgLight,
                      color:
                        activeCategory === cat.id ? "#0f0d0b" : CAFE.textMuted,
                      border: `1px solid ${activeCategory === cat.id ? CAFE.gold : CAFE.border}`,
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Productos — scrolleable */}
              <div className="flex-1 overflow-y-auto px-8 py-6 menu-modal-scroll">
                {filteredProducts.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center py-20"
                    style={{ color: CAFE.textFaint }}
                  >
                    <Coffee className="h-12 w-12 mb-4 opacity-30" />
                    <p className="text-sm">No hay productos disponibles</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product, index) => {
                      const finalPrice =
                        product.discount_price ??
                        (product.discount_percentage
                          ? product.price *
                            (1 - product.discount_percentage / 100)
                          : product.price);
                      const hasDiscount = finalPrice < product.price;

                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.04 }}
                          className="flex gap-4 p-4 rounded-2xl"
                          style={{
                            backgroundColor: CAFE.bgCard,
                            border: `1px solid ${CAFE.border}`,
                          }}
                        >
                          {/* Imagen */}
                          <div
                            className="shrink-0 w-20 h-20 rounded-xl overflow-hidden"
                            style={{ backgroundColor: CAFE.bgLight }}
                          >
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Coffee
                                  className="h-8 w-8 opacity-20"
                                  style={{ color: CAFE.gold }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h3
                                className="font-bold text-sm leading-tight mb-1"
                                style={{ color: CAFE.text }}
                              >
                                {product.name}
                              </h3>
                              {product.description && (
                                <p
                                  className="text-xs line-clamp-2 leading-relaxed"
                                  style={{ color: CAFE.textMuted }}
                                >
                                  {product.description}
                                </p>
                              )}
                            </div>

                            {/* Precio */}
                            <div className="flex items-center gap-2 mt-2">
                              <span
                                className="text-sm font-black"
                                style={{ color: CAFE.gold }}
                              >
                                {formatPrice(finalPrice)}
                              </span>
                              {hasDiscount && (
                                <span
                                  className="text-xs line-through"
                                  style={{ color: CAFE.textFaint }}
                                >
                                  {formatPrice(product.price)}
                                </span>
                              )}
                              {product.discount_percentage && (
                                <span
                                  className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: `${CAFE.gold}15`,
                                    color: CAFE.gold,
                                    border: `1px solid ${CAFE.borderGold}`,
                                  }}
                                >
                                  -{product.discount_percentage}%
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                className="px-8 py-4 shrink-0 flex items-center justify-between"
                style={{ borderTop: `1px solid ${CAFE.border}` }}
              >
                <p className="text-xs" style={{ color: CAFE.textFaint }}>
                  {filteredProducts.length} producto
                  {filteredProducts.length !== 1 ? "s" : ""}
                </p>
                <button
                  onClick={onClose}
                  className="text-xs px-5 py-2 rounded-full cursor-pointer font-medium transition-all hover:opacity-70"
                  style={{
                    border: `1px solid ${CAFE.border}`,
                    color: CAFE.textMuted,
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
