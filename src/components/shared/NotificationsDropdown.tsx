import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useNotifications,
  type NotificationSeverity,
} from "@/hooks/useNotifications";
import {
  useDismissAllNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationReads,
} from "@/hooks/useNotificationReads";
import { timeAgo } from "@/lib/timeAgo";
import { playNotificationSound } from "@/lib/notificationSound";
import { cn } from "@/lib/utils";

const severityStyles: Record<
  NotificationSeverity,
  { iconBg: string; iconText: string }
> = {
  danger: {
    iconBg: "bg-destructive/10",
    iconText: "text-destructive",
  },
  warning: {
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-500",
  },
  info: {
    iconBg: "bg-blue-500/10",
    iconText: "text-blue-500",
  },
};

export function NotificationsDropdown() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const { data: reads = {} } = useNotificationReads();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const dismissAll = useDismissAllNotifications();

  // Merge each notification with its read/dismissed state; drop dismissed ones whose signature still matches
  const items = useMemo(
    () =>
      notifications
        .map((n) => {
          const state = reads[n.id];
          return {
            ...n,
            unread: state?.signature !== n.signature,
            dismissed:
              state?.dismissed === true && state.signature === n.signature,
          };
        })
        .filter((n) => !n.dismissed),
    [notifications, reads],
  );

  const unreadCount = items.filter((i) => i.unread).length;

  // Play a sound when the unread count goes up
  const prevCountRef = useRef<number | null>(null);
  useEffect(() => {
    const prev = prevCountRef.current;
    if (prev !== null && unreadCount > prev) {
      const newOnes = items.filter((i) => i.unread);
      const sev: NotificationSeverity = newOnes.some((n) => n.severity === "danger")
        ? "danger"
        : newOnes.some((n) => n.severity === "warning")
          ? "warning"
          : "info";
      playNotificationSound(sev);
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount, items]);

  // Tick to refresh relative timestamps every 60s
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const handleItemClick = (n: (typeof items)[number]) => {
    markRead.mutate({ notificationId: n.id, signature: n.signature });
    // onRead solo viene definido cuando hay estado pendiente de persistir
    // en la base (p. ej. cash_audit_log.read_at), así que siempre se dispara.
    n.onRead?.();
    navigate(n.href);
  };

  const handleMarkAll = () => {
    if (items.length === 0) return;
    markAllRead.mutate(
      items.map((i) => ({ notificationId: i.id, signature: i.signature })),
    );
    items.forEach((i) => i.onRead?.());
  };

  const handleClearAll = () => {
    if (items.length === 0) return;
    dismissAll.mutate(
      items.map((i) => ({ notificationId: i.id, signature: i.signature })),
    );
    items.forEach((i) => i.onRead?.());
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] font-bold leading-none rounded-full flex items-center justify-center animate-in zoom-in-50"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificaciones</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className="w-[calc(100vw-1.5rem)] max-w-sm sm:w-80 p-0"
      >
        <div className="px-4 py-3 border-b flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-sm font-semibold">Notificaciones</p>
            {items.length > 0 && (
              <Badge variant="secondary" className="text-xs shrink-0">
                {unreadCount > 0 ? `${unreadCount} sin leer` : "al día"}
              </Badge>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="py-8 px-4 flex flex-col items-center gap-2 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <p className="text-sm text-muted-foreground">
              Todo en orden, sin notificaciones
            </p>
          </div>
        ) : (
          <>
            <div className="max-h-80 overflow-y-auto">
              {items.map((n) => {
                const styles = severityStyles[n.severity];
                const Icon = n.icon;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleItemClick(n)}
                    className={cn(
                      "w-full px-4 py-3 flex items-start gap-3 hover:bg-accent/50 transition-colors text-left border-b last:border-b-0 relative",
                      n.unread && "bg-accent/20",
                    )}
                  >
                    {n.unread && (
                      <span
                        aria-hidden
                        className="absolute left-1.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary"
                      />
                    )}
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                        styles.iconBg,
                      )}
                    >
                      <Icon className={cn("h-4 w-4", styles.iconText)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm leading-tight",
                            n.unread
                              ? "font-semibold"
                              : "font-medium text-foreground/80",
                          )}
                        >
                          {n.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                          {timeAgo(n.timestamp)}
                        </span>
                      </div>
                      {n.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {n.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer actions */}
            <div className="border-t flex">
              <button
                type="button"
                onClick={handleMarkAll}
                disabled={unreadCount === 0 || markAllRead.isPending}
                className="flex-1 px-3 py-2.5 text-xs font-medium text-primary hover:bg-accent/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar leídas
              </button>
              <div className="w-px bg-border" />
              <button
                type="button"
                onClick={handleClearAll}
                disabled={dismissAll.isPending}
                className="flex-1 px-3 py-2.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Limpiar todas
              </button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
