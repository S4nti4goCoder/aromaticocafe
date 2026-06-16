// Detalle de una compra: muestra sus productos y permite anularla.
// Anular revierte el stock y el costo de cada producto y registra un
// ingreso compensatorio en contabilidad (todo atómico en el RPC).
import { useState } from "react";
import { Ban } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SkeletonRows } from "@/components/shared/SkeletonRows";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatCurrency } from "@/lib/currency";
import { usePurchaseItems, useVoidPurchase } from "@/hooks/usePurchases";
import { useProfile } from "@/hooks/useProfile";
import type { Purchase } from "@/types";

const formatDate = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const METHOD_LABEL: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  otro: "Otro",
};

interface Props {
  purchase: Purchase | null;
  onOpenChange: (open: boolean) => void;
}

export function PurchaseDetailModal({ purchase, onOpenChange }: Props) {
  const { data: items = [], isLoading } = usePurchaseItems(purchase?.id ?? null);
  const { data: profile } = useProfile();
  const voidPurchase = useVoidPurchase();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (!purchase) return null;

  const canVoid =
    !purchase.is_voided &&
    (profile?.role === "super_admin" || profile?.role === "gerente");

  const handleVoid = async () => {
    try {
      await voidPurchase.mutateAsync({ id: purchase.id, reason: reason.trim() });
      setConfirmOpen(false);
      setReason("");
      onOpenChange(false);
    } catch {
      // el toast del hook ya muestra el error
    }
  };

  return (
    <Dialog open={!!purchase} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Compra {purchase.invoice_number ?? `#${purchase.id.slice(0, 8)}`}
            {purchase.is_voided && (
              <Badge className="bg-red-600 text-white">Anulada</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm rounded-md border p-3">
            <div>
              <span className="text-muted-foreground">Fecha: </span>
              {formatDate(purchase.purchase_date)}
            </div>
            <div>
              <span className="text-muted-foreground">Proveedor: </span>
              {purchase.supplier?.name ?? "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Pago: </span>
              {METHOD_LABEL[purchase.payment_method] ?? purchase.payment_method}
            </div>
            <div>
              <span className="text-muted-foreground">Total: </span>
              <strong>{formatCurrency(Number(purchase.total))}</strong>
            </div>
          </div>

          {isLoading ? (
            <SkeletonRows count={3} />
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Producto</th>
                    <th className="px-3 py-2 text-center font-medium">Cant.</th>
                    <th className="px-3 py-2 text-right font-medium">C. unit.</th>
                    <th className="px-3 py-2 text-right font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="px-3 py-2">{it.product_name}</td>
                      <td className="px-3 py-2 text-center">{it.quantity}</td>
                      <td className="px-3 py-2 text-right">
                        {formatCurrency(Number(it.unit_cost))}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {formatCurrency(Number(it.subtotal))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {purchase.is_voided && purchase.void_reason && (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
              <strong>Anulada:</strong> {purchase.void_reason}
            </div>
          )}

          <div className="flex justify-between gap-2 pt-2">
            {canVoid ? (
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  setReason("");
                  setConfirmOpen(true);
                }}
              >
                <Ban className="h-3.5 w-3.5 mr-1.5" />
                Anular compra
              </Button>
            ) : (
              <span />
            )}
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </div>

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={(o) => {
            setConfirmOpen(o);
            if (!o) setReason("");
          }}
          title="Anular compra"
          description="Devuelve el stock, restaura el costo anterior de cada producto y registra un ingreso que cancela el egreso. No se puede deshacer."
          confirmLabel="Anular"
          destructive
          loading={voidPurchase.isPending}
          disabled={reason.trim().length < 5}
          onConfirm={handleVoid}
        >
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: factura cargada por error"
            className="mt-2"
          />
        </ConfirmDialog>
      </DialogContent>
    </Dialog>
  );
}
