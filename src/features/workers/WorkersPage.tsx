import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  Phone,
  Mail,
  X,
  Check,
  ChevronDown,
  Calendar,
  ClipboardCheck,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  useWorkers,
  useDeleteWorker,
  useBulkUpdateWorkerStatus,
  useBulkDeleteWorkers,
  useUpdateWorkerStatus,
} from "@/hooks/useWorkers";
import { WorkerFormModal } from "@/features/workers/WorkerFormModal";
import { ShiftsTab } from "@/features/workers/ShiftsTab";
import { AttendanceTab } from "@/features/workers/AttendanceTab";
import { PerformanceTab } from "@/features/workers/PerformanceTab";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";
import type { Worker, WorkerStatus } from "@/types";

const statusConfig: Record<
  WorkerStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline";
    dot: string;
    bg: string;
  }
> = {
  activo: {
    label: "Activo",
    variant: "default",
    dot: "bg-green-500",
    bg: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  inactivo: {
    label: "Inactivo",
    variant: "secondary",
    dot: "bg-red-500",
    bg: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  vacaciones: {
    label: "Vacaciones",
    variant: "outline",
    dot: "bg-amber-500",
    bg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
};

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  gerente: "Gerente",
  cajero: "Cajero",
  barista: "Barista",
};

const INACTIVE_REASONS = [
  "Renuncia voluntaria",
  "Despido",
  "Fin de contrato",
  "Abandono de cargo",
  "Mutuo acuerdo",
  "Otro",
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);

export function WorkersPage() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modal, setModal] = useState<{ open: boolean; worker?: Worker | null }>(
    { open: false },
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [confirmSingleDelete, setConfirmSingleDelete] = useState<Worker | null>(
    null,
  );
  const [avatarPreview, setAvatarPreview] = useState<Worker | null>(null);

  // Status change modal (single + bulk)
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    ids: string[];
    targetStatus: WorkerStatus;
  } | null>(null);
  const [statusReason, setStatusReason] = useState("");
  const [statusReasonCustom, setStatusReasonCustom] = useState("");

  const { data: workers = [], isLoading } = useWorkers();
  const deleteWorker = useDeleteWorker();
  const bulkUpdateStatus = useBulkUpdateWorkerStatus();
  const bulkDelete = useBulkDeleteWorkers();
  const updateStatus = useUpdateWorkerStatus();

  const filtered = workers.filter((w) => {
    const matchesSearch =
      w.full_name.toLowerCase().includes(search.toLowerCase()) ||
      w.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "all" || w.role === filterRole;
    const matchesStatus = filterStatus === "all" || w.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

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
  }, [search, filterRole, filterStatus, reset]);

  // Selection
  const pageIds = paginatedItems.map((w) => w.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  // Open status change modal
  const openStatusChange = (ids: string[], targetStatus: WorkerStatus) => {
    if (targetStatus === "inactivo") {
      setStatusReason("");
      setStatusReasonCustom("");
      setStatusModal({ open: true, ids, targetStatus });
    } else {
      if (ids.length === 1) {
        updateStatus.mutate({ id: ids[0], status: targetStatus });
      } else {
        bulkUpdateStatus.mutate({ ids, status: targetStatus });
      }
      clearSelection();
    }
  };

  const handleStatusConfirm = () => {
    if (!statusModal) return;
    const reason =
      statusReason === "Otro"
        ? statusReasonCustom.trim()
        : statusReason;
    if (!reason) return;
    if (statusModal.ids.length === 1) {
      updateStatus.mutate({
        id: statusModal.ids[0],
        status: statusModal.targetStatus,
        reason,
      });
    } else {
      bulkUpdateStatus.mutate({
        ids: statusModal.ids,
        status: statusModal.targetStatus,
        reason,
      });
    }
    setStatusModal(null);
    clearSelection();
  };

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

      <Tabs defaultValue="team" className="space-y-4">
        <TabsList>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            Equipo
          </TabsTrigger>
          <TabsTrigger value="shifts" className="gap-2">
            <Calendar className="h-4 w-4" />
            Turnos
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Asistencia
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Rendimiento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar trabajadores..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="gerente">Gerente</SelectItem>
            <SelectItem value="cajero">Cajero</SelectItem>
            <SelectItem value="barista">Barista</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="inactivo">Inactivo</SelectItem>
            <SelectItem value="vacaciones">Vacaciones</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 rounded-lg border bg-muted/50 p-2"
          >
            <span className="text-sm font-medium ml-2">
              {selected.size} seleccionado{selected.size === 1 ? "" : "s"}
            </span>
            <PermissionGuard module="workers" action="can_edit">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openStatusChange([...selected], "activo")}
              >
                <Check className="mr-1 h-3 w-3" />
                Activar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openStatusChange([...selected], "vacaciones")}
              >
                Vacaciones
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openStatusChange([...selected], "inactivo")}
              >
                Desactivar
              </Button>
            </PermissionGuard>
            <PermissionGuard module="workers" action="can_delete">
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setConfirmBulkDelete(true)}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Eliminar
              </Button>
            </PermissionGuard>
            <Button size="sm" variant="ghost" onClick={clearSelection}>
              <X className="h-3 w-3" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

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
                  <th className="w-10 px-4 py-3">
                    <Checkbox
                      checked={
                        allPageSelected
                          ? true
                          : somePageSelected
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={toggleAll}
                    />
                  </th>
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
                    className={cn(
                      "border-t hover:bg-muted/30 transition-colors",
                      selected.has(worker.id) && "bg-primary/5",
                    )}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selected.has(worker.id)}
                        onCheckedChange={() => toggleOne(worker.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            worker.avatar_url
                              ? setAvatarPreview(worker)
                              : undefined
                          }
                          className={cn(
                            worker.avatar_url &&
                              "cursor-pointer hover:ring-2 hover:ring-primary rounded-full transition-shadow",
                          )}
                        >
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={worker.avatar_url ?? undefined}
                            />
                            <AvatarFallback className="text-xs">
                              {worker.full_name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </button>
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
                      <PermissionGuard
                        module="workers"
                        action="can_edit"
                        fallback={
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border",
                              statusConfig[worker.status].bg,
                            )}
                          >
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                statusConfig[worker.status].dot,
                              )}
                            />
                            {statusConfig[worker.status].label}
                          </span>
                        }
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto py-0 px-1 gap-1"
                            >
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border",
                                  statusConfig[worker.status].bg,
                                )}
                              >
                                <span
                                  className={cn(
                                    "h-2 w-2 rounded-full",
                                    statusConfig[worker.status].dot,
                                  )}
                                />
                                {statusConfig[worker.status].label}
                              </span>
                              <ChevronDown className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {(
                              ["activo", "vacaciones", "inactivo"] as const
                            ).map((s) =>
                              s !== worker.status ? (
                                <DropdownMenuItem
                                  key={s}
                                  onClick={() =>
                                    openStatusChange([worker.id], s)
                                  }
                                  className="gap-2"
                                >
                                  <span
                                    className={cn(
                                      "h-2 w-2 rounded-full",
                                      statusConfig[s].dot,
                                    )}
                                  />
                                  {statusConfig[s].label}
                                </DropdownMenuItem>
                              ) : null,
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </PermissionGuard>
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
                            onClick={() => setConfirmSingleDelete(worker)}
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
        </TabsContent>

        <TabsContent value="shifts">
          <ShiftsTab />
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceTab />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceTab />
        </TabsContent>
      </Tabs>

      <WorkerFormModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        worker={modal.worker}
      />

      {/* Avatar preview */}
      <Dialog
        open={!!avatarPreview}
        onOpenChange={(open) => !open && setAvatarPreview(null)}
      >
        <DialogContent className="max-w-md flex flex-col items-center gap-4">
          <DialogHeader>
            <DialogTitle>{avatarPreview?.full_name}</DialogTitle>
          </DialogHeader>
          {avatarPreview?.avatar_url && (
            <img
              src={avatarPreview.avatar_url}
              alt={avatarPreview.full_name}
              className="w-64 h-64 object-cover rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Status change with reason (for inactivo) */}
      <Dialog
        open={!!statusModal?.open}
        onOpenChange={(open) => {
          if (!open) setStatusModal(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Desactivar trabajador</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Selecciona el motivo para desactivar{" "}
              {statusModal && statusModal.ids.length > 1
                ? `${statusModal.ids.length} trabajadores`
                : "este trabajador"}
              :
            </p>
            <div className="grid grid-cols-2 gap-2">
              {INACTIVE_REASONS.map((r) => (
                <Button
                  key={r}
                  type="button"
                  variant={statusReason === r ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => setStatusReason(r)}
                >
                  {r}
                </Button>
              ))}
            </div>
            {statusReason === "Otro" && (
              <div className="space-y-1">
                <Label className="text-xs">Especifica el motivo *</Label>
                <Textarea
                  placeholder="Motivo..."
                  value={statusReasonCustom}
                  onChange={(e) => setStatusReasonCustom(e.target.value)}
                  rows={2}
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStatusModal(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={
                  !statusReason ||
                  (statusReason === "Otro" && !statusReasonCustom.trim())
                }
                onClick={handleStatusConfirm}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm single delete */}
      <ConfirmDialog
        open={!!confirmSingleDelete}
        onOpenChange={(open) => !open && setConfirmSingleDelete(null)}
        title={`Eliminar a ${confirmSingleDelete?.full_name ?? "trabajador"}`}
        description="Se eliminará el trabajador y su cuenta de acceso al sistema. Esta acción no se puede deshacer."
        destructive
        confirmLabel="Eliminar"
        loading={deleteWorker.isPending}
        onConfirm={() => {
          if (!confirmSingleDelete) return;
          deleteWorker.mutate(confirmSingleDelete.id, {
            onSuccess: () => setConfirmSingleDelete(null),
          });
        }}
      />

      {/* Confirm bulk delete */}
      <ConfirmDialog
        open={confirmBulkDelete}
        onOpenChange={setConfirmBulkDelete}
        title={`Eliminar ${selected.size} trabajador${selected.size === 1 ? "" : "es"}`}
        description="Se eliminarán los trabajadores seleccionados y sus cuentas de acceso. Esta acción no se puede deshacer."
        destructive
        confirmLabel="Eliminar"
        loading={bulkDelete.isPending}
        onConfirm={() => {
          bulkDelete.mutate([...selected], {
            onSuccess: () => {
              clearSelection();
              setConfirmBulkDelete(false);
            },
          });
        }}
      />
    </div>
  );
}
