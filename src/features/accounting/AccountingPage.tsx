import { useState, useRef } from "react";
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
  FileText,
  Users,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useTodayCashRegister,
  useOpenCashRegister,
  useCloseCashRegister,
  useTransactions,
  useDeleteTransaction,
  useTransactionSummary,
  usePayrollReport,
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
  const [expandedWorker, setExpandedWorker] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const { data: cashRegister, isLoading: loadingCash } = useTodayCashRegister();
  const { data: transactions = [], isLoading: loadingTransactions } =
    useTransactions();
  const { data: summary } = useTransactionSummary();
  const { data: payroll = [], isLoading: loadingPayroll } = usePayrollReport();
  const openCash = useOpenCashRegister();
  const closeCash = useCloseCashRegister();
  const deleteTransaction = useDeleteTransaction();

  const isCashOpen = cashRegister?.status === "abierta";

  const handleOpenCash = async () => {
    if (!openingAmount) return;
    await openCash.mutateAsync({ opening_amount: parseFloat(openingAmount) });
    setOpeningAmount("");
    setOpenCashModal(false);
  };

  const handleCloseCash = async () => {
    if (!cashRegister || !closingAmount) return;
    await closeCash.mutateAsync({
      id: cashRegister.id,
      closing_amount: parseFloat(closingAmount),
    });
    setClosingAmount("");
    setCloseCashModal(false);
  };

  const handlePrintReport = () => {
    const content = reportRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=800,height=600");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html>
      <head>
        <title>Reporte Nómina</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
          th { background: #f5f5f5; font-weight: bold; }
          h1 { font-size: 18px; }
          h2 { font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>${content.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  const totalNomina = payroll.reduce((sum, p) => sum + p.netoTrabajador, 0);
  const totalCostoEmpresa = payroll.reduce(
    (sum, p) => sum + p.costoTotalEmpresa,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contabilidad</h2>
          <p className="text-muted-foreground text-sm">
            Control financiero de Aromático Café
          </p>
        </div>
      </div>

      <Tabs defaultValue="resumen">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="resumen" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="transacciones" className="gap-2">
            <Receipt className="h-4 w-4" />
            Transacciones
          </TabsTrigger>
          <TabsTrigger value="nomina" className="gap-2">
            <Users className="h-4 w-4" />
            Nómina
          </TabsTrigger>
          <TabsTrigger value="caja" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Caja
          </TabsTrigger>
        </TabsList>

        {/* ── TAB RESUMEN ── */}
        <TabsContent value="resumen" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border bg-card p-4 space-y-1"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Ingresos del mes
                </p>
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

          {/* Gráfico ingresos vs egresos */}
          {summary && summary.chartData.length > 0 && (
            <div className="rounded-lg border bg-card p-4 space-y-4">
              <h3 className="font-semibold">Ingresos vs Egresos del mes</h3>
              <div className="space-y-2">
                {summary.chartData.map((day, i) => {
                  const maxVal = Math.max(
                    ...summary.chartData.map((d) =>
                      Math.max(d.ingresos, d.egresos),
                    ),
                    1,
                  );
                  return (
                    <div key={i} className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        {day.date}
                      </p>
                      <div className="flex gap-1 items-center">
                        <span className="text-xs text-green-600 w-4">I</span>
                        <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${(day.ingresos / maxVal) * 100}%`,
                            }}
                            transition={{ delay: i * 0.05, duration: 0.4 }}
                            className="h-full bg-green-500 rounded-full"
                          />
                        </div>
                        <span className="text-xs w-24 text-right">
                          {formatCurrency(day.ingresos)}
                        </span>
                      </div>
                      {day.egresos > 0 && (
                        <div className="flex gap-1 items-center">
                          <span className="text-xs text-red-600 w-4">E</span>
                          <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${(day.egresos / maxVal) * 100}%`,
                              }}
                              transition={{ delay: i * 0.05, duration: 0.4 }}
                              className="h-full bg-red-500 rounded-full"
                            />
                          </div>
                          <span className="text-xs w-24 text-right">
                            {formatCurrency(day.egresos)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── TAB TRANSACCIONES ── */}
        <TabsContent value="transacciones" className="mt-4 space-y-4">
          <div className="flex justify-end gap-2">
            <PermissionGuard module="accounting" action="can_create">
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 border-green-600"
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
                className="text-red-600 border-red-600"
                onClick={() =>
                  setTransactionModal({ open: true, type: "egreso" })
                }
              >
                <Minus className="mr-1 h-4 w-4" />
                Egreso
              </Button>
            </PermissionGuard>
          </div>

          {loadingTransactions ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Receipt className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No hay transacciones registradas</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Tipo</th>
                    <th className="text-left px-4 py-3 font-medium">
                      Categoría
                    </th>
                    <th className="text-left px-4 py-3 font-medium">
                      Descripción
                    </th>
                    <th className="text-left px-4 py-3 font-medium">Método</th>
                    <th className="text-left px-4 py-3 font-medium">Fecha</th>
                    <th className="text-right px-4 py-3 font-medium">Monto</th>
                    <th className="text-right px-4 py-3 font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
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
                          {transaction.type === "ingreso"
                            ? "Ingreso"
                            : "Egreso"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{transaction.category}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {transaction.description ?? "—"}
                      </td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">
                        {transaction.payment_method}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {formatDateTime(transaction.created_at)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-semibold ${
                          transaction.type === "ingreso"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {transaction.type === "ingreso" ? "+" : "-"}
                        {formatCurrency(Number(transaction.amount))}
                      </td>
                      <td className="px-4 py-3">
                        <PermissionGuard
                          module="accounting"
                          action="can_delete"
                        >
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
        </TabsContent>

        {/* ── TAB NÓMINA ── */}
        <TabsContent value="nomina" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Reporte de nómina</h3>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString("es-CO", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handlePrintReport}>
              <FileText className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>

          {/* Resumen nómina */}
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
              <p className="text-xs text-muted-foreground">
                Costo total empresa
              </p>
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
                Reporte Nómina —{" "}
                {new Date().toLocaleDateString("es-CO", {
                  month: "long",
                  year: "numeric",
                })}
              </h1>
              {payroll.map((item) => (
                <div
                  key={item.worker.id}
                  className="rounded-lg border bg-card overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                    onClick={() =>
                      setExpandedWorker(
                        expandedWorker === item.worker.id
                          ? null
                          : item.worker.id,
                      )
                    }
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
                      {/* Vista empleado */}
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
                              Comisión ({item.worker.commission_percentage}%
                              sobre {formatCurrency(item.ventasMes)})
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
                              -
                              {formatCurrency(
                                item.descuentos.pensionTrabajador,
                              )}
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

                      {/* Costo empleador */}
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
                            {formatCurrency(
                              item.costoEmpleador.pensionEmpleador,
                            )}
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
        </TabsContent>

        {/* ── TAB CAJA ── */}
        <TabsContent value="caja" className="mt-4 space-y-4">
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
                  <p className="text-muted-foreground">Apertura</p>
                  <p className="font-medium">
                    {formatCurrency(cashRegister.opening_amount)}
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
                    {new Date(cashRegister.opened_at).toLocaleTimeString(
                      "es-CO",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Hora cierre</p>
                  <p className="font-medium">
                    {cashRegister.closed_at
                      ? new Date(cashRegister.closed_at).toLocaleTimeString(
                          "es-CO",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                      : "—"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal abrir caja */}
      <Dialog open={openCashModal} onOpenChange={setOpenCashModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Abrir caja</DialogTitle>
            <DialogDescription>
              Ingresa el monto inicial de la caja.
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
              Ingresa el monto final contado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Monto contado *</Label>
              <Input
                type="number"
                min="0"
                step="1000"
                placeholder="0"
                value={closingAmount}
                onChange={(e) => setClosingAmount(e.target.value)}
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
