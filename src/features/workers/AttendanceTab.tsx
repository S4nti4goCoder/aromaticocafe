import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  LogIn,
  LogOut,
  Search,
  Calendar,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAttendance,
  useCreateAttendance,
  useUpdateAttendance,
  useDeleteAttendance,
} from "@/hooks/useAttendance";
import { useWorkers } from "@/hooks/useWorkers";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { cn } from "@/lib/utils";
import type { Attendance } from "@/types";

const statusConfig: Record<
  string,
  { label: string; dot: string; bg: string }
> = {
  presente: {
    label: "Presente",
    dot: "bg-green-500",
    bg: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  ausente: {
    label: "Ausente",
    dot: "bg-red-500",
    bg: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  tardanza: {
    label: "Tardanza",
    dot: "bg-amber-500",
    bg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  permiso: {
    label: "Permiso",
    dot: "bg-blue-500",
    bg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
};

const today = new Date().toISOString().split("T")[0];

export function AttendanceTab() {
  const [filterDate, setFilterDate] = useState(today);
  const [filterWorker, setFilterWorker] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [formModal, setFormModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Attendance | null>(null);

  // Form state
  const [formWorkerId, setFormWorkerId] = useState("");
  const [formStatus, setFormStatus] = useState<
    "presente" | "ausente" | "tardanza" | "permiso"
  >("presente");
  const [formCheckIn, setFormCheckIn] = useState("");
  const [formCheckOut, setFormCheckOut] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const { data: attendance = [], isLoading } = useAttendance({
    startDate: filterDate,
    endDate: filterDate,
    ...(filterWorker !== "all" ? { workerId: filterWorker } : {}),
    ...(filterStatus !== "all" ? { status: filterStatus } : {}),
  });
  const { data: workers = [] } = useWorkers();
  const activeWorkers = workers.filter((w) => w.status === "activo");
  const createAttendance = useCreateAttendance();
  const updateAttendance = useUpdateAttendance();
  const deleteAttendance = useDeleteAttendance();

  // Workers with attendance today
  const attendanceMap = new Map(
    attendance.map((a) => [a.worker_id, a]),
  );

  const filtered =
    filterWorker !== "all" || filterStatus !== "all"
      ? attendance
      : // Show all active workers for the day, even those without a record
        activeWorkers.map((w) => {
          const existing = attendanceMap.get(w.id);
          if (existing) return existing;
          return {
            id: "",
            worker_id: w.id,
            date: filterDate,
            check_in: null,
            check_out: null,
            status: "ausente" as const,
            notes: null,
            created_at: "",
            worker: w,
          } satisfies Attendance;
        });

  const openForm = () => {
    setFormWorkerId("");
    setFormStatus("presente");
    setFormCheckIn(
      new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    setFormCheckOut("");
    setFormNotes("");
    setFormModal(true);
  };

  const handleSubmit = async () => {
    if (!formWorkerId) return;
    await createAttendance.mutateAsync({
      worker_id: formWorkerId,
      date: filterDate,
      check_in: formCheckIn || undefined,
      check_out: formCheckOut || undefined,
      status: formStatus,
      notes: formNotes || undefined,
    });
    setFormModal(false);
  };

  const handleQuickCheckIn = async (workerId: string) => {
    const now = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const existing = attendanceMap.get(workerId);
    if (existing && existing.id) {
      await updateAttendance.mutateAsync({
        id: existing.id,
        check_in: now,
        status: "presente",
      });
    } else {
      await createAttendance.mutateAsync({
        worker_id: workerId,
        date: filterDate,
        check_in: now,
        status: "presente",
      });
    }
  };

  const handleQuickCheckOut = async (workerId: string) => {
    const existing = attendanceMap.get(workerId);
    if (!existing?.id) return;
    const now = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    await updateAttendance.mutateAsync({
      id: existing.id,
      check_out: now,
    });
  };

  // KPIs
  const presentes = attendance.filter((a) => a.status === "presente").length;
  const ausentes = activeWorkers.length - presentes;
  const tardanzas = attendance.filter((a) => a.status === "tardanza").length;
  const permisos = attendance.filter((a) => a.status === "permiso").length;

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Presentes</p>
          <p className="text-xl font-bold text-green-600">{presentes}</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Ausentes</p>
          <p className="text-xl font-bold text-red-600">{ausentes}</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Tardanzas</p>
          <p className="text-xl font-bold text-amber-600">{tardanzas}</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Permisos</p>
          <p className="text-xl font-bold text-blue-600">{permisos}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="date"
          className="w-40"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <Select value={filterWorker} onValueChange={setFilterWorker}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Trabajador" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all">Todos</SelectItem>
            {activeWorkers.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="presente">Presente</SelectItem>
            <SelectItem value="ausente">Ausente</SelectItem>
            <SelectItem value="tardanza">Tardanza</SelectItem>
            <SelectItem value="permiso">Permiso</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <PermissionGuard module="workers" action="can_create">
          <Button size="sm" onClick={openForm}>
            <Plus className="mr-1 h-3 w-3" />
            Registrar
          </Button>
        </PermissionGuard>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Trabajador</th>
                <th className="text-center px-4 py-2 font-medium">Estado</th>
                <th className="text-center px-4 py-2 font-medium">Entrada</th>
                <th className="text-center px-4 py-2 font-medium">Salida</th>
                <th className="text-left px-4 py-2 font-medium">Notas</th>
                <th className="text-right px-4 py-2 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record, index) => {
                const worker =
                  record.worker ??
                  workers.find((w) => w.id === record.worker_id);
                const status = statusConfig[record.status] ?? statusConfig.ausente;
                const hasRecord = !!record.id;

                return (
                  <motion.tr
                    key={record.id || record.worker_id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-t hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage
                            src={worker?.avatar_url ?? undefined}
                          />
                          <AvatarFallback className="text-[10px]">
                            {worker?.full_name?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-xs">
                          {worker?.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border",
                          status.bg,
                        )}
                      >
                        <span
                          className={cn("h-1.5 w-1.5 rounded-full", status.dot)}
                        />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center text-xs text-muted-foreground">
                      {record.check_in?.slice(0, 5) ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-center text-xs text-muted-foreground">
                      {record.check_out?.slice(0, 5) ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground truncate max-w-32">
                      {record.notes ?? ""}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex justify-end gap-1">
                        <PermissionGuard module="workers" action="can_edit">
                          {filterDate === today && !record.check_in && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs text-green-600"
                              onClick={() =>
                                handleQuickCheckIn(record.worker_id)
                              }
                              disabled={
                                createAttendance.isPending ||
                                updateAttendance.isPending
                              }
                            >
                              <LogIn className="h-3 w-3 mr-1" />
                              Entrada
                            </Button>
                          )}
                          {filterDate === today &&
                            record.check_in &&
                            !record.check_out && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs text-amber-600"
                                onClick={() =>
                                  handleQuickCheckOut(record.worker_id)
                                }
                                disabled={updateAttendance.isPending}
                              >
                                <LogOut className="h-3 w-3 mr-1" />
                                Salida
                              </Button>
                            )}
                        </PermissionGuard>
                        {hasRecord && (
                          <PermissionGuard module="workers" action="can_delete">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(record)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </PermissionGuard>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Form modal */}
      <Dialog open={formModal} onOpenChange={setFormModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Registrar asistencia</DialogTitle>
            <DialogDescription>
              Registra la asistencia de un trabajador para el{" "}
              {new Date(filterDate + "T12:00:00").toLocaleDateString("es-CO")}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Trabajador *</Label>
              <Select value={formWorkerId} onValueChange={setFormWorkerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent position="popper">
                  {activeWorkers.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Estado *</Label>
              <div className="grid grid-cols-4 gap-1">
                {(
                  ["presente", "tardanza", "ausente", "permiso"] as const
                ).map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant={formStatus === s ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setFormStatus(s)}
                  >
                    {statusConfig[s].label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Entrada</Label>
                <Input
                  type="time"
                  value={formCheckIn}
                  onChange={(e) => setFormCheckIn(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Salida</Label>
                <Input
                  type="time"
                  value={formCheckOut}
                  onChange={(e) => setFormCheckOut(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Notas</Label>
              <Input
                placeholder="Opcional..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setFormModal(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={!formWorkerId || createAttendance.isPending}
              >
                Registrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar registro"
        description="¿Estás seguro de eliminar este registro de asistencia?"
        destructive
        confirmLabel="Eliminar"
        loading={deleteAttendance.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteAttendance.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
      />
    </div>
  );
}
