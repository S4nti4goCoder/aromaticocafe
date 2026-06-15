import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { SaleRefund } from "@/types";

export function useSaleRefunds(saleId: string | null) {
  return useQuery({
    queryKey: ["sale_refunds", saleId],
    enabled: !!saleId,
    queryFn: async (): Promise<SaleRefund[]> => {
      const { data, error } = await supabase
        .from("sale_refunds")
        .select("*")
        .eq("sale_id", saleId!)
        .order("refunded_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SaleRefund[];
    },
  });
}

export interface CreatePartialRefundArgs {
  saleId: string;
  saleItemId: string;
  quantity: number;
  reason: string;
}

export function useCreatePartialRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      saleId,
      saleItemId,
      quantity,
      reason,
    }: CreatePartialRefundArgs): Promise<string> => {
      const { data, error } = await supabase.rpc("create_partial_refund", {
        payload: {
          sale_id: saleId,
          sale_item_id: saleItemId,
          quantity,
          reason,
        } as never,
      });
      if (error) throw error;
      return data as unknown as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sales_history"] });
      queryClient.invalidateQueries({ queryKey: ["sale_refunds"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["product_stock"] });
      queryClient.invalidateQueries({ queryKey: ["inventory_movements"] });
      queryClient.invalidateQueries({ queryKey: ["cash_register"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Devolución parcial registrada");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al registrar la devolución");
    },
  });
}
