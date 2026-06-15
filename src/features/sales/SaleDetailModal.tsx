import { useState, useMemo } from "react";
import { Loader2, Printer, Ban, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/currency";
import { useSaleRefunds } from "@/hooks/useSaleRefunds";
import { useVoidSale } from "@/hooks/useSales";
import { deriveStatus } from "@/hooks/useSalesHistory";
import { RefundItemModal } from "@/features/sales/RefundItemModal";
import type { Sale, SaleItem, SaleRefund, SaleStatus } from "@/types";

interface SaleDetailModalProps {
  sale: (Sale & { items: SaleItem[]; refunds?: SaleRefund[] }) | null;
  onOpenChange: (open: boolean) => void;
  onPrintReceipt?: (sale: Sale) => void;
}

const STATUS_BADGE: Record<SaleStatus, { label: string; className: string }> = {
  valida: { label: "Válida", className: "bg-green-600 text-white" },
  devuelta_parcial: {
    label: "Devuelta parcial",
    className: "bg-amber-500 text-white",
  },
  devuelta_total: {
    label: "Devuelta total",
    className: "bg-orange-500 text-white",
  },
  anulada: { label: "Anulada", className: "bg-red-600 text-white" },
};

export function SaleDetailModal({
  sale,
  onOpenChange,
  onPrintReceipt,
}: SaleDetailModalProps) {
  const { data: refunds = [], isLoading: loadingRefunds } = useSaleRefunds(
    sale?.id ?? null,
  );
  const [refundTarget, setRefundTarget] = useState<{
    item: SaleItem;
    remaining: number;
  } | null>(null);
  const [voidConfirmOpen, setVoidConfirmOpen] = useState(false);
  const [voidReason, setVoidReason] = useState("");
  const voidSale = useVoidSale();

  const itemRemaining = useMemo(() => {
    if (!sale) return new Map<string, number>();
    const refunded = new Map<string, number>();
    for (const r of refunds) {
      refunded.set(
        r.sale_item_id,
        (refunded.get(r.sale_item_id) ?? 0) + Number(r.quantity),
      );
    }
    const out = new Map<string, number>();
    for (const it of sale.items) {
      out.set(it.id, it.quantity - (refunded.get(it.id) ?? 0));
    }
    return out;
  }, [sale, refunds]);

  if (!sale) return null;

  const status = deriveStatus({
    is_voided: sale.is_voided,
    items: sale.items,
    refunds,
  });
  const badge = STATUS_BADGE[status];
  const refundedTotal = refunds.reduce((sum, r) => sum + Number(r.amount), 0);
  const netTotal = sale.total - refundedTotal;
  const canVoid = status === "valida"; // only clean sales can be fully voided

  return (
    <Dialog open={!!sale} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Venta #{sale.sale_number ?? sale.id.slice(0, 8)}
            <Badge className={badge.className}>{badge.label}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-2 gap-2 text-sm rounded-md border p-3">
            <div>
              <span className="text-muted-foreground">Fecha: </span>
              {new Date(sale.created_at).toLocaleString("es-CO")}
            </div>
            <div>
              <span className="text-muted-foreground">Método: </span>
              {sale.payment_method}
            </div>
            <div>
              <span className="text-muted-foreground">Total: </span>
              <strong>{formatCurrency(sale.total)}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">Devuelto: </span>
              <strong>{formatCurrency(refundedTotal)}</strong>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Neto: </span>
              <strong>{formatCurrency(netTotal)}</strong>
            </div>
          </div>

          {/* Items */}
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Producto</th>
                  <th className="px-3 py-2 text-center font-medium">P. unit.</th>
                  <th className="px-3 py-2 text-center font-medium">Cant.</th>
                  <th className="px-3 py-2 text-center font-medium">Devuelto</th>
                  <th className="px-3 py-2 text-center font-medium">Restante</th>
                  <th className="px-3 py-2 text-right font-medium">Subtotal</th>
                  <th className="px-3 py-2 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item) => {
                  const remaining = itemRemaining.get(item.id) ?? item.quantity;
                  const refunded = item.quantity - remaining;
                  const canRefund = !sale.is_voided && remaining > 0;
                  return (
                    <tr key={item.id} className="border-t">
                      <td className="px-3 py-2">{item.product_name}</td>
                      <td className="px-3 py-2 text-center">
                        {formatCurrency(item.product_price)}
                      </td>
                      <td className="px-3 py-2 text-center">{item.quantity}</td>
                      <td className="px-3 py-2 text-center">{refunded}</td>
                      <td className="px-3 py-2 text-center font-medium">
                        {remaining}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {formatCurrency(item.subtotal)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {canRefund && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setRefundTarget({ item, remaining })
                            }
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Devolver
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Refund history */}
          {!loadingRefunds && refunds.length > 0 && (
            <div className="rounded-md border p-3 space-y-1.5 text-sm">
              <p className="font-medium">Historial de devoluciones</p>
              {refunds.map((r) => {
                const item = sale.items.find((i) => i.id === r.sale_item_id);
                return (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
                  >
                    <span>
                      {new Date(r.refunded_at).toLocaleString("es-CO")}
                    </span>
                    <span>·</span>
                    <span>{item?.product_name ?? "Ítem eliminado"}</span>
                    <span>·</span>
                    <span>{r.quantity} und</span>
                    <span>·</span>
                    <span>{formatCurrency(Number(r.amount))}</span>
                    <span>·</span>
                    <span className="italic">"{r.reason}"</span>
                  </div>
                );
              })}
            </div>
          )}

          {sale.is_voided && sale.void_reason && (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
              <strong>Anulada:</strong> {sale.void_reason}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="flex gap-2">
            {onPrintReceipt && (
              <Button variant="outline" onClick={() => onPrintReceipt(sale)}>
                <Printer className="h-3.5 w-3.5 mr-1.5" />
                Imprimir recibo
              </Button>
            )}
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              disabled={!canVoid}
              title={
                canVoid
                  ? undefined
                  : "Solo se puede anular una venta limpia (sin devoluciones)"
              }
              onClick={() => {
                setVoidReason("");
                setVoidConfirmOpen(true);
              }}
            >
              <Ban className="h-3.5 w-3.5 mr-1.5" />
              Anular venta completa
            </Button>
          </div>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>

        {refundTarget && (
          <RefundItemModal
            open={!!refundTarget}
            onOpenChange={(o) => {
              if (!o) setRefundTarget(null);
            }}
            saleId={sale.id}
            item={refundTarget.item}
            remaining={refundTarget.remaining}
            onRefunded={() => setRefundTarget(null)}
          />
        )}

        <Dialog open={voidConfirmOpen} onOpenChange={setVoidConfirmOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Anular venta completa</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Esta acción devolverá el stock, registrará un egreso por el
                total y reversará los sellos/puntos si aplica.
              </p>
              <Textarea
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="Razón de la anulación"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setVoidConfirmOpen(false)}
                disabled={voidSale.isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  await voidSale.mutateAsync({
                    sale,
                    reason: voidReason.trim(),
                  });
                  setVoidConfirmOpen(false);
                  onOpenChange(false);
                }}
                disabled={!voidReason.trim() || voidSale.isPending}
              >
                {voidSale.isPending && (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                )}
                Confirmar anulación
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
