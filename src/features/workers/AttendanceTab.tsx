import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  LogIn,
  LogOut,
  Trash2,
  Pencil,
  Download,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  useAttendance,
  useCreateAttendance,
  useUpdateAttendance,
  useDeleteAttendance,
} from "@/hooks/useAttendance";
import { useShifts } from "@/hooks/useShifts";
import { useWorkers } from "@/hooks/useWorkers";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
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

const ABSENCE_REASONS = [
  "Enfermedad",
  "Cita médica",
  "Calamidad doméstica",
  "Trámite personal",
  "Permiso autorizado",
  "Sin justificación",
];

const TARDANZA_REASONS = [
  "Transporte público",
  "Problema de salud",
  "Tráfico",
  "Motivo personal",
  "Sin justificación",
];

const today = new Date().toISOString().split("T")[0];

function getWeekDates(offset: number) {
  const now = new Date();
  now.setDate(now.getDate() + offset * 7);
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

function getMonthDates(year: number, month: number) {
  const dates: string[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    dates.push(
      `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    );
  }
  return dates;
}

export function AttendanceTab() {
  const [activeView, setActiveView] = useState("daily");

  return (
    <Tabs value={activeView} onValueChange={setActiveView}>
      <TabsList>
        <TabsTrigger value="daily">Diario</TabsTrigger>
        <TabsTrigger value="weekly">Semanal</TabsTrigger>
        <TabsTrigger value="monthly">Mensual</TabsTrigger>
      </TabsList>
      <TabsContent value="daily" className="mt-4">
        <DailyView />
      </TabsContent>
      <TabsContent value="weekly" className="mt-4">
        <WeeklyView />
      </TabsContent>
      <TabsContent value="monthly" className="mt-4">
        <MonthlyView />
      </TabsContent>
    </Tabs>
  );
}

/* ─────────────────────── DAILY VIEW ─────────────────────── */
function DailyView() {
  const [filterDate, setFilterDate] = useState(today);
  const [filterWorker, setFilterWorker] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [formModal, setFormModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Attendance | null>(null);
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
  const { data: todayShifts = [] } = useShifts({
    startDate: filterDate,
    endDate: filterDate,
  });
  const createAttendance = useCreateAttendance();
  const updateAttendance = useUpdateAttendance();
  const deleteAttendance = useDeleteAttendance();

  const shiftMap = new Map(todayShifts.map((s) => [s.worker_id, s]));
  const attendanceMap = new Map(attendance.map((a) => [a.worker_id, a]));

  const filtered =
    filterWorker !== "all" || filterStatus !== "all"
      ? attendance
      : activeWorkers.map((w) => {
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
    setEditTarget(null);
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

  const openEdit = (record: Attendance) => {
    setEditTarget(record);
    setFormWorkerId(record.worker_id);
    setFormStatus(record.status);
    setFormCheckIn(record.check_in?.slice(0, 5) ?? "");
    setFormCheckOut(record.check_out?.slice(0, 5) ?? "");
    setFormNotes(record.notes ?? "");
    setFormModal(true);
  };

  const handleSubmit = async () => {
    if (editTarget) {
      await updateAttendance.mutateAsync({
        id: editTarget.id,
        check_in: formCheckIn || undefined,
        check_out: formCheckOut || undefined,
        status: formStatus,
        notes: formNotes || undefined,
      });
    } else {
      if (!formWorkerId) return;
      // Auto-detect tardanza based on shift
      let finalStatus = formStatus;
      if (formStatus === "presente" && formCheckIn) {
        const shift = shiftMap.get(formWorkerId);
        if (shift && formCheckIn > shift.start_time.slice(0, 5)) {
          finalStatus = "tardanza";
        }
      }
      await createAttendance.mutateAsync({
        worker_id: formWorkerId,
        date: filterDate,
        check_in: formCheckIn || undefined,
        check_out: formCheckOut || undefined,
        status: finalStatus,
        notes: formNotes || undefined,
      });
    }
    setFormModal(false);
  };

  const handleQuickCheckIn = async (workerId: string) => {
    const now = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const existing = attendanceMap.get(workerId);

    // Auto-detect tardanza
    const shift = shiftMap.get(workerId);
    let status: "presente" | "tardanza" = "presente";
    let notes: string | null = null;
    if (shift && now.slice(0, 5) > shift.start_time.slice(0, 5)) {
      status = "tardanza";
      notes = `Turno: ${shift.start_time.slice(0, 5)}, llegada: ${now.slice(0, 5)}`;
    }

    if (existing && existing.id) {
      await updateAttendance.mutateAsync({
        id: existing.id,
        check_in: now,
        status,
        ...(notes ? { notes } : {}),
      });
    } else {
      await createAttendance.mutateAsync({
        worker_id: workerId,
        date: filterDate,
        check_in: now,
        status,
        notes: notes || undefined,
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

  // Pre-selectable notes based on status
  const noteOptions =
    formStatus === "ausente"
      ? ABSENCE_REASONS
      : formStatus === "tardanza"
        ? TARDANZA_REASONS
        : formStatus === "permiso"
          ? ABSENCE_REASONS
          : [];

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
                <th className="text-center px-4 py-2 font-medium">Turno</th>
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
                const status =
                  statusConfig[record.status] ?? statusConfig.ausente;
                const hasRecord = !!record.id;
                const shift = shiftMap.get(record.worker_id);

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
                    <td className="px-4 py-2 text-center text-xs text-muted-foreground">
                      {shift
                        ? `${shift.start_time.slice(0, 5)} - ${shift.end_time.slice(0, 5)}`
                        : "—"}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border",
                          status.bg,
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            status.dot,
                          )}
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
                          {hasRecord && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openEdit(record)}
                            >
                              <Pencil className="h-3 w-3" />
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

      {/* Form modal (create / edit) */}
      <Dialog open={formModal} onOpenChange={setFormModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Editar asistencia" : "Registrar asistencia"}
            </DialogTitle>
            <DialogDescription>
              {editTarget
                ? "Modifica los datos de este registro."
                : `Registra la asistencia para el ${new Date(filterDate + "T12:00:00").toLocaleDateString("es-CO")}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {!editTarget && (
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
            )}
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
                    onClick={() => {
                      setFormStatus(s);
                      setFormNotes("");
                    }}
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
              <Label className="text-xs">Motivo / Notas</Label>
              {noteOptions.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {noteOptions.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      className={cn(
                        "text-[11px] px-2 py-0.5 rounded-full border transition-colors",
                        formNotes === reason
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 hover:bg-muted",
                      )}
                      onClick={() =>
                        setFormNotes(formNotes === reason ? "" : reason)
                      }
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              )}
              <Input
                placeholder="Otro motivo..."
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
                disabled={
                  (!editTarget && !formWorkerId) ||
                  createAttendance.isPending ||
                  updateAttendance.isPending
                }
              >
                {editTarget ? "Guardar" : "Registrar"}
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

/* ─────────────────────── WEEKLY VIEW ─────────────────────── */
function WeeklyView() {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = getWeekDates(weekOffset);
  const startDate = weekDates[0];
  const endDate = weekDates[6];

  const { data: attendance = [], isLoading } = useAttendance({
    startDate,
    endDate,
  });
  const { data: workers = [] } = useWorkers();
  const activeWorkers = workers.filter((w) => w.status === "activo");

  const attendanceByWorkerDate = useMemo(() => {
    const map = new Map<string, Attendance>();
    for (const a of attendance) {
      map.set(`${a.worker_id}_${a.date}`, a);
    }
    return map;
  }, [attendance]);

  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  // Export to Excel
  const handleExport = () => {
    const rows = activeWorkers.flatMap((w) =>
      weekDates.map((date) => {
        const record = attendanceByWorkerDate.get(`${w.id}_${date}`);
        return {
          Trabajador: w.full_name,
          Fecha: date,
          Estado: record ? statusConfig[record.status]?.label ?? record.status : "Ausente",
          Entrada: record?.check_in?.slice(0, 5) ?? "",
          Salida: record?.check_out?.slice(0, 5) ?? "",
          Notas: record?.notes ?? "",
        };
      }),
    );
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistencia");
    XLSX.writeFile(wb, `asistencia_${startDate}_${endDate}.xlsx`);
  };

  const weekLabel = `${new Date(startDate + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short" })} — ${new Date(endDate + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setWeekOffset((p) => p - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekOffset(0)}
        >
          Hoy
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setWeekOffset((p) => p + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium capitalize">{weekLabel}</span>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-3 w-3 mr-1" />
          Exportar
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-lg" />
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2 font-medium sticky left-0 bg-muted/50 z-10 min-w-36">
                  Trabajador
                </th>
                {weekDates.map((date, i) => (
                  <th
                    key={date}
                    className={cn(
                      "text-center px-2 py-2 font-medium min-w-20",
                      date === today && "bg-primary/10",
                    )}
                  >
                    <div className="text-[10px] text-muted-foreground">
                      {dayNames[i]}
                    </div>
                    <div className="text-xs">
                      {new Date(date + "T12:00:00").getDate()}
                    </div>
                  </th>
                ))}
                <th className="text-center px-3 py-2 font-medium min-w-16">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {activeWorkers.map((worker) => {
                let weekPresent = 0;
                return (
                  <tr
                    key={worker.id}
                    className="border-t hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-2 sticky left-0 bg-background z-10">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={worker.avatar_url ?? undefined}
                          />
                          <AvatarFallback className="text-[9px]">
                            {worker.full_name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium truncate max-w-24">
                          {worker.full_name}
                        </span>
                      </div>
                    </td>
                    {weekDates.map((date) => {
                      const record = attendanceByWorkerDate.get(
                        `${worker.id}_${date}`,
                      );
                      const st = record?.status ?? "ausente";
                      const cfg = statusConfig[st];
                      if (st === "presente" || st === "tardanza")
                        weekPresent++;
                      return (
                        <td
                          key={date}
                          className={cn(
                            "text-center px-2 py-2",
                            date === today && "bg-primary/5",
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-5 w-5 rounded-full leading-5 text-[10px] font-bold",
                              cfg.bg,
                            )}
                            title={`${cfg.label}${record?.check_in ? ` — ${record.check_in.slice(0, 5)}` : ""}`}
                          >
                            {st === "presente"
                              ? "✓"
                              : st === "tardanza"
                                ? "T"
                                : st === "permiso"
                                  ? "P"
                                  : "✗"}
                          </span>
                        </td>
                      );
                    })}
                    <td className="text-center px-3 py-2 text-xs font-bold">
                      {weekPresent}/7
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── MONTHLY VIEW ─────────────────────── */
function MonthlyView() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const monthDates = useMemo(() => getMonthDates(year, month), [year, month]);
  const startDate = monthDates[0];
  const endDate = monthDates[monthDates.length - 1];

  const { data: attendance = [], isLoading } = useAttendance({
    startDate,
    endDate,
  });
  const { data: workers = [] } = useWorkers();
  const activeWorkers = workers.filter((w) => w.status === "activo");

  const attendanceByWorkerDate = useMemo(() => {
    const map = new Map<string, Attendance>();
    for (const a of attendance) {
      map.set(`${a.worker_id}_${a.date}`, a);
    }
    return map;
  }, [attendance]);

  const monthLabel = new Date(year, month).toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });

  const goBack = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  };
  const goForward = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  };

  // Export
  const handleExport = () => {
    const rows = activeWorkers.map((w) => {
      const row: Record<string, string | number> = { Trabajador: w.full_name };
      let present = 0;
      let late = 0;
      let absent = 0;
      let permission = 0;
      for (const date of monthDates) {
        const record = attendanceByWorkerDate.get(`${w.id}_${date}`);
        const st = record?.status ?? "ausente";
        if (st === "presente") present++;
        else if (st === "tardanza") late++;
        else if (st === "permiso") permission++;
        else absent++;
      }
      row["Presentes"] = present;
      row["Tardanzas"] = late;
      row["Ausencias"] = absent;
      row["Permisos"] = permission;
      row["% Asistencia"] = `${Math.round(((present + late) / monthDates.length) * 100)}%`;
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resumen Mensual");
    XLSX.writeFile(
      wb,
      `asistencia_resumen_${year}-${String(month + 1).padStart(2, "0")}.xlsx`,
    );
  };

  // Summary per worker
  const summary = activeWorkers.map((w) => {
    let present = 0;
    let late = 0;
    let absent = 0;
    let permission = 0;
    let totalHours = 0;
    for (const date of monthDates) {
      const record = attendanceByWorkerDate.get(`${w.id}_${date}`);
      const st = record?.status ?? "ausente";
      if (st === "presente") present++;
      else if (st === "tardanza") late++;
      else if (st === "permiso") permission++;
      else absent++;
      if (record?.check_in && record?.check_out) {
        const [hi, mi] = record.check_in.split(":").map(Number);
        const [ho, mo] = record.check_out.split(":").map(Number);
        totalHours += (ho * 60 + mo - (hi * 60 + mi)) / 60;
      }
    }
    return {
      worker: w,
      present,
      late,
      absent,
      permission,
      totalHours,
      pct: Math.round(((present + late) / monthDates.length) * 100),
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={goBack}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setYear(now.getFullYear());
            setMonth(now.getMonth());
          }}
        >
          <CalendarDays className="h-3 w-3 mr-1" />
          Hoy
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={goForward}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium capitalize">{monthLabel}</span>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-3 w-3 mr-1" />
          Exportar
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-lg" />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Trabajador</th>
                <th className="text-center px-3 py-2 font-medium">
                  Presentes
                </th>
                <th className="text-center px-3 py-2 font-medium">
                  Tardanzas
                </th>
                <th className="text-center px-3 py-2 font-medium">
                  Ausencias
                </th>
                <th className="text-center px-3 py-2 font-medium">
                  Permisos
                </th>
                <th className="text-center px-3 py-2 font-medium">
                  Horas totales
                </th>
                <th className="text-center px-3 py-2 font-medium">
                  % Asistencia
                </th>
              </tr>
            </thead>
            <tbody>
              {summary.map((s, index) => (
                <motion.tr
                  key={s.worker.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="border-t hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage
                          src={s.worker.avatar_url ?? undefined}
                        />
                        <AvatarFallback className="text-[10px]">
                          {s.worker.full_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-xs">
                        {s.worker.full_name}
                      </span>
                    </div>
                  </td>
                  <td className="text-center px-3 py-2">
                    <span className="text-xs font-bold text-green-600">
                      {s.present}
                    </span>
                  </td>
                  <td className="text-center px-3 py-2">
                    <span className="text-xs font-bold text-amber-600">
                      {s.late}
                    </span>
                  </td>
                  <td className="text-center px-3 py-2">
                    <span className="text-xs font-bold text-red-600">
                      {s.absent}
                    </span>
                  </td>
                  <td className="text-center px-3 py-2">
                    <span className="text-xs font-bold text-blue-600">
                      {s.permission}
                    </span>
                  </td>
                  <td className="text-center px-3 py-2 text-xs text-muted-foreground">
                    {s.totalHours.toFixed(1)}h
                  </td>
                  <td className="text-center px-3 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-1.5">
                        <div
                          className={cn(
                            "rounded-full h-1.5 transition-all",
                            s.pct >= 80
                              ? "bg-green-500"
                              : s.pct >= 60
                                ? "bg-amber-500"
                                : "bg-red-500",
                          )}
                          style={{ width: `${Math.min(s.pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold">{s.pct}%</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
