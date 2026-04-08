import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard_stats"],
    queryFn: async () => {
      const now = new Date();

      // El navegador ya maneja la zona horaria local
      // setHours(0,0,0,0) da medianoche en hora local → ya es correcto en UTC
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      const firstDayOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
        0,
        0,
        0,
        0,
      );

      const firstDayOfPrevMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
        0,
        0,
        0,
        0,
      );

      // Ventas del mes anterior (mismo rango: día 1 → mismo día actual del mes pasado)
      const sameDayPrevMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate(),
        23,
        59,
        59,
        999,
      );

      const { data: prevMonthSales } = await supabase
        .from("sales")
        .select("total")
        .gte("created_at", firstDayOfPrevMonth.toISOString())
        .lte("created_at", sameDayPrevMonth.toISOString());

      // Ventas de hoy
      const { data: todaySales } = await supabase
        .from("sales")
        .select("total")
        .gte("created_at", todayStart.toISOString());

      // Ventas del mes
      const { data: monthSales } = await supabase
        .from("sales")
        .select("id, total, created_at, payment_method")
        .gte("created_at", firstDayOfMonth.toISOString())
        .order("created_at", { ascending: true });

      // Transacciones del mes
      const { data: monthTransactions } = await supabase
        .from("transactions")
        .select("type, amount")
        .gte("created_at", firstDayOfMonth.toISOString());

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

      // Items de ventas del mes
      const monthSaleIds = monthSales?.map((s) => s.id) ?? [];
      const { data: monthItems } =
        monthSaleIds.length > 0
          ? await supabase
              .from("sale_items")
              .select("product_name, quantity, subtotal")
              .in("sale_id", monthSaleIds)
          : { data: [] };

      // Calcular KPIs
      const todayTotal =
        todaySales?.reduce((sum, s) => sum + Number(s.total), 0) ?? 0;
      const todayCount = todaySales?.length ?? 0;

      const monthTotal =
        monthSales?.reduce((sum, s) => sum + Number(s.total), 0) ?? 0;
      const monthCount = monthSales?.length ?? 0;

      const monthIngresos =
        monthTransactions
          ?.filter((t) => t.type === "ingreso")
          .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

      const monthEgresos =
        monthTransactions
          ?.filter((t) => t.type === "egreso")
          .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

      // Ventas por día para gráfico
      const salesByDay: Record<string, number> = {};
      monthSales?.forEach((sale) => {
        const date = new Date(sale.created_at);
        // Convertir a hora local para agrupar por día correcto
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
      monthItems?.forEach((item) => {
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

      // Ticket promedio del mes
      const avgTicket = monthCount > 0 ? monthTotal / monthCount : 0;

      // Ventas por hora del día (este mes, agrupadas por hora local)
      const salesByHour: Record<number, number> = {};
      for (let h = 0; h < 24; h++) salesByHour[h] = 0;
      monthSales?.forEach((sale) => {
        const h = new Date(sale.created_at).getHours();
        salesByHour[h] += Number(sale.total);
      });
      const salesByHourData = Object.entries(salesByHour).map(([h, total]) => ({
        hour: `${h.padStart(2, "0")}h`,
        total,
      }));

      // Métodos de pago (este mes)
      const paymentTotals: Record<string, number> = {};
      monthSales?.forEach((sale) => {
        const method = sale.payment_method || "otro";
        paymentTotals[method] = (paymentTotals[method] ?? 0) + Number(sale.total);
      });
      const paymentMethodsData = Object.entries(paymentTotals).map(
        ([method, total]) => ({ method, total }),
      );

      const prevMonthTotal =
        prevMonthSales?.reduce((sum, s) => sum + Number(s.total), 0) ?? 0;

      const monthChangePct =
        prevMonthTotal > 0
          ? ((monthTotal - prevMonthTotal) / prevMonthTotal) * 100
          : null;

      return {
        today: { total: todayTotal, count: todayCount },
        month: {
          total: monthTotal,
          count: monthCount,
          prevTotal: prevMonthTotal,
          changePct: monthChangePct,
          avgTicket,
        },
        balance: {
          ingresos: monthIngresos,
          egresos: monthEgresos,
          net: monthIngresos - monthEgresos,
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
