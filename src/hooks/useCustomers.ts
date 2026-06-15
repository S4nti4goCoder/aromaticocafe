import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Customer } from "@/types";

/**
 * Looks up a single customer by phone via a SECURITY DEFINER RPC.
 * Cashiers can resolve one customer at a time but cannot enumerate the table
 * (direct SELECT is restricted to admin/gerente by RLS).
 */
export async function findCustomerByPhone(
  phone: string,
): Promise<Customer | null> {
  const clean = phone.trim();
  if (!clean) return null;
  const { data, error } = await supabase.rpc("lookup_customer", {
    p_phone: clean,
  });
  if (error) throw error;
  const rows = data as unknown as Customer[] | null;
  return rows?.[0] ?? null;
}

interface ApplyLoyaltyArgs {
  /** Customer phone (identity). */
  phone: string;
  name: string | null;
  /** Current customer record (from lookup) or null for a new one. */
  current: Customer | null;
  saleTotal: number;
  mode: "sellos" | "puntos";
  pointsPerThousand: number;
  stampsRequired: number;
  /** Whether this sale qualifies to earn (passed the minimum purchase). */
  earns: boolean;
  /** Stamps consumed in this sale (reward redeemed). */
  stampsRedeemed?: number;
  /** Points consumed in this sale (redeemed for discount). */
  pointsRedeemed?: number;
}

/**
 * Computes the new loyalty balance and persists it through a SECURITY DEFINER
 * upsert RPC. Earning only happens when `earns` is true (minimum purchase met).
 * Returns the updated customer (for showing the new balance on the receipt).
 */
export async function applyLoyalty({
  phone,
  name,
  current,
  saleTotal,
  mode,
  pointsPerThousand,
  stampsRequired,
  earns,
  stampsRedeemed = 0,
  pointsRedeemed = 0,
}: ApplyLoyaltyArgs): Promise<Customer> {
  let stamps = current?.stamps ?? 0;
  let points = current?.points ?? 0;

  if (mode === "sellos") {
    stamps = stamps - stampsRedeemed + (earns ? 1 : 0);
    if (stamps < 0) stamps = 0;
    if (stamps > stampsRequired) stamps = stamps % stampsRequired || stampsRequired;
  } else {
    const earned = earns
      ? Math.floor(saleTotal / 1000) * pointsPerThousand
      : 0;
    points = points - pointsRedeemed + earned;
    if (points < 0) points = 0;
  }

  // El acumulado lo suma la base (total_spent += p_sale_total): aquí solo
  // se manda el valor de ESTA venta. Antes se mandaba el total absoluto y
  // si current venía incompleto (p. ej. del buscador del punto de venta,
  // que no trae total_spent) se borraba el histórico del cliente.
  const { data, error } = await supabase.rpc("save_customer_loyalty", {
    p_phone: phone.trim(),
    p_name: name ?? "",
    p_stamps: stamps,
    p_points: points,
    p_sale_total: saleTotal,
  });
  if (error) throw error;
  return data as unknown as Customer;
}

export interface CustomersPageResult {
  customers: Customer[];
  total: number;
}

/**
 * List/search customers — direct table read, allowed only for admin/gerente
 * by RLS (used by the Clientes page, which is itself admin-only).
 *
 * Server-side paginated: only the requested page is fetched (`range`), and the
 * exact total is returned (`count`) so the UI can render page controls without
 * downloading the whole table. `keepPreviousData` keeps the current page
 * visible while the next one loads, avoiding a flash of skeletons on paging.
 */
export function useCustomers(search = "", page = 1, pageSize = 8) {
  return useQuery({
    queryKey: ["customers", search, page, pageSize],
    queryFn: async (): Promise<CustomersPageResult> => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      let query = supabase
        .from("customers")
        .select("*", { count: "exact" })
        .order("total_spent", { ascending: false })
        .range(from, to);
      if (search.trim()) {
        const s = search.trim();
        // El nombre se busca contra name_search (columna generada en
        // minúsculas y sin tildes), normalizando aquí igual.
        const sNorm = s
          .toLowerCase()
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "");
        query = query.or(
          `name_search.ilike.%${sNorm}%,phone.ilike.%${s}%`,
        );
      }
      const { data, error, count } = await query;
      if (error) throw error;
      return { customers: (data as Customer[]) ?? [], total: count ?? 0 };
    },
    placeholderData: keepPreviousData,
  });
}

/** Edita nombre y teléfono de un cliente (solo gerente/super_admin). */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      phone,
    }: {
      id: string;
      name: string;
      phone: string;
    }): Promise<Customer> => {
      const { data, error } = await supabase.rpc("update_customer", {
        p_id: id,
        p_name: name,
        p_phone: phone,
      });
      if (error) throw error;
      return data as unknown as Customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Cliente actualizado");
    },
    onError: (err: Error) =>
      toast.error(err.message || "No se pudo actualizar el cliente"),
  });
}

/** Borra los datos personales de un cliente conservando su saldo y ventas. */
export function useAnonymizeCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase.rpc("anonymize_customer", {
        p_id: id,
        p_reason: reason,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Datos del cliente anonimizados");
    },
    onError: (err: Error) =>
      toast.error(err.message || "No se pudo anonimizar el cliente"),
  });
}

/** Ajusta sellos/puntos a mano con una razón obligatoria (queda auditado). */
export function useAdjustCustomerLoyalty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      stamps,
      points,
      reason,
    }: {
      id: string;
      stamps: number;
      points: number;
      reason: string;
    }): Promise<Customer> => {
      const { data, error } = await supabase.rpc("adjust_customer_loyalty", {
        p_id: id,
        p_stamps: stamps,
        p_points: points,
        p_reason: reason,
      });
      if (error) throw error;
      return data as unknown as Customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Fidelización ajustada");
    },
    onError: (err: Error) =>
      toast.error(err.message || "No se pudo ajustar la fidelización"),
  });
}
