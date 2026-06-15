import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/currency";
import { useCreatePartialRefund } from "@/hooks/useSaleRefunds";
import type { SaleItem } from "@/types";

interface RefundItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saleId: string;
  item: SaleItem;
  remaining: number;
  onRefunded: () => void;
}

export function RefundItemModal({
  open,
  onOpenChange,
  saleId,
  item,
  remaining,
  onRefunded,
}: RefundItemModalProps) {
  const [quantity, setQuantity] = useState<string>(String(remaining));
  const [reason, setReason] = useState("");
  const refund = useCreatePartialRefund();

  const qtyNum = Number(quantity);
  const validQty =
    Number.isFinite(qtyNum) && qtyNum > 0 && qtyNum <= remaining;
  const previewAmount = validQty
    ? Math.round(item.subtotal * (qtyNum / item.quantity) * 100) / 100
    : 0;

  const handleConfirm = async () => {
    if (!validQty || !reason.trim()) return;
    await refund.mutateAsync({
      saleId,
      saleItemId: item.id,
      quantity: qtyNum,
      reason: reason.trim(),
    });
    onOpenChange(false);
    onRefunded();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Devolver ítem</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="text-sm">
            <p className="font-medium">{item.product_name}</p>
            <p className="text-muted-foreground">
              Restante: {remaining} de {item.quantity} unds
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="refund-qty">Cantidad a devolver</Label>
            <Input
              id="refund-qty"
              type="number"
              min={1}
              max={remaining}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="refund-reason">Razón</Label>
            <Textarea
              id="refund-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Cliente pidió cambio, producto en mal estado, etc."
              rows={3}
            />
          </div>

          <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
            Monto a reembolsar: <strong>{formatCurrency(previewAmount)}</strong>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={refund.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!validQty || !reason.trim() || refund.isPending}
          >
            {refund.isPending && (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            )}
            Confirmar devolución
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
