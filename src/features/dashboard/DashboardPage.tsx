import { lazy, Suspense, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/currency";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  DollarSign,
  BarChart2,
  Clock,
  CreditCard,
  Receipt,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/useProfile";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { ExportMenu } from "@/components/shared/ExportMenu";
import { previousRange, type Brand } from "@/lib/reports/types";
import {
  generateSalesPdf,
  generateSalesXlsx,
} from "@/lib/reports/salesReport";
import {
  generateProfitPdf,
  generateProfitXlsx,
} from "@/lib/reports/profitReport";
import {
  useDashboardStats,
  type DateRange,
  type DateRangeKey,
} from "@/hooks/useDashboard";

// recharts is heavy and only needed once the dashboard has data to plot, so the
// chart bodies load on demand from their own chunk. All four resolve to the same
// dynamic import, so recharts is fetched once.
const SalesBarChart = lazy(() =>
  import("@/features/dashboard/DashboardCharts").then((m) => ({
    default: m.SalesBarChart,
  })),
);
const TopProductsBarChart = lazy(() =>
  import("@/features/dashboard/DashboardCharts").then((m) => ({
    default: m.TopProductsBarChart,
  })),
);
const SalesByHourAreaChart = lazy(() =>
  import("@/features/dashboard/DashboardCharts").then((m) => ({
    default: m.SalesByHourAreaChart,
  })),
);
const PaymentMethodsPieChart = lazy(() =>
  import("@/features/dashboard/DashboardCharts").then((m) => ({
    default: m.PaymentMethodsPieChart,
  })),
);

// Fills a chart's h-64 container while its chunk loads.
const ChartFallback = () => <Skeleton className="h-full w-full" />;

const RANGE_LABELS: Record<DateRangeKey, string> = {
  today: "Hoy",
  "7d": "7 días",
  "30d": "30 días",
  month: "Mes",
  custom: "Personalizado",
};

function buildRange(key: DateRangeKey, customFrom?: string, customTo?: string): DateRange {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);

  switch (key) {
    case "today":
      return { key, from, to };
    case "7d":
      from.setDate(from.getDate() - 6);
      return { key, from, to };
    case "30d":
      from.setDate(from.getDate() - 29);
      return { key, from, to };
    case "month": {
      const first = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return { key, from: first, to };
    }
    case "custom": {
      const f = customFrom ? new Date(customFrom + "T00:00:00") : from;
      const t = customTo ? new Date(customTo + "T23:59:59") : to;
      return { key, from: f, to: t };
    }
  }
}

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color?: string;
  delay?: number;
  changePct?: number | null;
}

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "text-primary",
  delay = 0,
  changePct,
}: KPICardProps) {
  const hasChange = changePct !== undefined && changePct !== null;
  const isPositive = (changePct ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-lg border bg-card p-4 space-y-2"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {hasChange && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {isPositive ? "+" : ""}
            {changePct.toFixed(1)}%
          </span>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}

export function DashboardPage() {
  const [rangeKey, setRangeKey] = useState<DateRangeKey>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const range = useMemo(
    () => buildRange(rangeKey, customFrom, customTo),
    [rangeKey, customFrom, customTo],
  );
  const { data: stats, isLoading, refetch, isFetching } =
    useDashboardStats(range);
  const prevRange = useMemo(() => previousRange(range), [range]);
  const { data: prevStats } = useDashboardStats(prevRange ?? range);
  const { settings } = useSystemSettings();
  const periodLabel = RANGE_LABELS[rangeKey].toLowerCase();
  const { data: profile } = useProfile();
  const canSeeProfit =
    profile?.role === "super_admin" || profile?.role === "gerente";

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

  const exportItems = useMemo(() => {
    if (!stats || !canSeeProfit) return [];
    const usablePrev = prevRange ? (prevStats ?? null) : null;
    return [
      {
        group: "Ventas",
        label: "Excel",
        onClick: () =>
          generateSalesXlsx({
            stats,
            prevStats: usablePrev,
            range,
            prevRange,
            brand,
          }),
      },
      {
        group: "Ventas",
        label: "PDF",
        onClick: () =>
          generateSalesPdf({
            stats,
            prevStats: usablePrev,
            range,
            prevRange,
            brand,
          }),
      },
      {
        group: "Rentabilidad",
        label: "Excel",
        onClick: () =>
          generateProfitXlsx({
            stats,
            prevStats: usablePrev,
            range,
            prevRange,
            brand,
          }),
      },
      {
        group: "Rentabilidad",
        label: "PDF",
        onClick: () =>
          generateProfitPdf({
            stats,
            prevStats: usablePrev,
            range,
            prevRange,
            brand,
          }),
      },
    ];
  }, [stats, prevStats, prevRange, range, brand, canSeeProfit]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Panel principal</h2>
          <p className="text-muted-foreground text-sm">Resumen del negocio</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Panel principal</h2>
          <p className="text-muted-foreground text-sm">
            {new Date().toLocaleDateString("es-CO", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border bg-card overflow-x-auto max-w-full">
            {(Object.keys(RANGE_LABELS) as DateRangeKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setRangeKey(k)}
                className={`px-2 sm:px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  rangeKey === k
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {RANGE_LABELS[k]}
              </button>
            ))}
          </div>
          {rangeKey === "custom" && (
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="rounded-md border bg-card px-2 py-1 text-xs"
              />
              <span className="text-xs text-muted-foreground">→</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="rounded-md border bg-card px-2 py-1 text-xs"
              />
            </div>
          )}
          {canSeeProfit && (
            <ExportMenu
              label="Exportar reporte"
              items={exportItems}
              disabled={!stats}
            />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Ventas hoy"
          value={formatCurrency(stats?.today.total ?? 0)}
          subtitle={`${stats?.today.count ?? 0} transacciones`}
          icon={ShoppingCart}
          color="text-green-600 dark:text-green-400"
          delay={0}
        />
        <KPICard
          title={`Ventas · ${RANGE_LABELS[rangeKey]}`}
          value={formatCurrency(stats?.month.total ?? 0)}
          subtitle={`${stats?.month.count ?? 0} transacciones`}
          icon={TrendingUp}
          color="text-blue-600 dark:text-blue-400"
          delay={0.05}
          changePct={stats?.month.changePct ?? null}
        />
        <KPICard
          title="Ingresos netos"
          value={formatCurrency(stats?.balance.net ?? 0)}
          subtitle={`Egresos: ${formatCurrency(stats?.balance.egresos ?? 0)}`}
          icon={DollarSign}
          color={
            (stats?.balance.net ?? 0) >= 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }
          delay={0.1}
        />
        <KPICard
          title="Ticket promedio"
          value={formatCurrency(stats?.month.avgTicket ?? 0)}
          subtitle={`Por venta · ${periodLabel}`}
          icon={Receipt}
          color="text-amber-600 dark:text-amber-400"
          delay={0.15}
        />
        <KPICard
          title="Trabajadores activos"
          value={String(stats?.workers.active ?? 0)}
          subtitle="En turno"
          icon={Users}
          delay={0.2}
        />
      </div>

      {/* Stock alerts */}
      {((stats?.stock.out ?? 0) > 0 || (stats?.stock.low ?? 0) > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Alertas de inventario
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(stats?.stock.out ?? 0) > 0 && (
              <Badge variant="destructive">
                {stats?.stock.out} producto(s) agotado(s)
              </Badge>
            )}
            {(stats?.stock.low ?? 0) > 0 && (
              <Badge
                variant="outline"
                className="border-amber-500 text-amber-600"
              >
                {stats?.stock.low} producto(s) con stock bajo
              </Badge>
            )}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly sales chart */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-lg border bg-card p-4 space-y-4"
        >
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Ventas · {RANGE_LABELS[rangeKey]}</h3>
          </div>

          {(stats?.salesChartData.length ?? 0) === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              No hay ventas en este período
            </div>
          ) : (
            <div className="h-64 w-full">
              <Suspense fallback={<ChartFallback />}>
                <SalesBarChart data={stats?.salesChartData ?? []} />
              </Suspense>
            </div>
          )}
        </motion.div>

        {/* Best-selling products */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border bg-card p-4 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Productos más vendidos</h3>
            <span className="text-xs text-muted-foreground">({periodLabel})</span>
          </div>

          {(stats?.topProducts.length ?? 0) === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              No hay ventas en este período
            </div>
          ) : (
            <div className="h-64 w-full">
              <Suspense fallback={<ChartFallback />}>
                <TopProductsBarChart data={stats?.topProducts ?? []} />
              </Suspense>
            </div>
          )}
        </motion.div>
      </div>

      {/* Sales by hour + Payment methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="rounded-lg border bg-card p-4 space-y-4 lg:col-span-2"
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Ventas por hora</h3>
            <span className="text-xs text-muted-foreground">({periodLabel})</span>
          </div>
          {(stats?.month.count ?? 0) === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              No hay ventas en este período
            </div>
          ) : (
            <div className="h-64 w-full">
              <Suspense fallback={<ChartFallback />}>
                <SalesByHourAreaChart data={stats?.salesByHour ?? []} />
              </Suspense>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
          className="rounded-lg border bg-card p-4 space-y-4"
        >
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Métodos de pago</h3>
          </div>
          {(stats?.paymentMethods.length ?? 0) === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              No hay ventas en este período
            </div>
          ) : (
            <div className="h-64 w-full">
              <Suspense fallback={<ChartFallback />}>
                <PaymentMethodsPieChart data={stats?.paymentMethods ?? []} />
              </Suspense>
            </div>
          )}
        </motion.div>
      </div>

      {/* Monthly balance */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-lg border bg-card p-4"
      >
        <h3 className="font-semibold mb-4">Balance · {RANGE_LABELS[rangeKey]}</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <p className="text-sm text-muted-foreground">Ingresos</p>
            </div>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(stats?.balance.ingresos ?? 0)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <p className="text-sm text-muted-foreground">Egresos</p>
            </div>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(stats?.balance.egresos ?? 0)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <DollarSign className="h-4 w-4 text-primary" />
              <p className="text-sm text-muted-foreground">Balance neto</p>
            </div>
            <p
              className={`text-xl font-bold ${
                (stats?.balance.net ?? 0) >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(stats?.balance.net ?? 0)}
            </p>
          </div>
        </div>
      </motion.div>

      {canSeeProfit && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          className="rounded-lg border bg-card p-4"
        >
          <h3 className="font-semibold mb-4">
            Rentabilidad · {RANGE_LABELS[rangeKey]}
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">COGS</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(stats?.profit.cogs ?? 0)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Utilidad bruta</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(stats?.profit.gross ?? 0)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Margen</p>
              <p className="text-xl font-bold text-primary">
                {(stats?.profit.marginPct ?? 0).toFixed(1)}%
              </p>
            </div>
          </div>
          {(stats?.profit.topProfitable.length ?? 0) > 0 && (
            <div className="mt-4 border-t pt-3 space-y-1">
              <p className="text-sm text-muted-foreground mb-1">
                Productos más rentables
              </p>
              {stats?.profit.topProfitable.map((p) => (
                <div key={p.name} className="flex justify-between text-sm">
                  <span className="truncate">{p.name}</span>
                  <span className="font-medium">{formatCurrency(p.profit)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
