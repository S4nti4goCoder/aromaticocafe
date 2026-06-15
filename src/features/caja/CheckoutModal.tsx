import { Loader2 } from "lucide-react";
import {
  CustomerSection,
  type CustomerMode,
} from "@/features/caja/CustomerSection";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/features/caja/format";
import type {
  CartItem,
  Customer,
  PaymentMethod,
  Product,
  Promotion,
} from "@/types";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Receipt summary
  businessName: string | null | undefined;
  cart: CartItem[];
  products: Product[];
  getPromoForProduct: (product: Product) => Promotion | undefined;
  taxEnabled: boolean;
  taxName: string;
  taxPercent: number;
  totalBase: number;
  totalIVA: number;
  discountAmount: number;
  total: number;
  // Extra discount
  discount: string;
  onDiscountChange: (value: string) => void;
  // Payment
  isMixto: boolean;
  onToggleMixto: () => void;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  cashReceived: string;
  onCashReceivedChange: (value: string) => void;
  cashReceivedNum: number;
  cashShort: boolean;
  change: number;
  mixtoCash: string;
  onMixtoCashChange: (value: string) => void;
  mixtoCard: string;
  onMixtoCardChange: (value: string) => void;
  mixtoSum: number;
  mixtoShort: boolean;
  // Notes
  notes: string;
  onNotesChange: (value: string) => void;
  // Customer + loyalty
  customerMode: CustomerMode;
  onCustomerModeChange: (mode: CustomerMode) => void;
  customerName: string;
  onCustomerNameChange: (value: string) => void;
  customerPhone: string;
  onCustomerPhoneChange: (value: string) => void;
  loyaltyOn: boolean;
  loyaltyCustomer: Customer | null;
  onLoyaltyCustomerChange: (customer: Customer | null) => void;
  loyaltyMode: "sellos" | "puntos";
  stampsRequired: number;
  canRedeemStamps: boolean;
  canRedeemPoints: boolean;
  redeemLoyalty: boolean;
  onRedeemLoyaltyChange: (value: boolean) => void;
  rewardBase: number;
  pointsDiscount: number;
  rewardLabel: string | null | undefined;
  // Confirm
  canConfirm: boolean;
  onConfirm: () => void;
  isPending: boolean;
}

