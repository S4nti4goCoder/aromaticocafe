import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Sale, CartItem, PaymentMethod } from "@/types";

export function useTodaySales(cashRegisterId?: string) {
  return useQuery({
    queryKey: ["sales", "today", cashRegisterId],
    queryFn: async (): Promise<Sale[]> => {
      let query = supabase
        .from("sales")
        .select("*, items:sale_items(*)")
        .order("created_at", { ascending: false });

      if (cashRegisterId) {
        query = query.eq("cash_register_id", cashRegisterId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Sale[];
    },
    enabled: !!cashRegisterId,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cartItems,
      cashRegisterId,
      paymentMethod,
      discount,
      notes,
    }: {
      cartItems: CartItem[];
      cashRegisterId: string;
      paymentMethod: PaymentMethod;
      discount: number;
      notes?: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const total =
        cartItems.reduce((sum, item) => sum + item.subtotal, 0) - discount;

      // Crear la venta
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          cash_register_id: cashRegisterId,
          seller_id: user?.id,
          total,
          discount,
          payment_method: paymentMethod,
          notes: notes || null,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Crear los items
      const items = cartItems.map((item) => ({
        sale_id: sale.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_price: item.product_price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(items);

      if (itemsError) throw itemsError;

      // Descontar stock automáticamente por cada item vendido
      for (const item of cartItems) {
        await supabase.rpc("update_product_stock", {
          p_product_id: item.product_id,
          p_type: "salida",
          p_quantity: item.quantity,
          p_reason: `Venta #${sale.id.slice(0, 8)}`,
        });
      }

      // Registrar como ingreso en transactions
      await supabase.from("transactions").insert({
        cash_register_id: cashRegisterId,
        type: "ingreso",
        amount: total,
        category: "Venta",
        payment_method: paymentMethod,
        registered_by: user?.id,
        description: `Venta #${sale.id.slice(0, 8)}`,
      });

      return sale as unknown as Sale;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["sales", "today", variables.cashRegisterId],
      });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["cash_register"] });
      queryClient.invalidateQueries({ queryKey: ["product_stock"] });
      queryClient.invalidateQueries({ queryKey: ["inventory_movements"] });
      toast.success("Venta registrada correctamente");
    },
    onError: () => {
      toast.error("Error al registrar la venta");
    },
  });
}

export function useVoidSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sale,
      reason,
    }: {
      sale: Sale;
      reason: string;
    }) => {
      if (sale.is_voided) {
        throw new Error("La venta ya está anulada");
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 1. Marcar la venta como anulada
      const { error: updateError } = await supabase
        .from("sales")
        .update({
          is_voided: true,
          void_reason: reason,
          voided_at: new Date().toISOString(),
          voided_by: user?.id ?? null,
        })
        .eq("id", sale.id);
      if (updateError) throw updateError;

      // 2. Devolver stock por cada item (entrada)
      if (sale.items && sale.items.length > 0) {
        for (const item of sale.items) {
          if (!item.product_id) continue;
          await supabase.rpc("update_product_stock", {
            p_product_id: item.product_id,
            p_type: "entrada",
            p_quantity: item.quantity,
            p_reason: `Anulación venta #${sale.id.slice(0, 8)}`,
          });
        }
      }

      // 3. Registrar egreso compensatorio
      if (sale.cash_register_id) {
        await supabase.from("transactions").insert({
          cash_register_id: sale.cash_register_id,
          type: "egreso",
          amount: sale.total,
          category: "Anulación de venta",
          payment_method: sale.payment_method,
          registered_by: user?.id ?? null,
          description: `Anulación venta #${sale.id.slice(0, 8)} — ${reason}`,
        });
      }

      return sale.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["product_stock"] });
      queryClient.invalidateQueries({ queryKey: ["inventory_movements"] });
      queryClient.invalidateQueries({ queryKey: ["cash_register"] });
      toast.success("Venta anulada correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al anular la venta");
    },
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sales").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["product_stock"] });
      toast.success("Venta eliminada");
    },
    onError: () => {
      toast.error("Error al eliminar la venta");
    },
  });
}
