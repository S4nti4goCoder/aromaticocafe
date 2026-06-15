import { motion } from "framer-motion";
import {
  Search,
  Package,
  ArrowUp,
  ArrowDown,
  Pencil,
  Copy,
  Trash2,
  LayoutGrid,
  List,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonRows } from "@/components/shared/SkeletonRows";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { Pagination } from "@/components/shared/Pagination";
import { ResponsiveTableWrapper } from "@/components/shared/ResponsiveTableWrapper";
import { Button } from "@/components/ui/button";
import type { InventoryMovementType, Product, ProductStock } from "@/types";
import {
  getStockStatus,
  type StatusFilter,
} from "@/features/inventory/stock/helpers";

interface ProductsTabProps {
  search: string;
  onSearchChange: (v: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (v: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (v: StatusFilter) => void;
  categories: { id: string; name: string }[];
  view: "table" | "grid";
  onViewChange: (v: "table" | "grid") => void;
  isLoading: boolean;
  filtered: ProductStock[];
  paginatedStock: ProductStock[];
  products: Product[];
  onQuickMovement: (productId: string, type: InventoryMovementType) => void;
  onEditProduct: (product: Product) => void;
  onDuplicateProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  page: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

// "Productos" tab: filters, table/grid toggle, per-product quick movements +
// edit/duplicate/delete actions, and pagination.
export function ProductsTab({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
  categories,
  view,
  onViewChange,
  isLoading,
  filtered,
  paginatedStock,
  products,
  onQuickMovement,
  onEditProduct,
  onDuplicateProduct,
  onDeleteProduct,
  page,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: ProductsTabProps) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:max-w-sm sm:flex-1 sm:min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            className="pl-9"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring sm:w-auto"
        >
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring sm:w-auto"
        >
          <option value="all">Todos los estados</option>
          <option value="ok">OK</option>
          <option value="bajo">Stock bajo</option>
          <option value="agotado">Agotado</option>
        </select>
        <div className="ml-auto inline-flex rounded-md border bg-card p-0.5">
          <button
            type="button"
            onClick={() => onViewChange("table")}
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
            onClick={() => onViewChange("grid")}
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

      {isLoading ? (
        <SkeletonRows count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Sin resultados"
          description="No hay productos que coincidan con los filtros."
        />
      ) : (
        <>
          {view === "table" ? (
            <ResponsiveTableWrapper>
              <table className="w-full text-sm min-w-160">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Producto</th>
                    <th className="text-left px-4 py-3 font-medium">Categoría</th>
                    <th className="text-center px-4 py-3 font-medium">
                      Stock actual
                    </th>
                    <th className="text-center px-4 py-3 font-medium">Mínimo</th>
                    <th className="text-left px-4 py-3 font-medium">Estado</th>
                    <th className="text-left px-4 py-3 font-medium">
                      Último movimiento
                    </th>
                    <th className="text-right px-4 py-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStock.map((item, index) => {
                    const status = getStockStatus(item);
                    return (
                      <motion.tr
                        key={item.product_id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-t hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.product_name}
                                className="h-8 w-8 rounded object-cover"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                <Package className="h-3 w-3 text-muted-foreground/40" />
                              </div>
                            )}
                            <span className="font-medium">
                              {item.product_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.category_name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`font-bold text-lg ${
                              status === "agotado"
                                ? "text-red-600"
                                : status === "bajo"
                                  ? "text-amber-600"
                                  : ""
                            }`}
                          >
                            {item.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                          {item.min_stock}
                        </td>
                        <td className="px-4 py-3">
                          {status === "agotado" ? (
                            <Badge variant="destructive">Agotado</Badge>
                          ) : status === "bajo" ? (
                            <Badge
                              variant="outline"
                              className="border-amber-500 text-amber-600"
                            >
                              Stock bajo
                            </Badge>
                          ) : (
                            <Badge variant="default" className="bg-green-600">
                              OK
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {item.last_movement
                            ? new Date(item.last_movement).toLocaleString(
                                "es-CO",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "Sin movimientos"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <PermissionGuard
                              module="inventory"
                              action="can_create"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 cursor-pointer text-green-600 hover:text-green-700"
                                title="Registrar entrada"
                                onClick={() =>
                                  onQuickMovement(item.product_id, "entrada")
                                }
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 cursor-pointer text-red-600 hover:text-red-700"
                                title="Registrar salida"
                                onClick={() =>
                                  onQuickMovement(item.product_id, "salida")
                                }
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard module="inventory" action="can_edit">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 cursor-pointer"
                                title="Editar producto"
                                onClick={() => {
                                  const product = products.find(
                                    (p) => p.id === item.product_id,
                                  );
                                  if (product) onEditProduct(product);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard
                              module="inventory"
                              action="can_create"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 cursor-pointer"
                                title="Duplicar producto"
                                onClick={() => {
                                  const product = products.find(
                                    (p) => p.id === item.product_id,
                                  );
                                  if (product) onDuplicateProduct(product);
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard
                              module="inventory"
                              action="can_delete"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 cursor-pointer text-destructive hover:text-destructive"
                                title="Eliminar producto"
                                onClick={() => {
                                  const product = products.find(
                                    (p) => p.id === item.product_id,
                                  );
                                  if (product) onDeleteProduct(product);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </ResponsiveTableWrapper>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {paginatedStock.map((item, index) => {
                const status = getStockStatus(item);
                const product = products.find((p) => p.id === item.product_id);
                return (
                  <motion.div
                    key={item.product_id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md"
                  >
                    <div className="absolute right-2 top-2 z-10">
                      {status === "agotado" ? (
                        <Badge
                          variant="destructive"
                          className="bg-background/80 backdrop-blur"
                        >
                          Agotado
                        </Badge>
                      ) : status === "bajo" ? (
                        <Badge
                          variant="outline"
                          className="border-amber-500 bg-background/80 text-amber-600 backdrop-blur dark:text-amber-400"
                        >
                          Stock bajo
                        </Badge>
                      ) : (
                        <Badge className="bg-green-600/90 text-white backdrop-blur">
                          OK
                        </Badge>
                      )}
                    </div>
                    <div className="aspect-square w-full bg-muted">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 p-3">
                      <div className="min-h-10">
                        <p className="line-clamp-1 text-sm font-medium leading-tight">
                          {item.product_name}
                        </p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {item.category_name ?? "—"}
                        </p>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span
                            className={`text-2xl font-bold ${
                              status === "agotado"
                                ? "text-red-600"
                                : status === "bajo"
                                  ? "text-amber-600"
                                  : ""
                            }`}
                          >
                            {item.stock}
                          </span>
                          <span className="ml-1 text-xs text-muted-foreground">
                            / mín {item.min_stock}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-1 border-t pt-2">
                        <PermissionGuard module="inventory" action="can_create">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 cursor-pointer text-green-600 hover:text-green-700"
                            title="Registrar entrada"
                            onClick={() =>
                              onQuickMovement(item.product_id, "entrada")
                            }
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 cursor-pointer text-red-600 hover:text-red-700"
                            title="Registrar salida"
                            onClick={() =>
                              onQuickMovement(item.product_id, "salida")
                            }
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard module="inventory" action="can_edit">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 cursor-pointer"
                            title="Editar"
                            onClick={() => {
                              if (product) onEditProduct(product);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard module="inventory" action="can_create">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 cursor-pointer"
                            title="Duplicar"
                            onClick={() => {
                              if (product) onDuplicateProduct(product);
                            }}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard module="inventory" action="can_delete">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 cursor-pointer text-destructive hover:text-destructive"
                            title="Eliminar"
                            onClick={() => {
                              if (product) onDeleteProduct(product);
                            }}
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
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
            itemsPerPageOptions={[8, 16, 32, 50]}
          />
        </>
      )}
    </>
  );
}
