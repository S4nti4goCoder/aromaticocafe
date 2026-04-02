import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { CafeSettings } from '@/types';

const SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

export function useCafeSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["cafe_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cafe_settings")
        .select("*")
        .eq("id", SETTINGS_ID)
        .single();
      if (error) throw error;
      return data as CafeSettings;
    },
  });

  const { mutateAsync: updateSettings, isPending: isSaving } = useMutation({
    mutationFn: async (updates: Partial<CafeSettings>) => {
      const { error } = await supabase
        .from("cafe_settings")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", SETTINGS_ID);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cafe_settings"] });
    },
  });

  return { settings, isLoading, updateSettings, isSaving };
}
