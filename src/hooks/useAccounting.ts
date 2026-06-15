import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  enqueueCashOp,
  getLocalCashRegister,
  getPendingCashOps,
  setLocalCashRegister,
} from "@/lib/offlineQueue";
import { useAuthStore } from "@/store/authStore";
import {
  localDateString,
  localDayStartIso,
  localDayEndIso,
} from "@/lib/localDate";
import type {
  CashRegister,
  Transaction,
  TransactionFormData,
  PaymentMethod,
} from "@/types";

/** True when the failure looks like a connectivity problem (not a data error). */
function isCashNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) return true;
  const msg = (err as { message?: string })?.message?.toLowerCase() ?? "";
  return (
    msg.includes("fetch") ||
    msg.includes("network") ||
    msg.includes("failed to") ||
    msg.includes("load failed") ||
    msg.includes("timeout")
  );
}

function withCashTimeout<T>(p: PromiseLike<T>, ms: number): Promise<T> {
  return Promise.race([
    Promise.resolve(p),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("network timeout")), ms),
    ),
  ]);
}

// ── Colombia 2026 constants ───────────────────────────────
export const COLOMBIA_2026 = {
  SMLMV: 1_750_905,
  AUXILIO_TRANSPORTE: 249_095,
  // Employee
  SALUD_TRABAJADOR: 0.04,
  PENSION_TRABAJADOR: 0.04,
  // Employer
  SALUD_EMPLEADOR: 0.085,
  PENSION_EMPLEADOR: 0.12,
  ARL_EMPLEADOR: 0.00522,
  PARAFISCALES: 0.09,
};

// ── Daily cash register ───────────────────────────────────

export function useTodayCashRegister() {
  return useQuery({
    queryKey: ["cash_register", "active"],
    networkMode: "always",
    queryFn: async (): Promise<CashRegister | null> => {
      // Offline: fall back to the locally-opened register so the POS works.
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return await getLocalCashRegister<CashRegister>();
      }

      try {
        // Buscamos la sesión actualmente abierta (no la del día). El índice
        // parcial UNIQUE(status) WHERE 'abierta' garantiza que hay 0 o 1.
        // Esto permite múltiples sesiones por día — al cerrar una, este query
        // devuelve null y la UI muestra "Abrir caja" para iniciar otra.
        const { data, error } = await withCashTimeout(
          supabase
            .from("cash_register")
            .select("*")
            .eq("status", "abierta")
            .maybeSingle(),
          6000,
        );
        if (error) throw error;

        const ops = await getPendingCashOps();
        const pendingClose = ops.find((o) => o.type === "close");
        const pendingOpen = ops.find((o) => o.type === "open");

        if (data) {
          // Closed offline but not yet synced → reflect it as closed locally.
          if (pendingClose && pendingClose.payload.id === data.id) {
            await setLocalCashRegister(null);
            return { ...data, status: "cerrada" } as CashRegister;
          }
          // Mirror the server register so offline reads have it available.
          await setLocalCashRegister(data as unknown as Record<string, unknown>);
          return data;
        }

        // Server has none, but we opened one offline that hasn't synced yet.
        if (pendingOpen) return await getLocalCashRegister<CashRegister>();

        await setLocalCashRegister(null);
        return null;
      } catch (err) {
        if (isCashNetworkError(err)) {
          return await getLocalCashRegister<CashRegister>();
        }
        throw err;
      }
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
  const userId = useAuthStore((s) => s.user?.id ?? null);

  return useMutation({
    networkMode: "always",
    mutationFn: async ({
      opening_amount,
      notes,
    }: {
      opening_amount: number;
      notes?: string;
    }): Promise<{ register: CashRegister; queued: boolean }> => {
      // Día local: con toISOString() una caja abierta de noche quedaba
      // fechada al día siguiente (UTC va 5 horas adelante de Colombia).
      const today = localDateString();
      const id = crypto.randomUUID();
      const openedAt = new Date().toISOString();

      const payload = {
        id,
        date: today,
        opening_amount,
        notes: notes || null,
        opened_by: userId,
        opened_at: openedAt,
      };

      const localRegister = {
        id,
        date: today,
        opening_amount,
        closing_amount: null,
        notes: notes || null,
        opened_by: userId,
        opened_at: openedAt,
        closed_by: null,
        closed_at: null,
        status: "abierta",
        created_at: openedAt,
      } as unknown as CashRegister;

      const queueIt = async () => {
        await setLocalCashRegister(localRegister as unknown as Record<string, unknown>);
        await enqueueCashOp({
          key: `open:${id}`,
          type: "open",
          payload,
          createdAt: openedAt,
        });
        return { register: localRegister, queued: true };
      };

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return queueIt();
      }

      try {
        const { data, error } = await withCashTimeout(
          supabase.rpc("create_cash_register", { payload: payload as never }),
          6000,
        );
        if (error) throw error;
        return { register: data as unknown as CashRegister, queued: false };
      } catch (err) {
        if (isCashNetworkError(err)) return queueIt();
        throw err;
      }
    },
    onSuccess: ({ queued }) => {
      queryClient.invalidateQueries({ queryKey: ["cash_register"] });
      if (queued) {
        toast.info("Caja abierta sin conexión — se sincronizará al volver internet");
      } else {
        toast.success("Caja abierta correctamente");
      }
    },
    onError: () => {
      toast.error("Error al abrir la caja");
    },
  });
}

export function useCloseCashRegister() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id ?? null);

  return useMutation({
    networkMode: "always",
    mutationFn: async ({
      id,
      closing_amount,
      notes,
    }: {
      id: string;
      closing_amount: number;
      notes?: string;
    }): Promise<{ queued: boolean }> => {
      const closedAt = new Date().toISOString();
      const payload = {
        id,
        closing_amount,
        notes: notes || null,
        closed_by: userId,
        closed_at: closedAt,
      };

      const queueIt = async () => {
        await enqueueCashOp({
          key: `close:${id}`,
          type: "close",
          payload,
          createdAt: closedAt,
        });
        // Locally the register is now closed.
        await setLocalCashRegister(null);
        return { queued: true };
      };

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return queueIt();
      }

      try {
        const { error } = await withCashTimeout(
          supabase.rpc("close_cash_register", { payload: payload as never }),
          6000,
        );
        if (error) throw error;
        await setLocalCashRegister(null);
        return { queued: false };
      } catch (err) {
        if (isCashNetworkError(err)) return queueIt();
        throw err;
      }
    },
    onSuccess: ({ queued }) => {
      queryClient.invalidateQueries({ queryKey: ["cash_register"] });
      if (queued) {
        toast.info("Caja cerrada sin conexión — se sincronizará al volver internet");
      } else {
        toast.success("Caja cerrada correctamente");
      }
    },
    onError: () => {
      toast.error("Error al cerrar la caja");
    },
  });
}

