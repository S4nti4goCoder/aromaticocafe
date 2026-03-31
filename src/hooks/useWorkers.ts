import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        role: formData.role,
        status: formData.status,
        address: formData.address || null,
        birth_date: formData.birth_date || null,
        hire_date: formData.hire_date,
        base_salary: parseFloat(formData.base_salary) || 0,
        transport_allowance: parseFloat(formData.transport_allowance) || 0,
        commission_percentage: parseFloat(formData.commission_percentage) || 0,
        notes: formData.notes || null,
        avatar_url: formData.avatar_url,
      };

      const { data, error } = await supabase
        .from("workers")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
    },
  });
}

export function useUpdateWorker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...formData
    }: WorkerFormData & { id: string }) => {
      const payload = {
        full_name: formData.full_name,
        email: formData.email || "",
        phone: formData.phone || null,
        role: formData.role,
        status: formData.status,
        address: formData.address || null,
        birth_date: formData.birth_date || null,
        hire_date: formData.hire_date,
        base_salary: parseFloat(formData.base_salary) || 0,
        transport_allowance: parseFloat(formData.transport_allowance) || 0,
        commission_percentage: parseFloat(formData.commission_percentage) || 0,
        notes: formData.notes || null,
        avatar_url: formData.avatar_url,
      };

      const { data, error } = await supabase
        .from("workers")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
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
    },
  });
}
