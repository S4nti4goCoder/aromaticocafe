import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// Admin/gerente-only: returns a map product_id -> cost. For other roles RLS
// returns no rows, so the map is simply empty (no error).
export function useProductCosts() {
  return useQuery({
    queryKey: ["product_costs"],
    queryFn: async (): Promise<Record<string, number>> => {
      const { data, error } = await supabase
        .from("product_costs")
        .select("product_id, cost");
      if (error) throw error;
      const map: Record<string, number> = {};
      for (const row of data ?? []) map[row.product_id] = Number(row.cost);
      return map;
    },
  });
}

export function useUpsertProductCost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      cost,
    }: {
      productId: string;
      cost: number | null;
    }) => {
      // cost === null significa "no hay costo registrado" (campo vacío).
      // Borramos la fila para distinguirlo de "costo 0 explícito".
      if (cost === null) {
        const { error } = await supabase
          .from("product_costs")
          .delete()
          .eq("product_id", productId);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("product_costs").upsert(
        { product_id: productId, cost, updated_at: new Date().toISOString() },
        { onConflict: "product_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product_costs"] });
    },
    onError: () => {
      toast.error("Error al guardar el costo del producto");
    },
  });
}
