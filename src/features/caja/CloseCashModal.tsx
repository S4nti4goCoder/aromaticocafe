import { Calculator, Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { DENOMINATIONS } from "@/features/caja/constants";
import { formatCurrency } from "@/features/caja/format";

interface CloseCashModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Day summary (precomputed by CajaPage)
  salesCount: number;
  voidedCount: number;
  todayTotal: number;
  totalDiscounts: number;
  salesByMethod: Record<string, number>;
  topProducts: { id: string; name: string }[];
  todayIngresos: number;
  todayEgresos: number;
  openingAmount: number;
  expectedInCash: number;
  // Cash count
  denominations: Record<number, string>;
  onDenominationsChange: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
  denomTotal: number;
  denomDiff: number;
  closingAmount: string;
  onClosingAmountChange: (value: string) => void;
  // Actions
  onConfirm: () => void;
  isPending: boolean;
}

// Day-close summary + denominated cash count (arqueo) before closing the register.
export function CloseCashModal({
  open,
  onOpenChange,
  salesCount,
  voidedCount,
  todayTotal,
  totalDiscounts,
  salesByMethod,
  topProducts,
  todayIngresos,
  todayEgresos,
  openingAmount,
  expectedInCash,
  denominations,
  onDenominationsChange,
  denomTotal,
  denomDiff,
  closingAmount,
  onClosingAmountChange,
  onConfirm,
  isPending,
}: CloseCashModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl! max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cerrar caja</DialogTitle>
          <DialogDescription>
            Revisa el resumen del día y realiza el arqueo desglosado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Day summary */}
          <div className="space-y-2">
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Resumen del día
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Transacciones
                  </p>
                  <p className="font-bold">{salesCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Anuladas</p>
                  <p className="font-bold text-destructive">{voidedCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total ventas
                  </p>
                  <p className="font-bold text-green-600">
                    {formatCurrency(todayTotal)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Descuentos</p>
                  <p className="font-bold">{formatCurrency(totalDiscounts)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-3 space-y-1 text-sm">
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                Por método de pago
              </p>
              {(["efectivo", "tarjeta", "transferencia", "otro"] as const).map(
                (m) =>
                  salesByMethod[m] ? (
                    <div key={m} className="flex justify-between">
                      <span className="capitalize text-muted-foreground">
                        {m}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(salesByMethod[m])}
                      </span>
                    </div>
                  ) : null,
              )}
              {Object.keys(salesByMethod).length === 0 && (
                <p className="text-xs text-muted-foreground">Sin ventas</p>
              )}
            </div>

            {topProducts.length > 0 && (
              <div className="rounded-lg border p-3 space-y-1 text-sm">
                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                  Top productos
                </p>
                {topProducts.slice(0, 3).map((p, i) => (
                  <div key={p.id} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {i + 1}. {p.name}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-lg border bg-muted/30 p-3 space-y-1 text-sm">
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                Movimientos manuales
              </p>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ingresos</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(todayIngresos)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Egresos</span>
                <span className="font-medium text-destructive">
                  {formatCurrency(todayEgresos)}
                </span>
              </div>
            </div>

            <div className="rounded-lg border-2 border-primary p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Apertura</span>
                <span>{formatCurrency(openingAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">+ Efectivo ventas</span>
                <span>{formatCurrency(salesByMethod.efectivo ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">+ Ingresos</span>
                <span>{formatCurrency(todayIngresos)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">− Egresos</span>
                <span>{formatCurrency(todayEgresos)}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t">
                <span>Esperado en caja</span>
                <span>{formatCurrency(expectedInCash)}</span>
              </div>
            </div>
          </div>

          {/* Denominated cash count */}
          <div className="space-y-2">
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4" />
                <p className="text-xs font-medium uppercase">
                  Arqueo desglosado
                </p>
              </div>
              <div className="space-y-2">
                {DENOMINATIONS.map((d) => {
                  const qty = parseInt(denominations[d] || "0") || 0;
                  const subtotal = d * qty;
                  return (
                    <div
                      key={d}
                      className={cn(
                        "grid grid-cols-[55px_1fr_60px] items-center gap-1.5 rounded-md border px-2 py-0.5 transition-colors sm:grid-cols-[90px_1fr_100px] sm:gap-3 sm:px-3",
                        qty > 0 && "border-primary/40 bg-primary/5",
                      )}
                    >
                      <span className="text-xs font-medium sm:text-sm">
                        {formatCurrency(d)}
                      </span>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="h-8 text-sm text-center font-bold"
                        value={denominations[d] || ""}
                        onChange={(e) =>
                          onDenominationsChange((prev) => ({
                            ...prev,
                            [d]: e.target.value,
                          }))
                        }
                      />
                      <span
                        className={cn(
                          "text-xs text-right font-semibold sm:text-sm",
                          qty > 0 ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border-2 border-primary p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Total contado
                </span>
                <span className="text-lg font-bold">
                  {formatCurrency(denomTotal)}
                </span>
              </div>
              {denomTotal > 0 && (
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm">Diferencia</span>
                  <span
                    className={cn(
                      "font-bold",
                      denomDiff === 0
                        ? "text-green-600"
                        : denomDiff > 0
                          ? "text-amber-500"
                          : "text-destructive",
                    )}
                  >
                    {denomDiff > 0 ? "+" : ""}
                    {formatCurrency(denomDiff)}
                  </span>
                </div>
              )}
            </div>

            {denomTotal === 0 && (
              <div className="space-y-2">
                <Label className="text-xs">O ingresar monto manual *</Label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  value={closingAmount}
                  onChange={(e) => onClosingAmountChange(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={onConfirm}
            disabled={(denomTotal === 0 && !closingAmount) || isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cerrar caja
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
