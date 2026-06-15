import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/**
 * Public-safe brand fields (name + logo) read from the `brand_settings` view.
 * Used by anonymous-facing surfaces (landing, login) so they never fetch the
 * sensitive `system_settings` columns (NIT, email, tax, loyalty config).
 */
export interface BrandSettings {
  id: string | null;
  cafe_name: string | null;
  logo_url: string | null;
}

export function useBrandSettings() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["brand_settings"],
    staleTime: 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as BrandSettings | null) ?? null;
    },
  });

  return { settings, isLoading };
}
