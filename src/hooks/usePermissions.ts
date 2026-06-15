import { useProfile } from "@/hooks/useProfile";
import type { Role } from "@/types";

const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 4,
  gerente: 3,
  cajero: 2,
  barista: 1,
};

export function usePermissions() {
  const { data: profile, isLoading } = useProfile();

  const role = profile?.role ?? null;

  // Whether the user has at least the required role
  const hasRole = (requiredRole: Role): boolean => {
    if (!role) return false;
    return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[requiredRole];
  };

  // Whether the user has exactly one of the given roles
  const hasAnyRole = (...roles: Role[]): boolean => {
    if (!role) return false;
    return roles.includes(role);
  };

  return {
    role,
    isLoading,
    isActive: profile?.is_active ?? false,
    isSuperAdmin: role === "super_admin",
    isGerente: hasRole("gerente"),
    isCajero: hasRole("cajero"),
    isBarista: role === "barista",
    hasRole,
    hasAnyRole,
  };
}
