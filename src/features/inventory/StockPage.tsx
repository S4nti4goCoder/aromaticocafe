import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Package,
  AlertTriangle,
  RefreshCw,
  Download,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProductStock, useInventoryMovements } from "@/hooks/useInventory";
import {
  useProducts,
  useDeleteProduct,
  useDuplicateProduct,
} from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useProductCosts } from "@/hooks/useProductCosts";
import { useProfile } from "@/hooks/useProfile";
import { ExportMenu } from "@/components/shared/ExportMenu";
import type { Brand } from "@/lib/reports/types";
import {
  generateInventoryPdf,
  generateInventoryXlsx,
  type InventoryRow,
} from "@/lib/reports/inventoryReport";
import { StockMovementModal } from "@/features/inventory/StockMovementModal";
import { ProductFormModal } from "@/features/inventory/ProductFormModal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { usePagination } from "@/hooks/usePagination";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { InventoryMovementType, Product } from "@/types";
import {
  getStockStatus,
  exportStockCsv,
  exportMovementsCsv,
  type StatusFilter,
  type MovementTypeFilter,
} from "@/features/inventory/stock/helpers";
import { ProductsTab } from "@/features/inventory/stock/ProductsTab";
import { MovementsTab } from "@/features/inventory/stock/MovementsTab";

