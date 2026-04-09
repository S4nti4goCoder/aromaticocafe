import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Shift, ShiftFormData } from "@/types";

export function useShifts(filters?: { workerId?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ["shifts", filters],
    queryFn: async (): Promise<Shift[]> => {
      let query = supabase
        .from("shifts")
        .select("*, worker:workers(id, full_name, avatar_url, role)")
        .order("date", { ascending: false })
        .order("start_time", { ascending: true });

      if (filters?.workerId) query = query.eq("worker_id", filters.workerId);
      if (filters?.startDate) query = query.gte("date", filters.startDate);
      if (filters?.endDate) query = query.lte("date", filters.endDate);

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Shift[];
    },
  });
}

export function useCreateShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: ShiftFormData) => {
      const { data, error } = await supabase
        .from("shifts")
        .insert({
          worker_id: formData.worker_id,
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          notes: formData.notes || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Turno asignado correctamente");
    },
    onError: () => {
      toast.error("Error al asignar el turno");
    },
  });
}

export function useUpdateShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: ShiftFormData }) => {
      const { data, error } = await supabase
        .from("shifts")
        .update({
          worker_id: formData.worker_id,
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          notes: formData.notes || null,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Turno actualizado");
    },
    onError: () => {
      toast.error("Error al actualizar el turno");
    },
  });
}

export function useDeleteShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shifts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Turno eliminado");
    },
    onError: () => {
      toast.error("Error al eliminar el turno");
    },
  });
}
