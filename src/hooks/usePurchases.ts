import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Purchase, PurchaseItem, PurchaseLineInput } from "@/types";

const PURCHASES_PAGE_SIZE = 8;

export interface PurchasesResult {
  purchases: Purchase[];
  total: number;
}

/**
 * Compras paginadas en el servidor: solo trae la página pedida (`range`) y el
 * total exacto (`count`), igual que Ventas/Reservas. Antes traía todas de un
 * golpe, lo que con el tiempo cargaría cientos de filas en cada visita.
 */
export function usePurchases(page = 1, pageSize = PURCHASES_PAGE_SIZE) {
  return useQuery({
    queryKey: ["purchases", page, pageSize],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<PurchasesResult> => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from("purchases")
        .select("*, supplier:suppliers(id, name)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return {
        purchases: (data as unknown as Purchase[]) ?? [],
        total: count ?? 0,
      };
    },
  });
}

export { PURCHASES_PAGE_SIZE };

export function usePurchaseItems(purchaseId: string | null) {
  return useQuery({
    queryKey: ["purchase_items", purchaseId],
    enabled: !!purchaseId,
    queryFn: async (): Promise<PurchaseItem[]> => {
      const { data, error } = await supabase
        .from("purchase_items")
        .select("*")
        .eq("purchase_id", purchaseId!);
      if (error) throw error;
      return data as PurchaseItem[];
    },
  });
}

export interface CreatePurchaseInput {
  supplier_id: string | null;
  invoice_number: string;
  purchase_date: string;
  notes: string;
  payment_method: string;
  items: PurchaseLineInput[];
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePurchaseInput) => {
      const { error } = await supabase.rpc("create_purchase", {
        payload: {
          purchase_id: crypto.randomUUID(),
          supplier_id: input.supplier_id,
          invoice_number: input.invoice_number,
          purchase_date: input.purchase_date,
          notes: input.notes,
          payment_method: input.payment_method,
          items: input.items,
        } as never,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["product_stock"] });
      queryClient.invalidateQueries({ queryKey: ["product_costs"] });
      queryClient.invalidateQueries({ queryKey: ["inventory_movements"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Compra registrada");
    },
    onError: () => toast.error("Error al registrar la compra"),
  });
}

/** Anula una compra: revierte stock y costo, registra ingreso compensatorio. */
export function useVoidPurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase.rpc("void_purchase", {
        payload: { purchase_id: id, reason } as never,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["product_stock"] });
      queryClient.invalidateQueries({ queryKey: ["product_costs"] });
      queryClient.invalidateQueries({ queryKey: ["inventory_movements"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Compra anulada");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Error al anular la compra"),
  });
}
