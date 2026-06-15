import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Zone } from "@/types";

export function useZones() {
  return useQuery({
    queryKey: ["zones"],
    queryFn: async (): Promise<Zone[]> => {
      const { data, error } = await supabase
        .from("zones")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Zone[];
    },
  });
}

export interface ZoneInput {
  name: string;
  notes?: string | null;
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["zones"] });
  qc.invalidateQueries({ queryKey: ["restaurant_tables"] });
}

export function useCreateZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ZoneInput) => {
      const { error } = await supabase.from("zones").insert({
        name: input.name.trim(),
        notes: input.notes?.trim() || null,
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate(qc);
      toast.success("Zona creada");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Error al crear la zona"),
  });
}

export function useUpdateZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ZoneInput }) => {
      const { error } = await supabase
        .from("zones")
        .update({
          name: input.name.trim(),
          notes: input.notes?.trim() || null,
        } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate(qc);
      toast.success("Zona actualizada");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Error al actualizar la zona"),
  });
}

export function useDeleteZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("zones").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate(qc);
      toast.success("Zona eliminada");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Error al eliminar la zona"),
  });
}
