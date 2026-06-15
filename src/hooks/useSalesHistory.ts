import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Sale, SaleItem, SaleRefund, SaleStatus } from "@/types";

export interface SalesHistoryFilters {
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  cashierId?: string;
  paymentMethod?: string;
  /** Filter by derived effective status. */
  status?: "all" | SaleStatus;
  /** Free-text search on sale_number. */
  saleNumber?: string;
}

export type SaleWithItemsAndRefunds = Sale & {
  items: SaleItem[];
  refunds: SaleRefund[];
  /** Estado derivado calculado por la vista sales_with_status. */
  status: SaleStatus;
};

export interface SalesHistoryResult {
  sales: SaleWithItemsAndRefunds[];
  total: number;
}

const PAGE_SIZE = 8;

export function useSalesHistory(filters: SalesHistoryFilters, page = 1) {
  return useQuery({
    queryKey: ["sales_history", filters, page],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<SalesHistoryResult> => {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // sales_with_status es una vista sobre sales que agrega la columna
      // derivada status; permite filtrar y paginar en el servidor.
      let query = supabase
        .from("sales_with_status")
        .select(
          "*, items:sale_items(id, sale_id, product_id, product_name, product_price, quantity, subtotal), refunds:sale_refunds(*)",
          { count: "exact" },
        )
        // Las fechas del filtro son días locales (Colombia, UTC-5) pero
        // created_at está en UTC: se convierten con new Date(), que
        // interpreta el string sin zona como hora local.
        .gte(
          "created_at",
          new Date(`${filters.fromDate}T00:00:00`).toISOString(),
        )
        .lte(
          "created_at",
          new Date(`${filters.toDate}T23:59:59.999`).toISOString(),
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      if (filters.cashierId) query = query.eq("seller_id", filters.cashierId);
      if (filters.paymentMethod)
        query = query.eq("payment_method", filters.paymentMethod);
      if (filters.saleNumber && filters.saleNumber.trim()) {
        const n = parseInt(filters.saleNumber.trim(), 10);
        if (!Number.isNaN(n)) query = query.eq("sale_number", n);
      }
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      const rows = (data as unknown as SaleWithItemsAndRefunds[]) ?? [];
      return { sales: rows, total: count ?? 0 };
    },
  });
}

export interface SalesHistorySummary {
  count: number;
  totalAmount: number;
  totalRefunded: number;
  voided: number;
}

// Totales de TODO el rango filtrado (no solo la página visible). Hace una
// consulta liviana (sin items) sobre las mismas filas que la tabla.
export function useSalesHistorySummary(filters: SalesHistoryFilters) {
  return useQuery({
    queryKey: ["sales_history_summary", filters],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<SalesHistorySummary> => {
      let query = supabase
        .from("sales_with_status")
        .select("total, is_voided, refunds:sale_refunds(amount)")
        .gte(
          "created_at",
          new Date(`${filters.fromDate}T00:00:00`).toISOString(),
        )
        .lte(
          "created_at",
          new Date(`${filters.toDate}T23:59:59.999`).toISOString(),
        )
        .limit(10000);

      if (filters.cashierId) query = query.eq("seller_id", filters.cashierId);
      if (filters.paymentMethod)
        query = query.eq("payment_method", filters.paymentMethod);
      if (filters.saleNumber && filters.saleNumber.trim()) {
        const n = parseInt(filters.saleNumber.trim(), 10);
        if (!Number.isNaN(n)) query = query.eq("sale_number", n);
      }
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;

      const rows =
        (data as unknown as {
          total: number;
          is_voided: boolean;
          refunds: { amount: number }[];
        }[]) ?? [];

      let totalAmount = 0;
      let totalRefunded = 0;
      let voided = 0;
      for (const s of rows) {
        totalAmount += Number(s.total);
        totalRefunded += (s.refunds ?? []).reduce(
          (sum, r) => sum + Number(r.amount),
          0,
        );
        if (s.is_voided) voided += 1;
      }
      return { count: rows.length, totalAmount, totalRefunded, voided };
    },
  });
}

export function deriveStatus(
  s: Pick<Sale, "is_voided"> & {
    items: { quantity: number }[];
    refunds: { quantity: number; sale_item_id: string }[];
  },
): SaleStatus {
  if (s.is_voided) return "anulada";
  const totalItems = s.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalRefunded = s.refunds.reduce(
    (sum, r) => sum + Number(r.quantity),
    0,
  );
  if (totalRefunded === 0) return "valida";
  if (totalRefunded >= totalItems) return "devuelta_total";
  return "devuelta_parcial";
}

export const SALES_HISTORY_PAGE_SIZE = PAGE_SIZE;
