import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  countPendingSales,
  getPendingCashOps,
  getPendingSales,
  onPendingSalesChange,
  removeCashOp,
  removePendingSale,
} from "@/lib/offlineQueue";

/**
 * Drains the offline sales queue into Supabase whenever connectivity returns.
 * Each sale is replayed through the idempotent `create_sale` RPC, so retries
 * never create duplicates. Exposes the pending count for UI signalling.
 */
export function useOfflineSync() {
  const queryClient = useQueryClient();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncingRef = useRef(false);

  const refreshCount = useCallback(async () => {
    setPendingCount(await countPendingSales());
  }, []);

  const flush = useCallback(async () => {
    if (syncingRef.current) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    const cashOps = await getPendingCashOps(); // opens first, then closes
    const opens = cashOps.filter((o) => o.type === "open");
    const closes = cashOps.filter((o) => o.type === "close");
    const pending = await getPendingSales();
    if (opens.length + closes.length + pending.length === 0) return;

    syncingRef.current = true;
    setIsSyncing(true);
    let synced = 0;

    try {
      // 1. Cash register opens — must exist before their sales sync.
      for (const op of opens) {
        const { error } = await supabase.rpc("create_cash_register", {
          payload: op.payload as never,
        });
        if (error) return; // stop the whole flush; retry later
        await removeCashOp(op.key);
      }

      // 2. Sales.
      for (const item of pending) {
        const { error } = await supabase.rpc("create_sale", {
          payload: { ...item.payload, created_at: item.createdAt } as never,
        });
        if (error) return;
        await removePendingSale(item.id);
        synced++;
      }

      // 3. Cash register closes — after their sales are in.
      for (const op of closes) {
        const { error } = await supabase.rpc("close_cash_register", {
          payload: op.payload as never,
        });
        if (error) return;
        await removeCashOp(op.key);
      }
    } catch {
      // Network dropped mid-flush — keep what's left, retry later.
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
      await refreshCount();

      if (synced > 0) {
        queryClient.invalidateQueries({ queryKey: ["sales"] });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["cash_register"] });
        queryClient.invalidateQueries({ queryKey: ["product_stock"] });
        queryClient.invalidateQueries({ queryKey: ["inventory_movements"] });
        toast.success(
          `${synced} venta${synced === 1 ? "" : "s"} sincronizada${synced === 1 ? "" : "s"}`,
        );
      }
    }
  }, [queryClient, refreshCount]);

  useEffect(() => {
    refreshCount();
    const unsubscribe = onPendingSalesChange(() => {
      refreshCount();
      flush();
    });
    const handleOnline = () => flush();
    window.addEventListener("online", handleOnline);
    // Attempt a flush on mount in case there are leftover pending sales.
    flush();
    return () => {
      unsubscribe();
      window.removeEventListener("online", handleOnline);
    };
  }, [flush, refreshCount]);

  return { pendingCount, isSyncing, flush };
}
