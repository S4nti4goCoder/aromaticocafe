import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useProfile } from "@/hooks/useProfile";

/**
 * Subscribes to changes in critical tables and refreshes the related queries.
 * Used once (in AdminLayout) to keep the whole panel in sync across multiple
 * users / devices.
 *
 * When offline it doesn't subscribe (avoids the Realtime websocket retrying and
 * flooding the console with errors). It resubscribes on its own once the
 * connection returns.
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const { data: profile } = useProfile();
  const role = profile?.role;

  useEffect(() => {
    if (!isOnline) return;

    const channels = [
      // Sales
      supabase
        .channel("rt:sales")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "sales" },
          () => {
            queryClient.invalidateQueries({ queryKey: ["sales"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
          },
        )
        .subscribe(),

      // Cash register
      supabase
        .channel("rt:cash_register")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "cash_register" },
          () => {
            queryClient.invalidateQueries({ queryKey: ["cash_register"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
          },
        )
        .subscribe(),

      // product_stock is a view → Realtime doesn't apply, but changes come in
      // via inventory_movements (table) and products (affects is_active).
      supabase
        .channel("rt:inventory_movements")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "inventory_movements" },
          () => {
            queryClient.invalidateQueries({ queryKey: ["product_stock"] });
            queryClient.invalidateQueries({ queryKey: ["inventory_movements"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
          },
        )
        .subscribe(),

      supabase
        .channel("rt:products")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "products" },
          () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["product_stock"] });
          },
        )
        .subscribe(),

      // Workers
      supabase
        .channel("rt:workers")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "workers" },
          () => {
            queryClient.invalidateQueries({ queryKey: ["workers"] });
          },
        )
        .subscribe(),

      // Promotions
      supabase
        .channel("rt:promotions")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "promotions" },
          () => {
            queryClient.invalidateQueries({ queryKey: ["promotions"] });
            queryClient.invalidateQueries({ queryKey: ["active_promotions"] });
          },
        )
        .subscribe(),

      // Notification reads
      supabase
        .channel("rt:notification_reads")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "notification_reads" },
          () => {
            queryClient.invalidateQueries({ queryKey: ["notification_reads"] });
          },
        )
        .subscribe(),

      // Reservations — fire a toast for admins on INSERT, always invalidate.
      supabase
        .channel("rt:reservations")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "reservations" },
          (payload) => {
            queryClient.invalidateQueries({ queryKey: ["reservations"] });
            if (
              payload.eventType === "INSERT" &&
              (role === "super_admin" || role === "gerente")
            ) {
              const reservation = payload.new as {
                customer_name?: string;
                reservation_date?: string;
                reservation_time?: string;
              };
              const time = reservation.reservation_time?.slice(0, 5) ?? "";
              toast.info(
                `Nueva reserva de ${reservation.customer_name ?? "cliente"}`,
                {
                  description: `${reservation.reservation_date ?? ""} a las ${time}`,
                  duration: 8000,
                },
              );
            }
          },
        )
        .subscribe(),
    ];

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [queryClient, isOnline, role]);
}
