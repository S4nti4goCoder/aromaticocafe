import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProductStock, useInventoryMovements } from "@/hooks/useInventory";
import { useProducts } from "@/hooks/useProducts";
import { StockMovementModal } from "@/features/inventory/StockMovementModal";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";

export function StockPage() {
  const [search, setSearch] = useState("");
  const [movementModal, setMovementModal] = useState(false);

  const { data: productStock = [], isLoading } = useProductStock();
  const { data: movements = [], isLoading: loadingMovements } =
    useInventoryMovements();
  const { data: products = [] } = useProducts();

  const lowStockProducts = productStock.filter(
    (p) => p.stock <= 5 && p.is_active,
  );

  const filtered = productStock.filter((p) =>
    p.product_name.toLowerCase().includes(search.toLowerCase()),
  );

  const {
    currentPage: stockPage,
    totalPages: stockTotalPages,
    totalItems: stockTotalItems,
    itemsPerPage: stockItemsPerPage,
    paginatedItems: paginatedStock,
    handlePageChange: handleStockPageChange,
    handleItemsPerPageChange: handleStockItemsPerPageChange,
    reset: resetStock,
  } = usePagination(filtered);

  const {
    currentPage: movPage,
    totalPages: movTotalPages,
    totalItems: movTotalItems,
    itemsPerPage: movItemsPerPage,
    paginatedItems: paginatedMovements,
    handlePageChange: handleMovPageChange,
    handleItemsPerPageChange: handleMovItemsPerPageChange,
  } = usePagination(movements);

  useEffect(() => {
    resetStock();
  }, [search, resetStock]);

  const movementTypeConfig: Record<
    "entrada" | "salida" | "ajuste",
    { label: string; color: string; icon: typeof ArrowUp }
  > = {
    entrada: {
      label: "Entrada",
      color: "text-green-600 dark:text-green-400",
      icon: ArrowUp,
    },
    salida: {
      label: "Salida",
      color: "text-red-600 dark:text-red-400",
      icon: ArrowDown,
    },
    ajuste: {
      label: "Ajuste",
      color: "text-blue-600 dark:text-blue-400",
      icon: RefreshCw,
    },
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return "agotado";
    if (stock <= 5) return "bajo";
    return "ok";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Stock</h2>
          <p className="text-muted-foreground text-sm">
            Control de stock de productos
          </p>
        </div>
        <PermissionGuard module="inventory" action="can_create">
          <Button onClick={() => setMovementModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo movimiento
          </Button>
        </PermissionGuard>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
              {lowStockProducts.length} producto(s) con stock bajo o agotado
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockProducts.map((p) => (
              <Badge
                key={p.product_id}
                variant="outline"
                className="border-amber-500 text-amber-600 dark:text-amber-400"
              >
                {p.product_name}: {p.stock} und.
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Productos ({productStock.length})
          </TabsTrigger>
          <TabsTrigger value="movements" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Movimientos ({movements.length})
          </TabsTrigger>
        </TabsList>

        {/* PRODUCTOS */}
        <TabsContent value="products" className="mt-4 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No hay productos en inventario</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">
                        Producto
                      </th>
                      <th className="text-left px-4 py-3 font-medium">
                        Categoría
                      </th>
                      <th className="text-center px-4 py-3 font-medium">
                        Stock actual
                      </th>
                      <th className="text-left px-4 py-3 font-medium">
                        Estado
                      </th>
                      <th className="text-left px-4 py-3 font-medium">
                        Último movimiento
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStock.map((item, index) => {
                      const status = getStockStatus(item.stock);
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
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={stockPage}
                totalPages={stockTotalPages}
                totalItems={stockTotalItems}
                itemsPerPage={stockItemsPerPage}
                onPageChange={handleStockPageChange}
                onItemsPerPageChange={handleStockItemsPerPageChange}
              />
            </>
          )}
        </TabsContent>

        {/* MOVIMIENTOS */}
        <TabsContent value="movements" className="mt-4">
          {loadingMovements ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : movements.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <RefreshCw className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No hay movimientos registrados</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Tipo</th>
                      <th className="text-left px-4 py-3 font-medium">
                        Producto
                      </th>
                      <th className="text-center px-4 py-3 font-medium">
                        Cantidad
                      </th>
                      <th className="text-center px-4 py-3 font-medium">
                        Stock anterior
                      </th>
                      <th className="text-center px-4 py-3 font-medium">
                        Stock nuevo
                      </th>
                      <th className="text-left px-4 py-3 font-medium">
                        Motivo
                      </th>
                      <th className="text-left px-4 py-3 font-medium">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMovements.map((movement, index) => {
                      const config =
                        movementTypeConfig[
                          movement.type as keyof typeof movementTypeConfig
                        ];
                      const Icon = config.icon;
                      const product = products.find(
                        (p) => p.id === movement.product_id,
                      );
                      return (
                        <motion.tr
                          key={movement.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-t hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div
                              className={`flex items-center gap-1 ${config.color}`}
                            >
                              <Icon className="h-3 w-3" />
                              <span className="text-xs font-medium">
                                {config.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {product?.name ?? "Producto eliminado"}
                          </td>
                          <td className="px-4 py-3 text-center font-bold">
                            {movement.type === "salida" ? "-" : "+"}
                            {movement.quantity}
                          </td>
                          <td className="px-4 py-3 text-center text-muted-foreground">
                            {movement.previous_stock}
                          </td>
                          <td className="px-4 py-3 text-center font-medium">
                            {movement.new_stock}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {movement.reason ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {new Date(movement.created_at).toLocaleString(
                              "es-CO",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={movPage}
                totalPages={movTotalPages}
                totalItems={movTotalItems}
                itemsPerPage={movItemsPerPage}
                onPageChange={handleMovPageChange}
                onItemsPerPageChange={handleMovItemsPerPageChange}
              />
            </>
          )}
        </TabsContent>
      </Tabs>

      <StockMovementModal
        open={movementModal}
        onClose={() => setMovementModal(false)}
      />
    </div>
  );
}
