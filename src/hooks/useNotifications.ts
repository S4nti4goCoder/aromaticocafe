import { useMemo } from "react";
import {
  AlertTriangle,
  Lock,
  PackageX,
  Ban,
  CalendarClock,
  RotateCcw,
} from "lucide-react";
import { useProductStock } from "@/hooks/useInventory";
import { useTodaySales } from "@/hooks/useSales";
import {
  useTodayCashRegister,
  useUnreadCashAudit,
  useMarkCashAuditAsRead,
} from "@/hooks/useAccounting";
import { useWorkers } from "@/hooks/useWorkers";
import { useActivePromotions } from "@/hooks/usePromotions";
import { usePendingReservationsCount } from "@/hooks/useReservations";

export type NotificationSeverity = "info" | "warning" | "danger";

export interface AppNotification {
  id: string;
  type: string;
  severity: NotificationSeverity;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** ISO timestamp of the event that triggered the notification (most recent). */
  timestamp: string;
  /** Content hash — changes when the set of items changes. */
  signature: string;
  /** Extra persistence when the notification is marked as read (e.g. cash_audit_log.read_at). */
  onRead?: () => void;
}

export function useNotifications() {
  const { data: stock = [] } = useProductStock();
  const { data: cashRegister } = useTodayCashRegister();
  const { data: todaySales = [] } = useTodaySales(cashRegister?.id);
  const { data: workers = [] } = useWorkers();
  const { data: promos = [] } = useActivePromotions();
  const { data: pendingReservations = 0 } = usePendingReservationsCount();
  const { data: cashAuditUnread = [] } = useUnreadCashAudit();
  const { mutate: markCashAuditRead } = useMarkCashAuditAsRead();

  return useMemo<AppNotification[]>(() => {
    const items: AppNotification[] = [];
    const nowIso = new Date().toISOString();

    // 0. Cash audit log: caja reabierta (alerta para gerente/super_admin).
    // RLS oculta esto a otros roles, así que cashAuditUnread queda vacío
    // y este bloque no agrega nada.
    const reopens = cashAuditUnread.filter((e) => e.event_type === "reopen");
    if (reopens.length > 0) {
      const last = reopens[0];
      items.push({
        id: `cash_reopen_${last.id}`,
        type: "cash_audit",
        severity: "warning",
        title:
          reopens.length === 1
            ? "Caja reabierta"
            : `${reopens.length} reaperturas de caja`,
        description: last.reason ?? "Sin razón especificada",
        href: "/caja",
        icon: RotateCcw,
        timestamp: last.performed_at,
        signature: reopens.map((r) => r.id).join(","),
        onRead: () => markCashAuditRead(reopens.map((r) => r.id)),
      });
    }

    // 1. Out-of-stock products (stock = 0)
    const outOfStock = stock.filter((s) => s.is_active && s.stock <= 0);
    if (outOfStock.length > 0) {
      const lastMov = outOfStock
        .map((s) => s.last_movement)
        .filter(Boolean)
        .sort()
        .pop();
      items.push({
        id: "out_of_stock",
        type: "stock",
        severity: "danger",
        title: `${outOfStock.length} producto${outOfStock.length === 1 ? "" : "s"} agotado${outOfStock.length === 1 ? "" : "s"}`,
        description: outOfStock
          .slice(0, 3)
          .map((s) => s.product_name)
          .join(", "),
        href: "/inventory/stock?filter=agotado",
        icon: PackageX,
        timestamp: lastMov ?? nowIso,
        signature: outOfStock
          .map((s) => s.product_id)
          .sort()
          .join(","),
      });
    }

    // 2. Low-stock products
    const lowStock = stock.filter(
      (s) => s.is_active && s.stock > 0 && s.stock <= s.min_stock,
    );
    if (lowStock.length > 0) {
      const lastMov = lowStock
        .map((s) => s.last_movement)
        .filter(Boolean)
        .sort()
        .pop();
      items.push({
        id: "low_stock",
        type: "stock",
        severity: "warning",
        title: `${lowStock.length} producto${lowStock.length === 1 ? "" : "s"} con stock bajo`,
        description: lowStock
          .slice(0, 3)
          .map((s) => `${s.product_name} (${s.stock})`)
          .join(", "),
        href: "/inventory/stock?filter=bajo",
        icon: AlertTriangle,
        timestamp: lastMov ?? nowIso,
        signature: lowStock
          .map((s) => `${s.product_id}:${s.stock}`)
          .sort()
          .join(","),
      });
    }

    // 3. Cash register not opened
    if (!cashRegister) {
      const todayKey = new Date().toISOString().slice(0, 10);
      items.push({
        id: "cash_register_closed",
        type: "cash",
        severity: "warning",
        title: "Caja sin abrir hoy",
        description: "Abre la caja para comenzar a registrar ventas",
        href: "/caja",
        icon: Lock,
        timestamp: nowIso,
        signature: "no-cash-" + todayKey,
      });
    }

    // 4. Sales voided today
    const voidedToday = todaySales.filter((s) => s.is_voided);
    if (voidedToday.length > 0) {
      const lastVoid = voidedToday
        .map((s) => s.voided_at)
        .filter(Boolean)
        .sort()
        .pop();
      items.push({
        id: "voided_sales",
        type: "sales",
        severity: "warning",
        title: `${voidedToday.length} venta${voidedToday.length === 1 ? "" : "s"} anulada${voidedToday.length === 1 ? "" : "s"} hoy`,
        description: "Revisa los motivos en el historial",
        href: "/caja?tab=historial",
        icon: Ban,
        timestamp: lastVoid ?? nowIso,
        signature: voidedToday
          .map((s) => s.id)
          .sort()
          .join(","),
      });
    }

    // 5. Workers on vacation
    const onVacation = workers.filter((w) => w.status === "vacaciones");
    if (onVacation.length > 0) {
      items.push({
        id: "workers_vacation",
        type: "workers",
        severity: "info",
        title: `${onVacation.length} trabajador${onVacation.length === 1 ? "" : "es"} en vacaciones`,
        description: onVacation.map((w) => w.full_name).join(", "),
        href: "/workers?filter=vacaciones",
        icon: CalendarClock,
        timestamp:
          onVacation
            .map((w) => w.updated_at)
            .filter(Boolean)
            .sort()
            .pop() ?? nowIso,
        signature: onVacation
          .map((w) => w.id)
          .sort()
          .join(","),
      });
    }

    // 6. Promotions expiring within 7 days
    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expiringSoon = promos.filter((p) => {
      if (!p.ends_at) return false;
      const end = new Date(p.ends_at);
      return end > now && end <= sevenDays;
    });
    if (expiringSoon.length > 0) {
      items.push({
        id: "promos_expiring",
        type: "promotions",
        severity: "info",
        title: `${expiringSoon.length} promoción${expiringSoon.length === 1 ? "" : "es"} vence${expiringSoon.length === 1 ? "" : "n"} pronto`,
        description: expiringSoon
          .slice(0, 3)
          .map((p) => p.name)
          .join(", "),
        href: "/inventory/promotions?filter=expira",
        icon: CalendarClock,
        timestamp: nowIso,
        signature: expiringSoon
          .map((p) => `${p.id}:${p.ends_at}`)
          .sort()
          .join(","),
      });
    }

    // Pending reservations (from /reservations)
    if (pendingReservations > 0) {
      items.push({
        id: "pending_reservations",
        type: "reservations",
        severity: "info",
        title: `${pendingReservations} reserva${pendingReservations === 1 ? "" : "s"} pendiente${pendingReservations === 1 ? "" : "s"}`,
        description: "Pendientes de confirmar",
        href: "/reservations?status=pendiente",
        icon: CalendarClock,
        timestamp: nowIso,
        signature: `pending:${pendingReservations}`,
      });
    }

    return items;
  }, [
    stock,
    cashRegister,
    todaySales,
    workers,
    promos,
    pendingReservations,
    cashAuditUnread,
    markCashAuditRead,
  ]);
}
