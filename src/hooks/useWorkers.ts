import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Worker, WorkerFormData } from "@/types";

export function useWorkers() {
  return useQuery({
    queryKey: ["workers"],
    queryFn: async (): Promise<Worker[]> => {
      const { data, error } = await supabase
        .from("workers")
        .select("*")
        .order("full_name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: WorkerFormData) => {
      const { data, error } = await supabase
        .from("workers")
        .insert({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || null,
          role: formData.role,
          status: formData.status,
          address: formData.address || null,
          birth_date: formData.birth_date || null,
          hire_date: formData.hire_date,
          base_salary: parseFloat(formData.base_salary),
          transport_allowance: parseFloat(formData.transport_allowance),
          commission_percentage: parseFloat(formData.commission_percentage),
          notes: formData.notes || null,
          avatar_url: formData.avatar_url,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Trabajador creado correctamente");
    },
    onError: () => {
      toast.error("Error al crear el trabajador");
    },
  });
}

export function useUpdateWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: WorkerFormData;
    }) => {
      const { data, error } = await supabase
        .from("workers")
        .update({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || null,
          role: formData.role,
          status: formData.status,
          address: formData.address || null,
          birth_date: formData.birth_date || null,
          hire_date: formData.hire_date,
          base_salary: parseFloat(formData.base_salary),
          transport_allowance: parseFloat(formData.transport_allowance),
          commission_percentage: parseFloat(formData.commission_percentage),
          notes: formData.notes || null,
          avatar_url: formData.avatar_url,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Trabajador actualizado correctamente");
    },
    onError: () => {
      toast.error("Error al actualizar el trabajador");
    },
  });
}

export function useDeleteWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("delete_worker_account", {
        worker_id: id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Trabajador eliminado");
    },
    onError: () => {
      toast.error("Error al eliminar el trabajador");
    },
  });
}
