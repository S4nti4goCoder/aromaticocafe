import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Pencil, Trash2, Users, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkers, useDeleteWorker } from "@/hooks/useWorkers";
import { WorkerFormModal } from "@/features/workers/WorkerFormModal";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";
import type { Worker } from "@/types";

const statusConfig = {
  activo: { label: "Activo", variant: "default" as const },
  inactivo: { label: "Inactivo", variant: "secondary" as const },
  vacaciones: { label: "Vacaciones", variant: "outline" as const },
};

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  gerente: "Gerente",
  cajero: "Cajero",
  barista: "Barista",
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);

export function WorkersPage() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean; worker?: Worker | null }>(
    { open: false },
  );

  const { data: workers = [], isLoading } = useWorkers();
  const deleteWorker = useDeleteWorker();

  const filtered = workers.filter(
    (w) =>
      w.full_name.toLowerCase().includes(search.toLowerCase()) ||
      w.email.toLowerCase().includes(search.toLowerCase()),
  );

  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedItems,
    handlePageChange,
    handleItemsPerPageChange,
    reset,
  } = usePagination(filtered);

  useEffect(() => {
    reset();
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trabajadores</h2>
          <p className="text-muted-foreground text-sm">
            Gestiona el equipo de Aromático Café
          </p>
        </div>
        <PermissionGuard module="workers" action="can_create">
          <Button onClick={() => setModal({ open: true, worker: null })}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo trabajador
          </Button>
        </PermissionGuard>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar trabajadores..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No hay trabajadores registrados</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">
                    Trabajador
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Contacto</th>
                  <th className="text-left px-4 py-3 font-medium">Rol</th>
                  <th className="text-left px-4 py-3 font-medium">
                    Salario base
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="text-right px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((worker, index) => (
                  <motion.tr
                    key={worker.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-t hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={worker.avatar_url ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {worker.full_name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{worker.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Desde{" "}
                            {new Date(worker.hire_date).toLocaleDateString(
                              "es-CO",
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="text-xs">{worker.email}</span>
                        </div>
                        {worker.phone && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span className="text-xs">{worker.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{roleLabels[worker.role]}</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(worker.base_salary)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusConfig[worker.status].variant}>
                        {statusConfig[worker.status].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <PermissionGuard module="workers" action="can_edit">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setModal({ open: true, worker })}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard module="workers" action="can_delete">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteWorker.mutate(worker.id)}
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
          />
        </>
      )}

      <WorkerFormModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        worker={modal.worker}
      />
    </div>
  );
}
