import { Loader2 } from "lucide-react";

// Suspense fallback shown while a lazy-loaded route chunk is fetched.
export function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
