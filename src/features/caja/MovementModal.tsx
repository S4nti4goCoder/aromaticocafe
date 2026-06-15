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
import type { TransactionType } from "@/types";

interface MovementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: TransactionType;
  onTypeChange: (type: TransactionType) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}

// Registers a manual cash movement (ingreso/egreso) against the open register.
export function MovementModal({
  open,
  onOpenChange,
  type,
  onTypeChange,
  amount,
  onAmountChange,
  category,
  onCategoryChange,
  description,
  onDescriptionChange,
  onSubmit,
  isPending,
}: MovementModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Movimiento de caja</DialogTitle>
          <DialogDescription>
            Registra un ingreso o egreso manual.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={type === "ingreso" ? "default" : "outline"}
              onClick={() => onTypeChange("ingreso")}
            >
              Ingreso
            </Button>
            <Button
              type="button"
              variant={type === "egreso" ? "destructive" : "outline"}
              onClick={() => onTypeChange("egreso")}
            >
              Egreso
            </Button>
          </div>
          <div className="space-y-2">
            <Label>Monto *</Label>
            <Input
              type="number"
              min="0"
              step="100"
              placeholder="0"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Categoría *</Label>
            <Input
              placeholder="Ej: Propina, Servilletas, Retiro..."
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Input
              placeholder="Opcional"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={onSubmit}
              disabled={!amount || !category.trim() || isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
