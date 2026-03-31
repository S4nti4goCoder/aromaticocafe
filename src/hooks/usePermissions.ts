import { useProfile } from "@/hooks/useProfile";
import type { Role } from "@/types";

const roleHierarchy: Record<Role, number> = {
  super_admin: 4,
  gerente: 3,
  cajero: 2,
  barista: 1,
};

export function usePermissions() {
  const { data: profile, isLoading } = useProfile();

  const role = profile?.role ?? null;

  // Verifica si el usuario tiene al menos el rol requerido
  const hasRole = (requiredRole: Role): boolean => {
    if (!role) return false;
    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  };

  // Verifica si el usuario tiene exactamente uno de los roles indicados
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
