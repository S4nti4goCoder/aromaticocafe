import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  DollarSign,
  BarChart2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useDashboardStats } from "@/hooks/useDashboard";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color?: string;
  delay?: number;
}

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "text-primary",
  delay = 0,
}: KPICardProps) {
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
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </motion.div>
  );
}

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

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

      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Ventas hoy"
          value={formatCurrency(stats?.today.total ?? 0)}
          subtitle={`${stats?.today.count ?? 0} transacciones`}
          icon={ShoppingCart}
          color="text-green-600 dark:text-green-400"
          delay={0}
        />
        <KPICard
          title="Ventas del mes"
          value={formatCurrency(stats?.month.total ?? 0)}
          subtitle={`${stats?.month.count ?? 0} transacciones`}
          icon={TrendingUp}
          color="text-blue-600 dark:text-blue-400"
          delay={0.05}
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
          title="Trabajadores activos"
          value={String(stats?.workers.active ?? 0)}
          subtitle="En turno"
          icon={Users}
          delay={0.15}
        />
      </div>

      {/* Alertas de stock */}
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
          <div className="flex gap-3">
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
        {/* Gráfico de ventas del mes */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-lg border bg-card p-4 space-y-4"
        >
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Ventas del mes</h3>
          </div>

          {(stats?.salesChartData.length ?? 0) === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              No hay ventas este mes
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.salesChartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                    }
                  />
                  <Tooltip
                    cursor={{ className: "fill-muted/40" }}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Ventas",
                    ]}
                  />
                  <Bar
                    dataKey="total"
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Productos más vendidos */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border bg-card p-4 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Productos más vendidos</h3>
            <span className="text-xs text-muted-foreground">(este mes)</span>
          </div>

          {(stats?.topProducts.length ?? 0) === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              No hay ventas este mes
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.topProducts}
                  layout="vertical"
                  margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    className="stroke-muted"
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                    width={90}
                  />
                  <Tooltip
                    cursor={{ className: "fill-muted/40" }}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value: number, _name, item) => [
                      `${value} und. · ${formatCurrency(item.payload.total)}`,
                      "Vendidos",
                    ]}
                  />
                  <Bar dataKey="quantity" radius={[0, 6, 6, 0]}>
                    {stats?.topProducts.map((_, i) => (
                      <Cell key={i} fill="hsl(var(--primary))" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      {/* Balance del mes */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-lg border bg-card p-4"
      >
        <h3 className="font-semibold mb-4">Balance del mes</h3>
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
    </div>
  );
}
