import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type {
  CashRegister,
  Transaction,
  TransactionFormData,
  PaymentMethod,
} from "@/types";

// ── Constantes Colombia 2026 ──────────────────────────────
export const COLOMBIA_2026 = {
  SMLMV: 1_750_905,
  AUXILIO_TRANSPORTE: 249_095,
  // Trabajador
  SALUD_TRABAJADOR: 0.04,
  PENSION_TRABAJADOR: 0.04,
  // Empleador
  SALUD_EMPLEADOR: 0.085,
  PENSION_EMPLEADOR: 0.12,
  ARL_EMPLEADOR: 0.00522,
  PARAFISCALES: 0.09,
};

// ── Caja diaria ──────────────────────────────────────────

export function useTodayCashRegister() {
  return useQuery({
    queryKey: ["cash_register", "today"],
    queryFn: async (): Promise<CashRegister | null> => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("cash_register")
        .select("*")
        .eq("date", today)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}

export function useCashRegisterHistory(limit = 30) {
  return useQuery({
    queryKey: ["cash_register", "history", limit],
    queryFn: async (): Promise<CashRegister[]> => {
      const { data, error } = await supabase
        .from("cash_register")
        .select("*")
        .order("date", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as CashRegister[];
    },
  });
}

export function useOpenCashRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      opening_amount,
      notes,
    }: {
      opening_amount: number;
      notes?: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("cash_register")
        .insert({
          date: today,
          opening_amount,
          notes: notes || null,
          opened_by: user?.id,
          status: "abierta",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash_register"] });
      toast.success("Caja abierta correctamente");
    },
    onError: () => {
      toast.error("Error al abrir la caja");
    },
  });
}

export function useCloseCashRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      closing_amount,
      notes,
    }: {
      id: string;
      closing_amount: number;
      notes?: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("cash_register")
        .update({
          closing_amount,
          status: "cerrada",
          closed_by: user?.id,
          closed_at: new Date().toISOString(),
          notes: notes || null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash_register"] });
      toast.success("Caja cerrada correctamente");
    },
    onError: () => {
      toast.error("Error al cerrar la caja");
    },
  });
}

// ── Transacciones ─────────────────────────────────────────

export interface TransactionFilters {
  type?: "ingreso" | "egreso";
  category?: string;
  payment_method?: PaymentMethod;
  startDate?: string;
  endDate?: string;
}

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async (): Promise<Transaction[]> => {
      let query = supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.type) query = query.eq("type", filters.type);
      if (filters?.category) query = query.eq("category", filters.category);
      if (filters?.payment_method)
        query = query.eq("payment_method", filters.payment_method);
      if (filters?.startDate)
        query = query.gte("created_at", filters.startDate);
      if (filters?.endDate)
        query = query.lte("created_at", filters.endDate + "T23:59:59");

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Transaction[];
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      formData,
      cashRegisterId,
    }: {
      formData: TransactionFormData;
      cashRegisterId: string | null;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("transactions")
        .insert({
          cash_register_id: cashRegisterId,
          type: formData.type,
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description || null,
          payment_method: formData.payment_method,
          registered_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      const label =
        variables.formData.type === "ingreso" ? "Ingreso" : "Egreso";
      toast.success(`${label} registrado correctamente`);
    },
    onError: () => {
      toast.error("Error al registrar la transacción");
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: TransactionFormData;
    }) => {
      const { data, error } = await supabase
        .from("transactions")
        .update({
          type: formData.type,
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description || null,
          payment_method: formData.payment_method,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transacción actualizada");
    },
    onError: () => {
      toast.error("Error al actualizar la transacción");
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transacción eliminada");
    },
    onError: () => {
      toast.error("Error al eliminar la transacción");
    },
  });
}

export function useTransactionSummary(year?: number, month?: number) {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth();

  return useQuery({
    queryKey: ["transactions", "summary", y, m],
    queryFn: async () => {
      const firstDay = new Date(y, m, 1).toISOString();
      const lastDay = new Date(y, m + 1, 0, 23, 59, 59).toISOString();

      const { data, error } = await supabase
        .from("transactions")
        .select("type, amount, category, created_at")
        .gte("created_at", firstDay)
        .lte("created_at", lastDay);

      if (error) throw error;

      const ingresos = data
        .filter((t) => t.type === "ingreso")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const egresos = data
        .filter((t) => t.type === "egreso")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Agrupar por día para gráfico
      const byDay: Record<string, { ingresos: number; egresos: number }> = {};
      data.forEach((t) => {
        const day = t.created_at.split("T")[0];
        if (!byDay[day]) byDay[day] = { ingresos: 0, egresos: 0 };
        if (t.type === "ingreso") byDay[day].ingresos += Number(t.amount);
        else byDay[day].egresos += Number(t.amount);
      });

      const chartData = Object.entries(byDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, values]) => ({
          date: new Date(date + "T12:00:00").toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "2-digit",
          }),
          ...values,
        }));

      // Top categorías
      const byCategory: Record<
        string,
        { type: string; total: number; count: number }
      > = {};
      data.forEach((t) => {
        const key = `${t.type}:${t.category}`;
        if (!byCategory[key])
          byCategory[key] = { type: t.type, total: 0, count: 0 };
        byCategory[key].total += Number(t.amount);
        byCategory[key].count += 1;
      });

      const topIngresos = Object.entries(byCategory)
        .filter(([, v]) => v.type === "ingreso")
        .map(([k, v]) => ({ category: k.split(":")[1], ...v }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      const topEgresos = Object.entries(byCategory)
        .filter(([, v]) => v.type === "egreso")
        .map(([k, v]) => ({ category: k.split(":")[1], ...v }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      return {
        ingresos,
        egresos,
        balance: ingresos - egresos,
        chartData,
        topIngresos,
        topEgresos,
      };
    },
  });
}

