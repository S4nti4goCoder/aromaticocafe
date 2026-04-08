import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type DateRangeKey = "today" | "7d" | "30d" | "month" | "custom";

export interface DateRange {
  key: DateRangeKey;
  from: Date;
  to: Date;
}

export function useDashboardStats(range: DateRange) {
  return useQuery({
    queryKey: [
      "dashboard_stats",
      range.key,
      range.from.toISOString(),
      range.to.toISOString(),
    ],
    queryFn: async () => {
      const fromISO = range.from.toISOString();
      const toISO = range.to.toISOString();

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // Comparación: solo cuando el rango es "month"
      let prevPeriodSales: { total: number }[] | null = null;
      if (range.key === "month") {
        const now = new Date();
        const firstDayOfPrevMonth = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1,
          0,
          0,
          0,
          0,
        );
        const sameDayPrevMonth = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate(),
          23,
          59,
          59,
          999,
        );
        const { data } = await supabase
          .from("sales")
          .select("total")
          .gte("created_at", firstDayOfPrevMonth.toISOString())
          .lte("created_at", sameDayPrevMonth.toISOString());
        prevPeriodSales = data;
      }

      // Ventas de hoy (siempre, independiente del rango)
      const { data: todaySales } = await supabase
        .from("sales")
        .select("total")
        .gte("created_at", todayStart.toISOString());

      // Ventas del periodo seleccionado
      const { data: periodSales } = await supabase
        .from("sales")
        .select("id, total, created_at, payment_method")
        .gte("created_at", fromISO)
        .lte("created_at", toISO)
        .order("created_at", { ascending: true });

      // Transacciones del periodo
      const { data: periodTransactions } = await supabase
        .from("transactions")
        .select("type, amount")
        .gte("created_at", fromISO)
        .lte("created_at", toISO);

      // Stock bajo
      const { data: lowStock } = await supabase
        .from("product_stock")
        .select("product_id")
        .lte("stock", 5)
        .gt("stock", 0);

      // Agotados
      const { data: outOfStock } = await supabase
        .from("product_stock")
        .select("product_id")
        .eq("stock", 0);

      // Trabajadores activos
      const { count: activeWorkers } = await supabase
        .from("workers")
        .select("*", { count: "exact", head: true })
        .eq("status", "activo");

      // Items de ventas del periodo
      const periodSaleIds = periodSales?.map((s) => s.id) ?? [];
      const { data: periodItems } =
        periodSaleIds.length > 0
          ? await supabase
              .from("sale_items")
              .select("product_name, quantity, subtotal")
              .in("sale_id", periodSaleIds)
          : { data: [] };

      // KPIs
      const todayTotal =
        todaySales?.reduce((sum, s) => sum + Number(s.total), 0) ?? 0;
      const todayCount = todaySales?.length ?? 0;

      const periodTotal =
        periodSales?.reduce((sum, s) => sum + Number(s.total), 0) ?? 0;
      const periodCount = periodSales?.length ?? 0;

      const periodIngresos =
        periodTransactions
          ?.filter((t) => t.type === "ingreso")
          .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

      const periodEgresos =
        periodTransactions
          ?.filter((t) => t.type === "egreso")
          .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

      // Ventas por día para gráfico
      const salesByDay: Record<string, number> = {};
      periodSales?.forEach((sale) => {
        const date = new Date(sale.created_at);
        const localDate = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000,
        );
        const day = localDate.toISOString().split("T")[0];
        salesByDay[day] = (salesByDay[day] ?? 0) + Number(sale.total);
      });

      const salesChartData = Object.entries(salesByDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, total]) => ({
          date: new Date(date + "T12:00:00").toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "2-digit",
          }),
          total,
        }));

      // Productos más vendidos
      const productSales: Record<
        string,
        { name: string; quantity: number; total: number }
      > = {};
      periodItems?.forEach((item) => {
        if (!productSales[item.product_name]) {
          productSales[item.product_name] = {
            name: item.product_name,
            quantity: 0,
            total: 0,
          };
        }
        productSales[item.product_name].quantity += item.quantity;
        productSales[item.product_name].total += Number(item.subtotal);
      });

      const topProductsList = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      const avgTicket = periodCount > 0 ? periodTotal / periodCount : 0;

      // Ventas por hora del día
      const salesByHour: Record<number, number> = {};
      for (let h = 0; h < 24; h++) salesByHour[h] = 0;
      periodSales?.forEach((sale) => {
        const h = new Date(sale.created_at).getHours();
        salesByHour[h] += Number(sale.total);
      });
      const salesByHourData = Object.entries(salesByHour).map(([h, total]) => ({
        hour: `${h.padStart(2, "0")}h`,
        total,
      }));

      // Métodos de pago
      const paymentTotals: Record<string, number> = {};
      periodSales?.forEach((sale) => {
        const method = sale.payment_method || "otro";
        paymentTotals[method] =
          (paymentTotals[method] ?? 0) + Number(sale.total);
      });
      const paymentMethodsData = Object.entries(paymentTotals).map(
        ([method, total]) => ({ method, total }),
      );

      const prevPeriodTotal =
        prevPeriodSales?.reduce((sum, s) => sum + Number(s.total), 0) ?? 0;

      const periodChangePct =
        range.key === "month" && prevPeriodTotal > 0
          ? ((periodTotal - prevPeriodTotal) / prevPeriodTotal) * 100
          : null;

      return {
        today: { total: todayTotal, count: todayCount },
        month: {
          total: periodTotal,
          count: periodCount,
          prevTotal: prevPeriodTotal,
          changePct: periodChangePct,
          avgTicket,
        },
        balance: {
          ingresos: periodIngresos,
          egresos: periodEgresos,
          net: periodIngresos - periodEgresos,
        },
        stock: {
          low: lowStock?.length ?? 0,
          out: outOfStock?.length ?? 0,
        },
        workers: { active: activeWorkers ?? 0 },
        salesChartData,
        topProducts: topProductsList,
        salesByHour: salesByHourData,
        paymentMethods: paymentMethodsData,
      };
    },
    refetchInterval: 1000 * 60 * 2,
  });
}
