import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/features/accounting/format";

interface CloseCashModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expectedCash: number | null;
  closingAmount: string;
  onClosingAmountChange: (value: string) => void;
  closingNotes: string;
  onClosingNotesChange: (value: string) => void;
  onConfirm: () => void;
  isPending: boolean;
}

// Closes the register: shows expected cash, captures the counted amount + notes,
// and previews the over/short difference.
export function CloseCashModal({
  open,
  onOpenChange,
  expectedCash,
  closingAmount,
  onClosingAmountChange,
  closingNotes,
  onClosingNotesChange,
  onConfirm,
  isPending,
}: CloseCashModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cerrar caja</DialogTitle>
          <DialogDescription>Ingresa el monto final contado.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {expectedCash !== null && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="text-muted-foreground">Monto esperado</p>
              <p className="text-lg font-bold">{formatCurrency(expectedCash)}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label>Monto contado *</Label>
            <Input
              type="number"
              min="0"
              step="1000"
              placeholder="0"
              value={closingAmount}
              onChange={(e) => onClosingAmountChange(e.target.value)}
            />
            {closingAmount && expectedCash !== null && (
              <p
                className={`text-xs ${
                  parseFloat(closingAmount) - expectedCash >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                Diferencia:{" "}
                {formatCurrency(parseFloat(closingAmount) - expectedCash)}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Notas de cierre</Label>
            <Textarea
              placeholder="Observaciones opcionales..."
              rows={2}
              value={closingNotes}
              onChange={(e) => onClosingNotesChange(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="w-full sm:flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="w-full sm:flex-1"
              onClick={onConfirm}
              disabled={!closingAmount || isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cerrar caja
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
