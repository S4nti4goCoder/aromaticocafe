import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  enqueueSale,
  getPendingSales,
  onPendingSalesChange,
  type PendingSale,
  type PendingSalePayload,
} from "@/lib/offlineQueue";
import { useAuthStore } from "@/store/authStore";
import type { Sale, CartItem, PaymentMethod } from "@/types";

/** Converts a queued offline sale into a Sale shape for display. */
function pendingToSale(p: PendingSale): Sale {
  return {
    id: p.id,
    sale_number: null,
    cash_register_id: p.payload.cash_register_id,
    seller_id: p.payload.seller_id,
    total: p.payload.total,
    discount: p.payload.discount,
    payment_method: p.payload.payment_method as PaymentMethod,
    notes: p.payload.notes,
    created_at: p.createdAt,
    is_voided: false,
    void_reason: null,
    voided_at: null,
    voided_by: null,
    customer_phone: null,
    loyalty_stamps_awarded: null,
    loyalty_points_awarded: null,
    loyalty_redeemed_value: null,
    loyalty_redeemed_mode: null,
    items: p.payload.items.map((it, i) => ({
      id: `${p.id}-${i}`,
      sale_id: p.id,
      product_id: it.product_id,
      product_name: it.product_name,
      product_price: it.product_price,
      quantity: it.quantity,
      subtotal: it.subtotal,
    })),
  };
}

/**
 * Pending offline sales (not yet synced), as Sale objects, reactive to queue
 * changes. Lets the Caja show offline sales in totals/history immediately.
 */
export function usePendingSales(cashRegisterId?: string): Sale[] {
  const [pending, setPending] = useState<Sale[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const items = await getPendingSales();
      if (!active) return;
      setPending(
        items
          .filter(
            (i) =>
              !cashRegisterId ||
              i.payload.cash_register_id === cashRegisterId,
          )
          .map(pendingToSale),
      );
    };
    load();
    const off = onPendingSalesChange(load);
    return () => {
      active = false;
      off();
    };
  }, [cashRegisterId]);

  return pending;
}

/** True when the failure looks like a connectivity problem (not a data error). */
function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) return true; // fetch() failures
  const msg = (err as { message?: string })?.message?.toLowerCase() ?? "";
  return (
    msg.includes("fetch") ||
    msg.includes("network") ||
    msg.includes("failed to") ||
    msg.includes("load failed") ||
    msg.includes("timeout")
  );
}

/** Rejects with a network-style error if the promise doesn't settle in time. */
function withTimeout<T>(p: PromiseLike<T>, ms: number): Promise<T> {
  return Promise.race([
    Promise.resolve(p),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("network timeout")), ms),
    ),
  ]);
}

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
  // Read from the in-memory store — no network call, so it never hangs offline.
  const sellerId = useAuthStore((s) => s.user?.id ?? null);

  return useMutation({
    // Run even when the browser is offline — our flow handles queueing itself.
    // (React Query's default "online" mode would pause the mutation otherwise.)
    networkMode: "always",
    mutationFn: async ({
      cartItems,
      cashRegisterId,
      paymentMethod,
      discount,
      notes,
      customerPhone,
      loyaltyStampsAwarded,
      loyaltyPointsAwarded,
      loyaltyRedeemedValue,
      loyaltyRedeemedMode,
    }: {
      cartItems: CartItem[];
      cashRegisterId: string;
      paymentMethod: PaymentMethod;
      discount: number;
      notes?: string;
      customerPhone?: string | null;
      loyaltyStampsAwarded?: number | null;
      loyaltyPointsAwarded?: number | null;
      loyaltyRedeemedValue?: number | null;
      loyaltyRedeemedMode?: "sellos" | "puntos" | null;
    }): Promise<{ sale: Sale; queued: boolean }> => {
      const total =
        cartItems.reduce((sum, item) => sum + item.subtotal, 0) - discount;
      const saleId = crypto.randomUUID();
      const createdAt = new Date().toISOString();

      const payload: PendingSalePayload = {
        sale_id: saleId,
        cash_register_id: cashRegisterId,
        seller_id: sellerId,
        payment_method: paymentMethod,
        discount,
        notes: notes ?? null,
        total,
        customer_phone: customerPhone ?? null,
        loyalty_stamps_awarded: loyaltyStampsAwarded ?? null,
        loyalty_points_awarded: loyaltyPointsAwarded ?? null,
        loyalty_redeemed_value: loyaltyRedeemedValue ?? null,
        loyalty_redeemed_mode: loyaltyRedeemedMode ?? null,
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          product_price: item.product_price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
      };

      // Sale object reconstructed locally (used for the receipt). Offline sales
      // have no sale_number yet — it's assigned when they sync.
      const localSale = {
        id: saleId,
        cash_register_id: cashRegisterId,
        seller_id: sellerId,
        total,
        discount,
        payment_method: paymentMethod,
        notes: notes ?? null,
        created_at: createdAt,
        is_voided: false,
        sale_number: null,
        void_reason: null,
        voided_at: null,
        voided_by: null,
      } as unknown as Sale;

      const queueIt = async () => {
        await enqueueSale({ id: saleId, payload, createdAt });
        return { sale: localSale, queued: true };
      };

      // No connection at all → straight to the local queue.
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return queueIt();
      }

      // Online → run the atomic RPC. If it fails or hangs due to connectivity,
      // queue it. The timeout guards against requests that stay pending when
      // the browser hasn't flipped navigator.onLine yet.
      try {
        const { data, error } = await withTimeout(
          supabase.rpc("create_sale", {
            payload: { ...payload, created_at: createdAt } as never,
          }),
          6000,
        );
        if (error) throw error;
        return { sale: data as unknown as Sale, queued: false };
      } catch (err) {
        if (isNetworkError(err)) return queueIt();
        throw err; // genuine server/data error — surface it
      }
    },
    onSuccess: ({ queued }, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["sales", "today", variables.cashRegisterId],
      });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["cash_register"] });
      queryClient.invalidateQueries({ queryKey: ["product_stock"] });
      queryClient.invalidateQueries({ queryKey: ["inventory_movements"] });
      if (queued) {
        toast.info("Venta guardada sin conexión — se sincronizará al volver internet");
      } else {
        toast.success("Venta registrada correctamente");
      }
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
      // Todo el trabajo (marcar anulada, devolver stock, egreso en caja,
      // reversar fidelización) ocurre en el RPC void_sale dentro de una
      // sola transacción: o se aplica completo o no se aplica nada.
      const { data, error } = await supabase.rpc("void_sale", {
        payload: {
          sale_id: sale.id,
          reason,
        } as never,
      });
      if (error) throw error;
      return data as unknown as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sales_history"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["product_stock"] });
      queryClient.invalidateQueries({ queryKey: ["inventory_movements"] });
      queryClient.invalidateQueries({ queryKey: ["cash_register"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
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
