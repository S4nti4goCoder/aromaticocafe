// Modal de confirmación para reabrir una caja que ya se cerró. Pide una razón
// obligatoria (mínimo 5 caracteres) que queda guardada en notes del registro
// para que la auditoría pueda revisar después por qué se reabrió.
import { useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useReopenCashRegister } from "@/hooks/useAccounting";
import { formatCurrency } from "@/features/caja/format";
import type { CashRegister } from "@/types";

interface ReopenCashModalProps {
  open: boolean;
  onClose: () => void;
  cashRegister: CashRegister | null;
}

export function ReopenCashModal({
  open,
  onClose,
  cashRegister,
}: ReopenCashModalProps) {
  const [reason, setReason] = useState("");
  const reopen = useReopenCashRegister();

  const handleReopen = async () => {
    if (!cashRegister) return;
    if (reason.trim().length < 5) return;
    try {
      await reopen.mutateAsync({ id: cashRegister.id, reason: reason.trim() });
      setReason("");
      onClose();
    } catch {
      // El toast del hook ya muestra el error
    }
  };

  const closedAtFmt = cashRegister?.closed_at
    ? new Date(cashRegister.closed_at).toLocaleString("es-CO", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : null;

  const canSubmit = reason.trim().length >= 5 && !reopen.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setReason("");
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reabrir caja</DialogTitle>
          <DialogDescription>
            Esto deshace el cierre y vuelve a activar la sesión para registrar
            ventas y movimientos.
          </DialogDescription>
        </DialogHeader>

        {cashRegister && (
          <div className="rounded-md border bg-muted/30 p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cerrada</span>
              <span className="font-medium">{closedAtFmt ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monto de cierre</span>
              <span className="font-medium">
                {cashRegister.closing_amount != null
                  ? formatCurrency(Number(cashRegister.closing_amount))
                  : "—"}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="reopen-reason">¿Por qué reabres?</Label>
          <Input
            id="reopen-reason"
            placeholder="Ej: Olvidé registrar una venta"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            autoFocus
          />
          <p className="text-[11px] text-muted-foreground">
            Mínimo 5 caracteres. Queda registrado para auditoría.
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={reopen.isPending}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={handleReopen}
            disabled={!canSubmit}
          >
            {reopen.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reabrir
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
