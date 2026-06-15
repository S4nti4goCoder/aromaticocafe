import { motion } from "framer-motion";
import { Filter, X, Download, Plus, Minus, Receipt, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { ResponsiveTableWrapper } from "@/components/shared/ResponsiveTableWrapper";
import { Pagination } from "@/components/shared/Pagination";
import { formatCurrency, formatDateTime } from "@/features/accounting/format";
import type { TransactionFilters } from "@/hooks/useAccounting";
import type { Transaction, TransactionType } from "@/types";

const CATEGORY_OPTIONS = [
  "Venta",
  "Propina",
  "Otro ingreso",
  "Insumos",
  "Servicios",
  "Nómina",
  "Arriendo",
  "Mantenimiento",
  "Otro egreso",
];

interface TransactionsTabProps {
  showFilters: boolean;
  onToggleFilters: () => void;
  filters: TransactionFilters;
  onFiltersChange: React.Dispatch<React.SetStateAction<TransactionFilters>>;
  transactions: Transaction[];
  loadingTransactions: boolean;
  paginatedTransactions: Transaction[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  onExport: () => void;
  onNewTransaction: (type: TransactionType) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

// "Transacciones" tab: filter bar, create/export actions, and the paginated
// transactions table with edit/delete row actions.
export function TransactionsTab({
  showFilters,
  onToggleFilters,
  filters,
  onFiltersChange,
  transactions,
  loadingTransactions,
  paginatedTransactions,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onExport,
  onNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
}: TransactionsTabProps) {
  const hasActiveFilters =
    filters.type ||
    filters.category ||
    filters.payment_method ||
    filters.startDate ||
    filters.endDate;
  const clearFilters = () => onFiltersChange({});

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFilters}
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

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={transactions.length === 0}
            className="col-span-2 sm:col-span-1 w-full sm:w-auto"
          >
            <Download className="mr-1 h-4 w-4" />
            Excel
          </Button>
          <PermissionGuard module="accounting" action="can_create">
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-600 w-full sm:w-auto"
              onClick={() => onNewTransaction("ingreso")}
            >
              <Plus className="mr-1 h-4 w-4" />
              Ingreso
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-600 w-full sm:w-auto"
              onClick={() => onNewTransaction("egreso")}
            >
              <Minus className="mr-1 h-4 w-4" />
              Egreso
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Filters panel */}
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
                  onFiltersChange((f) => ({
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
                  onFiltersChange((f) => ({
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
                  {CATEGORY_OPTIONS.map((cat) => (
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
                  onFiltersChange((f) => ({
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
                  onFiltersChange((f) => ({
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
                  onFiltersChange((f) => ({
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
          <ResponsiveTableWrapper>
            <table className="w-full text-sm min-w-175">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium">Categoría</th>
                  <th className="text-left px-4 py-3 font-medium">
                    Descripción
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Método</th>
                  <th className="text-left px-4 py-3 font-medium">Fecha</th>
                  <th className="text-right px-4 py-3 font-medium">Monto</th>
                  <th className="text-right px-4 py-3 font-medium">Acciones</th>
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
                        <PermissionGuard module="accounting" action="can_edit">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditTransaction(transaction)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard module="accounting" action="can_delete">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => onDeleteTransaction(transaction.id)}
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
          </ResponsiveTableWrapper>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
            itemsPerPageOptions={[8, 16, 32, 50]}
          />
        </>
      )}
    </>
  );
}
