import { useRef } from "react";
import { Printer, Download } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { printHtml } from "@/lib/print";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface ClosingReportData {
  cafeName: string;
  businessName: string;
  businessNit?: string | null;
  date: string;
  openedAt?: string | null;
  closedAt?: string | null;
  openingAmount: number;
  salesCount: number;
  salesTotal: number;
  salesByMethod: Record<string, number>;
  totalDiscounts: number;
  voidedCount: number;
  ingresos: number;
  egresos: number;
  expectedCash: number;
  countedCash: number;
  difference: number;
  taxEnabled: boolean;
  taxName: string;
  taxPercent: number;
  /** True when shown mid-shift (before closing): no physical cash count yet. */
  preliminary?: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  data: ClosingReportData | null;
}

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
  otro: "Otro",
};

const formatDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export function CashClosingReportModal({ open, onClose, data }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  const base = data.taxEnabled
    ? data.salesTotal / (1 + data.taxPercent / 100)
    : data.salesTotal;
  const iva = data.salesTotal - base;

  const print = () => {
    const content = reportRef.current;
    if (!content) return;
    printHtml({
      title: `${data.preliminary ? "Reporte" : "Cierre de caja"} ${data.date}`,
      styles: `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #111; padding: 32px; max-width: 720px; margin: 0 auto; }
        h1 { font-size: 20px; margin-bottom: 2px; }
        .muted { color: #666; font-size: 12px; }
        .section { margin-top: 20px; }
        .section-title { font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: .04em; border-bottom: 2px solid #111; padding-bottom: 4px; margin-bottom: 8px; }
        .row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #eee; }
        .row.total { font-weight: 700; border-bottom: none; border-top: 2px solid #111; margin-top: 4px; padding-top: 8px; }
        .center { text-align: center; }
        .pos { color: #15803d; } .neg { color: #b91c1c; }
      `,
      bodyHtml: content.innerHTML,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {data.preliminary ? "Reporte del día" : "Reporte de cierre de caja"}
          </DialogTitle>
          <DialogDescription>
            Resumen del día. Imprímelo o guárdalo como PDF.
          </DialogDescription>
        </DialogHeader>

        <div
          ref={reportRef}
          className="border rounded-lg p-5 bg-white text-black text-sm space-y-1"
        >
          {/* Header */}
          <h1 className="text-lg font-bold text-center">
            {data.businessName || data.cafeName}
          </h1>
          {data.businessNit && (
            <p className="muted text-center text-xs text-gray-500">
              NIT: {data.businessNit}
            </p>
          )}
          <p className="text-center text-xs text-gray-500">
            {data.preliminary ? "REPORTE PRELIMINAR" : "CIERRE DE CAJA"} ·{" "}
            {data.date}
          </p>

          {/* Session */}
          <div className="section mt-4">
            <p className="section-title font-semibold uppercase tracking-wide border-b-2 border-black pb-1 mb-2">
              Sesión
            </p>
            <div className="row flex justify-between py-1 border-b border-gray-100">
              <span>Apertura</span>
              <span>{formatDate(data.openedAt)}</span>
            </div>
            <div className="row flex justify-between py-1 border-b border-gray-100">
              <span>Cierre</span>
              <span>{formatDate(data.closedAt)}</span>
            </div>
            <div className="row flex justify-between py-1">
              <span>Base inicial</span>
              <span>{formatCurrency(data.openingAmount)}</span>
            </div>
          </div>

          {/* Sales */}
          <div className="section mt-4">
            <p className="section-title font-semibold uppercase tracking-wide border-b-2 border-black pb-1 mb-2">
              Ventas
            </p>
            <div className="row flex justify-between py-1 border-b border-gray-100">
              <span># de ventas</span>
              <span>{data.salesCount}</span>
            </div>
            {Object.entries(data.salesByMethod).map(([method, amount]) => (
              <div
                key={method}
                className="row flex justify-between py-1 border-b border-gray-100"
              >
                <span>{PAYMENT_LABELS[method] ?? method}</span>
                <span>{formatCurrency(amount)}</span>
              </div>
            ))}
            {data.totalDiscounts > 0 && (
              <div className="row flex justify-between py-1 border-b border-gray-100 text-gray-600">
                <span>Descuentos otorgados</span>
                <span>-{formatCurrency(data.totalDiscounts)}</span>
              </div>
            )}
            {data.voidedCount > 0 && (
              <div className="row flex justify-between py-1 border-b border-gray-100 text-gray-600">
                <span>Ventas anuladas</span>
                <span>{data.voidedCount}</span>
              </div>
            )}
            <div className="row total flex justify-between font-bold border-t-2 border-black mt-1 pt-2">
              <span>Total ventas</span>
              <span>{formatCurrency(data.salesTotal)}</span>
            </div>
          </div>

          {/* Taxes */}
          {data.taxEnabled && (
            <div className="section mt-4">
              <p className="section-title font-semibold uppercase tracking-wide border-b-2 border-black pb-1 mb-2">
                Impuestos
              </p>
              <div className="row flex justify-between py-1 border-b border-gray-100">
                <span>Base gravable</span>
                <span>{formatCurrency(base)}</span>
              </div>
              <div className="row flex justify-between py-1">
                <span>
                  {data.taxName} ({data.taxPercent}%)
                </span>
                <span>{formatCurrency(iva)}</span>
              </div>
            </div>
          )}

          {/* Movements */}
          {(data.ingresos > 0 || data.egresos > 0) && (
            <div className="section mt-4">
              <p className="section-title font-semibold uppercase tracking-wide border-b-2 border-black pb-1 mb-2">
                Movimientos
              </p>
              <div className="row flex justify-between py-1 border-b border-gray-100">
                <span>Ingresos extra</span>
                <span>{formatCurrency(data.ingresos)}</span>
              </div>
              <div className="row flex justify-between py-1">
                <span>Egresos</span>
                <span>-{formatCurrency(data.egresos)}</span>
              </div>
            </div>
          )}

          {/* Cash count */}
          <div className="section mt-4">
            <p className="section-title font-semibold uppercase tracking-wide border-b-2 border-black pb-1 mb-2">
              Arqueo de efectivo
            </p>
            <div className="row flex justify-between py-1 border-b border-gray-100">
              <span>Efectivo esperado</span>
              <span>{formatCurrency(data.expectedCash)}</span>
            </div>
            {data.preliminary ? (
              <p className="text-xs text-gray-500 pt-2">
                El arqueo (conteo físico) y la diferencia se calculan al cerrar
                la caja.
              </p>
            ) : (
              <>
                <div className="row flex justify-between py-1 border-b border-gray-100">
                  <span>Efectivo contado</span>
                  <span>{formatCurrency(data.countedCash)}</span>
                </div>
                <div
                  className={`row total flex justify-between font-bold border-t-2 border-black mt-1 pt-2 ${
                    data.difference === 0
                      ? ""
                      : data.difference > 0
                        ? "pos text-green-700"
                        : "neg text-red-700"
                  }`}
                >
                  <span>Diferencia</span>
                  <span>
                    {data.difference > 0 ? "+" : ""}
                    {formatCurrency(data.difference)}
                  </span>
                </div>
              </>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 pt-4">
            Generado por {data.cafeName}
          </p>
        </div>

        <div className="flex flex-col gap-2 mt-2 sm:flex-row">
          <Button variant="outline" className="w-full sm:flex-1" onClick={print}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" className="w-full sm:flex-1" onClick={print}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button className="w-full sm:flex-1" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
