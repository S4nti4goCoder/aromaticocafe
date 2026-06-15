import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Attendance } from "@/types";

export function useAttendance(filters?: {
  workerId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["attendance", filters],
    queryFn: async (): Promise<Attendance[]> => {
      let query = supabase
        .from("attendance")
        .select("*, worker:workers(id, full_name, avatar_url, role)")
        .order("date", { ascending: false })
        .order("check_in", { ascending: true });

      if (filters?.workerId) query = query.eq("worker_id", filters.workerId);
      if (filters?.startDate) query = query.gte("date", filters.startDate);
      if (filters?.endDate) query = query.lte("date", filters.endDate);
      if (filters?.status) query = query.eq("status", filters.status);

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Attendance[];
    },
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: {
      worker_id: string;
      date: string;
      check_in?: string;
      check_out?: string;
      status: "presente" | "ausente" | "tardanza" | "permiso";
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("attendance")
        .insert({
          worker_id: record.worker_id,
          date: record.date,
          check_in: record.check_in || null,
          check_out: record.check_out || null,
          status: record.status,
          notes: record.notes || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Asistencia registrada");
    },
    onError: () => {
      toast.error("Error al registrar asistencia");
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...record
    }: {
      id: string;
      check_in?: string;
      check_out?: string;
      status?: "presente" | "ausente" | "tardanza" | "permiso";
      notes?: string;
    }) => {
      const update: Record<string, unknown> = {};
      if (record.check_in !== undefined) update.check_in = record.check_in || null;
      if (record.check_out !== undefined) update.check_out = record.check_out || null;
      if (record.status) update.status = record.status;
      if (record.notes !== undefined) update.notes = record.notes || null;

      const { data, error } = await supabase
        .from("attendance")
        .update(update)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Asistencia actualizada");
    },
    onError: () => {
      toast.error("Error al actualizar asistencia");
    },
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("attendance").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Registro eliminado");
    },
    onError: () => {
      toast.error("Error al eliminar registro");
    },
  });
}
