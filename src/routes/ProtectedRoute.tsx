import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react";

export function ProtectedRoute() {
  const { user, isLoading } = useAuthStore();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();

  if (isLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Fuerza cambio de contraseña si es primer login
  if (profile?.must_change_password) {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
}
