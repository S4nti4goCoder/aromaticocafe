import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { CashRegister, Transaction, TransactionFormData } from "@/types";

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
    },
  });
}

// ── Transacciones ─────────────────────────────────────────

export function useTransactions(filters?: {
  type?: "ingreso" | "egreso";
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async (): Promise<Transaction[]> => {
      let query = supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.type) query = query.eq("type", filters.type);
      if (filters?.startDate)
        query = query.gte("created_at", filters.startDate);
      if (filters?.endDate) query = query.lte("created_at", filters.endDate);

      const { data, error } = await query;
      if (error) throw error;
      return data;
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
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
    },
  });
}

export function useTransactionSummary() {
  return useQuery({
    queryKey: ["transactions", "summary"],
    queryFn: async () => {
      const firstDayOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      ).toISOString();

      const { data, error } = await supabase
        .from("transactions")
        .select("type, amount, created_at")
        .gte("created_at", firstDayOfMonth);

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

      return { ingresos, egresos, balance: ingresos - egresos, chartData };
    },
  });
}

// ── Nómina ────────────────────────────────────────────────

export function usePayrollReport() {
  return useQuery({
    queryKey: ["payroll_report"],
    queryFn: async () => {
      // Traer trabajadores activos
      const { data: workers, error } = await supabase
        .from("workers")
        .select("*")
        .eq("status", "activo")
        .order("full_name");

      if (error) throw error;

      // Ventas del mes por vendedor
      const firstDayOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      ).toISOString();

      const { data: sales } = await supabase
        .from("sales")
        .select("seller_id, total")
        .gte("created_at", firstDayOfMonth);

      // Calcular nómina por trabajador
      const payroll = workers.map((worker) => {
        const workerSales =
          sales
            ?.filter((s) => s.seller_id === worker.user_id)
            .reduce((sum, s) => sum + Number(s.total), 0) ?? 0;

        const salarioBase = worker.base_salary;
        const auxilioTransporte = worker.transport_allowance;
        const comision = workerSales * (worker.commission_percentage / 100);

        // IBC = salario base (no incluye auxilio)
        const ibc = salarioBase;

        // Descuentos trabajador
        const saludTrabajador = ibc * COLOMBIA_2026.SALUD_TRABAJADOR;
        const pensionTrabajador = ibc * COLOMBIA_2026.PENSION_TRABAJADOR;
        const totalDescuentos = saludTrabajador + pensionTrabajador;

        // Neto trabajador
        const netoTrabajador =
          salarioBase + auxilioTransporte + comision - totalDescuentos;

        // Costo empleador adicional
        const saludEmpleador = ibc * COLOMBIA_2026.SALUD_EMPLEADOR;
        const pensionEmpleador = ibc * COLOMBIA_2026.PENSION_EMPLEADOR;
        const arl = ibc * COLOMBIA_2026.ARL_EMPLEADOR;
        const parafiscales = ibc * COLOMBIA_2026.PARAFISCALES;
        const costoAdicionalEmpleador =
          saludEmpleador + pensionEmpleador + arl + parafiscales;

        // Costo total para la empresa
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
