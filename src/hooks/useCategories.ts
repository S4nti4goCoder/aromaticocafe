import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Category, CategoryFormData } from "@/types";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useCategoryProductCounts() {
  return useQuery({
    queryKey: ["category_product_counts"],
    queryFn: async (): Promise<Record<string, number>> => {
      const { data, error } = await supabase
        .from("products")
        .select("category_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        if (!row.category_id) continue;
        counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
      }
      return counts;
    },
  });
}

export function useToggleCategoryActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      is_active,
    }: {
      id: string;
      is_active: boolean;
    }) => {
      // 1. Actualizar la categoría
      const { error: catError } = await supabase
        .from("categories")
        .update({ is_active })
        .eq("id", id);
      if (catError) throw catError;

      // 2. Cascada con memoria sobre los productos
      let affected = 0;
      if (!is_active) {
        const { data, error: prodError } = await supabase
          .from("products")
          .update({ is_active: false, deactivated_by_category: true })
          .eq("category_id", id)
          .eq("is_active", true)
          .select("id");
        if (prodError) throw prodError;
        affected = data?.length ?? 0;
      } else {
        const { data, error: prodError } = await supabase
          .from("products")
          .update({ is_active: true, deactivated_by_category: false })
          .eq("category_id", id)
          .eq("deactivated_by_category", true)
          .select("id");
        if (prodError) throw prodError;
        affected = data?.length ?? 0;
      }

      return { is_active, affected };
    },
    onSuccess: ({ is_active, affected }) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      const action = is_active ? "activada" : "desactivada";
      const detail =
        affected > 0
          ? ` · ${affected} producto${affected === 1 ? "" : "s"} ${action}${affected === 1 ? "" : "s"} en cascada`
          : "";
      toast.success(`Categoría ${action}${detail}`);
    },
    onError: () => {
      toast.error("Error al cambiar el estado de la categoría");
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: CategoryFormData) => {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: formData.name,
          description: formData.description || null,
          is_active: formData.is_active,
          image_url: formData.image_url,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoría creada correctamente");
    },
    onError: () => {
      toast.error("Error al crear la categoría");
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: CategoryFormData;
    }) => {
      const { data, error } = await supabase
        .from("categories")
        .update({
          name: formData.name,
          description: formData.description || null,
          is_active: formData.is_active,
          image_url: formData.image_url,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoría actualizada correctamente");
    },
    onError: () => {
      toast.error("Error al actualizar la categoría");
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoría eliminada");
    },
    onError: () => {
      toast.error("Error al eliminar la categoría");
    },
  });
}
