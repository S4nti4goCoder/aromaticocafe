import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Product, ProductFormData } from "@/types";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(id, name)")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as unknown as Product[];
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: ProductFormData) => {
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price),
          discount_percentage: formData.discount_percentage
            ? parseFloat(formData.discount_percentage)
            : null,
          discount_price: formData.discount_price
            ? parseFloat(formData.discount_price)
            : null,
          category_id: formData.category_id || null,
          is_active: formData.is_active,
          image_url: formData.image_url,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Producto creado correctamente");
    },
    onError: () => {
      toast.error("Error al crear el producto");
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: ProductFormData;
    }) => {
      const { data, error } = await supabase
        .from("products")
        .update({
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price),
          discount_percentage: formData.discount_percentage
            ? parseFloat(formData.discount_percentage)
            : null,
          discount_price: formData.discount_price
            ? parseFloat(formData.discount_price)
            : null,
          category_id: formData.category_id || null,
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
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Producto actualizado correctamente");
    },
    onError: () => {
      toast.error("Error al actualizar el producto");
    },
  });
}

export function useToggleProductActive() {
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
        .from("products")
        .update({
          is_active,
          deactivated_by_category: false,
          deactivated_by_stock: false,
        })
        .eq("id", id);
      if (error) throw error;
      return is_active;
    },
    onSuccess: (is_active) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(is_active ? "Producto activado" : "Producto desactivado");
    },
    onError: () => {
      toast.error("Error al cambiar el estado del producto");
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Producto eliminado");
    },
    onError: () => {
      toast.error("Error al eliminar el producto");
    },
  });
}
