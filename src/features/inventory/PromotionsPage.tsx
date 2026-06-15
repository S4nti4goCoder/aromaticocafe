import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/currency";
import {
  Plus,
  Pencil,
  Trash2,
  Percent,
  Search,
  Copy,
  LayoutGrid,
  List,
  Download,
  Upload,
  X,
  CheckCircle2,
  CalendarClock,
  CalendarX,
  Package,
  Tag,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonRows } from "@/components/shared/SkeletonRows";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  usePromotions,
  useDeletePromotion,
  useTogglePromotionActive,
  useDuplicatePromotion,
  useBulkUpdatePromotionsActive,
  useBulkDeletePromotions,
} from "@/hooks/usePromotions";
import { PromotionFormModal } from "@/features/inventory/PromotionFormModal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { Pagination } from "@/components/shared/Pagination";
import { ResponsiveTableWrapper } from "@/components/shared/ResponsiveTableWrapper";
import { usePagination } from "@/hooks/usePagination";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useProfile } from "@/hooks/useProfile";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { ImportModal } from "@/features/import/ImportModal";
import {
  buildPromotionsImportConfig,
  usePromotionsImportDone,
} from "@/features/import/configs/promotionsImport";
import { normalizeName } from "@/lib/importExcel";
import type { Promotion, PromotionType, PromotionAppliesTo } from "@/types";

const TYPE_LABELS: Record<string, string> = {
  descuento_porcentaje: "Descuento %",
  descuento_precio: "Descuento $",
  "2x1": "2x1",
  precio_fijo: "Precio fijo",
};

const APPLIES_TO_LABELS: Record<string, string> = {
  todos: "Todos",
  categoria: "Categoría",
  producto: "Producto",
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const MONTH_NAMES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];
const formatDateShort = (date: string) => {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
};

const AppliesToCell = ({ promotion }: { promotion: Promotion }) => {
  const config =
    promotion.applies_to === "todos"
      ? {
          icon: Globe,
          label: "Todos los productos",
          className:
            "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300",
        }
      : promotion.applies_to === "categoria"
        ? {
            icon: Tag,
            label: promotion.category?.name ?? "—",
            className:
              "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
          }
        : {
            icon: Package,
            label: promotion.product?.name ?? "—",
            className:
              "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
          };
  const Icon = config.icon;
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </div>
  );
};

const VigenciaCell = ({ promotion }: { promotion: Promotion }) => (
  <div className="space-y-1 text-xs whitespace-nowrap">
    <div className="flex items-center gap-2">
      <span className="w-10 shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">
        Inicio
      </span>
      <span className="font-medium text-foreground">
        {formatDateShort(promotion.starts_at)}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <span className="w-10 shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">
        Fin
      </span>
      <span
        className={`font-medium ${
          promotion.ends_at ? "text-foreground" : "text-muted-foreground italic"
        }`}
      >
        {promotion.ends_at ? formatDateShort(promotion.ends_at) : "Sin fin"}
      </span>
    </div>
  </div>
);

type PromoStatus = "activa" | "inactiva" | "programada" | "vencida";

const getPromotionStatus = (promotion: Promotion): PromoStatus => {
  if (!promotion.is_active) return "inactiva";
  const now = new Date();
  const starts = new Date(promotion.starts_at);
  if (now < starts) return "programada";
  if (promotion.ends_at && now > new Date(promotion.ends_at)) return "vencida";
  return "activa";
};

const STATUS_REASON: Record<PromoStatus, string> = {
  activa: "Vigente y publicada",
  inactiva: "Marcada como inactiva manualmente",
  programada: "Aún no llega su fecha de inicio",
  vencida: "Ya pasó su fecha de fin",
};

const formatPromoValue = (p: Promotion) => {
  if (p.type === "2x1") return "2x1";
  if (p.type === "descuento_porcentaje") return `${p.value}%`;
  return formatCurrency(p.value);
};

type StatusFilter = "all" | PromoStatus;
type TypeFilter = "all" | PromotionType;
type AppliesFilter = "all" | PromotionAppliesTo;

