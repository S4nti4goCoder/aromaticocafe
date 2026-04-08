import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ShoppingBag,
  Copy,
  LayoutGrid,
  List,
  Download,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  useDuplicateProduct,
  useBulkUpdateProductsActive,
  useBulkDeleteProducts,
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
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [view, setView] = useState<"table" | "grid">("table");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: activePromotions = [] } = useActivePromotions();
  const deleteProduct = useDeleteProduct();
  const toggleActive = useToggleProductActive();
  const duplicateProduct = useDuplicateProduct();
  const bulkUpdateActive = useBulkUpdateProductsActive();
  const bulkDelete = useBulkDeleteProducts();

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

  useEffect(() => {
    handleItemsPerPageChange(view === "grid" ? 10 : 6);
  }, [view, handleItemsPerPageChange]);

  // Limpiar selecciones que ya no están en filtrados
  useEffect(() => {
    setSelected((prev) => {
      const filteredIds = new Set(filtered.map((p) => p.id));
      const next = new Set<string>();
      for (const id of prev) if (filteredIds.has(id)) next.add(id);
      return next.size === prev.size ? prev : next;
    });
  }, [filtered]);

  const pageIds = useMemo(
    () => paginatedItems.map((p) => p.id),
    [paginatedItems],
  );
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));

  const togglePageSelection = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        for (const id of pageIds) next.delete(id);
      } else {
        for (const id of pageIds) next.add(id);
      }
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const exportCsv = () => {
    const rows = filtered.map((p) => ({
      nombre: p.name,
      categoria: p.category?.name ?? "",
      precio: p.price,
      activo: p.is_active ? "sí" : "no",
      descripcion: p.description ?? "",
    }));
    const headers = ["nombre", "categoria", "precio", "activo", "descripcion"];
    const escape = (val: unknown) => {
      const s = String(val ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers.map((h) => escape(r[h as keyof typeof r])).join(","),
      ),
    ].join("\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `productos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Productos</h2>
          <p className="text-muted-foreground text-sm">
            Gestiona el catálogo de productos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="cursor-pointer"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <PermissionGuard module="inventory" action="can_create">
            <Button onClick={() => setModal({ open: true, product: null })}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo producto
            </Button>
          </PermissionGuard>
        </div>
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
        <div className="ml-auto inline-flex rounded-md border bg-card p-0.5">
          <button
            type="button"
            onClick={() => setView("table")}
            className={`inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors cursor-pointer ${
              view === "table"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            Tabla
          </button>
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors cursor-pointer ${
              view === "grid"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Tarjetas
          </button>
        </div>
      </div>

      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5"
        >
          <span className="text-sm font-medium">
            {selected.size} seleccionado{selected.size === 1 ? "" : "s"}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <PermissionGuard module="inventory" action="can_edit">
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer"
                onClick={() =>
                  bulkUpdateActive.mutate(
                    { ids: [...selected], is_active: true },
                    { onSuccess: clearSelection },
                  )
                }
              >
                Activar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer"
                onClick={() =>
                  bulkUpdateActive.mutate(
                    { ids: [...selected], is_active: false },
                    { onSuccess: clearSelection },
                  )
                }
              >
                Desactivar
              </Button>
            </PermissionGuard>
            <PermissionGuard module="inventory" action="can_delete">
              <Button
                size="sm"
                variant="destructive"
                className="cursor-pointer"
                onClick={() => setConfirmBulkDelete(true)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Eliminar
              </Button>
            </PermissionGuard>
            <Button
              size="sm"
              variant="ghost"
              className="cursor-pointer"
              onClick={clearSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

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
          {view === "table" ? (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <Checkbox
                      checked={
                        allPageSelected
                          ? true
                          : somePageSelected
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={togglePageSelection}
                      aria-label="Seleccionar página"
                      className="cursor-pointer"
                    />
                  </th>
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
                    className={`border-t hover:bg-muted/30 transition-colors ${
                      selected.has(product.id) ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selected.has(product.id)}
                        onCheckedChange={() => toggleOne(product.id)}
                        aria-label={`Seleccionar ${product.name}`}
                        className="cursor-pointer"
                      />
                    </td>
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
                      <div className="flex items-center gap-2">
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
                        {product.deactivated_by_stock && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="outline"
                                  className="cursor-help border-amber-500/40 text-amber-600 dark:text-amber-400"
                                >
                                  Sin stock
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Desactivado automáticamente porque el stock
                                  llegó a cero
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
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
                        <PermissionGuard module="inventory" action="can_create">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
                            onClick={() => duplicateProduct.mutate(product)}
                            title="Duplicar"
                          >
                            <Copy className="h-4 w-4" />
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
          ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {paginatedItems.map((product, index) => {
              const promo =
                productPromoMap.get(product.id) ??
                (product.category_id
                  ? categoryPromoMap.get(product.category_id)
                  : undefined);
              const promoLabel = promo
                ? promo.type === "descuento_porcentaje"
                  ? `${promo.value}%`
                  : promo.type === "descuento_monto"
                    ? formatCurrency(promo.value)
                    : "2x1"
                : null;
              const isSelected = selected.has(product.id);
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md ${
                    isSelected ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <div className="absolute left-2 top-2 z-10">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleOne(product.id)}
                      aria-label={`Seleccionar ${product.name}`}
                      className="cursor-pointer bg-background/80 backdrop-blur"
                    />
                  </div>
                  {promoLabel && (
                    <div className="absolute right-2 top-2 z-10">
                      <Badge
                        variant="outline"
                        className="border-green-500/40 bg-background/80 text-green-600 backdrop-blur dark:text-green-400"
                      >
                        {promoLabel}
                      </Badge>
                    </div>
                  )}
                  <div className="aspect-square w-full bg-muted">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="min-h-10">
                      <p className="line-clamp-2 text-sm font-medium leading-tight">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.category?.name ?? "—"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        {formatCurrency(product.price)}
                      </p>
                      {!product.is_active && (
                        <Badge
                          variant="outline"
                          className={
                            product.deactivated_by_stock
                              ? "border-amber-500/40 text-amber-600 dark:text-amber-400"
                              : "text-muted-foreground"
                          }
                        >
                          {product.deactivated_by_stock
                            ? "Sin stock"
                            : "Inactivo"}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-1 border-t pt-2">
                      <PermissionGuard module="inventory" action="can_edit">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 cursor-pointer"
                          onClick={() => setModal({ open: true, product })}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard module="inventory" action="can_create">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 cursor-pointer"
                          onClick={() => duplicateProduct.mutate(product)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard module="inventory" action="can_delete">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 cursor-pointer text-destructive hover:text-destructive"
                          onClick={() => setConfirmDelete(product)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </PermissionGuard>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemsPerPageOptions={
              view === "grid" ? [10, 20, 30, 50] : [6, 12, 24, 50]
            }
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
        open={confirmBulkDelete}
        onOpenChange={setConfirmBulkDelete}
        title="Eliminar productos seleccionados"
        description={`¿Seguro que quieres eliminar ${selected.size} producto${selected.size === 1 ? "" : "s"}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        loading={bulkDelete.isPending}
        onConfirm={() => {
          bulkDelete.mutate([...selected], {
            onSuccess: () => {
              clearSelection();
              setConfirmBulkDelete(false);
            },
          });
        }}
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
