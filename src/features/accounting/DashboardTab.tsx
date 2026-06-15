import { motion } from "framer-motion";
import {
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/features/accounting/format";
import type { CashRegisterData, TodaySummaryData } from "@/features/accounting/types";

interface DashboardTabProps {
  todaySummary: TodaySummaryData;
  loadingCash: boolean;
  cashRegister: CashRegisterData;
  isCashOpen: boolean;
  expectedCash: number | null;
}

// "Hoy" tab: today's sales/income/expense/balance cards + quick register status.
export function DashboardTab({
  todaySummary,
  loadingCash,
  cashRegister,
  isCashOpen,
  expectedCash,
}: DashboardTabProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border bg-card p-4 space-y-1"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Ventas hoy</p>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">
            {todaySummary ? formatCurrency(todaySummary.ventasHoy) : "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            {todaySummary?.numVentas ?? 0} ventas
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-lg border bg-card p-4 space-y-1"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Ingresos hoy</p>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {todaySummary ? formatCurrency(todaySummary.ingresos) : "—"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border bg-card p-4 space-y-1"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Egresos hoy</p>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {todaySummary ? formatCurrency(todaySummary.egresos) : "—"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-lg border bg-card p-4 space-y-1"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Balance hoy</p>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <p
            className={`text-2xl font-bold ${
              (todaySummary?.balance ?? 0) >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {todaySummary ? formatCurrency(todaySummary.balance) : "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            {todaySummary?.totalTransacciones ?? 0} transacciones
          </p>
        </motion.div>
      </div>

      {/* Quick register status */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Caja del día</h3>
          </div>
          {loadingCash ? (
            <Skeleton className="h-6 w-20" />
          ) : !cashRegister ? (
            <Badge variant="secondary">Sin abrir</Badge>
          ) : isCashOpen ? (
            <Badge variant="default" className="bg-green-600">
              Abierta
            </Badge>
          ) : (
            <Badge variant="secondary">Cerrada</Badge>
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
            {cashRegister.closing_amount && expectedCash !== null && (
              <div>
                <p className="text-muted-foreground">Diferencia</p>
                <p
                  className={`font-medium ${
                    cashRegister.closing_amount - expectedCash >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(cashRegister.closing_amount - expectedCash)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
