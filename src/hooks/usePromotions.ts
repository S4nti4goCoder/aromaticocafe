import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export function useActivePromotions() {
  return useQuery({
    queryKey: ["promotions", "active"],
    queryFn: async (): Promise<Promotion[]> => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("promotions")
        .select("*, product:products(id, name), category:categories(id, name)")
        .eq("is_active", true)
        .lte("starts_at", now)
        .or(`ends_at.is.null,ends_at.gte.${now}`);

      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: PromotionFormData) => {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        type: formData.type,
        value: parseFloat(formData.value) || 0,
        applies_to: formData.applies_to,
        product_id:
          formData.applies_to === "producto" && formData.product_id
            ? formData.product_id
            : null,
        category_id:
          formData.applies_to === "categoria" && formData.category_id
            ? formData.category_id
            : null,
        is_active: formData.is_active,
        starts_at: formData.starts_at || new Date().toISOString(),
        ends_at: formData.ends_at || null,
      };

      const { data, error } = await supabase
        .from("promotions")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...formData
    }: PromotionFormData & { id: string }) => {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        type: formData.type,
        value: parseFloat(formData.value) || 0,
        applies_to: formData.applies_to,
        product_id:
          formData.applies_to === "producto" && formData.product_id
            ? formData.product_id
            : null,
        category_id:
          formData.applies_to === "categoria" && formData.category_id
            ? formData.category_id
            : null,
        is_active: formData.is_active,
        starts_at: formData.starts_at || new Date().toISOString(),
        ends_at: formData.ends_at || null,
      };

      const { data, error } = await supabase
        .from("promotions")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
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
    },
  });
}