export function useTransactionSummaryPrevMonth(year?: number, month?: number) {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth();
  const prevMonth = m === 0 ? 11 : m - 1;
  const prevYear = m === 0 ? y - 1 : y;

  return useQuery({
    queryKey: ["transactions", "summary_prev", prevYear, prevMonth],
    queryFn: async () => {
      const firstDay = new Date(prevYear, prevMonth, 1).toISOString();
      const lastDay = new Date(
        prevYear,
        prevMonth + 1,
        0,
        23,
        59,
        59,
      ).toISOString();

      const { data, error } = await supabase
        .from("transactions")
        .select("type, amount")
        .gte("created_at", firstDay)
        .lte("created_at", lastDay);

      if (error) throw error;

      const ingresos = data
        .filter((t) => t.type === "ingreso")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const egresos = data
        .filter((t) => t.type === "egreso")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return { ingresos, egresos, balance: ingresos - egresos };
    },
  });
}

// ── Dashboard del día ────────────────────────────────────

export function useTodaySummary() {
  return useQuery({
    queryKey: ["transactions", "today_summary"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("transactions")
        .select("type, amount, category")
        .gte("created_at", today)
        .lte("created_at", today + "T23:59:59");

      if (error) throw error;

      const ingresos = data
        .filter((t) => t.type === "ingreso")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const egresos = data
        .filter((t) => t.type === "egreso")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const totalTransacciones = data.length;

      // Ventas del día
      const { data: salesData } = await supabase
        .from("sales")
        .select("total")
        .gte("created_at", today)
        .lte("created_at", today + "T23:59:59");

      const ventasHoy = salesData?.reduce(
        (sum, s) => sum + Number(s.total),
        0,
      ) ?? 0;
      const numVentas = salesData?.length ?? 0;

      return {
        ingresos,
        egresos,
        balance: ingresos - egresos,
        totalTransacciones,
        ventasHoy,
        numVentas,
      };
    },
  });
}

// ── Caja: diferencia esperada ────────────────────────────

export function useCashDifference(cashRegisterId: string | null) {
  return useQuery({
    queryKey: ["cash_difference", cashRegisterId],
    enabled: !!cashRegisterId,
    queryFn: async () => {
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("type, amount")
        .eq("cash_register_id", cashRegisterId!);

      if (error) throw error;

      const ingresosEfectivo = transactions
        .filter((t) => t.type === "ingreso")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const egresosEfectivo = transactions
        .filter((t) => t.type === "egreso")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return { ingresos: ingresosEfectivo, egresos: egresosEfectivo };
    },
  });
}

// ── Nómina ────────────────────────────────────────────────

export function usePayrollReport(year?: number, month?: number) {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth();

  return useQuery({
    queryKey: ["payroll_report", y, m],
    queryFn: async () => {
      const { data: workers, error } = await supabase
        .from("workers")
        .select("*")
        .eq("status", "activo")
        .order("full_name");

      if (error) throw error;

      const firstDay = new Date(y, m, 1).toISOString();
      const lastDay = new Date(y, m + 1, 0, 23, 59, 59).toISOString();

      const { data: sales } = await supabase
        .from("sales")
        .select("seller_id, total")
        .gte("created_at", firstDay)
        .lte("created_at", lastDay);

      const payroll = workers.map((worker) => {
        const workerSales =
          sales
            ?.filter((s) => s.seller_id === worker.user_id)
            .reduce((sum, s) => sum + Number(s.total), 0) ?? 0;

        const salarioBase = worker.base_salary;
        const auxilioTransporte = worker.transport_allowance;
        const comision = workerSales * (worker.commission_percentage / 100);
        const ibc = salarioBase;

        const saludTrabajador = ibc * COLOMBIA_2026.SALUD_TRABAJADOR;
        const pensionTrabajador = ibc * COLOMBIA_2026.PENSION_TRABAJADOR;
        const totalDescuentos = saludTrabajador + pensionTrabajador;

        const netoTrabajador =
          salarioBase + auxilioTransporte + comision - totalDescuentos;

        const saludEmpleador = ibc * COLOMBIA_2026.SALUD_EMPLEADOR;
        const pensionEmpleador = ibc * COLOMBIA_2026.PENSION_EMPLEADOR;
        const arl = ibc * COLOMBIA_2026.ARL_EMPLEADOR;
        const parafiscales = ibc * COLOMBIA_2026.PARAFISCALES;
        const costoAdicionalEmpleador =
          saludEmpleador + pensionEmpleador + arl + parafiscales;

        const costoTotalEmpresa =
          salarioBase + auxilioTransporte + comision + costoAdicionalEmpleador;

        return {
          worker,
          salarioBase,
          auxilioTransporte,
          comision,
          ventasMes: workerSales,
          descuentos: {
            saludTrabajador,
            pensionTrabajador,
            total: totalDescuentos,
          },
          netoTrabajador,
          costoEmpleador: {
            saludEmpleador,
            pensionEmpleador,
            arl,
            parafiscales,
            total: costoAdicionalEmpleador,
          },
          costoTotalEmpresa,
        };
      });

      return payroll;
    },
  });
}
