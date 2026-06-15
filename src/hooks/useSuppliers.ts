import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Supplier, SupplierFormData } from "@/types";

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async (): Promise<Supplier[]> => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Supplier[];
    },
  });
}

function toRow(form: SupplierFormData) {
  return {
    name: form.name,
    contact_name: form.contact_name || null,
    phone: form.phone || null,
    email: form.email || null,
    nit: form.nit || null,
    address: form.address || null,
    notes: form.notes || null,
    is_active: form.is_active,
  };
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (form: SupplierFormData) => {
      const { data, error } = await supabase
        .from("suppliers")
        .insert(toRow(form))
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Proveedor creado");
    },
    onError: () => toast.error("Error al crear el proveedor"),
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, form }: { id: string; form: SupplierFormData }) => {
      const { error } = await supabase
        .from("suppliers")
        .update({ ...toRow(form), updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Proveedor actualizado");
    },
    onError: () => toast.error("Error al actualizar el proveedor"),
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Proveedor eliminado");
    },
    onError: () => toast.error("Error al eliminar el proveedor"),
  });
}
