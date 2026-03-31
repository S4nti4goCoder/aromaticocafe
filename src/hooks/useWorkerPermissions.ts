import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { PermissionModule, PermissionsMap } from "@/types";

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

export function useWorkerPermissions(workerId: string | null) {
  return useQuery({
    queryKey: ["worker_permissions", workerId],
    queryFn: async (): Promise<PermissionsMap> => {
      if (!workerId) return {};

      const { data, error } = await supabase
        .from("worker_permissions")
        .select("*")
        .eq("worker_id", workerId);

      if (error) throw error;

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
    enabled: !!workerId,
  });
}

export function useSaveWorkerPermissions(workerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (permissions: PermissionsMap) => {
      const upsertData = MODULES.map((mod) => ({
        worker_id: workerId,
        module: mod,
        can_view: permissions[mod]?.can_view ?? false,
        can_create: permissions[mod]?.can_create ?? false,
        can_edit: permissions[mod]?.can_edit ?? false,
        can_delete: permissions[mod]?.can_delete ?? false,
      }));

      const { error } = await supabase
        .from("worker_permissions")
        .upsert(upsertData, { onConflict: "worker_id,module" });

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalida tanto los permisos del trabajador como los permisos propios
      queryClient.invalidateQueries({
        queryKey: ["worker_permissions", workerId],
      });
      // Invalida todos los my_permissions para que cualquier sesión activa se actualice
      queryClient.invalidateQueries({ queryKey: ["my_permissions"] });
    },
  });
}
