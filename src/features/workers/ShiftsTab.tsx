import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Upload,
  Download,
  FileSpreadsheet,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import * as XLSX from "xlsx";
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
  useShifts,
  useCreateShift,
  useUpdateShift,
  useDeleteShift,
} from "@/hooks/useShifts";
import { useWorkers } from "@/hooks/useWorkers";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { cn } from "@/lib/utils";
import type { Shift, ShiftFormData } from "@/types";

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  gerente: "Gerente",
  cajero: "Cajero",
  barista: "Barista",
};

function getWeekDates(offset: number) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay() + 1 + offset * 7);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const QUICK_SHIFTS = [
  { label: "Mañana", start: "06:00", end: "14:00" },
  { label: "Tarde", start: "14:00", end: "22:00" },
  { label: "Completo", start: "08:00", end: "17:00" },
];

export function ShiftsTab() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [formModal, setFormModal] = useState<{
    open: boolean;
    shift?: Shift | null;
    prefillDate?: string;
    prefillWorkerId?: string;
  }>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<Shift | null>(null);

  // Import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importModal, setImportModal] = useState(false);
  const [importData, setImportData] = useState<
    { worker_name: string; date: string; start: string; end: string; notes: string; valid: boolean; error?: string }[]
  >([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: number } | null>(null);

  // Form state
  const [formWorkerId, setFormWorkerId] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const weekDates = getWeekDates(weekOffset);
  const startDate = weekDates[0];
  const endDate = weekDates[6];

  const { data: shifts = [], isLoading } = useShifts({ startDate, endDate });
  const { data: workers = [] } = useWorkers();
  const activeWorkers = workers.filter((w) => w.status === "activo");
  const createShift = useCreateShift();
  const updateShift = useUpdateShift();
  const deleteShift = useDeleteShift();

  const openForm = (opts?: {
    shift?: Shift;
    date?: string;
    workerId?: string;
  }) => {
    if (opts?.shift) {
      setFormWorkerId(opts.shift.worker_id);
      setFormDate(opts.shift.date);
      setFormStart(opts.shift.start_time);
      setFormEnd(opts.shift.end_time);
      setFormNotes(opts.shift.notes ?? "");
    } else {
      setFormWorkerId(opts?.workerId ?? "");
      setFormDate(opts?.date ?? "");
      setFormStart("");
      setFormEnd("");
      setFormNotes("");
    }
    setFormModal({ open: true, shift: opts?.shift ?? null });
  };

  const handleSubmit = async () => {
    if (!formWorkerId || !formDate || !formStart || !formEnd) return;
    const data: ShiftFormData = {
      worker_id: formWorkerId,
      date: formDate,
      start_time: formStart,
      end_time: formEnd,
      notes: formNotes,
    };
    if (formModal.shift) {
      await updateShift.mutateAsync({ id: formModal.shift.id, formData: data });
    } else {
      await createShift.mutateAsync(data);
    }
    setFormModal({ open: false });
  };

  const weekLabel = (() => {
    const s = new Date(startDate + "T12:00:00");
    const e = new Date(endDate + "T12:00:00");
    const fmt = (d: Date) =>
      d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
    return `${fmt(s)} — ${fmt(e)}`;
  })();

  const today = new Date().toISOString().split("T")[0];

  // Normalizar hora: "6:00" → "06:00", "14" → "14:00"
  const normalizeTime = (v: string): string => {
    if (!v) return "";
    const clean = String(v).trim();
    // Handle Excel decimal time (0.25 = 06:00, 0.5 = 12:00)
    const num = parseFloat(clean);
    if (!isNaN(num) && num >= 0 && num < 1) {
      const totalMin = Math.round(num * 24 * 60);
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    const parts = clean.split(":");
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
    }
    if (/^\d{1,2}$/.test(clean)) {
      return `${clean.padStart(2, "0")}:00`;
    }
    return clean;
  };

  // Normalizar fecha: "2026-04-10" o "10/04/2026" o Excel serial
  const normalizeDate = (v: string | number): string => {
    if (!v) return "";
    if (typeof v === "number") {
      // Excel serial date
      const d = XLSX.SSF.parse_date_code(v);
      return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
    }
    const s = String(v).trim();
    // DD/MM/YYYY
    const slash = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
    if (slash) {
      return `${slash[3]}-${slash[2].padStart(2, "0")}-${slash[1].padStart(2, "0")}`;
    }
    // Already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    return s;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

      const parsed = rows.map((row) => {
        const workerName = String(row["Trabajador"] ?? row["trabajador"] ?? row["Nombre"] ?? row["nombre"] ?? "").trim();
        const date = normalizeDate(row["Fecha"] ?? row["fecha"] ?? "" as string | number);
        const start = normalizeTime(String(row["Inicio"] ?? row["inicio"] ?? row["Entrada"] ?? row["entrada"] ?? ""));
        const end = normalizeTime(String(row["Fin"] ?? row["fin"] ?? row["Salida"] ?? row["salida"] ?? ""));
        const notes = String(row["Notas"] ?? row["notas"] ?? "").trim();

        // Validate
        const matchedWorker = workers.find(
          (w) => w.full_name.toLowerCase() === workerName.toLowerCase(),
        );
        let valid = true;
        let error = "";
        if (!workerName) { valid = false; error = "Falta nombre"; }
        else if (!matchedWorker) { valid = false; error = "Trabajador no encontrado"; }
        else if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) { valid = false; error = "Fecha inválida"; }
        else if (!start || !/^\d{2}:\d{2}$/.test(start)) { valid = false; error = "Hora inicio inválida"; }
        else if (!end || !/^\d{2}:\d{2}$/.test(end)) { valid = false; error = "Hora fin inválida"; }

        return { worker_name: workerName, date, start, end, notes, valid, error };
      });

      setImportData(parsed);
      setImportResult(null);
      setImportModal(true);
    };
    reader.readAsArrayBuffer(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImportConfirm = async () => {
    const validRows = importData.filter((r) => r.valid);
    if (validRows.length === 0) return;

    setImporting(true);
    let success = 0;
    let errors = 0;

    for (const row of validRows) {
      const worker = workers.find(
        (w) => w.full_name.toLowerCase() === row.worker_name.toLowerCase(),
      );
      if (!worker) { errors++; continue; }
      try {
        await createShift.mutateAsync({
          worker_id: worker.id,
          date: row.date,
          start_time: row.start,
          end_time: row.end,
          notes: row.notes,
        });
        success++;
      } catch {
        errors++;
      }
    }

    setImporting(false);
    setImportResult({ success, errors });
  };

  const downloadTemplate = () => {
    const templateData = [
      { Trabajador: "Laura Gómez", Fecha: "2026-04-10", Inicio: "06:00", Fin: "14:00", Notas: "" },
      { Trabajador: "Andrés Ramírez", Fecha: "2026-04-10", Inicio: "14:00", Fin: "22:00", Notas: "Turno extra" },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    ws["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Turnos");
    XLSX.writeFile(wb, "plantilla_turnos.xlsx");
  };

  return (
    <div className="space-y-4">
      {/* Week nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setWeekOffset((v) => v - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-36 text-center">
            {weekLabel}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setWeekOffset((v) => v + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {weekOffset !== 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setWeekOffset(0)}
            >
              Hoy
            </Button>
          )}
        </div>
        <PermissionGuard module="workers" action="can_create">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={downloadTemplate}
            >
              <Download className="mr-1 h-3 w-3" />
              Plantilla
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-1 h-3 w-3" />
              Importar Excel
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button size="sm" onClick={() => openForm()}>
              <Plus className="mr-1 h-3 w-3" />
              Asignar turno
            </Button>
          </div>
        </PermissionGuard>
      </div>

      {/* Grid semanal */}
      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2 font-medium w-40">
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
                    <div className="text-xs">{DAY_LABELS[i]}</div>
                    <div
                      className={cn(
                        "text-xs",
                        date === today && "text-primary font-bold",
                      )}
                    >
                      {new Date(date + "T12:00:00").getDate()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeWorkers.map((worker) => (
                <tr key={worker.id} className="border-t">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={worker.avatar_url ?? undefined} />
                        <AvatarFallback className="text-[10px]">
                          {worker.full_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium truncate max-w-28">
                          {worker.full_name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {roleLabels[worker.role]}
                        </p>
                      </div>
                    </div>
                  </td>
                  {weekDates.map((date) => {
                    const dayShifts = shifts.filter(
                      (s) => s.worker_id === worker.id && s.date === date,
                    );
                    return (
                      <td
                        key={date}
                        className={cn(
                          "px-1 py-1 text-center align-top",
                          date === today && "bg-primary/5",
                        )}
                      >
                        {dayShifts.length > 0 ? (
                          dayShifts.map((s) => (
                            <PermissionGuard
                              key={s.id}
                              module="workers"
                              action="can_edit"
                              fallback={
                                <div className="text-[10px] rounded bg-primary/10 text-primary px-1 py-0.5 mb-0.5">
                                  {s.start_time.slice(0, 5)}-
                                  {s.end_time.slice(0, 5)}
                                </div>
                              }
                            >
                              <button
                                onClick={() => openForm({ shift: s })}
                                className="w-full text-[10px] rounded bg-primary/10 text-primary px-1 py-0.5 mb-0.5 hover:bg-primary/20 transition-colors group relative"
                              >
                                {s.start_time.slice(0, 5)}-
                                {s.end_time.slice(0, 5)}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteTarget(s);
                                  }}
                                  className="absolute -top-1 -right-1 hidden group-hover:flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-white text-[8px]"
                                >
                                  ×
                                </button>
                              </button>
                            </PermissionGuard>
                          ))
                        ) : (
                          <PermissionGuard
                            module="workers"
                            action="can_create"
                          >
                            <button
                              onClick={() =>
                                openForm({ date, workerId: worker.id })
                              }
                              className="w-full h-6 rounded border border-dashed border-transparent hover:border-muted-foreground/30 transition-colors text-[10px] text-muted-foreground/30 hover:text-muted-foreground/60"
                            >
                              +
                            </button>
                          </PermissionGuard>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {activeWorkers.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No hay trabajadores activos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Form modal */}
      <Dialog
        open={formModal.open}
        onOpenChange={(open) => !open && setFormModal({ open: false })}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {formModal.shift ? "Editar turno" : "Asignar turno"}
            </DialogTitle>
            <DialogDescription>
              Configura el horario del trabajador.
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
                      {w.full_name} ({roleLabels[w.role]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Fecha *</Label>
              <Input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Turnos rápidos</Label>
              <div className="flex gap-2">
                {QUICK_SHIFTS.map((qs) => (
                  <Button
                    key={qs.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => {
                      setFormStart(qs.start);
                      setFormEnd(qs.end);
                    }}
                  >
                    {qs.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Inicio *</Label>
                <Input
                  type="time"
                  value={formStart}
                  onChange={(e) => setFormStart(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Fin *</Label>
                <Input
                  type="time"
                  value={formEnd}
                  onChange={(e) => setFormEnd(e.target.value)}
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
                onClick={() => setFormModal({ open: false })}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={
                  !formWorkerId ||
                  !formDate ||
                  !formStart ||
                  !formEnd ||
                  createShift.isPending ||
                  updateShift.isPending
                }
              >
                {formModal.shift ? "Actualizar" : "Asignar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar turno"
        description="¿Estás seguro de eliminar este turno?"
        destructive
        confirmLabel="Eliminar"
        loading={deleteShift.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteShift.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
      />

      {/* Import modal */}
      <Dialog
        open={importModal}
        onOpenChange={(open) => {
          if (!open && !importing) {
            setImportModal(false);
            setImportData([]);
            setImportResult(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Importar turnos
            </DialogTitle>
            <DialogDescription>
              Revisa los datos antes de importar. Las filas con errores se
              omitirán.
            </DialogDescription>
          </DialogHeader>

          {importResult ? (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
                <div>
                  <p className="font-bold text-lg">Importación completada</p>
                  <p className="text-sm text-muted-foreground">
                    {importResult.success} turno
                    {importResult.success === 1 ? "" : "s"} importado
                    {importResult.success === 1 ? "" : "s"}
                    {importResult.errors > 0 &&
                      ` — ${importResult.errors} error${importResult.errors === 1 ? "" : "es"}`}
                  </p>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setImportModal(false);
                  setImportData([]);
                  setImportResult(null);
                }}
              >
                Cerrar
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium w-8"></th>
                      <th className="px-3 py-2 text-left font-medium">
                        Trabajador
                      </th>
                      <th className="px-3 py-2 text-left font-medium">
                        Fecha
                      </th>
                      <th className="px-3 py-2 text-left font-medium">
                        Inicio
                      </th>
                      <th className="px-3 py-2 text-left font-medium">Fin</th>
                      <th className="px-3 py-2 text-left font-medium">
                        Notas
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {importData.map((row, i) => (
                      <tr
                        key={i}
                        className={
                          row.valid
                            ? "border-t"
                            : "border-t bg-destructive/5"
                        }
                      >
                        <td className="px-3 py-1.5">
                          {row.valid ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                          )}
                        </td>
                        <td className="px-3 py-1.5">{row.worker_name}</td>
                        <td className="px-3 py-1.5">{row.date}</td>
                        <td className="px-3 py-1.5">{row.start}</td>
                        <td className="px-3 py-1.5">{row.end}</td>
                        <td className="px-3 py-1.5">
                          {row.valid ? (
                            row.notes
                          ) : (
                            <span className="text-destructive">
                              {row.error}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {importData.filter((r) => r.valid).length} válidos de{" "}
                  {importData.length} filas
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setImportModal(false);
                      setImportData([]);
                    }}
                    disabled={importing}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleImportConfirm}
                    disabled={
                      importing ||
                      importData.filter((r) => r.valid).length === 0
                    }
                  >
                    {importing && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Importar {importData.filter((r) => r.valid).length} turno
                    {importData.filter((r) => r.valid).length === 1
                      ? ""
                      : "s"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
