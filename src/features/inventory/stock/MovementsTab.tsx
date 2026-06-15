import { motion } from "framer-motion";
import { Search, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonRows } from "@/components/shared/SkeletonRows";
import { Pagination } from "@/components/shared/Pagination";
import { ResponsiveTableWrapper } from "@/components/shared/ResponsiveTableWrapper";
import type { InventoryMovementType, Product } from "@/types";
import type {
  InventoryMovement,
  MovementTypeFilter,
} from "@/features/inventory/stock/helpers";

const movementTypeConfig: Record<
  InventoryMovementType,
  { label: string; color: string; icon: typeof ArrowUp }
> = {
  entrada: {
    label: "Entrada",
    color: "text-green-600 dark:text-green-400",
    icon: ArrowUp,
  },
  salida: {
    label: "Salida",
    color: "text-red-600 dark:text-red-400",
    icon: ArrowDown,
  },
  ajuste: {
    label: "Ajuste",
    color: "text-blue-600 dark:text-blue-400",
    icon: RefreshCw,
  },
};

interface MovementsTabProps {
  movSearch: string;
  onMovSearchChange: (v: string) => void;
  movTypeFilter: MovementTypeFilter;
  onMovTypeFilterChange: (v: MovementTypeFilter) => void;
  movFromDate: string;
  onMovFromDateChange: (v: string) => void;
  movToDate: string;
  onMovToDateChange: (v: string) => void;
  loadingMovements: boolean;
  filteredMovements: InventoryMovement[];
  paginatedMovements: InventoryMovement[];
  products: Product[];
  page: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

// "Movimientos" tab: filter bar + paginated inventory movements table.
export function MovementsTab({
  movSearch,
  onMovSearchChange,
  movTypeFilter,
  onMovTypeFilterChange,
  movFromDate,
  onMovFromDateChange,
  movToDate,
  onMovToDateChange,
  loadingMovements,
  filteredMovements,
  paginatedMovements,
  products,
  page,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: MovementsTabProps) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar producto..."
            className="pl-9"
            value={movSearch}
            onChange={(e) => onMovSearchChange(e.target.value)}
          />
        </div>
        <select
          value={movTypeFilter}
          onChange={(e) =>
            onMovTypeFilterChange(e.target.value as MovementTypeFilter)
          }
          className="h-9 rounded-md border border-input bg-background px-3 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">Todos los tipos</option>
          <option value="entrada">Entradas</option>
          <option value="salida">Salidas</option>
          <option value="ajuste">Ajustes</option>
        </select>
        <input
          type="date"
          value={movFromDate}
          onChange={(e) => onMovFromDateChange(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <input
          type="date"
          value={movToDate}
          onChange={(e) => onMovToDateChange(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {loadingMovements ? (
        <SkeletonRows count={5} height="h-14" />
      ) : filteredMovements.length === 0 ? (
        <EmptyState
          icon={RefreshCw}
          title="Sin movimientos"
          description="No hay movimientos que coincidan con los filtros."
        />
      ) : (
        <>
          <ResponsiveTableWrapper>
            <table className="w-full text-sm min-w-160">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium">Producto</th>
                  <th className="text-center px-4 py-3 font-medium">Cantidad</th>
                  <th className="text-center px-4 py-3 font-medium">
                    Stock anterior
                  </th>
                  <th className="text-center px-4 py-3 font-medium">
                    Stock nuevo
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Motivo</th>
                  <th className="text-left px-4 py-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMovements.map((movement, index) => {
                  const config =
                    movementTypeConfig[movement.type as InventoryMovementType];
                  const Icon = config.icon;
                  const product = products.find(
                    (p) => p.id === movement.product_id,
                  );
                  return (
                    <motion.tr
                      key={movement.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-t hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-1 ${config.color}`}>
                          <Icon className="h-3 w-3" />
                          <span className="text-xs font-medium">
                            {config.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {product?.name ?? "Producto eliminado"}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">
                        {movement.type === "salida" ? "-" : "+"}
                        {movement.quantity}
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {movement.previous_stock}
                      </td>
                      <td className="px-4 py-3 text-center font-medium">
                        {movement.new_stock}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {movement.reason ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(movement.created_at).toLocaleString("es-CO", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </ResponsiveTableWrapper>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
          />
        </>
      )}
    </>
  );
}
