import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// Resultado del RPC search_customers_for_pos. Cajeros pueden buscar por nombre
// o teléfono parcial (LIKE). El RPC está marcado SECURITY DEFINER porque la
// tabla customers está protegida por RLS para roles no admin.
export interface CustomerSearchResult {
  id: string;
  name: string | null;
  phone: string;
  stamps: number;
  points: number;
}

export function useCustomerSearch(query: string) {
  const cleaned = query.trim();
  return useQuery({
    queryKey: ["customer_search", cleaned],
    queryFn: async (): Promise<CustomerSearchResult[]> => {
      if (cleaned.length < 2) return [];
      const { data, error } = await supabase.rpc("search_customers_for_pos", {
        q: cleaned,
      });
      if (error) throw error;
      return (data ?? []) as CustomerSearchResult[];
    },
    // Habilitado solo cuando el query tiene >= 2 caracteres para no spamear
    // la BD con cada keystroke inicial.
    enabled: cleaned.length >= 2,
    // El listado puede quedarse "fresco" 30s porque difícilmente cambian los
    // clientes en mitad de una venta.
    staleTime: 30000,
  });
}
