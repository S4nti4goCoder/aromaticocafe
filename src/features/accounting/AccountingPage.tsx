import { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Users,
  Receipt,
  LayoutDashboard,
} from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
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
import { OpenCashModal } from "@/features/accounting/OpenCashModal";
import { CloseCashModal } from "@/features/accounting/CloseCashModal";
import { DashboardTab } from "@/features/accounting/DashboardTab";
import { CashTab } from "@/features/accounting/CashTab";
import { SummaryTab } from "@/features/accounting/SummaryTab";
import { PayrollTab } from "@/features/accounting/PayrollTab";
import { TransactionsTab } from "@/features/accounting/TransactionsTab";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { usePagination } from "@/hooks/usePagination";
import { formatDateTime, MONTH_NAMES } from "@/features/accounting/format";
import { printHtml } from "@/lib/print";
import { localDateString } from "@/lib/localDate";
import type { Transaction, TransactionType } from "@/types";

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

  // Month navigation (summary + payroll)
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
  } = usePagination(transactions, 8);

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
    printHtml({
      title: "Reporte Nómina",
      styles: `
        body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background: #f5f5f5; font-weight: bold; }
        h1 { font-size: 18px; }
        h2 { font-size: 14px; margin-top: 20px; }
      `,
      bodyHtml: content.innerHTML,
    });
  };

  const handleExportTransactions = async () => {
    const XLSX = await import("xlsx");
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
    XLSX.writeFile(wb, `transacciones_${localDateString()}.xlsx`);
  };

  const handleExportPayroll = async () => {
    const XLSX = await import("xlsx");
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

  // Past cash registers (exclude today). Día local: con toISOString, de
  // noche "hoy" sería mañana en UTC y la caja de hoy caería como pasada.
  const pastCashRegisters = cashHistory.filter(
    (cr) => cr.date !== localDateString(),
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

        {/* ── TODAY DASHBOARD TAB ── */}
        <TabsContent value="dashboard" className="mt-4 space-y-4">
          <DashboardTab
            todaySummary={todaySummary}
            loadingCash={loadingCash}
            cashRegister={cashRegister}
            isCashOpen={isCashOpen}
            expectedCash={expectedCash}
          />
        </TabsContent>

        {/* ── SUMMARY TAB ── */}
        <TabsContent value="resumen" className="mt-4 space-y-4">
          <SummaryTab
            month={summaryMonth}
            year={summaryYear}
            isCurrent={isCurrentSummary}
            onPrev={() => navigateSummary(-1)}
            onNext={() => navigateSummary(1)}
            summary={summary}
            prevSummary={prevSummary}
          />
        </TabsContent>

        {/* ── TRANSACTIONS TAB ── */}
        <TabsContent value="transacciones" className="mt-4 space-y-4">
          <TransactionsTab
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            filters={filters}
            onFiltersChange={setFilters}
            transactions={transactions}
            loadingTransactions={loadingTransactions}
            paginatedTransactions={paginatedTransactions}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            onExport={handleExportTransactions}
            onNewTransaction={(type) => setTransactionModal({ open: true, type })}
            onEditTransaction={(transaction) =>
              setTransactionModal({
                open: true,
                type: transaction.type,
                editTransaction: transaction,
              })
            }
            onDeleteTransaction={setDeleteTarget}
          />
        </TabsContent>

        {/* ── PAYROLL TAB ── */}
        <TabsContent value="nomina" className="mt-4 space-y-4">
          <PayrollTab
            month={payrollMonth}
            year={payrollYear}
            isCurrent={isCurrentPayroll}
            onPrev={() => navigatePayroll(-1)}
            onNext={() => navigatePayroll(1)}
            onExport={handleExportPayroll}
            onPrint={handlePrintReport}
            payroll={payroll}
            loadingPayroll={loadingPayroll}
            totalNomina={totalNomina}
            totalCostoEmpresa={totalCostoEmpresa}
            expandedWorker={expandedWorker}
            onToggleWorker={(id) =>
              setExpandedWorker(expandedWorker === id ? null : id)
            }
            reportRef={reportRef}
          />
        </TabsContent>

        {/* ── CASH REGISTER TAB ── */}
        <TabsContent value="caja" className="mt-4 space-y-4">
          <CashTab
            loadingCash={loadingCash}
            cashRegister={cashRegister}
            isCashOpen={isCashOpen}
            expectedCash={expectedCash}
            onOpenCash={() => setOpenCashModal(true)}
            onCloseCash={() => setCloseCashModal(true)}
            loadingHistory={loadingHistory}
            pastCashRegisters={pastCashRegisters}
          />
        </TabsContent>
      </Tabs>

      {/* Open-register modal */}
      <OpenCashModal
        open={openCashModal}
        onOpenChange={setOpenCashModal}
        openingAmount={openingAmount}
        onOpeningAmountChange={setOpeningAmount}
        onConfirm={handleOpenCash}
        isPending={openCash.isPending}
      />

      <CloseCashModal
        open={closeCashModal}
        onOpenChange={setCloseCashModal}
        expectedCash={expectedCash}
        closingAmount={closingAmount}
        onClosingAmountChange={setClosingAmount}
        closingNotes={closingNotes}
        onClosingNotesChange={setClosingNotes}
        onConfirm={handleCloseCash}
        isPending={closeCash.isPending}
      />

      {/* Transaction modal (create / edit) */}
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
