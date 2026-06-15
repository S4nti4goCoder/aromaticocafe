import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useMyPermissions } from "@/hooks/useMyPermissions";
import { Loader2 } from "lucide-react";
import type { PermissionModule } from "@/types";

interface RoleRouteProps {
  module: PermissionModule;
}

export function RoleRoute({ module }: RoleRouteProps) {
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const { data: permissions, isLoading: isLoadingPermissions } =
    useMyPermissions();
  const location = useLocation();

  if (isLoadingProfile || isLoadingPermissions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // super_admin and gerente have full access
  if (profile?.role === "super_admin" || profile?.role === "gerente") {
    return <Outlet />;
  }

  // Other roles: check granular permissions
  const hasPermission = permissions?.[module]?.can_view === true;

  if (!hasPermission) {
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
