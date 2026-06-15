import { lazy, Suspense } from "react";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { AppRouter } from "@/routes/AppRouter";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";

// El banner de cookies es lazy para no añadir peso al bundle inicial
const CookieBanner = lazy(() =>
  import("@/components/shared/CookieBanner").then((m) => ({
    default: m.CookieBanner,
  })),
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppRouter />
          {/* Banner de cookies — solo aparece en rutas públicas y respeta el tema */}
          <Suspense fallback={null}>
            <CookieBanner />
          </Suspense>
          {/* Global toaster — follows the active theme automatically */}
          <Toaster position="bottom-right" richColors closeButton />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
