import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile";
import type { PermissionsMap, PermissionModule } from "@/types";

const MODULES: PermissionModule[] = [
  "categories",
  "products",
  "caja",
  "inventory",
  "workers",
  "accounting",
  "appearance",
  "settings",
];

const FULL_ACCESS: PermissionsMap = Object.fromEntries(
  MODULES.map((mod) => [
    mod,
    { can_view: true, can_create: true, can_edit: true, can_delete: true },
  ]),
);

export function useMyPermissions() {
  const { user } = useAuthStore();
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ["my_permissions", user?.id, profile?.role],
    queryFn: async (): Promise<PermissionsMap> => {
      if (!profile) return {};

      if (profile.role === "super_admin" || profile.role === "gerente") {
        return FULL_ACCESS;
      }

      const { data: worker } = await supabase
        .from("workers")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!worker) return {};

      const { data, error } = await supabase
        .from("worker_permissions")
        .select("*")
        .eq("worker_id", worker.id);

      if (error) throw error;
      if (!data || data.length === 0) return {};

      const map: PermissionsMap = {};
      MODULES.forEach((mod) => {
        const found = data.find((p) => p.module === mod);
        map[mod] = {
          can_view: found?.can_view ?? false,
          can_create: found?.can_create ?? false,
          can_edit: found?.can_edit ?? false,
          can_delete: found?.can_delete ?? false,
        };
      });

      return map;
    },
    enabled: !!user?.id && !!profile?.role,
  });
}
