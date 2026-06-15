import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type {
  JobApplication,
  JobApplicationFormData,
  JobApplicationStatus,
} from "@/types";

// ── Lectura (panel admin) ──────────────────────────────────────────────

export function useJobApplications() {
  return useQuery({
    queryKey: ["job_applications"],
    queryFn: async (): Promise<JobApplication[]> => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as JobApplication[];
    },
  });
}

export function useJobApplicationCounts() {
  return useQuery({
    queryKey: ["job_applications_counts"],
    queryFn: async (): Promise<Record<JobApplicationStatus, number>> => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("status");
      if (error) throw error;
      const counts: Record<JobApplicationStatus, number> = {
        new: 0,
        reviewed: 0,
        contacted: 0,
        hired: 0,
        rejected: 0,
      };
      for (const row of data ?? []) {
        const s = row.status as JobApplicationStatus;
        if (s in counts) counts[s] += 1;
      }
      return counts;
    },
  });
}

// ── Creación pública (formulario /trabaja-con-nosotros) ─────────────────

export function useCreateJobApplication() {
  return useMutation({
    mutationFn: async (payload: JobApplicationFormData): Promise<string> => {
      const { data, error } = await supabase.rpc(
        "create_public_job_application",
        { payload: payload as never },
      );
      if (error) throw error;
      return data as string;
    },
  });
}

// ── Mutaciones admin (cambio de estado, eliminación) ───────────────────

interface UpdateStatusInput {
  id: string;
  status: JobApplicationStatus;
}

export function useUpdateJobApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: UpdateStatusInput) => {
      const now = new Date().toISOString();
      const { data: userResult } = await supabase.auth.getUser();
      const userId = userResult?.user?.id ?? null;

      // Setea timestamp/by según el estado destino
      const patch: Record<string, unknown> = { status };
      if (status === "reviewed") {
        patch.reviewed_at = now;
        patch.reviewed_by = userId;
      } else if (status === "contacted") {
        patch.contacted_at = now;
        patch.contacted_by = userId;
      } else if (status === "hired" || status === "rejected") {
        patch.decision_at = now;
        patch.decision_by = userId;
      }

      const { error } = await supabase
        .from("job_applications")
        .update(patch)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["job_applications"] });
      queryClient.invalidateQueries({
        queryKey: ["job_applications_counts"],
      });
      const labels: Record<JobApplicationStatus, string> = {
        new: "marcada como nueva",
        reviewed: "marcada como revisada",
        contacted: "marcada como contactada",
        hired: "marcada como contratada",
        rejected: "marcada como rechazada",
      };
      toast.success(`Postulación ${labels[vars.status]}`);
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : "No pudimos actualizar la postulación",
      );
    },
  });
}

interface UpdateNotesInput {
  id: string;
  notes: string | null;
}

export function useUpdateJobApplicationNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notes }: UpdateNotesInput) => {
      const { error } = await supabase
        .from("job_applications")
        .update({ notes })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job_applications"] });
      toast.success("Notas actualizadas");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "No pudimos guardar las notas",
      );
    },
  });
}

export function useDeleteJobApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("job_applications")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job_applications"] });
      queryClient.invalidateQueries({
        queryKey: ["job_applications_counts"],
      });
      toast.success("Postulación eliminada");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "No pudimos eliminar la postulación",
      );
    },
  });
}

export function useBulkDeleteJobApplications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("job_applications")
        .delete()
        .in("id", ids);
      if (error) throw error;
      return ids.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["job_applications"] });
      queryClient.invalidateQueries({
        queryKey: ["job_applications_counts"],
      });
      toast.success(
        `${count} postulación${count === 1 ? "" : "es"} eliminada${count === 1 ? "" : "s"}`,
      );
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : "No pudimos eliminar las postulaciones",
      );
    },
  });
}
