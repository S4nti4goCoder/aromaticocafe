import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, RotateCcw, XCircle, ListChecks } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/shared/Pagination";
import { ResponsiveTableWrapper } from "@/components/shared/ResponsiveTableWrapper";
import { SkeletonRows } from "@/components/shared/SkeletonRows";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency } from "@/lib/currency";
import { localDateString } from "@/lib/localDate";
import {
  useSalesHistory,
  useSalesHistorySummary,
  SALES_HISTORY_PAGE_SIZE,
  type SalesHistoryFilters,
  type SaleWithItemsAndRefunds,
} from "@/hooks/useSalesHistory";
import { useWorkers } from "@/hooks/useWorkers";
import { SaleDetailModal } from "@/features/sales/SaleDetailModal";
import type { SaleStatus } from "@/types";

const STATUS_BADGE: Record<SaleStatus, { label: string; className: string }> = {
  valida: { label: "Válida", className: "bg-green-600 text-white" },
  devuelta_parcial: {
    label: "Devuelta parcial",
    className: "bg-amber-500 text-white",
  },
  devuelta_total: {
    label: "Devuelta total",
    className: "bg-orange-500 text-white",
  },
  anulada: { label: "Anulada", className: "bg-red-600 text-white" },
};

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 6);
  return {
    fromDate: localDateString(from),
    toDate: localDateString(to),
  };
}

export function SalesPage() {
  const [filters, setFilters] = useState<SalesHistoryFilters>(() => ({
    ...defaultRange(),
    status: "all",
  }));
  const [page, setPage] = useState(1);
  const [selectedSale, setSelectedSale] =
    useState<SaleWithItemsAndRefunds | null>(null);

  const { data, isLoading } = useSalesHistory(filters, page);
  const sales = data?.sales ?? [];
  const total = data?.total ?? 0;
  const { data: workers = [] } = useWorkers();
  // Cualquier trabajador con usuario puede registrar ventas (cajero,
  // gerente, admin); sin user_id no hay forma de filtrar sus ventas.
  const sellers = useMemo(
    () => workers.filter((w) => w.user_id),
    [workers],
  );

  // KPIs de TODO el rango filtrado (no solo la página visible).
  const { data: summary } = useSalesHistorySummary(filters);
  const kpis = summary ?? {
    count: 0,
    totalAmount: 0,
    totalRefunded: 0,
    voided: 0,
  };

  const totalPages = Math.max(1, Math.ceil(total / SALES_HISTORY_PAGE_SIZE));

  const update = (patch: Partial<SalesHistoryFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Ventas</h2>
          <p className="text-muted-foreground text-sm">
            Historial completo de ventas con devoluciones y anulaciones
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-2 rounded-lg border bg-card p-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Desde</p>
          <Input
            type="date"
            value={filters.fromDate}
            onChange={(e) => update({ fromDate: e.target.value })}
            className="h-9 w-40"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Hasta</p>
          <Input
            type="date"
            value={filters.toDate}
            onChange={(e) => update({ toDate: e.target.value })}
            className="h-9 w-40"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Vendedor</p>
          <select
            value={filters.cashierId ?? ""}
            onChange={(e) =>
              update({ cashierId: e.target.value || undefined })
            }
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">Todos</option>
            {sellers.map((w) => (
              <option key={w.id} value={w.user_id!}>
                {w.full_name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Método</p>
          <select
            value={filters.paymentMethod ?? ""}
            onChange={(e) =>
              update({ paymentMethod: e.target.value || undefined })
            }
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Estado</p>
          <select
            value={filters.status ?? "all"}
            onChange={(e) =>
              update({
                status: e.target.value as SalesHistoryFilters["status"],
              })
            }
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="all">Todas</option>
            <option value="valida">Válidas</option>
            <option value="devuelta_parcial">Devueltas parciales</option>
            <option value="devuelta_total">Devueltas totales</option>
            <option value="anulada">Anuladas</option>
          </select>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground"># Venta</p>
          <Input
            type="number"
            value={filters.saleNumber ?? ""}
            onChange={(e) =>
              update({ saleNumber: e.target.value || undefined })
            }
            className="h-9 w-24"
            placeholder="123"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFilters({ ...defaultRange(), status: "all" });
            setPage(1);
          }}
        >
          Limpiar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPI
          label="Ventas (total)"
          value={String(kpis.count)}
          icon={ListChecks}
        />
        <KPI
          label="Facturado (total)"
          value={formatCurrency(kpis.totalAmount)}
          icon={CheckCircle2}
          color="text-green-600 dark:text-green-400"
        />
        <KPI
          label="Devuelto (total)"
          value={formatCurrency(kpis.totalRefunded)}
          icon={RotateCcw}
          color="text-amber-600 dark:text-amber-400"
        />
        <KPI
          label="Anuladas (total)"
          value={String(kpis.voided)}
          icon={XCircle}
          color="text-red-600 dark:text-red-400"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonRows count={6} />
      ) : sales.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Sin ventas"
          description="No hay ventas en este rango con los filtros aplicados."
        />
      ) : (
        <ResponsiveTableWrapper>
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-3 py-2 text-left font-medium"># Venta</th>
                <th className="px-3 py-2 text-left font-medium">Fecha</th>
                <th className="px-3 py-2 text-left font-medium">Método</th>
                <th className="px-3 py-2 text-right font-medium">Total</th>
                <th className="px-3 py-2 text-right font-medium">Devuelto</th>
                <th className="px-3 py-2 text-center font-medium">Estado</th>
                <th className="px-3 py-2 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => {
                const badge = STATUS_BADGE[s.status];
                const refundedAmount = s.refunds.reduce(
                  (sum, r) => sum + Number(r.amount),
                  0,
                );
                return (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t hover:bg-muted/20"
                  >
                    <td className="px-3 py-2">
                      {s.sale_number ?? s.id.slice(0, 8)}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {new Date(s.created_at).toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-2">{s.payment_method}</td>
                    <td className="px-3 py-2 text-right">
                      {formatCurrency(s.total)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {refundedAmount > 0
                        ? formatCurrency(refundedAmount)
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Badge className={badge.className}>{badge.label}</Badge>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedSale(s)}
                      >
                        Ver
                      </Button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </ResponsiveTableWrapper>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={total}
        itemsPerPage={SALES_HISTORY_PAGE_SIZE}
        onPageChange={setPage}
      />

      <SaleDetailModal
        sale={selectedSale}
        onOpenChange={(o) => {
          if (!o) setSelectedSale(null);
        }}
      />
    </div>
  );
}

function KPI({
  label,
  value,
  icon: Icon,
  color = "text-foreground",
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
