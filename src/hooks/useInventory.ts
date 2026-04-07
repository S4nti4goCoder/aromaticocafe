import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { ProductStock, InventoryMovementType } from "@/types";

export function useProductStock() {
  return useQuery({
    queryKey: ["product_stock"],
    queryFn: async (): Promise<ProductStock[]> => {
      const { data, error } = await supabase
        .from("product_stock")
        .select("*")
        .order("product_name", { ascending: true });
      if (error) throw error;
      return data as unknown as ProductStock[];
    },
  });
}

export function useUpdateStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      type,
      quantity,
      reason,
    }: {
      productId: string;
      type: InventoryMovementType;
      quantity: number;
      reason?: string;
    }) => {
      const { error } = await supabase.rpc("update_product_stock", {
        p_product_id: productId,
        p_type: type,
        p_quantity: quantity,
        p_reason: reason,
      });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product_stock"] });
      queryClient.invalidateQueries({ queryKey: ["inventory_movements"] });
      const typeLabel =
        variables.type === "entrada"
          ? "Entrada"
          : variables.type === "salida"
            ? "Salida"
            : "Ajuste";
      toast.success(`${typeLabel} de stock registrada`);
    },
    onError: () => {
      toast.error("Error al registrar el movimiento de stock");
    },
  });
}

export function useInventoryMovements(productId?: string) {
  return useQuery({
    queryKey: ["inventory_movements", productId],
    queryFn: async () => {
      let query = supabase
        .from("inventory_movements")
        .select("*")
        .order("created_at", { ascending: false });
      if (productId) query = query.eq("product_id", productId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
