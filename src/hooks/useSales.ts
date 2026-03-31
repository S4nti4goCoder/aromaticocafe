import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
      return data;
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

      return sale;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["sales", "today", variables.cashRegisterId],
      });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["cash_register"] });
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
    },
  });
}
