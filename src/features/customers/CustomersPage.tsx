import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Stamp, Star, Phone, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonRows } from "@/components/shared/SkeletonRows";
import { ResponsiveTableWrapper } from "@/components/shared/ResponsiveTableWrapper";
import { Pagination } from "@/components/shared/Pagination";
import { CustomerFormModal } from "@/features/customers/CustomerFormModal";
import { useCustomers } from "@/hooks/useCustomers";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useIsMobile } from "@/hooks/useIsMobile";
import { formatCurrency } from "@/lib/currency";
import type { Customer } from "@/types";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const PAGE_SIZE_OPTIONS = [8, 16, 32, 50];

export function CustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [editing, setEditing] = useState<Customer | null>(null);
  const { data, isLoading } = useCustomers(search, page, pageSize);
  const { settings } = useSystemSettings();
  const isMobile = useIsMobile();

  const customers = data?.customers ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Searching resets to the first page so results aren't hidden on a later one.
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const mode = settings?.loyalty_mode ?? "sellos";
  const stampsRequired = settings?.loyalty_stamps_required ?? 10;
  const balanceLabel = mode === "sellos" ? "Sellos" : "Puntos";

  const renderBalance = (stamps: number, points: number) =>
    mode === "sellos" ? (
      <span className="inline-flex items-center gap-1">
        <Stamp className="h-3.5 w-3.5 text-primary" />
        {stamps} / {stampsRequired}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1">
        <Star className="h-3.5 w-3.5 text-primary" />
        {points}
      </span>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">
          Clientes registrados y su saldo de fidelización
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o teléfono..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <SkeletonRows count={5} height="h-14" />
      ) : customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? "Sin resultados" : "Aún no hay clientes"}
          description={
            search
              ? "Ningún cliente coincide con la búsqueda."
              : "Los clientes se registran al cobrarles e identificarlos por teléfono en la caja."
          }
        />
      ) : isMobile ? (
        <div className="space-y-2">
          {customers.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setEditing(c)}
              className="w-full text-left rounded-lg border bg-card p-3 space-y-1.5 hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">{c.name || "Sin nombre"}</p>
                {renderBalance(c.stamps, c.points)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {c.phone}
              </p>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Total: {formatCurrency(Number(c.total_spent))}</span>
                <span>Desde {formatDate(c.created_at)}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <ResponsiveTableWrapper>
          <table className="w-full text-sm min-w-160">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Cliente</th>
                <th className="text-left px-4 py-3 font-medium">Teléfono</th>
                <th className="text-left px-4 py-3 font-medium">{balanceLabel}</th>
                <th className="text-right px-4 py-3 font-medium">Total gastado</th>
                <th className="text-right px-4 py-3 font-medium">Registrado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t hover:bg-accent/30">
                  <td className="px-4 py-3 font-medium">
                    {c.name || "Sin nombre"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                  <td className="px-4 py-3">{renderBalance(c.stamps, c.points)}</td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(Number(c.total_spent))}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {formatDate(c.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      title="Editar cliente"
                      onClick={() => setEditing(c)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ResponsiveTableWrapper>
      )}

      {!isLoading && total > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={pageSize}
          onPageChange={setPage}
          onItemsPerPageChange={setPageSize}
          itemsPerPageOptions={PAGE_SIZE_OPTIONS}
        />
      )}

      <CustomerFormModal
        customer={editing}
        open={!!editing}
        onOpenChange={(o) => {
          if (!o) setEditing(null);
        }}
        loyaltyMode={mode}
        stampsRequired={stampsRequired}
      />
    </motion.div>
  );
}