export function StockPage() {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get("filter");
  const initialStatus: StatusFilter =
    filterParam === "agotado" || filterParam === "bajo" || filterParam === "ok"
      ? filterParam
      : "all";
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);

  // Sync when a new deep-link arrives — adjust state during render (not in an
  // effect) per https://react.dev/learn/you-might-not-need-an-effect.
  const [prevFilterParam, setPrevFilterParam] = useState(filterParam);
  if (filterParam !== prevFilterParam) {
    setPrevFilterParam(filterParam);
    if (filterParam === "agotado" || filterParam === "bajo" || filterParam === "ok") {
      setStatusFilter(filterParam);
    }
  }

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
  const [activeTab, setActiveTab] = useState<"products" | "movements">(
    "products",
  );
  // Default to "grid" (cards) on mobile/tablet so users don't have to swipe
  // a wide table sideways. Desktop (lg+) gets the dense table view by default.
  const [view, setView] = useState<"table" | "grid">(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1024px)").matches
      ? "table"
      : "grid",
  );
  const isMobile = useIsMobile();

  // Movement filters
  const [movSearch, setMovSearch] = useState("");
  const [movTypeFilter, setMovTypeFilter] = useState<MovementTypeFilter>("all");
  const [movFromDate, setMovFromDate] = useState("");
  const [movToDate, setMovToDate] = useState("");

  const { data: productStock = [], isLoading } = useProductStock();
  const { data: movements = [], isLoading: loadingMovements } =
    useInventoryMovements();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: profile } = useProfile();
  const { settings } = useSystemSettings();
  const { data: costsMap = {} } = useProductCosts();
  const canSeeCosts =
    profile?.role === "super_admin" || profile?.role === "gerente";
  const deleteProduct = useDeleteProduct();
  const duplicateProduct = useDuplicateProduct();

  const lowStockProducts = useMemo(
    () =>
      productStock.filter((p) => p.is_active && getStockStatus(p) !== "ok"),
    [productStock],
  );

  // KPIs. "Total" cuenta todo el catálogo (activos e inactivos) porque mide el
  // tamaño del catálogo. OK/Bajo/Agotado solo consideran productos activos
  // porque un producto inactivo no se vende y no debería reflejarse como una
  // alerta de operación — esto mantiene consistencia con la alerta de
  // reposición de abajo (lowStockProducts también filtra por is_active).
  const kpis = useMemo(() => {
    let ok = 0;
    let bajo = 0;
    let agotado = 0;
    for (const p of productStock) {
      if (!p.is_active) continue;
      const status = getStockStatus(p);
      if (status === "ok") ok++;
      else if (status === "bajo") bajo++;
      else agotado++;
    }
    return { total: productStock.length, ok, bajo, agotado };
  }, [productStock]);

  // Normaliza tildes para que "cafe" encuentre "Café" y viceversa.
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");

  const filtered = useMemo(
    () =>
      productStock.filter((p) => {
        if (
          search &&
          !normalize(p.product_name).includes(normalize(search))
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
          if (!normalize(product?.name ?? "").includes(normalize(movSearch)))
            return false;
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
    if (isMobile) {
      handleStockItemsPerPageChange(6);
      handleMovItemsPerPageChange(6);
    } else {
      handleStockItemsPerPageChange(view === "grid" ? 10 : 6);
      handleMovItemsPerPageChange(10);
    }
  }, [view, isMobile, handleStockItemsPerPageChange, handleMovItemsPerPageChange]);

  useEffect(() => {
    resetMovements();
  }, [movSearch, movTypeFilter, movFromDate, movToDate, resetMovements]);

  const openQuickMovement = (
    productId: string,
    type: InventoryMovementType,
  ) => {
    setMovementModal({ open: true, productId, type });
  };

  const brand: Brand = useMemo(
    () => ({
      name:
        settings?.business_name?.trim() ||
        settings?.cafe_name?.trim() ||
        "Aromático Café",
      nit: settings?.business_nit ?? null,
      city: settings?.business_city ?? null,
      phone: settings?.business_phone ?? null,
    }),
    [settings],
  );

  const inventoryItems = useMemo(() => {
    if (!canSeeCosts) return [];
    const rows: InventoryRow[] = filtered.map((stock) => ({
      stock,
      cost: costsMap[stock.product_id] ?? null,
    }));
    return [
      {
        group: "Inventario",
        label: "Excel",
        onClick: () =>
          generateInventoryXlsx({ rows, brand, showCosts: true }),
        disabled: rows.length === 0,
      },
      {
        group: "Inventario",
        label: "PDF",
        onClick: () =>
          generateInventoryPdf({ rows, brand, showCosts: true }),
        disabled: rows.length === 0,
      },
    ];
  }, [filtered, costsMap, brand, canSeeCosts]);

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
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Stock</h2>
          <p className="text-muted-foreground text-sm">
            Control de stock de productos
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              activeTab === "products"
                ? exportStockCsv(filtered)
                : exportMovementsCsv(filteredMovements, products)
            }
            disabled={
              activeTab === "products"
                ? filtered.length === 0
                : filteredMovements.length === 0
            }
            className="w-full cursor-pointer sm:w-auto"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Exportar CSV
          </Button>
          {canSeeCosts && activeTab === "products" && (
            <ExportMenu
              label="Exportar inventario"
              items={inventoryItems}
            />
          )}
          <PermissionGuard module="inventory" action="can_create">
            <Button
              size="sm"
              onClick={() => setMovementModal({ open: true })}
              className="w-full sm:w-auto"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Nuevo movimiento
            </Button>
          </PermissionGuard>
        </div>
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

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "products" | "movements")}
      >
        <TabsList className="w-full sm:w-fit">
          <TabsTrigger value="products" className="gap-1.5">
            <Package className="hidden h-4 w-4 sm:block" />
            <span className="truncate">Productos ({productStock.length})</span>
          </TabsTrigger>
          <TabsTrigger value="movements" className="gap-1.5">
            <RefreshCw className="hidden h-4 w-4 sm:block" />
            <span className="truncate">Movimientos ({movements.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4 space-y-4">
          <ProductsTab
            search={search}
            onSearchChange={setSearch}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            categories={categories}
            view={view}
            onViewChange={setView}
            isLoading={isLoading}
            filtered={filtered}
            paginatedStock={paginatedStock}
            products={products}
            onQuickMovement={openQuickMovement}
            onEditProduct={(product) => setEditModal({ open: true, product })}
            onDuplicateProduct={(product) => duplicateProduct.mutate(product)}
            onDeleteProduct={setConfirmDelete}
            page={stockPage}
            totalPages={stockTotalPages}
            totalItems={stockTotalItems}
            itemsPerPage={stockItemsPerPage}
            onPageChange={handleStockPageChange}
            onItemsPerPageChange={handleStockItemsPerPageChange}
          />
        </TabsContent>

        <TabsContent value="movements" className="mt-4 space-y-4">
          <MovementsTab
            movSearch={movSearch}
            onMovSearchChange={setMovSearch}
            movTypeFilter={movTypeFilter}
            onMovTypeFilterChange={setMovTypeFilter}
            movFromDate={movFromDate}
            onMovFromDateChange={setMovFromDate}
            movToDate={movToDate}
            onMovToDateChange={setMovToDate}
            loadingMovements={loadingMovements}
            filteredMovements={filteredMovements}
            paginatedMovements={paginatedMovements}
            products={products}
            page={movPage}
            totalPages={movTotalPages}
            totalItems={movTotalItems}
            itemsPerPage={movItemsPerPage}
            onPageChange={handleMovPageChange}
            onItemsPerPageChange={handleMovItemsPerPageChange}
          />
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
