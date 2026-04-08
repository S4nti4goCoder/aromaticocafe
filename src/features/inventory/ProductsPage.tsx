import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Pencil, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useProducts,
  useDeleteProduct,
  useToggleProductActive,
} from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useActivePromotions } from "@/hooks/usePromotions";
import { ProductFormModal } from "@/features/inventory/ProductFormModal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";
import type { Product } from "@/types";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);

export function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [modal, setModal] = useState<{
    open: boolean;
    product?: Product | null;
  }>({ open: false });
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: activePromotions = [] } = useActivePromotions();
  const deleteProduct = useDeleteProduct();
  const toggleActive = useToggleProductActive();

  // Mapa de descuentos activos por producto (directo o vía categoría)
  const productPromoMap = new Map<
    string,
    { type: string; value: number; name: string }
  >();
  for (const promo of activePromotions) {
    if (promo.product_id) {
      productPromoMap.set(promo.product_id, {
        type: promo.type,
        value: promo.value,
        name: promo.name,
      });
    }
  }
  // Las de categoría se aplican como fallback a productos sin promo directa
  const categoryPromoMap = new Map<
    string,
    { type: string; value: number; name: string }
  >();
  for (const promo of activePromotions) {
    if (promo.category_id && !categoryPromoMap.has(promo.category_id)) {
      categoryPromoMap.set(promo.category_id, {
        type: promo.type,
        value: promo.value,
        name: promo.name,
      });
    }
  }

  const filtered = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || p.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedItems,
    handlePageChange,
    handleItemsPerPageChange,
    reset,
  } = usePagination(filtered);

  useEffect(() => {
    reset();
  }, [search, categoryFilter, reset]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Productos</h2>
          <p className="text-muted-foreground text-sm">
            Gestiona el catálogo de productos
          </p>
        </div>
        <PermissionGuard module="inventory" action="can_create">
          <Button onClick={() => setModal({ open: true, product: null })}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo producto
          </Button>
        </PermissionGuard>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border bg-card px-3 py-2 text-sm cursor-pointer"
        >
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No hay productos</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Producto</th>
                  <th className="text-left px-4 py-3 font-medium">Categoría</th>
                  <th className="text-left px-4 py-3 font-medium">Precio</th>
                  <th className="text-left px-4 py-3 font-medium">Descuento</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="text-right px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-t hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                            <ShoppingBag className="h-4 w-4 text-muted-foreground/40" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {product.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const promo =
                          productPromoMap.get(product.id) ??
                          (product.category_id
                            ? categoryPromoMap.get(product.category_id)
                            : undefined);
                        if (!promo) {
                          return (
                            <span className="text-muted-foreground">—</span>
                          );
                        }
                        const label =
                          promo.type === "descuento_porcentaje"
                            ? `${promo.value}%`
                            : promo.type === "descuento_monto"
                              ? formatCurrency(promo.value)
                              : "2x1";
                        return (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="outline"
                                  className="cursor-help border-green-500/40 text-green-600 dark:text-green-400"
                                >
                                  {label}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-medium">{promo.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <PermissionGuard module="inventory" action="can_edit">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={product.is_active}
                          onClick={() =>
                            toggleActive.mutate({
                              id: product.id,
                              is_active: !product.is_active,
                            })
                          }
                          className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                            product.is_active
                              ? "border-green-500/30 bg-green-500/90 focus-visible:ring-green-500"
                              : "border-border bg-muted focus-visible:ring-muted-foreground"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                              product.is_active
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </PermissionGuard>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <PermissionGuard module="inventory" action="can_edit">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
                            onClick={() => setModal({ open: true, product })}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard module="inventory" action="can_delete">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer text-destructive hover:text-destructive"
                            onClick={() => setConfirmDelete(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      )}

      <ProductFormModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        product={modal.product}
        categories={categories}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="Eliminar producto"
        description={
          confirmDelete
            ? `¿Seguro que quieres eliminar "${confirmDelete.name}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar"
        destructive
        loading={deleteProduct.isPending}
        onConfirm={() => {
          if (confirmDelete) {
            deleteProduct.mutate(confirmDelete.id, {
              onSuccess: () => setConfirmDelete(null),
            });
          }
        }}
      />
    </div>
  );
}
