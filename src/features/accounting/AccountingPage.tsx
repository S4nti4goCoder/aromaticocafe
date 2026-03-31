import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Minus,
  Trash2,
  LockKeyhole,
  LockKeyholeOpen,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useTodayCashRegister,
  useOpenCashRegister,
  useCloseCashRegister,
  useTransactions,
  useDeleteTransaction,
  useTransactionSummary,
} from "@/hooks/useAccounting";
import { TransactionFormModal } from "@/features/accounting/TransactionFormModal";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import type { TransactionType } from "@/types";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);

const formatDateTime = (dateStr: string) =>
  new Date(dateStr).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function AccountingPage() {
  const [transactionModal, setTransactionModal] = useState<{
    open: boolean;
    type: TransactionType;
  }>({ open: false, type: "ingreso" });

  const [openCashModal, setOpenCashModal] = useState(false);
  const [closeCashModal, setCloseCashModal] = useState(false);
  const [openingAmount, setOpeningAmount] = useState("");
  const [closingAmount, setClosingAmount] = useState("");
  const [cashNotes, setCashNotes] = useState("");

  const { data: cashRegister, isLoading: loadingCash } = useTodayCashRegister();
  const { data: transactions = [], isLoading: loadingTransactions } =
    useTransactions(cashRegister?.id);
  const { data: summary } = useTransactionSummary();
  const openCash = useOpenCashRegister();
  const closeCash = useCloseCashRegister();
  const deleteTransaction = useDeleteTransaction();

  const isCashOpen = cashRegister?.status === "abierta";
  const isCashClosed = cashRegister?.status === "cerrada";

  const handleOpenCash = async () => {
    if (!openingAmount) return;
    await openCash.mutateAsync({
      opening_amount: parseFloat(openingAmount),
      notes: cashNotes || undefined,
    });
    setOpeningAmount("");
    setCashNotes("");
    setOpenCashModal(false);
  };

  const handleCloseCash = async () => {
    if (!cashRegister || !closingAmount) return;
    await closeCash.mutateAsync({
      id: cashRegister.id,
      closing_amount: parseFloat(closingAmount),
      notes: cashNotes || undefined,
    });
    setClosingAmount("");
    setCashNotes("");
    setCloseCashModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contabilidad</h2>
          <p className="text-muted-foreground text-sm">
            Control financiero de Aromático Café
          </p>
        </div>
      </div>

      {/* KPIs del mes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.0 }}
          className="rounded-lg border bg-card p-4 space-y-1"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Ingresos del mes</p>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {summary ? formatCurrency(summary.ingresos) : "—"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-lg border bg-card p-4 space-y-1"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Egresos del mes</p>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {summary ? formatCurrency(summary.egresos) : "—"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border bg-card p-4 space-y-1"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Balance del mes</p>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <p
            className={`text-2xl font-bold ${
              (summary?.balance ?? 0) >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {summary ? formatCurrency(summary.balance) : "—"}
          </p>
        </motion.div>
      </div>

      {/* Caja diaria */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
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
              <Button onClick={() => setOpenCashModal(true)}>
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
                  onClick={() => setCloseCashModal(true)}
                >
                  <LockKeyhole className="mr-2 h-4 w-4" />
                  Cerrar caja
                </Button>
              </PermissionGuard>
            </div>
          ) : (
            <Badge variant="secondary">Cerrada</Badge>
          )}
        </div>

        {cashRegister && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Monto apertura</p>
              <p className="font-medium">
                {formatCurrency(cashRegister.opening_amount)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Monto cierre</p>
              <p className="font-medium">
                {cashRegister.closing_amount
                  ? formatCurrency(cashRegister.closing_amount)
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Apertura</p>
              <p className="font-medium">
                {formatDateTime(cashRegister.opened_at)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Cierre</p>
              <p className="font-medium">
                {cashRegister.closed_at
                  ? formatDateTime(cashRegister.closed_at)
                  : "—"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Transacciones */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Transacciones de hoy</h3>
          {isCashOpen && (
            <PermissionGuard module="accounting" action="can_create">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                  onClick={() =>
                    setTransactionModal({ open: true, type: "ingreso" })
                  }
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Ingreso
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={() =>
                    setTransactionModal({ open: true, type: "egreso" })
                  }
                >
                  <Minus className="mr-1 h-4 w-4" />
                  Egreso
                </Button>
              </div>
            </PermissionGuard>
          )}
        </div>

        {loadingTransactions ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground border rounded-lg">
            <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay transacciones registradas hoy</p>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium">Categoría</th>
                  <th className="text-left px-4 py-3 font-medium">
                    Descripción
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Método</th>
                  <th className="text-left px-4 py-3 font-medium">Hora</th>
                  <th className="text-right px-4 py-3 font-medium">Monto</th>
                  <th className="text-right px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-t hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          transaction.type === "ingreso"
                            ? "default"
                            : "destructive"
                        }
                        className={
                          transaction.type === "ingreso" ? "bg-green-600" : ""
                        }
                      >
                        {transaction.type === "ingreso" ? "Ingreso" : "Egreso"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{transaction.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {transaction.description ?? "—"}
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">
                      {transaction.payment_method}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleTimeString(
                        "es-CO",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold ${
                        transaction.type === "ingreso"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {transaction.type === "ingreso" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <PermissionGuard module="accounting" action="can_delete">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() =>
                              deleteTransaction.mutate(transaction.id)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </PermissionGuard>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal abrir caja */}
      <Dialog open={openCashModal} onOpenChange={setOpenCashModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Abrir caja</DialogTitle>
            <DialogDescription>
              Ingresa el monto inicial de la caja para comenzar el día.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Monto de apertura *</Label>
              <Input
                type="number"
                min="0"
                step="1000"
                placeholder="0"
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Input
                placeholder="Observaciones opcionales..."
                value={cashNotes}
                onChange={(e) => setCashNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setOpenCashModal(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleOpenCash}
                disabled={!openingAmount || openCash.isPending}
              >
                {openCash.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Abrir caja
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal cerrar caja */}
      <Dialog open={closeCashModal} onOpenChange={setCloseCashModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cerrar caja</DialogTitle>
            <DialogDescription>
              Ingresa el monto final contado en caja al cierre del día.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Monto de cierre *</Label>
              <Input
                type="number"
                min="0"
                step="1000"
                placeholder="0"
                value={closingAmount}
                onChange={(e) => setClosingAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Input
                placeholder="Observaciones opcionales..."
                value={cashNotes}
                onChange={(e) => setCashNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCloseCashModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCloseCash}
                disabled={!closingAmount || closeCash.isPending}
              >
                {closeCash.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Cerrar caja
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal transacción */}
      <TransactionFormModal
        open={transactionModal.open}
        onClose={() => setTransactionModal({ open: false, type: "ingreso" })}
        defaultType={transactionModal.type}
        cashRegisterId={cashRegister?.id ?? null}
      />
    </div>
  );
}
