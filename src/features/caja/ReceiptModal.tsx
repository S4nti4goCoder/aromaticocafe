import { useRef } from "react";
import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import type { Sale, CartItem, Promotion } from "@/types";

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  sale: Sale | null;
  cartItems: CartItem[];
  promotions: Promotion[];
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);

const paymentLabels: Record<string, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
  otro: "Otro",
};

export function ReceiptModal({
  open,
  onClose,
  sale,
  cartItems,
  promotions,
}: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { settings: systemSettings } = useSystemSettings();

  const TAX_RATE = systemSettings?.tax_enabled
    ? (systemSettings.tax_percentage ?? 8) / 100
    : 0;
  const TAX_NAME = systemSettings?.tax_name ?? "IVA";
  const TAX_PERCENT = systemSettings?.tax_percentage ?? 8;

  const calcIVA = (amount: number) => amount - amount / (1 + TAX_RATE);
  const calcBase = (amount: number) => amount / (1 + TAX_RATE);

  if (!sale) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalIVA = calcIVA(subtotal);
  const totalBase = calcBase(subtotal);
  const total = Math.max(0, subtotal - sale.discount);

  const getPromoForItem = (item: CartItem): Promotion | undefined => {
    return promotions.find(
      (p) =>
        p.applies_to === "todos" ||
        (p.applies_to === "producto" && p.product_id === item.product_id),
    );
  };

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;
    const printWindow = window.open("", "_blank", "width=300,height=600");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recibo #${String(sale.sale_number ?? 0).padStart(5, "0")}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; font-size: 12px; width: 280px; padding: 8px; color: #000; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const handleDownloadPDF = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;
    const printWindow = window.open("", "_blank", "width=300,height=600");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recibo #${String(sale.sale_number ?? 0).padStart(5, "0")}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; font-size: 12px; width: 280px; padding: 8px; color: #000; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Recibo de venta</DialogTitle>
        </DialogHeader>

        <div
          ref={receiptRef}
          className="border rounded-lg p-4 font-mono text-xs space-y-1 bg-white text-black max-h-96 overflow-y-auto"
        >
          <p className="text-center font-bold text-sm">
            {systemSettings?.business_name?.toUpperCase() ?? "AROMÁTICO CAFÉ"}
          </p>
          {systemSettings?.business_nit && (
            <p className="text-center text-xs text-gray-500">
              NIT: {systemSettings.business_nit}
            </p>
          )}
          {systemSettings?.business_address && (
            <p className="text-center text-xs text-gray-500">
              {systemSettings.business_address}
            </p>
          )}
          {systemSettings?.business_city && (
            <p className="text-center text-xs text-gray-500">
              {systemSettings.business_city}
            </p>
          )}
          <p className="text-center text-xs text-gray-500">
            DOCUMENTO EQUIVALENTE
          </p>
          <p className="text-center font-bold">
            No. {String(sale.sale_number ?? 0).padStart(5, "0")}
          </p>
          <p className="text-center text-xs text-gray-500">
            {new Date(sale.created_at).toLocaleString("es-CO", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          <div className="border-t border-dashed border-gray-400 my-1" />

          {cartItems.map((item) => {
            const promo = getPromoForItem(item);
            const precioOriginal = item.product_price * item.quantity;
            const ahorro = precioOriginal - item.subtotal;

            return (
              <div key={item.product_id} className="space-y-0.5">
                <div className="flex justify-between">
                  <span className="flex-1 truncate">
                    {item.quantity}x {item.product_name}
                  </span>
                  <span className="ml-2 shrink-0">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Precio unit.</span>
                  <span>{formatCurrency(item.product_price)}</span>
                </div>
                {ahorro > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Descuento</span>
                    <span>-{formatCurrency(ahorro)}</span>
                  </div>
                )}
                {promo && (
                  <p className="text-yellow-700">
                    🏷️{" "}
                    {promo.type === "2x1"
                      ? "2x1 aplicado"
                      : promo.type === "descuento_porcentaje"
                        ? `${promo.value}% OFF`
                        : promo.name}
                  </p>
                )}
                {systemSettings?.tax_enabled && (
                  <div className="flex justify-between text-gray-500">
                    <span>
                      {TAX_NAME} {TAX_PERCENT}% incl.
                    </span>
                    <span>{formatCurrency(calcIVA(item.subtotal))}</span>
                  </div>
                )}
              </div>
            );
          })}

          <div className="border-t border-dashed border-gray-400 my-1" />

          {systemSettings?.tax_enabled && (
            <>
              <div className="flex justify-between text-gray-600">
                <span>Base gravable</span>
                <span>{formatCurrency(totalBase)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>
                  {TAX_NAME} {TAX_PERCENT}%
                </span>
                <span>{formatCurrency(totalIVA)}</span>
              </div>
            </>
          )}

          {sale.discount > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Descuento adicional</span>
              <span>-{formatCurrency(sale.discount)}</span>
            </div>
          )}

          <div className="border-t border-dashed border-gray-400 my-1" />

          <div className="flex justify-between font-bold text-sm">
            <span>TOTAL</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Método de pago</span>
            <span>
              {paymentLabels[sale.payment_method] ?? sale.payment_method}
            </span>
          </div>

          {sale.notes && (
            <>
              <div className="border-t border-dashed border-gray-400 my-1" />
              <p className="text-gray-600">Nota: {sale.notes}</p>
            </>
          )}

          <div className="border-t border-dashed border-gray-400 my-1" />
          <p className="text-center text-gray-500">¡Gracias por su compra!</p>
          <p className="text-center text-gray-500">
            {systemSettings?.business_name ?? "Aromático Café"}
          </p>
        </div>

        <div className="flex gap-2 mt-2">
          <Button variant="outline" className="flex-1" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDownloadPDF}
          >
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
