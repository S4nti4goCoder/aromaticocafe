import { ChevronLeft, ChevronRight, Download, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, MONTH_NAMES } from "@/features/accounting/format";
import type { PayrollRow } from "@/features/accounting/types";

interface PayrollTabProps {
  month: number;
  year: number;
  isCurrent: boolean;
  onPrev: () => void;
  onNext: () => void;
  onExport: () => void;
  onPrint: () => void;
  payroll: PayrollRow[];
  loadingPayroll: boolean;
  totalNomina: number;
  totalCostoEmpresa: number;
  expandedWorker: string | null;
  onToggleWorker: (id: string) => void;
  reportRef: React.RefObject<HTMLDivElement | null>;
}

// "Nómina" tab: month navigation, export buttons, totals, and a per-worker
// payroll breakdown (employee net + employer cost) that doubles as the PDF body.
export function PayrollTab({
  month,
  year,
  isCurrent,
  onPrev,
  onNext,
  onExport,
  onPrint,
  payroll,
  loadingPayroll,
  totalNomina,
  totalCostoEmpresa,
  expandedWorker,
  onToggleWorker,
  reportRef,
}: PayrollTabProps) {
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 justify-between sm:justify-start">
          <Button variant="outline" size="icon" className="shrink-0" onClick={onPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <h3 className="font-semibold">Reporte de nómina</h3>
            <p className="text-xs text-muted-foreground">
              {MONTH_NAMES[month]} {year}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={onNext}
            disabled={isCurrent}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={payroll.length === 0}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onPrint}
            className="w-full sm:w-auto"
          >
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">
            Total a pagar empleados
          </p>
          <p className="text-xl font-bold text-primary">
            {formatCurrency(totalNomina)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Costo total empresa</p>
          <p className="text-xl font-bold text-red-600">
            {formatCurrency(totalCostoEmpresa)}
          </p>
        </div>
      </div>

      {loadingPayroll ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : payroll.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No hay trabajadores activos</p>
        </div>
      ) : (
        <div ref={reportRef} className="space-y-3">
          <h1 className="hidden">
            Reporte Nómina — {MONTH_NAMES[month]} {year}
          </h1>
          {payroll.map((item) => (
            <div
              key={item.worker.id}
              className="rounded-lg border bg-card overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                onClick={() => onToggleWorker(item.worker.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                    {item.worker.full_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{item.worker.full_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {item.worker.role}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    {formatCurrency(item.netoTrabajador)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Neto a recibir
                  </p>
                </div>
              </button>

              {expandedWorker === item.worker.id && (
                <div className="border-t p-4 space-y-3 text-sm">
                  <div className="space-y-1">
                    <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                      Liquidación empleado
                    </p>
                    <div className="flex justify-between">
                      <span>Salario base</span>
                      <span>{formatCurrency(item.salarioBase)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auxilio de transporte</span>
                      <span>{formatCurrency(item.auxilioTransporte)}</span>
                    </div>
                    {item.comision > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>
                          Comisión ({item.worker.commission_percentage}% sobre{" "}
                          {formatCurrency(item.ventasMes)})
                        </span>
                        <span>+{formatCurrency(item.comision)}</span>
                      </div>
                    )}
                    <div className="border-t pt-1 space-y-1">
                      <div className="flex justify-between text-red-600">
                        <span>Salud trabajador (4%)</span>
                        <span>
                          -{formatCurrency(item.descuentos.saludTrabajador)}
                        </span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Pensión trabajador (4%)</span>
                        <span>
                          -{formatCurrency(item.descuentos.pensionTrabajador)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-1">
                      <span>NETO A RECIBIR</span>
                      <span className="text-primary">
                        {formatCurrency(item.netoTrabajador)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 bg-muted/30 rounded-lg p-3">
                    <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                      Aportes empleador (adicionales)
                    </p>
                    <div className="flex justify-between">
                      <span>Salud EPS (8.5%)</span>
                      <span>
                        {formatCurrency(item.costoEmpleador.saludEmpleador)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pensión AFP (12%)</span>
                      <span>
                        {formatCurrency(item.costoEmpleador.pensionEmpleador)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>ARL (0.522%)</span>
                      <span>{formatCurrency(item.costoEmpleador.arl)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Parafiscales (9%)</span>
                      <span>
                        {formatCurrency(item.costoEmpleador.parafiscales)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-1 text-red-600">
                      <span>COSTO TOTAL EMPRESA</span>
                      <span>{formatCurrency(item.costoTotalEmpresa)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
