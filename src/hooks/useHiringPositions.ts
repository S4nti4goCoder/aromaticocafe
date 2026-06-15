import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { HiringPosition, HiringPositionUpdate } from "@/types";

// ── Lectura pública: solo vacantes activas (RLS filtra por is_hiring=true) ──

export function useActiveHiringPositions() {
  return useQuery({
    queryKey: ["hiring_positions", "active"],
    queryFn: async (): Promise<HiringPosition[]> => {
      const { data, error } = await supabase
        .from("hiring_positions")
        .select("*")
        .eq("is_hiring", true)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as HiringPosition[];
    },
    // Cache moderado: las vacantes no cambian a cada segundo
    staleTime: 30 * 1000,
  });
}

// ── Lectura admin: todas las posiciones (activas e inactivas) ──────────

export function useAllHiringPositions() {
  return useQuery({
    queryKey: ["hiring_positions", "all"],
    queryFn: async (): Promise<HiringPosition[]> => {
      const { data, error } = await supabase
        .from("hiring_positions")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as HiringPosition[];
    },
  });
}

// ── Mutaciones admin ────────────────────────────────────────────────────

interface UpdatePositionInput {
  id: string;
  patch: HiringPositionUpdate;
}

export function useUpdateHiringPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: UpdatePositionInput) => {
      const { data: userResult } = await supabase.auth.getUser();
      const userId = userResult?.user?.id ?? null;

      const { error } = await supabase
        .from("hiring_positions")
        .update({ ...patch, updated_by: userId })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hiring_positions"] });
      toast.success("Vacante actualizada");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "No pudimos actualizar la vacante",
      );
    },
  });
}

interface ToggleHiringInput {
  id: string;
  is_hiring: boolean;
}

export function useToggleHiring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_hiring }: ToggleHiringInput) => {
      const { data: userResult } = await supabase.auth.getUser();
      const userId = userResult?.user?.id ?? null;

      const { error } = await supabase
        .from("hiring_positions")
        .update({ is_hiring, updated_by: userId })
        .eq("id", id);
      if (error) throw error;
      return is_hiring;
    },
    onSuccess: (is_hiring) => {
      queryClient.invalidateQueries({ queryKey: ["hiring_positions"] });
      toast.success(
        is_hiring ? "Vacante activada" : "Vacante desactivada",
      );
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "No pudimos cambiar el estado",
      );
    },
  });
}
