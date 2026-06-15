import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCancelReservation } from "@/hooks/useReservations";

interface CancelReservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservationId: string;
  onCancelled?: () => void;
}

export function CancelReservationModal({
  open,
  onOpenChange,
  reservationId,
  onCancelled,
}: CancelReservationModalProps) {
  const [reason, setReason] = useState("");
  const cancel = useCancelReservation();

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    await cancel.mutateAsync({ id: reservationId, reason: reason.trim() });
    onOpenChange(false);
    setReason("");
    onCancelled?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancelar reserva</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            La cancelación queda registrada en la base con tu nombre y la razón
            que ingreses.
          </p>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Razón de la cancelación"
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={cancel.isPending}
          >
            Volver
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!reason.trim() || cancel.isPending}
          >
            {cancel.isPending && (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            )}
            Confirmar cancelación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
