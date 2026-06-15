import { Loader2 } from "lucide-react";
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

interface OpenCashModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  openingAmount: string;
  onOpeningAmountChange: (value: string) => void;
  onConfirm: () => void;
  isPending: boolean;
}

// Prompts for the opening float when starting the day's cash register.
export function OpenCashModal({
  open,
  onOpenChange,
  openingAmount,
  onOpeningAmountChange,
  onConfirm,
  isPending,
}: OpenCashModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Abrir caja</DialogTitle>
          <DialogDescription>
            Ingresa el monto inicial de la caja.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Monto de apertura *</Label>
            <Input
              type="number"
              min="0"
              step="1000"
              placeholder="0"
              value={openingAmount}
              onChange={(e) => onOpeningAmountChange(e.target.value)}
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
              className="w-full sm:flex-1"
              onClick={onConfirm}
              disabled={!openingAmount || isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Abrir caja
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
