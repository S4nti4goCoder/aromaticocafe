import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { RestaurantTable } from "@/types";

export interface AvailableTablesArgs {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  partySize: number;
  excludeReservationId?: string | null;
}

export function useAvailableTables(args: AvailableTablesArgs | null) {
  return useQuery({
    queryKey: ["available_tables", args],
    enabled: !!args && !!args.date && !!args.time && args.partySize > 0,
    queryFn: async (): Promise<RestaurantTable[]> => {
      if (!args) return [];
      const { data, error } = await supabase.rpc("available_tables", {
        p_date: args.date,
        p_time: args.time,
        p_party_size: args.partySize,
        p_exclude_reservation_id: args.excludeReservationId ?? undefined,
      });
      if (error) throw error;
      return (data ?? []) as RestaurantTable[];
    },
  });
}
