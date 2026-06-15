import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

/** Only super_admin and gerente may access these routes. */
export function AdminRoute() {
  const { data: profile, isLoading } = useProfile();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (profile?.role === "super_admin" || profile?.role === "gerente") {
    return <Outlet />;
  }

  return <Navigate to="/dashboard" replace state={{ from: location }} />;
}
