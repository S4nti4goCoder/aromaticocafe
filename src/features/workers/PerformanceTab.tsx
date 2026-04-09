import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ShoppingCart, DollarSign, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkers } from "@/hooks/useWorkers";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  gerente: "Gerente",
  cajero: "Cajero",
  barista: "Barista",
};

function getMonthRange(offset: number) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + offset;
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    label: start.toLocaleDateString("es-CO", { month: "long", year: "numeric" }),
  };
}

function useWorkerSales(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["worker_sales", startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("seller_id, total, discount, is_voided, items:sale_items(quantity)")
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .eq("is_voided", false);

      if (error) throw error;
      return data;
    },
  });
}

export function PerformanceTab() {
  const [monthOffset, setMonthOffset] = useState(0);
  const { startDate, endDate, label: monthLabel } = getMonthRange(monthOffset);

  const { data: workers = [], isLoading: loadingWorkers } = useWorkers();
  const { data: sales = [], isLoading: loadingSales } = useWorkerSales(
    startDate,
    endDate,
  );

  const isLoading = loadingWorkers || loadingSales;

  // Build performance data per worker
  const performance = workers
    .filter((w) => w.status === "activo")
    .map((worker) => {
      const workerSales = sales.filter((s) => s.seller_id === worker.user_id);
      const totalSales = workerSales.reduce((sum, s) => sum + Number(s.total), 0);
      const totalTransactions = workerSales.length;
      const totalItems = workerSales.reduce(
        (sum, s) => sum + (s.items?.reduce((is, i) => is + i.quantity, 0) ?? 0),
        0,
      );
      const avgTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;
      const commission = totalSales * (worker.commission_percentage / 100);

      return {
        worker,
        totalSales,
        totalTransactions,
        totalItems,
        avgTicket,
        commission,
      };
    })
    .sort((a, b) => b.totalSales - a.totalSales);

  // Totals
  const grandTotalSales = performance.reduce((s, p) => s + p.totalSales, 0);
  const grandTotalTx = performance.reduce((s, p) => s + p.totalTransactions, 0);
  const grandTotalCommission = performance.reduce(
    (s, p) => s + p.commission,
    0,
  );
  const grandAvgTicket = grandTotalTx > 0 ? grandTotalSales / grandTotalTx : 0;

  const months = Array.from({ length: 6 }, (_, i) => {
    const { label } = getMonthRange(-i);
    return { value: String(-i), label };
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <Select
          value={String(monthOffset)}
          onValueChange={(v) => setMonthOffset(parseInt(v))}
        >
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label.charAt(0).toUpperCase() + m.label.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <DollarSign className="h-3 w-3" />
            Ventas totales
          </div>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(grandTotalSales)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <ShoppingCart className="h-3 w-3" />
            Transacciones
          </div>
          <p className="text-xl font-bold">{grandTotalTx}</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Receipt className="h-3 w-3" />
            Ticket promedio
          </div>
          <p className="text-xl font-bold">{formatCurrency(grandAvgTicket)}</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <TrendingUp className="h-3 w-3" />
            Comisiones
          </div>
          <p className="text-xl font-bold text-primary">
            {formatCurrency(grandTotalCommission)}
          </p>
        </div>
      </div>

      {/* Ranking table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : performance.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No hay trabajadores activos
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2 font-medium w-8">#</th>
                <th className="text-left px-4 py-2 font-medium">Vendedor</th>
                <th className="text-right px-4 py-2 font-medium">Ventas</th>
                <th className="text-right px-4 py-2 font-medium">
                  Transacciones
                </th>
                <th className="text-right px-4 py-2 font-medium">
                  Productos
                </th>
                <th className="text-right px-4 py-2 font-medium">
                  Ticket prom.
                </th>
                <th className="text-right px-4 py-2 font-medium">Comisión</th>
              </tr>
            </thead>
            <tbody>
              {performance.map((p, index) => {
                const pct =
                  grandTotalSales > 0
                    ? (p.totalSales / grandTotalSales) * 100
                    : 0;
                return (
                  <motion.tr
                    key={p.worker.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-t hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs font-bold",
                          index === 0 && "text-amber-500",
                          index === 1 && "text-gray-400",
                          index === 2 && "text-amber-700",
                        )}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={p.worker.avatar_url ?? undefined}
                          />
                          <AvatarFallback className="text-[10px]">
                            {p.worker.full_name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-xs">
                            {p.worker.full_name}
                          </p>
                          <div className="flex items-center gap-1">
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1 py-0"
                            >
                              {roleLabels[p.worker.role]}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {p.worker.commission_percentage}% com.
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div>
                        <p className="font-bold text-green-600">
                          {formatCurrency(p.totalSales)}
                        </p>
                        <div className="w-full bg-muted rounded-full h-1 mt-1">
                          <div
                            className="bg-green-500 rounded-full h-1 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {p.totalTransactions}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {p.totalItems}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(p.avgTicket)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-primary">
                      {formatCurrency(p.commission)}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
