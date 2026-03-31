import { useMyPermissions } from "@/hooks/useMyPermissions";
import { useProfile } from "@/hooks/useProfile";
import type { PermissionModule } from "@/types";

interface PermissionGuardProps {
  module: PermissionModule;
  action: "can_view" | "can_create" | "can_edit" | "can_delete";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  module,
  action,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { data: profile } = useProfile();
  const { data: permissions, isLoading } = useMyPermissions();

  if (isLoading) return null;

  // super_admin y gerente tienen acceso total
  if (profile?.role === "super_admin" || profile?.role === "gerente") {
    return <>{children}</>;
  }

  if (!permissions?.[module]?.[action]) return <>{fallback}</>;

  return <>{children}</>;
}
