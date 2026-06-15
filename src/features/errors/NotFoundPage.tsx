import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Coffee, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { isLogoImage } from "@/lib/logo";

export function NotFoundPage() {
  const { user } = useAuthStore();
  const { settings: systemSettings } = useSystemSettings();
  const logoValue = systemSettings?.logo_url ?? null;
  const brandName = systemSettings?.cafe_name ?? "Aromático Café";
  const homeHref = user ? "/dashboard" : "/";
  const homeLabel = user ? "Volver al panel" : "Ir al inicio";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md text-center space-y-6"
      >
        <div className="flex flex-col items-center gap-3">
          {isLogoImage(logoValue) ? (
            <img
              src={logoValue!}
              alt="Logo"
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : logoValue ? (
            <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl leading-none">
              {logoValue}
            </div>
          ) : (
            <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Coffee className="h-7 w-7" />
            </div>
          )}
          <span className="text-sm text-muted-foreground">{brandName}</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-bold tracking-tight">404</h1>
          <h2 className="text-xl font-semibold">Página no encontrada</h2>
          <p className="text-sm text-muted-foreground">
            La página que buscas no existe o fue movida.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button asChild className="w-full sm:w-auto">
            <Link to={homeHref}>
              <Home className="h-4 w-4 mr-2" />
              {homeLabel}
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver atrás
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
