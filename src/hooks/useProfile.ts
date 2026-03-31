import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import type { Profile } from "@/types";

export function useProfile() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}
