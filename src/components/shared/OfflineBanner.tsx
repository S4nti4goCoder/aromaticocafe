import { CloudOff, RefreshCw, Loader2 } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface OfflineBannerProps {
  pendingCount: number;
  isSyncing: boolean;
}

export function OfflineBanner({ pendingCount, isSyncing }: OfflineBannerProps) {
  const isOnline = useOnlineStatus();

  // Offline: warn that sales are being stored locally.
  if (!isOnline) {
    return (
      <div className="flex items-center justify-center gap-2 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-b border-amber-500/30 px-4 py-1.5 text-xs font-medium">
        <CloudOff className="h-3.5 w-3.5 shrink-0" />
        <span>
          Sin conexión — las ventas se guardan en este dispositivo
          {pendingCount > 0 && ` (${pendingCount} pendiente${pendingCount === 1 ? "" : "s"})`}
        </span>
      </div>
    );
  }

  // Online but with sales still queued.
  if (pendingCount > 0) {
    return (
      <div className="flex items-center justify-center gap-2 bg-blue-500/15 text-blue-600 dark:text-blue-400 border-b border-blue-500/30 px-4 py-1.5 text-xs font-medium">
        {isSyncing ? (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
        ) : (
          <RefreshCw className="h-3.5 w-3.5 shrink-0" />
        )}
        <span>
          {isSyncing
            ? `Sincronizando ${pendingCount} venta${pendingCount === 1 ? "" : "s"}...`
            : `${pendingCount} venta${pendingCount === 1 ? "" : "s"} pendiente${pendingCount === 1 ? "" : "s"} de sincronizar`}
        </span>
      </div>
    );
  }

  return null;
}
