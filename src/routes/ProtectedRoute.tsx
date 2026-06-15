import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile";
import { useAutoAttendance } from "@/hooks/useAutoAttendance";
import { Loader2 } from "lucide-react";

export function ProtectedRoute() {
  const { user, isLoading } = useAuthStore();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const location = useLocation();

  // Auto-register attendance on login
  useAutoAttendance();

  if (isLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Must change password and isn't already on that page
  if (
    profile?.must_change_password &&
    location.pathname !== "/change-password"
  ) {
    return <Navigate to="/change-password" replace />;
  }

  // Already changed password but navigates to /change-password → send to dashboard
  if (
    !profile?.must_change_password &&
    location.pathname === "/change-password"
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
