import type { Role } from "@/types";
import { usePermissions } from "@/hooks/usePermissions";

interface RoleGuardProps {
  requiredRole: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({
  requiredRole,
  children,
  fallback = null,
}: RoleGuardProps) {
  const { hasRole, isLoading } = usePermissions();

  if (isLoading) return null;

  if (!hasRole(requiredRole)) return <>{fallback}</>;

  return <>{children}</>;
}
