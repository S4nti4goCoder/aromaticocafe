import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { PermissionModule, PermissionsMap } from "@/types";

export function useWorkerPermissions(workerId: string) {
  return useQuery({
    queryKey: ["worker_permissions", workerId],
    queryFn: async (): Promise<PermissionsMap> => {
      const { data, error } = await supabase
        .from("worker_permissions")
        .select("*")
        .eq("worker_id", workerId);
      if (error) throw error;
      const map: PermissionsMap = {};
      (data ?? []).forEach((p) => {
        map[p.module as PermissionModule] = {
          can_view: p.can_view,
          can_create: p.can_create,
          can_edit: p.can_edit,
          can_delete: p.can_delete,
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
      const rows = Object.entries(permissions).map(([module, perms]) => ({
        worker_id: workerId,
        module,
        can_view: perms.can_view,
        can_create: perms.can_create,
        can_edit: perms.can_edit,
        can_delete: perms.can_delete,
      }));
      const { error } = await supabase
        .from("worker_permissions")
        .upsert(rows, { onConflict: "worker_id,module" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["worker_permissions", workerId],
      });
      queryClient.invalidateQueries({ queryKey: ["my_permissions"] });
      toast.success("Permisos guardados correctamente");
    },
    onError: () => {
      toast.error("Error al guardar los permisos");
    },
  });
}
