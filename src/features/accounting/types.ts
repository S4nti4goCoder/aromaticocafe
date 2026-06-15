// Data shapes used by the Accounting tab components, derived straight from the
// hooks so they never drift from the source of truth.
import type {
  useTodayCashRegister,
  useTodaySummary,
  useTransactionSummary,
  useTransactionSummaryPrevMonth,
  usePayrollReport,
  useCashDifference,
} from "@/hooks/useAccounting";

export type CashRegisterData = ReturnType<typeof useTodayCashRegister>["data"];
export type TodaySummaryData = ReturnType<typeof useTodaySummary>["data"];
export type TransactionSummaryData = ReturnType<
  typeof useTransactionSummary
>["data"];
export type PrevSummaryData = ReturnType<
  typeof useTransactionSummaryPrevMonth
>["data"];
export type CashDiffData = ReturnType<typeof useCashDifference>["data"];
export type PayrollRow = NonNullable<
  ReturnType<typeof usePayrollReport>["data"]
>[number];
