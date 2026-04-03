import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Promotion, PromotionFormData } from "@/types";

export function usePromotions() {
  return useQuery({
    queryKey: ["promotions"],
    queryFn: async (): Promise<Promotion[]> => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*, product:products(id, name), category:categories(id, name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: PromotionFormData) => {
      const { data, error } = await supabase
        .from("promotions")
        .insert({
          name: formData.name,
          description: formData.description || null,
          type: formData.type,
          value: parseFloat(formData.value),
          applies_to: formData.applies_to,
          product_id: formData.product_id || null,
          category_id: formData.category_id || null,
          is_active: formData.is_active,
          starts_at: formData.starts_at,
          ends_at: formData.ends_at || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      toast.success("Promoción creada correctamente");
    },
    onError: () => {
      toast.error("Error al crear la promoción");
    },
  });
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: PromotionFormData;
    }) => {
      const { data, error } = await supabase
        .from("promotions")
        .update({
          name: formData.name,
          description: formData.description || null,
          type: formData.type,
          value: parseFloat(formData.value),
          applies_to: formData.applies_to,
          product_id: formData.product_id || null,
          category_id: formData.category_id || null,
          is_active: formData.is_active,
          starts_at: formData.starts_at,
          ends_at: formData.ends_at || null,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      toast.success("Promoción actualizada correctamente");
    },
    onError: () => {
      toast.error("Error al actualizar la promoción");
    },
  });
}

export function useDeletePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promotions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      toast.success("Promoción eliminada");
    },
    onError: () => {
      toast.error("Error al eliminar la promoción");
    },
  });
}
