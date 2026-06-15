import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

interface NotificationRead {
  notification_id: string;
  signature: string;
  read_at: string;
  dismissed: boolean;
}

export interface NotificationReadState {
  signature: string;
  dismissed: boolean;
}

/** Returns a map { notification_id: { signature, dismissed } }. */
export function useNotificationReads() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ["notification_reads", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_reads")
        .select("notification_id, signature, read_at, dismissed")
        .eq("user_id", user!.id);
      if (error) throw error;
      const map: Record<string, NotificationReadState> = {};
      for (const r of (data ?? []) as NotificationRead[]) {
        map[r.notification_id] = { signature: r.signature, dismissed: r.dismissed };
      }
      return map;
    },
  });
}

/** Marks a notification as read (upsert with the current signature). */
export function useMarkNotificationRead() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      notificationId,
      signature,
    }: {
      notificationId: string;
      signature: string;
    }) => {
      if (!user?.id) throw new Error("No user");
      const { error } = await supabase.from("notification_reads").upsert(
        {
          user_id: user.id,
          notification_id: notificationId,
          signature,
          read_at: new Date().toISOString(),
          dismissed: false,
        },
        { onConflict: "user_id,notification_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification_reads"] });
    },
  });
}

/** Marks all received notifications as read. */
export function useMarkAllNotificationsRead() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      items: { notificationId: string; signature: string }[],
    ) => {
      if (!user?.id || items.length === 0) return;
      const rows = items.map((i) => ({
        user_id: user.id,
        notification_id: i.notificationId,
        signature: i.signature,
        read_at: new Date().toISOString(),
        dismissed: false,
      }));
      const { error } = await supabase
        .from("notification_reads")
        .upsert(rows, { onConflict: "user_id,notification_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification_reads"] });
    },
  });
}

/** Dismisses all received notifications. If they reappear with a different
 *  signature (different content), they'll show again. */
export function useDismissAllNotifications() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      items: { notificationId: string; signature: string }[],
    ) => {
      if (!user?.id || items.length === 0) return;
      const rows = items.map((i) => ({
        user_id: user.id,
        notification_id: i.notificationId,
        signature: i.signature,
        read_at: new Date().toISOString(),
        dismissed: true,
      }));
      const { error } = await supabase
        .from("notification_reads")
        .upsert(rows, { onConflict: "user_id,notification_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification_reads"] });
    },
  });
}