export function PromotionsPage() {
  const [modal, setModal] = useState<{
    open: boolean;
    promotion?: Promotion | null;
  }>({ open: false });
  const [confirmDelete, setConfirmDelete] = useState<Promotion | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [appliesFilter, setAppliesFilter] = useState<AppliesFilter>("all");
  // Default to "grid" (cards) on mobile/tablet so users don't have to swipe
  // a wide table sideways. Desktop (lg+) gets the dense table view by default.
  const [view, setView] = useState<"table" | "grid">(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1024px)").matches
      ? "table"
      : "grid",
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();

  const { data: promotions = [], isLoading } = usePromotions();
  const { data: profile } = useProfile();
  const canImport =
    profile?.role === "super_admin" || profile?.role === "gerente";
  const { data: productsForImport = [] } = useProducts();
  const { data: categoriesForImport = [] } = useCategories();
  const [importOpen, setImportOpen] = useState(false);
  const onImportDone = usePromotionsImportDone();
  const importConfig = buildPromotionsImportConfig({
    existingNames: promotions.map((p) => p.name),
    productByName: new Map(
      productsForImport.map((p) => [normalizeName(p.name), p.id]),
    ),
    categoryByName: new Map(
      categoriesForImport.map((c) => [normalizeName(c.name), c.id]),
    ),
    onDone: () => {
      onImportDone();
      setImportOpen(false);
    },
  });
  const deletePromotion = useDeletePromotion();
  const toggleActive = useTogglePromotionActive();
  const duplicatePromotion = useDuplicatePromotion();
  const bulkUpdateActive = useBulkUpdatePromotionsActive();
  const bulkDelete = useBulkDeletePromotions();

  const kpis = useMemo(() => {
    let activa = 0;
    let programada = 0;
    let vencida = 0;
    let inactiva = 0;
    for (const p of promotions) {
      const s = getPromotionStatus(p);
      if (s === "activa") activa++;
      else if (s === "programada") programada++;
      else if (s === "vencida") vencida++;
      else inactiva++;
    }
    return { total: promotions.length, activa, programada, vencida, inactiva };
  }, [promotions]);

  // Normaliza tildes para que "cafe" encuentre "Café" y viceversa.
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");

  const filtered = useMemo(
    () =>
      promotions.filter((p) => {
        if (search && !normalize(p.name).includes(normalize(search)))
          return false;
        if (statusFilter !== "all" && getPromotionStatus(p) !== statusFilter)
          return false;
        if (typeFilter !== "all" && p.type !== typeFilter) return false;
        if (appliesFilter !== "all" && p.applies_to !== appliesFilter)
          return false;
        return true;
      }),
    [promotions, search, statusFilter, typeFilter, appliesFilter],
  );

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
  }, [search, statusFilter, typeFilter, appliesFilter, reset]);

  useEffect(() => {
    // On mobile show fewer items per page (cards take full width and ~250px tall)
    if (isMobile) {
      handleItemsPerPageChange(5);
    } else {
      handleItemsPerPageChange(view === "grid" ? 10 : 6);
    }
  }, [view, isMobile, handleItemsPerPageChange]);

  // Drop selections that are no longer in the filtered list. Safe in an effect:
  // setSelected returns the same Set when nothing changed, so React bails out
  // (no re-render) — no loop despite `filtered` being a fresh array each render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      if (allPageSelected) for (const id of pageIds) next.delete(id);
      else for (const id of pageIds) next.add(id);
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
      tipo: TYPE_LABELS[p.type] ?? p.type,
      valor: formatPromoValue(p),
      aplica_a: APPLIES_TO_LABELS[p.applies_to] ?? p.applies_to,
      objetivo:
        p.applies_to === "producto"
          ? p.product?.name ?? ""
          : p.applies_to === "categoria"
            ? p.category?.name ?? ""
            : "",
      inicio: formatDate(p.starts_at),
      fin: p.ends_at ? formatDate(p.ends_at) : "Sin fin",
      estado: getPromotionStatus(p),
    }));
    const headers = [
      "nombre",
      "tipo",
      "valor",
      "aplica_a",
      "objetivo",
      "inicio",
      "fin",
      "estado",
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
    a.download = `promociones-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderStatusBadge = (promotion: Promotion) => {
    const status = getPromotionStatus(promotion);
    // Active/Inactive already show via the toggle; here we only highlight date-based states
    if (status === "activa" || status === "inactiva") return null;
    const config: Record<
      "programada" | "vencida",
      { label: string; className: string }
    > = {
      programada: { label: "Programada", className: "bg-blue-600" },
      vencida: { label: "Vencida", className: "bg-red-600" },
    };
    const c = config[status];
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={`cursor-help ${c.className}`}>{c.label}</Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{STATUS_REASON[status]}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const kpiCards = [
    {
      label: "Total",
      value: kpis.total,
      icon: Percent,
      color: "text-foreground",
      bg: "bg-muted/50",
    },
    {
      label: "Activas",
      value: kpis.activa,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Programadas",
      value: kpis.programada,
      icon: CalendarClock,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Vencidas",
      value: kpis.vencida,
      icon: CalendarX,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Promociones</h2>
          <p className="text-muted-foreground text-sm">
            Gestiona las ofertas y descuentos del café
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="w-full cursor-pointer sm:w-auto"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Exportar CSV
          </Button>
          {canImport && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportOpen(true)}
              className="w-full cursor-pointer sm:w-auto"
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Importar
            </Button>
          )}
          <PermissionGuard module="inventory" action="can_create">
            <Button
              size="sm"
              onClick={() => setModal({ open: true, promotion: null })}
              className="w-full sm:w-auto"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Nueva promoción
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:max-w-sm sm:flex-1 sm:min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar promociones..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring sm:w-auto"
        >
          <option value="all">Todos los estados</option>
          <option value="activa">Activas</option>
          <option value="programada">Programadas</option>
          <option value="vencida">Vencidas</option>
          <option value="inactiva">Inactivas</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring sm:w-auto"
        >
          <option value="all">Todos los tipos</option>
          <option value="descuento_porcentaje">Descuento %</option>
          <option value="descuento_precio">Descuento $</option>
          <option value="2x1">2x1</option>
          <option value="precio_fijo">Precio fijo</option>
        </select>
        <select
          value={appliesFilter}
          onChange={(e) =>
            setAppliesFilter(e.target.value as AppliesFilter)
          }
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring sm:w-auto"
        >
          <option value="all">Todas las aplicaciones</option>
          <option value="todos">Todos los productos</option>
          <option value="categoria">Por categoría</option>
          <option value="producto">Por producto</option>
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
            {selected.size} seleccionada{selected.size === 1 ? "" : "s"}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
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
        <SkeletonRows count={4} height="h-20" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Percent}
          title="No hay promociones"
          description="Aún no hay promociones que coincidan con los filtros."
        />
      ) : (
        <>
          {view === "table" ? (
            <ResponsiveTableWrapper>
              <table className="w-full text-sm min-w-160">
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
                    <th className="text-left px-4 py-3 font-medium">
                      Promoción
                    </th>
                    <th className="text-left px-4 py-3 font-medium">Tipo</th>
                    <th className="text-left px-4 py-3 font-medium">Valor</th>
                    <th className="text-left px-4 py-3 font-medium">
                      Aplica a
                    </th>
                    <th className="text-left px-4 py-3 font-medium">
                      Vigencia
                    </th>
                    <th className="text-left px-4 py-3 font-medium">Estado</th>
                    <th className="text-right px-4 py-3 font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((promotion, index) => {
                    const isSelected = selected.has(promotion.id);
                    return (
                      <motion.tr
                        key={promotion.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`border-t hover:bg-muted/30 transition-colors ${
                          isSelected ? "bg-primary/5" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleOne(promotion.id)}
                            aria-label={`Seleccionar ${promotion.name}`}
                            className="cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{promotion.name}</p>
                          {promotion.description && (
                            <p className="text-xs text-muted-foreground">
                              {promotion.description}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">
                            {TYPE_LABELS[promotion.type]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {formatPromoValue(promotion)}
                        </td>
                        <td className="px-4 py-3">
                          <AppliesToCell promotion={promotion} />
                        </td>
                        <td className="px-4 py-3">
                          <VigenciaCell promotion={promotion} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <PermissionGuard
                              module="inventory"
                              action="can_edit"
                            >
                              <Switch
                                checked={promotion.is_active}
                                onCheckedChange={(checked) =>
                                  toggleActive.mutate({
                                    id: promotion.id,
                                    is_active: checked,
                                  })
                                }
                                className="cursor-pointer"
                                aria-label={
                                  promotion.is_active
                                    ? "Desactivar promoción"
                                    : "Activar promoción"
                                }
                              />
                            </PermissionGuard>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <PermissionGuard
                              module="inventory"
                              action="can_edit"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 cursor-pointer"
                                onClick={() =>
                                  setModal({ open: true, promotion })
                                }
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
                                title="Duplicar"
                                onClick={() =>
                                  duplicatePromotion.mutate(promotion)
                                }
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
                                onClick={() => setConfirmDelete(promotion)}
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {paginatedItems.map((promotion, index) => {
                const isSelected = selected.has(promotion.id);
                const status = getPromotionStatus(promotion);
                return (
                  <motion.div
                    key={promotion.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`group relative overflow-hidden rounded-lg border bg-card p-4 transition-all hover:shadow-md ${
                      isSelected ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="absolute right-2 top-2">
                      {renderStatusBadge(promotion)}
                    </div>
                    <div className="absolute left-2 top-2">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(promotion.id)}
                        aria-label={`Seleccionar ${promotion.name}`}
                        className="cursor-pointer bg-background/80 backdrop-blur"
                      />
                    </div>
                    <div className="mt-7 space-y-3">
                      <div className="text-center">
                        <p className="text-3xl font-bold">
                          {formatPromoValue(promotion)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {TYPE_LABELS[promotion.type]}
                        </p>
                      </div>
                      <div>
                        <p className="line-clamp-1 text-sm font-semibold">
                          {promotion.name}
                        </p>
                        {promotion.description && (
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {promotion.description}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2 text-xs">
                        <AppliesToCell promotion={promotion} />
                        <VigenciaCell promotion={promotion} />
                      </div>
                      <div className="flex items-center justify-between border-t pt-2">
                        <PermissionGuard module="inventory" action="can_edit">
                          <Switch
                            checked={promotion.is_active}
                            onCheckedChange={(checked) =>
                              toggleActive.mutate({
                                id: promotion.id,
                                is_active: checked,
                              })
                            }
                            className="cursor-pointer"
                            aria-label={
                              promotion.is_active
                                ? "Desactivar promoción"
                                : "Activar promoción"
                            }
                          />
                        </PermissionGuard>
                        <div className="flex items-center gap-1">
                          <PermissionGuard
                            module="inventory"
                            action="can_edit"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 cursor-pointer"
                              onClick={() =>
                                setModal({ open: true, promotion })
                              }
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
                              onClick={() =>
                                duplicatePromotion.mutate(promotion)
                              }
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
                              onClick={() => setConfirmDelete(promotion)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </PermissionGuard>
                        </div>
                      </div>
                    </div>
                    {/* avoid unused warning if status only used in tooltip */}
                    <span className="hidden">{status}</span>
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
            itemsPerPageOptions={[8, 16, 32, 50]}
          />
        </>
      )}

      <PromotionFormModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        promotion={modal.promotion}
      />

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        config={importConfig}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="Eliminar promoción"
        description={`¿Seguro que quieres eliminar "${confirmDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        loading={deletePromotion.isPending}
        onConfirm={() => {
          if (confirmDelete) {
            deletePromotion.mutate(confirmDelete.id, {
              onSuccess: () => setConfirmDelete(null),
            });
          }
        }}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        onOpenChange={setConfirmBulkDelete}
        title="Eliminar promociones seleccionadas"
        description={`¿Seguro que quieres eliminar ${selected.size} promoción${selected.size === 1 ? "" : "es"}? Esta acción no se puede deshacer.`}
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
    </div>
  );
}
