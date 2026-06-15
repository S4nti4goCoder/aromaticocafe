import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Coffee, Search } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import type { CafeTheme } from "./cafeTheme";

interface MenuModalProps {
  open: boolean;
  onClose: () => void;
  cafeName?: string;
  theme: CafeTheme;
  initialCategoryId?: string;
}

export function MenuModal({
  open,
  onClose,
  cafeName,
  theme,
  initialCategoryId,
}: MenuModalProps) {
  const { data: allProducts = [] } = useProducts();
  const { data: allCategories = [] } = useCategories();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Sync the active tab whenever the modal opens (e.g. clicking a category card
  // from the landing should pre-select that category in the modal).
  useEffect(() => {
    if (open) {
      setActiveCategory(initialCategoryId || "all");
      setSearch("");
    }
  }, [open, initialCategoryId]);

  // Active products only
  const activeProducts = allProducts.filter((p) => p.is_active);

  // Only categories that have at least one active product
  const categoriesWithProducts = allCategories.filter((cat) =>
    activeProducts.some((p) => p.category_id === cat.id),
  );

  // Filter products by category and search
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
                backgroundColor: theme.bg,
                border: `1px solid ${theme.border}`,
                boxShadow: `0 25px 80px rgba(0,0,0,0.8), 0 0 0 1px ${theme.borderGold}20`,
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-8 py-6 shrink-0"
                style={{ borderBottom: `1px solid ${theme.border}` }}
              >
                <div>
                  <p
                    className="text-xs font-bold tracking-[0.3em] uppercase mb-1"
                    style={{ color: theme.gold }}
                  >
                    Carta
                  </p>
                  <h2
                    className="text-2xl font-black"
                    style={{ color: theme.text }}
                  >
                    {cafeName ?? "Nuestro Menú"}
                  </h2>
                </div>

                <button
                  onClick={onClose}
                  className="p-2.5 rounded-full cursor-pointer transition-all hover:opacity-70"
                  style={{
                    backgroundColor: theme.bgLight,
                    border: `1px solid ${theme.border}`,
                    color: theme.textMuted,
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search box */}
              <div
                className="px-8 py-4 shrink-0"
                style={{ borderBottom: `1px solid ${theme.border}` }}
              >
                <div className="relative max-w-sm">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                    style={{ color: theme.textFaint }}
                  />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{
                      backgroundColor: theme.bgLight,
                      border: `1px solid ${theme.border}`,
                      color: theme.text,
                    }}
                  />
                </div>
              </div>

              {/* Category tabs */}
              <div
                className="px-8 py-3 shrink-0 flex items-center gap-2 overflow-x-auto menu-modal-scroll"
                style={{ borderBottom: `1px solid ${theme.border}` }}
              >
                {/* "All" tab */}
                <button
                  onClick={() => setActiveCategory("all")}
                  className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all"
                  style={{
                    backgroundColor:
                      activeCategory === "all" ? theme.gold : theme.bgLight,
                    color:
                      activeCategory === "all" ? theme.bg : theme.textMuted,
                    border: `1px solid ${activeCategory === "all" ? theme.gold : theme.border}`,
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
                        activeCategory === cat.id ? theme.gold : theme.bgLight,
                      color:
                        activeCategory === cat.id ? theme.bg : theme.textMuted,
                      border: `1px solid ${activeCategory === cat.id ? theme.gold : theme.border}`,
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Products — scrollable */}
              <div className="flex-1 overflow-y-auto px-8 py-6 menu-modal-scroll">
                {filteredProducts.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center py-20"
                    style={{ color: theme.textFaint }}
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
                            backgroundColor: theme.bgCard,
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          {/* Image */}
                          <div
                            className="shrink-0 w-20 h-20 rounded-xl overflow-hidden"
                            style={{ backgroundColor: theme.bgLight }}
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
                                  style={{ color: theme.gold }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h3
                                className="font-bold text-sm leading-tight mb-1"
                                style={{ color: theme.text }}
                              >
                                {product.name}
                              </h3>
                              {product.description && (
                                <p
                                  className="text-xs line-clamp-2 leading-relaxed"
                                  style={{ color: theme.textMuted }}
                                >
                                  {product.description}
                                </p>
                              )}
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-2 mt-2">
                              <span
                                className="text-sm font-black"
                                style={{ color: theme.gold }}
                              >
                                {formatPrice(finalPrice)}
                              </span>
                              {hasDiscount && (
                                <span
                                  className="text-xs line-through"
                                  style={{ color: theme.textFaint }}
                                >
                                  {formatPrice(product.price)}
                                </span>
                              )}
                              {product.discount_percentage && (
                                <span
                                  className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: `${theme.gold}15`,
                                    color: theme.gold,
                                    border: `1px solid ${theme.borderGold}`,
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
                style={{ borderTop: `1px solid ${theme.border}` }}
              >
                <p className="text-xs" style={{ color: theme.textFaint }}>
                  {filteredProducts.length} producto
                  {filteredProducts.length !== 1 ? "s" : ""}
                </p>
                <button
                  onClick={onClose}
                  className="text-xs px-5 py-2 rounded-full cursor-pointer font-medium transition-all hover:opacity-70"
                  style={{
                    border: `1px solid ${theme.border}`,
                    color: theme.textMuted,
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