// Payment dialog: receipt preview, payment method (incl. mixto), cash/change,
// notes, customer + loyalty redemption, and the confirm action.
export function CheckoutModal({
  open,
  onOpenChange,
  businessName,
  cart,
  products,
  getPromoForProduct,
  taxEnabled,
  taxName,
  taxPercent,
  totalBase,
  totalIVA,
  discountAmount,
  total,
  discount,
  onDiscountChange,
  isMixto,
  onToggleMixto,
  paymentMethod,
  onPaymentMethodChange,
  cashReceived,
  onCashReceivedChange,
  cashReceivedNum,
  cashShort,
  change,
  mixtoCash,
  onMixtoCashChange,
  mixtoCard,
  onMixtoCardChange,
  mixtoSum,
  mixtoShort,
  notes,
  onNotesChange,
  customerMode,
  onCustomerModeChange,
  customerName,
  onCustomerNameChange,
  customerPhone,
  onCustomerPhoneChange,
  loyaltyOn,
  loyaltyCustomer,
  onLoyaltyCustomerChange,
  loyaltyMode,
  stampsRequired,
  canRedeemStamps,
  canRedeemPoints,
  redeemLoyalty,
  onRedeemLoyaltyChange,
  rewardBase,
  pointsDiscount,
  rewardLabel,
  canConfirm,
  onConfirm,
  isPending,
}: CheckoutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cobrar pedido</DialogTitle>
          <DialogDescription>Confirma el método de pago.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border p-3 space-y-1 text-sm font-mono bg-muted/30 max-h-48 overflow-y-auto">
            <p className="text-center font-bold">
              {businessName?.toUpperCase() ?? "AROMÁTICO CAFÉ"}
            </p>
            <div className="border-t border-dashed" />
            {cart.map((item) => {
              const product = products.find((p) => p.id === item.product_id);
              const promo = product ? getPromoForProduct(product) : undefined;
              const precioOriginal = product
                ? product.price * item.quantity
                : item.subtotal;
              const ahorro = precioOriginal - item.subtotal;
              return (
                <div key={item.product_id} className="space-y-0.5">
                  <div className="flex justify-between">
                    <span className="flex-1 truncate">
                      {item.quantity}x {item.product_name}
                    </span>
                    <span className="ml-1 shrink-0">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                  {ahorro > 0 && (
                    <div className="flex justify-between text-xs text-green-600">
                      <span>Descuento</span>
                      <span>-{formatCurrency(ahorro)}</span>
                    </div>
                  )}
                  {promo && (
                    <p className="text-xs text-amber-500">
                      🏷️{" "}
                      {promo.type === "2x1"
                        ? "2x1 aplicado"
                        : promo.type === "descuento_porcentaje"
                          ? `${promo.value}% OFF`
                          : promo.name}
                    </p>
                  )}
                </div>
              );
            })}
            <div className="border-t border-dashed" />
            {taxEnabled && (
              <>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Base gravable</span>
                  <span>{formatCurrency(totalBase)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {taxName} {taxPercent}%
                  </span>
                  <span>{formatCurrency(totalIVA)}</span>
                </div>
              </>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Descuento adicional</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="border-t border-dashed" />
            <div className="flex justify-between font-bold">
              <span>TOTAL</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descuento adicional</Label>
            <Input
              type="number"
              min="0"
              step="100"
              placeholder="0"
              value={discount}
              onChange={(e) => onDiscountChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Método de pago</Label>
              <button
                type="button"
                onClick={onToggleMixto}
                className={cn(
                  "text-xs px-2 py-1 rounded border transition-colors",
                  isMixto
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary",
                )}
              >
                Pago mixto
              </button>
            </div>
            {!isMixto && (
              <Select
                value={paymentMethod}
                onValueChange={(v) => onPaymentMethodChange(v as PaymentMethod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {!isMixto && paymentMethod === "efectivo" && (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
              <Label>Recibido</Label>
              <Input
                type="number"
                min="0"
                step="1000"
                placeholder="0"
                value={cashReceived}
                onChange={(e) => onCashReceivedChange(e.target.value)}
                autoFocus
              />
              <div className="flex flex-wrap gap-1">
                {[5000, 10000, 20000, 50000].map((v) => (
                  <Button
                    key={v}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 flex-1"
                    onClick={() => onCashReceivedChange(String(v))}
                  >
                    {formatCurrency(v)}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 flex-1"
                  onClick={() => onCashReceivedChange(String(total))}
                >
                  Exacto
                </Button>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">
                  {cashShort ? "Faltan" : "Vuelto"}
                </span>
                <span
                  className={cn(
                    "text-2xl font-bold",
                    cashShort ? "text-destructive" : "text-green-600",
                  )}
                >
                  {formatCurrency(cashShort ? total - cashReceivedNum : change)}
                </span>
              </div>
            </div>
          )}

          {isMixto && (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
              <div className="space-y-1">
                <Label className="text-xs">Efectivo</Label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  value={mixtoCash}
                  onChange={(e) => onMixtoCashChange(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tarjeta</Label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  value={mixtoCard}
                  onChange={(e) => onMixtoCardChange(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between pt-2 border-t text-sm">
                <span className="text-muted-foreground">Suma</span>
                <span
                  className={cn(
                    "font-bold",
                    mixtoShort ? "text-destructive" : "text-green-600",
                  )}
                >
                  {formatCurrency(mixtoSum)} / {formatCurrency(total)}
                </span>
              </div>
              {mixtoShort && (
                <p className="text-xs text-destructive">
                  Faltan {formatCurrency(total - mixtoSum)}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Notas</Label>
            <Input
              placeholder="Observaciones..."
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          </div>

          <CustomerSection
            mode={customerMode}
            onModeChange={onCustomerModeChange}
            customerName={customerName}
            onCustomerNameChange={onCustomerNameChange}
            customerPhone={customerPhone}
            onCustomerPhoneChange={onCustomerPhoneChange}
            loyaltyCustomer={loyaltyCustomer}
            onLoyaltyCustomerChange={onLoyaltyCustomerChange}
            loyaltyOn={loyaltyOn}
            loyaltyMode={loyaltyMode}
            stampsRequired={stampsRequired}
            canRedeemStamps={canRedeemStamps}
            canRedeemPoints={canRedeemPoints}
            redeemLoyalty={redeemLoyalty}
            onRedeemLoyaltyChange={onRedeemLoyaltyChange}
            rewardLabel={rewardLabel}
            rewardBase={rewardBase}
            pointsDiscount={pointsDiscount}
          />

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
              onClick={onConfirm}
              disabled={isPending || !canConfirm}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar cobro
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
