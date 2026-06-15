import { useState } from "react";
import {
  Loader2,
  MessageCircle,
  CheckCircle2,
  Ban,
  UserCheck,
  UserX,
  Armchair,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/useProfile";
import {
  useConfirmReservation,
  useCompleteReservation,
  useNoShowReservation,
  useAssignReservationTable,
  useUnassignReservationTable,
} from "@/hooks/useReservations";
import { CancelReservationModal } from "@/features/reservations/CancelReservationModal";
import { AssignTableModal } from "@/features/reservations/AssignTableModal";
import type { Reservation, ReservationStatus } from "@/types";

interface ReservationDetailModalProps {
  reservation: Reservation | null;
  onOpenChange: (open: boolean) => void;
}

const STATUS_BADGE: Record<
  ReservationStatus,
  { label: string; className: string }
> = {
  pendiente: { label: "Pendiente", className: "bg-amber-500 text-white" },
  confirmada: { label: "Confirmada", className: "bg-green-600 text-white" },
  cancelada: { label: "Cancelada", className: "bg-red-600 text-white" },
  completada: { label: "Completada", className: "bg-blue-600 text-white" },
  no_show: { label: "No se presentó", className: "bg-gray-600 text-white" },
};

function waLink(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function ReservationDetailModal({
  reservation,
  onOpenChange,
}: ReservationDetailModalProps) {
  const { data: profile } = useProfile();
  const role = profile?.role;
  const isAdmin = role === "super_admin" || role === "gerente";
  const isCashier = role === "cajero";

  const confirm = useConfirmReservation();
  const complete = useCompleteReservation();
  const noShow = useNoShowReservation();
  const assignTable = useAssignReservationTable();
  const unassignTable = useUnassignReservationTable();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignMode, setAssignMode] = useState<"confirm" | "change">("confirm");

  if (!reservation) return null;

  const badge = STATUS_BADGE[reservation.status];
  const wamsg = `Hola ${reservation.customer_name}, te escribimos sobre tu reserva del ${reservation.reservation_date} a las ${reservation.reservation_time.slice(0, 5)}.`;

  const canConfirm = isAdmin && reservation.status === "pendiente";
  const canCancel =
    isAdmin &&
    (reservation.status === "pendiente" ||
      reservation.status === "confirmada");
  const canComplete =
    (isAdmin || isCashier) && reservation.status === "confirmada";
  const canNoShow = canComplete;

  return (
    <Dialog open={!!reservation} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Reserva #{reservation.id.slice(0, 8)}
            <Badge className={badge.className}>{badge.label}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="rounded-md border p-3 space-y-1">
            <p className="font-medium">Cliente</p>
            <p>
              <span className="text-muted-foreground">Nombre: </span>
              {reservation.customer_name}
            </p>
            <p>
              <span className="text-muted-foreground">Teléfono: </span>
              <a
                href={waLink(reservation.customer_phone, wamsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                {reservation.customer_phone}
              </a>
            </p>
            {reservation.customer_email && (
              <p>
                <span className="text-muted-foreground">Email: </span>
                {reservation.customer_email}
              </p>
            )}
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="font-medium">Reserva</p>
            <p>
              <span className="text-muted-foreground">Fecha: </span>
              {reservation.reservation_date}
            </p>
            <p>
              <span className="text-muted-foreground">Hora: </span>
              {reservation.reservation_time.slice(0, 5)}
            </p>
            <p>
              <span className="text-muted-foreground">Personas: </span>
              {reservation.party_size}
            </p>
            {reservation.notes && (
              <p>
                <span className="text-muted-foreground">Notas: </span>
                {reservation.notes}
              </p>
            )}
          </div>

          {reservation.status === "confirmada" && (
            <div className="rounded-md border p-3 space-y-2">
              <p className="font-medium flex items-center gap-2">
                <Armchair className="h-3.5 w-3.5" />
                Mesa
              </p>
              {reservation.table ? (
                <p>
                  <span className="text-muted-foreground">Asignada: </span>
                  <strong>{reservation.table.name}</strong>{" "}
                  <span className="text-muted-foreground text-xs">
                    (capacidad {reservation.table.capacity})
                  </span>
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  Sin mesa asignada
                </p>
              )}
              {isAdmin && (
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAssignMode("change");
                      setAssignOpen(true);
                    }}
                  >
                    <Armchair className="h-3.5 w-3.5 mr-1.5" />
                    {reservation.table ? "Cambiar mesa" : "Asignar mesa"}
                  </Button>
                  {reservation.table && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => unassignTable.mutate(reservation.id)}
                      disabled={unassignTable.isPending}
                    >
                      Quitar mesa
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="rounded-md border p-3 space-y-1">
            <p className="font-medium">Historial</p>
            <p className="text-xs text-muted-foreground">
              Creada el{" "}
              {new Date(reservation.created_at).toLocaleString("es-CO")}
            </p>
            {reservation.confirmed_at && (
              <p className="text-xs">
                Confirmada el{" "}
                {new Date(reservation.confirmed_at).toLocaleString("es-CO")}
              </p>
            )}
            {reservation.cancelled_at && (
              <>
                <p className="text-xs">
                  Cancelada el{" "}
                  {new Date(reservation.cancelled_at).toLocaleString("es-CO")}
                </p>
                {reservation.cancel_reason && (
                  <p className="text-xs italic">
                    "{reservation.cancel_reason}"
                  </p>
                )}
              </>
            )}
            {reservation.completed_at && (
              <p className="text-xs">
                Marcada como completada el{" "}
                {new Date(reservation.completed_at).toLocaleString("es-CO")}
              </p>
            )}
            {reservation.no_show_at && (
              <p className="text-xs">
                Marcada como no se presentó el{" "}
                {new Date(reservation.no_show_at).toLocaleString("es-CO")}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <a
                href={waLink(reservation.customer_phone, wamsg)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                Contactar por WhatsApp
              </a>
            </Button>
            {canConfirm && (
              <Button
                size="sm"
                onClick={() => {
                  setAssignMode("confirm");
                  setAssignOpen(true);
                }}
                disabled={confirm.isPending}
              >
                {confirm.isPending ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                )}
                Confirmar reserva
              </Button>
            )}
            {canCancel && (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive"
                onClick={() => setCancelOpen(true)}
              >
                <Ban className="mr-2 h-3.5 w-3.5" />
                Cancelar reserva
              </Button>
            )}
            {canComplete && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => complete.mutate(reservation.id)}
                disabled={complete.isPending}
              >
                <UserCheck className="mr-2 h-3.5 w-3.5" />
                Marcar completada
              </Button>
            )}
            {canNoShow && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => noShow.mutate(reservation.id)}
                disabled={noShow.isPending}
              >
                <UserX className="mr-2 h-3.5 w-3.5" />
                No se presentó
              </Button>
            )}
          </div>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>

        <CancelReservationModal
          open={cancelOpen}
          onOpenChange={setCancelOpen}
          reservationId={reservation.id}
          onCancelled={() => onOpenChange(false)}
        />

        <AssignTableModal
          open={assignOpen}
          onOpenChange={setAssignOpen}
          mode={assignMode}
          reservation={reservation}
          isPending={confirm.isPending || assignTable.isPending}
          onSubmit={async (tableId) => {
            if (assignMode === "confirm") {
              await confirm.mutateAsync({ id: reservation.id, tableId });
              onOpenChange(false);
            } else if (tableId) {
              await assignTable.mutateAsync({ id: reservation.id, tableId });
            } else {
              await unassignTable.mutateAsync(reservation.id);
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
