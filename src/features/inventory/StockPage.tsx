import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  CheckCircle2,
  XCircle,
  Pencil,
  Copy,
  Trash2,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProductStock, useInventoryMovements } from "@/hooks/useInventory";
import {
  useProducts,
  useDeleteProduct,
  useDuplicateProduct,
} from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { StockMovementModal } from "@/features/inventory/StockMovementModal";
import { ProductFormModal } from "@/features/inventory/ProductFormModal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";
import type { InventoryMovementType, Product, ProductStock } from "@/types";

type StatusFilter = "all" | "ok" | "bajo" | "agotado";
type MovementTypeFilter = "all" | InventoryMovementType;

export function StockPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [movementModal, setMovementModal] = useState<{
    open: boolean;
    productId?: string;
    type?: InventoryMovementType;
  }>({ open: false });
  const [editModal, setEditModal] = useState<{
    open: boolean;
    product: Product | null;
  }>({ open: false, product: null });
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [view, setView] = useState<"table" | "grid">("table");

  // Filtros movimientos
  const [movSearch, setMovSearch] = useState("");
  const [movTypeFilter, setMovTypeFilter] = useState<MovementTypeFilter>("all");
  const [movFromDate, setMovFromDate] = useState("");
  const [movToDate, setMovToDate] = useState("");

  const { data: productStock = [], isLoading } = useProductStock();
  const { data: movements = [], isLoading: loadingMovements } =
    useInventoryMovements();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const deleteProduct = useDeleteProduct();
  const duplicateProduct = useDuplicateProduct();

  const getStockStatus = (item: ProductStock): StatusFilter => {
    if (item.stock <= 0) return "agotado";
    if (item.stock <= item.min_stock) return "bajo";
    return "ok";
  };

  const lowStockProducts = useMemo(
    () =>
      productStock.filter(
        (p) => p.is_active && getStockStatus(p) !== "ok",
      ),
    [productStock],
  );

  // KPIs
  const kpis = useMemo(() => {
    let ok = 0;
    let bajo = 0;
    let agotado = 0;
    for (const p of productStock) {
      const status = getStockStatus(p);
      if (status === "ok") ok++;
      else if (status === "bajo") bajo++;
      else agotado++;
    }
    return { total: productStock.length, ok, bajo, agotado };
  }, [productStock]);

  const filtered = useMemo(
    () =>
      productStock.filter((p) => {
        if (
          search &&
          !p.product_name.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        if (categoryFilter !== "all" && p.category_id !== categoryFilter)
          return false;
        if (statusFilter !== "all" && getStockStatus(p) !== statusFilter)
          return false;
        return true;
      }),
    [productStock, search, categoryFilter, statusFilter],
  );

  const filteredMovements = useMemo(
    () =>
      movements.filter((m) => {
        if (movTypeFilter !== "all" && m.type !== movTypeFilter) return false;
        if (movSearch) {
          const product = products.find((p) => p.id === m.product_id);
          const name = product?.name?.toLowerCase() ?? "";
          if (!name.includes(movSearch.toLowerCase())) return false;
        }
        if (movFromDate) {
          if (new Date(m.created_at) < new Date(movFromDate)) return false;
        }
        if (movToDate) {
          const end = new Date(movToDate);
          end.setHours(23, 59, 59, 999);
          if (new Date(m.created_at) > end) return false;
        }
        return true;
      }),
    [movements, movTypeFilter, movSearch, movFromDate, movToDate, products],
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
    reset: resetMovements,
  } = usePagination(filteredMovements);

  useEffect(() => {
    resetStock();
  }, [search, categoryFilter, statusFilter, resetStock]);

  useEffect(() => {
    handleStockItemsPerPageChange(view === "grid" ? 10 : 6);
  }, [view, handleStockItemsPerPageChange]);

  useEffect(() => {
    resetMovements();
  }, [movSearch, movTypeFilter, movFromDate, movToDate, resetMovements]);

  const movementTypeConfig: Record<
    InventoryMovementType,
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

  const exportStockCsv = () => {
    const rows = filtered.map((p) => ({
      producto: p.product_name,
      categoria: p.category_name ?? "",
      stock: p.stock,
      stock_minimo: p.min_stock,
      estado:
        getStockStatus(p) === "agotado"
          ? "Agotado"
          : getStockStatus(p) === "bajo"
            ? "Stock bajo"
            : "OK",
    }));
    const headers = ["producto", "categoria", "stock", "stock_minimo", "estado"];
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
    a.download = `stock-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportMovementsCsv = () => {
    const rows = filteredMovements.map((m) => {
      const product = products.find((p) => p.id === m.product_id);
      return {
        fecha: new Date(m.created_at).toISOString(),
        tipo: m.type,
        producto: product?.name ?? "Producto eliminado",
        cantidad: m.quantity,
        stock_anterior: m.previous_stock,
        stock_nuevo: m.new_stock,
        motivo: m.reason ?? "",
      };
    });
    const headers = [
      "fecha",
      "tipo",
      "producto",
      "cantidad",
      "stock_anterior",
      "stock_nuevo",
      "motivo",
    ];
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
    a.download = `movimientos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openQuickMovement = (
    productId: string,
    type: InventoryMovementType,
  ) => {
    setMovementModal({ open: true, productId, type });
  };

  const kpiCards = [
    {
      label: "Total productos",
      value: kpis.total,
      icon: Package,
      color: "text-foreground",
      bg: "bg-muted/50",
    },
    {
      label: "Con stock OK",
      value: kpis.ok,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Stock bajo",
      value: kpis.bajo,
      icon: AlertTriangle,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Agotados",
      value: kpis.agotado,
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-500/10",
    },
  ];

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
          <Button onClick={() => setMovementModal({ open: true })}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo movimiento
          </Button>
        </PermissionGuard>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-lg border bg-card p-4 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded ${kpi.bg}`}
                >
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </div>
              <p className={`mt-2 text-2xl font-bold ${kpi.color}`}>
                {kpi.value}
              </p>
            </div>
          );
        })}
      </div>

      {lowStockProducts.length > 0 && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
              {lowStockProducts.length} producto(s) requieren reposición
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockProducts.slice(0, 12).map((p) => (
              <Badge
                key={p.product_id}
                variant="outline"
                className="border-amber-500 text-amber-600 dark:text-amber-400"
              >
                {p.product_name}: {p.stock} und.
              </Badge>
            ))}
            {lowStockProducts.length > 12 && (
              <Badge
                variant="outline"
                className="border-amber-500 text-amber-600 dark:text-amber-400"
              >
                +{lowStockProducts.length - 12} más
              </Badge>
            )}
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
              className="h-9 rounded-md border border-input bg-background px-3 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
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
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
              className="h-9 rounded-md border border-input bg-background px-3 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">Todos los estados</option>
              <option value="ok">OK</option>
              <option value="bajo">Stock bajo</option>
              <option value="agotado">Agotado</option>
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
            <Button
              variant="outline"
              onClick={exportStockCsv}
              disabled={filtered.length === 0}
              className="cursor-pointer"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
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
              <p>No hay productos que coincidan con los filtros</p>
            </div>
          ) : (
            <>
              {view === "table" ? (
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
                      <th className="text-center px-4 py-3 font-medium">
                        Mínimo
                      </th>
                      <th className="text-left px-4 py-3 font-medium">
                        Estado
                      </th>
                      <th className="text-left px-4 py-3 font-medium">
                        Último movimiento
                      </th>
                      <th className="text-right px-4 py-3 font-medium">
                        Acciones
                      </th>
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
                              <Badge
                                variant="default"
                                className="bg-green-600"
                              >
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
                                    openQuickMovement(
                                      item.product_id,
                                      "entrada",
                                    )
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
                                    openQuickMovement(
                                      item.product_id,
                                      "salida",
                                    )
                                  }
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </Button>
                              </PermissionGuard>
                              <PermissionGuard
                                module="inventory"
                                action="can_edit"
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 cursor-pointer"
                                  title="Editar producto"
                                  onClick={() => {
                                    const product = products.find(
                                      (p) => p.id === item.product_id,
                                    );
                                    if (product)
                                      setEditModal({ open: true, product });
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
                                    if (product)
                                      duplicateProduct.mutate(product);
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
                                    if (product) setConfirmDelete(product);
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
              </div>
              ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {paginatedStock.map((item, index) => {
                  const status = getStockStatus(item);
                  const product = products.find(
                    (p) => p.id === item.product_id,
                  );
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
                        <div className="flex items-center justify-end gap-1 border-t pt-2">
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
                                openQuickMovement(item.product_id, "entrada")
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
                                openQuickMovement(item.product_id, "salida")
                              }
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard
                            module="inventory"
                            action="can_edit"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 cursor-pointer"
                              title="Editar"
                              onClick={() => {
                                if (product)
                                  setEditModal({ open: true, product });
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
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
                              title="Duplicar"
                              onClick={() => {
                                if (product) duplicateProduct.mutate(product);
                              }}
                            >
                              <Copy className="h-3.5 w-3.5" />
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
                              title="Eliminar"
                              onClick={() => {
                                if (product) setConfirmDelete(product);
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
                currentPage={stockPage}
                totalPages={stockTotalPages}
                totalItems={stockTotalItems}
                itemsPerPage={stockItemsPerPage}
                onPageChange={handleStockPageChange}
                onItemsPerPageChange={handleStockItemsPerPageChange}
                itemsPerPageOptions={
                  view === "grid" ? [10, 20, 30, 50] : [6, 12, 24, 50]
                }
              />
            </>
          )}
        </TabsContent>

        {/* MOVIMIENTOS */}
        <TabsContent value="movements" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-sm flex-1 min-w-50">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar producto..."
                className="pl-9"
                value={movSearch}
                onChange={(e) => setMovSearch(e.target.value)}
              />
            </div>
            <select
              value={movTypeFilter}
              onChange={(e) =>
                setMovTypeFilter(e.target.value as MovementTypeFilter)
              }
              className="h-9 rounded-md border border-input bg-background px-3 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">Todos los tipos</option>
              <option value="entrada">Entradas</option>
              <option value="salida">Salidas</option>
              <option value="ajuste">Ajustes</option>
            </select>
            <input
              type="date"
              value={movFromDate}
              onChange={(e) => setMovFromDate(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <input
              type="date"
              value={movToDate}
              onChange={(e) => setMovToDate(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button
              variant="outline"
              onClick={exportMovementsCsv}
              disabled={filteredMovements.length === 0}
              className="ml-auto cursor-pointer"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>

          {loadingMovements ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <RefreshCw className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No hay movimientos que coincidan con los filtros</p>
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
                      <th className="text-left px-4 py-3 font-medium">
                        Fecha
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMovements.map((movement, index) => {
                      const config =
                        movementTypeConfig[
                          movement.type as InventoryMovementType
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
        open={movementModal.open}
        onClose={() => setMovementModal({ open: false })}
        preselectedProductId={movementModal.productId}
        preselectedType={movementModal.type}
      />

      <ProductFormModal
        open={editModal.open}
        onClose={() => setEditModal({ open: false, product: null })}
        product={editModal.product}
        categories={categories}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="Eliminar producto"
        description={`¿Seguro que quieres eliminar "${confirmDelete?.name}"? Esta acción no se puede deshacer.`}
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
