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
      return data as unknown as Promotion[];
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
      return data as unknown as Promotion[];
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
      toast.success("Promoción actualizada correctamente");
    },
    onError: () => {
      toast.error("Error al actualizar la promoción");
    },
  });
}

export function useTogglePromotionActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      is_active,
    }: {
      id: string;
      is_active: boolean;
    }) => {
      const { error } = await supabase
        .from("promotions")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
      return is_active;
    },
    onSuccess: (is_active) => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      toast.success(`Promoción ${is_active ? "activada" : "desactivada"}`);
    },
    onError: () => {
      toast.error("Error al actualizar la promoción");
    },
  });
}

export function useDuplicatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (promotion: Promotion) => {
      const { data, error } = await supabase
        .from("promotions")
        .insert({
          name: `${promotion.name} (copia)`,
          description: promotion.description,
          type: promotion.type,
          value: promotion.value,
          applies_to: promotion.applies_to,
          product_id: promotion.product_id,
          category_id: promotion.category_id,
          is_active: promotion.is_active,
          starts_at: promotion.starts_at,
          ends_at: promotion.ends_at,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      toast.success("Promoción duplicada");
    },
    onError: () => {
      toast.error("Error al duplicar la promoción");
    },
  });
}

export function useBulkUpdatePromotionsActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ids,
      is_active,
    }: {
      ids: string[];
      is_active: boolean;
    }) => {
      const { error } = await supabase
        .from("promotions")
        .update({ is_active })
        .in("id", ids);
      if (error) throw error;
      return { count: ids.length, is_active };
    },
    onSuccess: ({ count, is_active }) => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      toast.success(
        `${count} promoción${count === 1 ? "" : "es"} ${is_active ? "activada" : "desactivada"}${count === 1 ? "" : "s"}`,
      );
    },
    onError: () => {
      toast.error("Error al actualizar las promociones");
    },
  });
}

export function useBulkDeletePromotions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("promotions")
        .delete()
        .in("id", ids);
      if (error) throw error;
      return ids.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      toast.success(
        `${count} promoción${count === 1 ? "" : "es"} eliminada${count === 1 ? "" : "s"}`,
      );
    },
    onError: () => {
      toast.error("Error al eliminar las promociones");
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
