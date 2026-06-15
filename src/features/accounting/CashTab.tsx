import { LockKeyhole, LockKeyholeOpen, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { ResponsiveTableWrapper } from "@/components/shared/ResponsiveTableWrapper";
import { formatCurrency } from "@/features/accounting/format";
import type { CashRegisterData } from "@/features/accounting/types";

interface CashTabProps {
  loadingCash: boolean;
  cashRegister: CashRegisterData;
  isCashOpen: boolean;
  expectedCash: number | null;
  onOpenCash: () => void;
  onCloseCash: () => void;
  loadingHistory: boolean;
  pastCashRegisters: NonNullable<CashRegisterData>[];
}

// "Caja" tab: today's register status + open/close actions and history table.
export function CashTab({
  loadingCash,
  cashRegister,
  isCashOpen,
  expectedCash,
  onOpenCash,
  onCloseCash,
  loadingHistory,
  pastCashRegisters,
}: CashTabProps) {
  return (
    <>
      {/* Today's register */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold">Caja del día</h3>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("es-CO", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {loadingCash ? (
            <Skeleton className="h-9 w-32" />
          ) : !cashRegister ? (
            <PermissionGuard module="accounting" action="can_create">
              <Button onClick={onOpenCash} className="w-full sm:w-auto">
                <LockKeyholeOpen className="mr-2 h-4 w-4" />
                Abrir caja
              </Button>
            </PermissionGuard>
          ) : isCashOpen ? (
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-600">
                Abierta
              </Badge>
              <PermissionGuard module="accounting" action="can_edit">
                <Button
                  variant="outline"
                  onClick={onCloseCash}
                  className="flex-1 sm:flex-none"
                >
                  <LockKeyhole className="mr-2 h-4 w-4" />
                  Cerrar caja
                </Button>
              </PermissionGuard>
            </div>
          ) : (
            <Badge variant="secondary" className="w-fit">
              Cerrada
            </Badge>
          )}
        </div>

        {cashRegister && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Apertura</p>
              <p className="font-medium">
                {formatCurrency(cashRegister.opening_amount)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Esperado</p>
              <p className="font-medium">
                {expectedCash !== null ? formatCurrency(expectedCash) : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Cierre</p>
              <p className="font-medium">
                {cashRegister.closing_amount
                  ? formatCurrency(cashRegister.closing_amount)
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Hora apertura</p>
              <p className="font-medium">
                {new Date(cashRegister.opened_at).toLocaleTimeString("es-CO", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        )}

        {/* Closing difference */}
        {cashRegister?.closing_amount && expectedCash !== null && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Diferencia (contado - esperado)
              </span>
              <span
                className={`font-bold ${
                  cashRegister.closing_amount - expectedCash >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatCurrency(cashRegister.closing_amount - expectedCash)}
              </span>
            </div>
            {cashRegister.notes && (
              <p className="text-xs text-muted-foreground mt-1">
                Nota: {cashRegister.notes}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Register history */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Historial de cajas</h3>
        </div>

        {loadingHistory ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : pastCashRegisters.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No hay registros anteriores
          </p>
        ) : (
          <ResponsiveTableWrapper>
            <table className="w-full text-sm min-w-150">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Fecha</th>
                  <th className="text-right px-4 py-2 font-medium">Apertura</th>
                  <th className="text-right px-4 py-2 font-medium">Cierre</th>
                  <th className="text-right px-4 py-2 font-medium">
                    Diferencia
                  </th>
                  <th className="text-center px-4 py-2 font-medium">Estado</th>
                  <th className="text-left px-4 py-2 font-medium">Notas</th>
                </tr>
              </thead>
              <tbody>
                {pastCashRegisters.map((cr) => (
                  <tr
                    key={cr.id}
                    className="border-t hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-2">
                      {new Date(cr.date + "T12:00:00").toLocaleDateString(
                        "es-CO",
                        {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                        },
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(cr.opening_amount)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {cr.closing_amount
                        ? formatCurrency(cr.closing_amount)
                        : "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {cr.closing_amount ? (
                        <span
                          className={
                            cr.closing_amount - cr.opening_amount >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {formatCurrency(
                            cr.closing_amount - cr.opening_amount,
                          )}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Badge
                        variant={
                          cr.status === "abierta" ? "default" : "secondary"
                        }
                        className={cr.status === "abierta" ? "bg-green-600" : ""}
                      >
                        {cr.status === "abierta" ? "Abierta" : "Cerrada"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground max-w-40 truncate">
                      {cr.notes ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ResponsiveTableWrapper>
        )}
      </div>
    </>
  );
}
