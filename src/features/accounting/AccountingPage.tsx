import { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Minus,
  Trash2,
  Pencil,
  LockKeyhole,
  LockKeyholeOpen,
  Loader2,
  FileText,
  Users,
  Receipt,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
  History,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useTodayCashRegister,
  useCashRegisterHistory,
  useOpenCashRegister,
  useCloseCashRegister,
  useTransactions,
  useDeleteTransaction,
  useTransactionSummary,
  useTransactionSummaryPrevMonth,
  usePayrollReport,
  useTodaySummary,
  useCashDifference,
  type TransactionFilters,
} from "@/hooks/useAccounting";
import { TransactionFormModal } from "@/features/accounting/TransactionFormModal";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";
import type { Transaction, TransactionType } from "@/types";

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

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

export function AccountingPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [transactionModal, setTransactionModal] = useState<{
    open: boolean;
    type: TransactionType;
    editTransaction?: Transaction | null;
  }>({ open: false, type: "ingreso" });
  const [openCashModal, setOpenCashModal] = useState(false);
  const [closeCashModal, setCloseCashModal] = useState(false);
  const [openingAmount, setOpeningAmount] = useState("");
  const [closingAmount, setClosingAmount] = useState("");
  const [closingNotes, setClosingNotes] = useState("");
  const [expandedWorker, setExpandedWorker] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const reportRef = useRef<HTMLDivElement>(null);

  // Navegación por mes (resumen + nómina)
  const now = new Date();
  const [summaryYear, setSummaryYear] = useState(now.getFullYear());
  const [summaryMonth, setSummaryMonth] = useState(now.getMonth());
  const [payrollYear, setPayrollYear] = useState(now.getFullYear());
  const [payrollMonth, setPayrollMonth] = useState(now.getMonth());

  // Queries
  const { data: cashRegister, isLoading: loadingCash } =
    useTodayCashRegister();
  const { data: cashHistory = [], isLoading: loadingHistory } =
    useCashRegisterHistory();
  const { data: transactions = [], isLoading: loadingTransactions } =
    useTransactions(filters);
  const { data: summary } = useTransactionSummary(summaryYear, summaryMonth);
  const { data: prevSummary } = useTransactionSummaryPrevMonth(
    summaryYear,
    summaryMonth,
  );
  const { data: payroll = [], isLoading: loadingPayroll } = usePayrollReport(
    payrollYear,
    payrollMonth,
  );
  const { data: todaySummary } = useTodaySummary();
  const { data: cashDiff } = useCashDifference(cashRegister?.id ?? null);
  const openCash = useOpenCashRegister();
  const closeCash = useCloseCashRegister();
  const deleteTransaction = useDeleteTransaction();

  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedItems: paginatedTransactions,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination(transactions, 10);

  const isCashOpen = cashRegister?.status === "abierta";

  const expectedCash = useMemo(() => {
    if (!cashRegister || !cashDiff) return null;
    return (
      cashRegister.opening_amount + cashDiff.ingresos - cashDiff.egresos
    );
  }, [cashRegister, cashDiff]);

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
      notes: closingNotes || undefined,
    });
    setClosingAmount("");
    setClosingNotes("");
    setCloseCashModal(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteTransaction.mutateAsync(deleteTarget);
    setDeleteTarget(null);
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

  const handleExportTransactions = () => {
    const rows = transactions.map((t) => ({
      Tipo: t.type === "ingreso" ? "Ingreso" : "Egreso",
      Categoría: t.category,
      Descripción: t.description ?? "",
      "Método de pago": t.payment_method,
      Monto: Number(t.amount),
      Fecha: formatDateTime(t.created_at),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transacciones");
    XLSX.writeFile(wb, `transacciones_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleExportPayroll = () => {
    const rows = payroll.map((p) => ({
      Trabajador: p.worker.full_name,
      Cargo: p.worker.role,
      "Salario base": p.salarioBase,
      "Aux. transporte": p.auxilioTransporte,
      Comisión: p.comision,
      "Ventas mes": p.ventasMes,
      "Salud (-4%)": p.descuentos.saludTrabajador,
      "Pensión (-4%)": p.descuentos.pensionTrabajador,
      "Neto trabajador": p.netoTrabajador,
      "Costo empresa": p.costoTotalEmpresa,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Nómina");
    XLSX.writeFile(
      wb,
      `nomina_${MONTH_NAMES[payrollMonth].toLowerCase()}_${payrollYear}.xlsx`,
    );
  };

  const navigateSummary = (dir: -1 | 1) => {
    let m = summaryMonth + dir;
    let y = summaryYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setSummaryMonth(m);
    setSummaryYear(y);
  };

  const navigatePayroll = (dir: -1 | 1) => {
    let m = payrollMonth + dir;
    let y = payrollYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setPayrollMonth(m);
    setPayrollYear(y);
  };

  const isCurrentSummary =
    summaryYear === now.getFullYear() && summaryMonth === now.getMonth();
  const isCurrentPayroll =
    payrollYear === now.getFullYear() && payrollMonth === now.getMonth();

  const totalNomina = payroll.reduce((sum, p) => sum + p.netoTrabajador, 0);
  const totalCostoEmpresa = payroll.reduce(
    (sum, p) => sum + p.costoTotalEmpresa,
    0,
  );

  const hasActiveFilters =
    filters.type || filters.category || filters.payment_method || filters.startDate || filters.endDate;

  const clearFilters = () => setFilters({});

  // Past cash registers (exclude today)
  const pastCashRegisters = cashHistory.filter(
    (cr) => cr.date !== new Date().toISOString().split("T")[0],
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* ── Custom Tab Navigation ── */}
        <nav className="flex gap-1.5 p-1.5 rounded-xl bg-muted/40 border border-border/50 backdrop-blur-sm">
          {([
            { value: "dashboard", label: "Hoy", icon: LayoutDashboard, accent: "text-blue-400" },
            { value: "resumen", label: "Resumen", icon: TrendingUp, accent: "text-emerald-400" },
            { value: "transacciones", label: "Transacciones", icon: Receipt, accent: "text-amber-400" },
            { value: "nomina", label: "Nómina", icon: Users, accent: "text-violet-400" },
            { value: "caja", label: "Caja", icon: DollarSign, accent: "text-rose-400" },
          ] as const).map((tab) => {
            const isActive = activeTab === tab.value;
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`relative flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground/80"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="accounting-tab-indicator"
                    className="absolute inset-0 rounded-lg bg-background shadow-sm border border-border/80"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <Icon className={`h-4 w-4 transition-colors duration-200 ${isActive ? tab.accent : ""}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* ── TAB DASHBOARD HOY ── */}
        <TabsContent value="dashboard" className="mt-4 space-y-4">
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

          {/* Caja rápida */}
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
                      {formatCurrency(
                        cashRegister.closing_amount - expectedCash,
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── TAB RESUMEN ── */}
        <TabsContent value="resumen" className="mt-4 space-y-4">
          {/* Navegación mes */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateSummary(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-semibold">
              {MONTH_NAMES[summaryMonth]} {summaryYear}
            </h3>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateSummary(1)}
              disabled={isCurrentSummary}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

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
              {prevSummary && summary && (
                <PctBadge
                  value={pctChange(summary.ingresos, prevSummary.ingresos)}
                />
              )}
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
              {prevSummary && summary && (
                <PctBadge
                  value={pctChange(summary.egresos, prevSummary.egresos)}
                  invertColor
                />
              )}
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
              {prevSummary && summary && (
                <PctBadge
                  value={pctChange(summary.balance, prevSummary.balance)}
                />
              )}
            </motion.div>
          </div>

          {/* Top categorías */}
          {summary &&
            (summary.topIngresos.length > 0 ||
              summary.topEgresos.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {summary.topIngresos.length > 0 && (
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Top ingresos
                    </h4>
                    {summary.topIngresos.map((cat, i) => (
                      <div
                        key={cat.category}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-4">
                            {i + 1}.
                          </span>
                          <span>{cat.category}</span>
                          <span className="text-xs text-muted-foreground">
                            ({cat.count})
                          </span>
                        </div>
                        <span className="font-medium text-green-600">
                          {formatCurrency(cat.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {summary.topEgresos.length > 0 && (
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      Top egresos
                    </h4>
                    {summary.topEgresos.map((cat, i) => (
                      <div
                        key={cat.category}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-4">
                            {i + 1}.
                          </span>
                          <span>{cat.category}</span>
                          <span className="text-xs text-muted-foreground">
                            ({cat.count})
                          </span>
                        </div>
                        <span className="font-medium text-red-600">
                          {formatCurrency(cat.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          {/* Gráfico diario */}
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={hasActiveFilters ? "border-primary text-primary" : ""}
              >
                <Filter className="mr-1 h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    !
                  </Badge>
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-1 h-4 w-4" />
                  Limpiar
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportTransactions}
                disabled={transactions.length === 0}
              >
                <Download className="mr-1 h-4 w-4" />
                Excel
              </Button>
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
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg border bg-card p-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Tipo</Label>
                  <Select
                    value={filters.type ?? "all"}
                    onValueChange={(v) =>
                      setFilters((f) => ({
                        ...f,
                        type: v === "all" ? undefined : (v as "ingreso" | "egreso"),
                      }))
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="ingreso">Ingreso</SelectItem>
                      <SelectItem value="egreso">Egreso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Categoría</Label>
                  <Select
                    value={filters.category ?? "all"}
                    onValueChange={(v) =>
                      setFilters((f) => ({
                        ...f,
                        category: v === "all" ? undefined : v,
                      }))
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="all">Todas</SelectItem>
                      {[
                        "Venta",
                        "Propina",
                        "Otro ingreso",
                        "Insumos",
                        "Servicios",
                        "Nómina",
                        "Arriendo",
                        "Mantenimiento",
                        "Otro egreso",
                      ].map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Método de pago</Label>
                  <Select
                    value={filters.payment_method ?? "all"}
                    onValueChange={(v) =>
                      setFilters((f) => ({
                        ...f,
                        payment_method:
                          v === "all"
                            ? undefined
                            : (v as "efectivo" | "tarjeta" | "transferencia" | "otro"),
                      }))
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Desde</Label>
                  <Input
                    type="date"
                    className="h-9"
                    value={filters.startDate ?? ""}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        startDate: e.target.value || undefined,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Hasta</Label>
                  <Input
                    type="date"
                    className="h-9"
                    value={filters.endDate ?? ""}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        endDate: e.target.value || undefined,
                      }))
                    }
                  />
                </div>
              </div>
            </motion.div>
          )}

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
            <>
              <div className="rounded-lg border overflow-x-auto">
                <table className="w-full text-sm min-w-175">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Tipo</th>
                      <th className="text-left px-4 py-3 font-medium">
                        Categoría
                      </th>
                      <th className="text-left px-4 py-3 font-medium">
                        Descripción
                      </th>
                      <th className="text-left px-4 py-3 font-medium">
                        Método
                      </th>
                      <th className="text-left px-4 py-3 font-medium">Fecha</th>
                      <th className="text-right px-4 py-3 font-medium">
                        Monto
                      </th>
                      <th className="text-right px-4 py-3 font-medium">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTransactions.map((transaction, index) => (
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
                              transaction.type === "ingreso"
                                ? "bg-green-600"
                                : ""
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
                          <div className="flex justify-end gap-1">
                            <PermissionGuard
                              module="accounting"
                              action="can_edit"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setTransactionModal({
                                    open: true,
                                    type: transaction.type,
                                    editTransaction: transaction,
                                  })
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard
                              module="accounting"
                              action="can_delete"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteTarget(transaction.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                itemsPerPageOptions={[10, 25, 50, 100]}
              />
            </>
          )}
        </TabsContent>

        {/* ── TAB NÓMINA ── */}
        <TabsContent value="nomina" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigatePayroll(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <h3 className="font-semibold">Reporte de nómina</h3>
                <p className="text-xs text-muted-foreground">
                  {MONTH_NAMES[payrollMonth]} {payrollYear}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigatePayroll(1)}
                disabled={isCurrentPayroll}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPayroll}
                disabled={payroll.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrintReport}>
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
                Reporte Nómina — {MONTH_NAMES[payrollMonth]} {payrollYear}
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
          {/* Caja de hoy */}
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
                    {new Date(cashRegister.opened_at).toLocaleTimeString(
                      "es-CO",
                      { hour: "2-digit", minute: "2-digit" },
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Diferencia al cierre */}
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

          {/* Historial de cajas */}
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
              <div className="rounded-lg border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium">Fecha</th>
                      <th className="text-right px-4 py-2 font-medium">
                        Apertura
                      </th>
                      <th className="text-right px-4 py-2 font-medium">
                        Cierre
                      </th>
                      <th className="text-right px-4 py-2 font-medium">
                        Diferencia
                      </th>
                      <th className="text-center px-4 py-2 font-medium">
                        Estado
                      </th>
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
                            className={
                              cr.status === "abierta" ? "bg-green-600" : ""
                            }
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

      {/* Modal cerrar caja con notas */}
      <Dialog open={closeCashModal} onOpenChange={setCloseCashModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cerrar caja</DialogTitle>
            <DialogDescription>
              Ingresa el monto final contado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {expectedCash !== null && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p className="text-muted-foreground">Monto esperado</p>
                <p className="text-lg font-bold">{formatCurrency(expectedCash)}</p>
              </div>
            )}
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
              {closingAmount && expectedCash !== null && (
                <p
                  className={`text-xs ${
                    parseFloat(closingAmount) - expectedCash >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  Diferencia:{" "}
                  {formatCurrency(parseFloat(closingAmount) - expectedCash)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Notas de cierre</Label>
              <Textarea
                placeholder="Observaciones opcionales..."
                rows={2}
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
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

      {/* Modal transacción (crear / editar) */}
      <TransactionFormModal
        open={transactionModal.open}
        onClose={() =>
          setTransactionModal({ open: false, type: "ingreso" })
        }
        defaultType={transactionModal.type}
        cashRegisterId={cashRegister?.id ?? null}
        editTransaction={transactionModal.editTransaction}
      />

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar transacción"
        description="Esta acción no se puede deshacer. ¿Estás seguro?"
        confirmLabel="Eliminar"
        destructive
        loading={deleteTransaction.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

// ── Helper: Porcentaje de cambio ──

function PctBadge({
  value,
  invertColor = false,
}: {
  value: number | null;
  invertColor?: boolean;
}) {
  if (value === null) return null;
  const isPositive = value >= 0;
  const colorClass = invertColor
    ? isPositive
      ? "text-red-600"
      : "text-green-600"
    : isPositive
      ? "text-green-600"
      : "text-red-600";

  return (
    <div className={`flex items-center gap-1 text-xs ${colorClass}`}>
      {isPositive ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      <span>{Math.abs(value).toFixed(1)}% vs mes anterior</span>
    </div>
  );
}
