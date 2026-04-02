import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface SystemSettings {
  id: string;
  business_name: string | null;
  business_nit: string | null;
  business_address: string | null;
  business_city: string | null;
  business_phone: string | null;
  business_email: string | null;
  tax_enabled: boolean;
  tax_percentage: number;
  tax_name: string | null;
  tax_included_in_price: boolean;
  currency_code: string | null;
  currency_symbol: string | null;
  currency_decimal_separator: string | null;
  currency_thousands_separator: string | null;
  updated_at: string;
}

const SETTINGS_ID = "00000000-0000-0000-0000-000000000002";

export function useSystemSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["system_settings"],
    staleTime: 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .eq("id", SETTINGS_ID)
        .single();
      if (error) throw error;
      return data as SystemSettings;
    },
  });

  const { mutateAsync: updateSettings, isPending: isSaving } = useMutation({
    mutationFn: async (updates: Partial<SystemSettings>) => {
      const { error } = await supabase
        .from("system_settings")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", SETTINGS_ID);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system_settings"] });
    },
  });

  return { settings, isLoading, updateSettings, isSaving };
}