/**
 * Devuelve el último cierre de caja del día actual (si lo hay). Sirve para
 * ofrecer la opción de "Reabrir última sesión" cuando el cajero se equivoca.
 */
export function useLastClosedTodayCashRegister() {
  return useQuery({
    queryKey: ["cash_register", "last_closed_today"],
    networkMode: "always",
    queryFn: async (): Promise<CashRegister | null> => {
      // Filtra por hora de cierre (no por fecha de apertura): una sesión
      // abierta ayer y cerrada hoy también debe poder reabrirse.
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { data, error } = await supabase
        .from("cash_register")
        .select("*")
        .gte("closed_at", todayStart.toISOString())
        .eq("status", "cerrada")
        .order("closed_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Reabre una caja cerrada. Requiere razón corta (mínimo 5 caracteres) que
 * queda guardada en notes para auditoría. El RPC valida que no haya otra
 * caja abierta y que la sesión esté realmente cerrada.
 */
export function useReopenCashRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase.rpc("reopen_cash_register", {
        p_id: id,
        p_reason: reason,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash_register"] });
      toast.success("Caja reabierta correctamente");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message ?? "No se pudo reabrir la caja");
    },
  });
}

// ── Cash audit log (reaperturas, etc) ──────────────────────

export interface CashAuditEntry {
  id: string;
  cash_register_id: string;
  event_type: string;
  reason: string | null;
  performed_by: string | null;
  performed_at: string;
  read_at: string | null;
}

/**
 * Devuelve las entradas no leídas del audit log de caja. Sirve para
 * mostrar la alerta in-app al gerente cuando se ha reabierto una caja
 * (u otro evento auditable). RLS asegura que solo gerentes/super_admin
 * ven los datos; para otros roles devuelve [] silenciosamente.
 */
export function useUnreadCashAudit() {
  return useQuery({
    queryKey: ["cash_audit_log", "unread"],
    queryFn: async (): Promise<CashAuditEntry[]> => {
      const { data, error } = await supabase
        .from("cash_audit_log")
        .select("*")
        .is("read_at", null)
        .order("performed_at", { ascending: false });
      if (error) {
        // Para cajeros sin permisos, RLS bloquea — no es un error real.
        return [];
      }
      return (data ?? []) as CashAuditEntry[];
    },
    // Refresh periódico para que el gerente vea nuevas reaperturas
    // aunque no recargue la pestaña.
    refetchInterval: 60_000,
  });
}

/** Marca entradas del audit log como leídas. Solo gerente/super_admin. */
export function useMarkCashAuditAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (ids.length === 0) return;
      const { error } = await supabase
        .from("cash_audit_log")
        .update({ read_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash_audit_log"] });
    },
  });
}

// ── Transactions ──────────────────────────────────────────

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

      // Group by day for the chart
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

      // Top categories
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

// ── Today's dashboard ─────────────────────────────────────

export function useTodaySummary() {
  return useQuery({
    queryKey: ["transactions", "today_summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("type, amount, category")
        .gte("created_at", localDayStartIso())
        .lte("created_at", localDayEndIso());

      if (error) throw error;

      const ingresos = data
        .filter((t) => t.type === "ingreso")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const egresos = data
        .filter((t) => t.type === "egreso")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const totalTransacciones = data.length;

      // Today's sales (excluye anuladas; rango del día local).
      const { data: salesData } = await supabase
        .from("sales")
        .select("total")
        .eq("is_voided", false)
        .gte("created_at", localDayStartIso())
        .lte("created_at", localDayEndIso());

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

// ── Cash register: expected difference ────────────────────

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

// ── Payroll ───────────────────────────────────────────────

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
