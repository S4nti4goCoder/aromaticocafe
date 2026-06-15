import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, MONTH_NAMES, pctChange } from "@/features/accounting/format";
import { PctBadge } from "@/features/accounting/PctBadge";
import type {
  TransactionSummaryData,
  PrevSummaryData,
} from "@/features/accounting/types";

interface SummaryTabProps {
  month: number;
  year: number;
  isCurrent: boolean;
  onPrev: () => void;
  onNext: () => void;
  summary: TransactionSummaryData;
  prevSummary: PrevSummaryData;
}

// "Resumen" tab: month navigation, income/expense/balance cards with vs-prev
// deltas, top categories, and a daily income/expense bar chart.
export function SummaryTab({
  month,
  year,
  isCurrent,
  onPrev,
  onNext,
  summary,
  prevSummary,
}: SummaryTabProps) {
  return (
    <>
      {/* Month navigation */}
      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" size="icon" className="shrink-0" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-center truncate">
          {MONTH_NAMES[month]} {year}
        </h3>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border bg-card p-4 space-y-1"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Ingresos del mes</p>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {summary ? formatCurrency(summary.ingresos) : "—"}
          </p>
          {prevSummary && summary && (
            <PctBadge value={pctChange(summary.ingresos, prevSummary.ingresos)} />
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
            <PctBadge value={pctChange(summary.balance, prevSummary.balance)} />
          )}
        </motion.div>
      </div>

      {/* Top categories */}
      {summary &&
        (summary.topIngresos.length > 0 || summary.topEgresos.length > 0) && (
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

      {/* Daily chart */}
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
                  <p className="text-xs text-muted-foreground">{day.date}</p>
                  <div className="flex gap-1 items-center">
                    <span className="text-xs text-green-600 w-4">I</span>
                    <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(day.ingresos / maxVal) * 100}%` }}
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
                          animate={{ width: `${(day.egresos / maxVal) * 100}%` }}
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
    </>
  );
}
