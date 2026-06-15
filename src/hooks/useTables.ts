import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { RestaurantTable } from "@/types";

export function useTables() {
  return useQuery({
    queryKey: ["restaurant_tables"],
    queryFn: async (): Promise<RestaurantTable[]> => {
      const { data, error } = await supabase
        .from("restaurant_tables")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as RestaurantTable[];
    },
  });
}

export interface TableInput {
  name: string;
  capacity: number;
  zone_id: string | null;
  is_active: boolean;
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["restaurant_tables"] });
  qc.invalidateQueries({ queryKey: ["reservations"] });
}

export function useCreateTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TableInput) => {
      const { error } = await supabase.from("restaurant_tables").insert({
        name: input.name.trim(),
        capacity: input.capacity,
        zone_id: input.zone_id,
        is_active: input.is_active,
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate(qc);
      toast.success("Mesa creada");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Error al crear la mesa"),
  });
}

export function useUpdateTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: TableInput }) => {
      const { error } = await supabase
        .from("restaurant_tables")
        .update({
          name: input.name.trim(),
          capacity: input.capacity,
          zone_id: input.zone_id,
          is_active: input.is_active,
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate(qc);
      toast.success("Mesa actualizada");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Error al actualizar la mesa"),
  });
}

export function useToggleTableActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      is_active,
    }: {
      id: string;
      is_active: boolean;
    }) => {
      const { error } = await supabase
        .from("restaurant_tables")
        .update({
          is_active,
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate(qc);
      toast.success("Mesa actualizada");
    },
    onError: (err: Error) => toast.error(err.message || "Error"),
  });
}

export function useDeleteTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Only allowed if no reservations point to this table — guarded in UI.
      const { error } = await supabase
        .from("restaurant_tables")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate(qc);
      toast.success("Mesa eliminada");
    },
    onError: (err: Error) =>
      toast.error(
        err.message ||
          "No se pudo eliminar la mesa (tiene reservas asociadas — usa Desactivar)",
      ),
  });
}

/** Counts reservations pointing to a given table — UI uses it to decide Eliminar vs Desactivar. */
export function useTableReservationCount(tableId: string | null) {
  return useQuery({
    queryKey: ["restaurant_table_reservation_count", tableId],
    enabled: !!tableId,
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from("reservations")
        .select("*", { count: "exact", head: true })
        .eq("table_id", tableId!);
      if (error) throw error;
      return count ?? 0;
    },
  });
}
