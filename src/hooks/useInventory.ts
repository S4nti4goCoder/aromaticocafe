import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  InventoryMovement,
  InventoryMovementType,
  ProductStock,
} from "@/types";

export function useProductStock() {
  return useQuery({
    queryKey: ["product_stock"],
    queryFn: async (): Promise<ProductStock[]> => {
      const { data, error } = await supabase
        .from("product_stock")
        .select("*")
        .order("product_name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useInventoryMovements(productId?: string) {
  return useQuery({
    queryKey: ["inventory_movements", productId],
    queryFn: async (): Promise<InventoryMovement[]> => {
      let query = supabase
        .from("inventory_movements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (productId) {
        query = query.eq("product_id", productId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
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
        p_reason: reason || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product_stock"] });
      queryClient.invalidateQueries({ queryKey: ["inventory_movements"] });
    },
  });
}
