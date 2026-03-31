import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useWorkerPermissions,
  useSaveWorkerPermissions,
} from "@/hooks/useWorkerPermissions";
import { usePermissions } from "@/hooks/usePermissions";
import type { PermissionModule, PermissionsMap } from "@/types";

interface PermissionsTabProps {
  workerId: string;
  workerRole: string;
}

const moduleLabels: Record<PermissionModule, string> = {
  categories: "Categorías",
  products: "Productos",
  workers: "Trabajadores",
  accounting: "Contabilidad",
  settings: "Configuración",
};

const MODULES: PermissionModule[] = [
  "categories",
  "products",
  "workers",
  "accounting",
  "settings",
];

export function PermissionsTab({ workerId, workerRole }: PermissionsTabProps) {
  const { data: savedPermissions, isLoading } = useWorkerPermissions(workerId);
  const savePermissions = useSaveWorkerPermissions(workerId);
  const { isSuperAdmin, isGerente } = usePermissions();

  const [permissions, setPermissions] = useState<PermissionsMap>({});

  useEffect(() => {
    if (savedPermissions) setPermissions(savedPermissions);
  }, [savedPermissions]);

  // super_admin y gerente tienen permisos fijos
  const isFixedRole = workerRole === "super_admin" || workerRole === "gerente";

  // gerente no puede editar permisos de otros gerentes ni super_admin
  const canEdit = isSuperAdmin || (isGerente && !isFixedRole);

  const handleToggle = (
    module: PermissionModule,
    field: "can_view" | "can_create" | "can_edit" | "can_delete",
    value: boolean,
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [field]: value,
        // Si activa cualquier permiso, activa ver automáticamente
        can_view:
          field === "can_view"
            ? value
            : value
              ? true
              : (prev[module]?.can_view ?? false),
        // Si desactiva ver, desactiva todos
        ...(field === "can_view" && !value
          ? { can_create: false, can_edit: false, can_delete: false }
          : {}),
      },
    }));
  };

  const handleSave = async () => {
    await savePermissions.mutateAsync(permissions);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded" />
        ))}
      </div>
    );
  }

  if (isFixedRole) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        <p>
          Los permisos de{" "}
          <strong>
            {workerRole === "super_admin" ? "Super Admin" : "Gerente"}
          </strong>{" "}
          son totales y no se pueden modificar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Módulo</th>
              <th className="text-center px-3 py-2 font-medium">Ver</th>
              <th className="text-center px-3 py-2 font-medium">Crear</th>
              <th className="text-center px-3 py-2 font-medium">Editar</th>
              <th className="text-center px-3 py-2 font-medium">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {MODULES.map((mod) => (
              <tr key={mod} className="border-t">
                <td className="px-4 py-3 font-medium">{moduleLabels[mod]}</td>
                {(
                  ["can_view", "can_create", "can_edit", "can_delete"] as const
                ).map((field) => (
                  <td key={field} className="text-center px-3 py-3">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={permissions[mod]?.[field] ?? false}
                        onCheckedChange={(checked) =>
                          handleToggle(mod, field, checked as boolean)
                        }
                        disabled={
                          !canEdit ||
                          (field !== "can_view" && !permissions[mod]?.can_view)
                        }
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canEdit && (
        <Button
          onClick={handleSave}
          disabled={savePermissions.isPending}
          className="w-full"
        >
          {savePermissions.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Save className="mr-2 h-4 w-4" />
          Guardar permisos
        </Button>
      )}
    </div>
  );
}
