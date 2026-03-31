import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { CashRegister, Transaction, TransactionFormData } from "@/types";

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

export function useTransactions(cashRegisterId?: string) {
  return useQuery({
    queryKey: ["transactions", cashRegisterId],
    queryFn: async (): Promise<Transaction[]> => {
      let query = supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (cashRegisterId) {
        query = query.eq("cash_register_id", cashRegisterId);
      }

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
      queryClient.invalidateQueries({ queryKey: ["cash_register"] });
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

// ── Reportes ──────────────────────────────────────────────

export function useTransactionSummary() {
  return useQuery({
    queryKey: ["transactions", "summary"],
    queryFn: async () => {
      const today = new Date();
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      ).toISOString();

      const { data, error } = await supabase
        .from("transactions")
        .select("type, amount")
        .gte("created_at", firstDayOfMonth);

      if (error) throw error;

      const ingresos = data
        .filter((t) => t.type === "ingreso")
        .reduce((sum, t) => sum + t.amount, 0);

      const egresos = data
        .filter((t) => t.type === "egreso")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        ingresos,
        egresos,
        balance: ingresos - egresos,
      };
    },
  });
}
