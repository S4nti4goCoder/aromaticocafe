import { useState, useMemo } from "react";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ResponsiveTableWrapper } from "@/components/shared/ResponsiveTableWrapper";
import { useAttendance } from "@/hooks/useAttendance";
import { useWorkers } from "@/hooks/useWorkers";
import { cn } from "@/lib/utils";
import type { Attendance } from "@/types";
import { statusConfig } from "@/features/workers/attendance/constants";
import { today, getWeekDates } from "@/features/workers/attendance/dates";

export function WeeklyView() {
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
  const handleExport = async () => {
    const XLSX = await import("xlsx");
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setWeekOffset((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset(0)}
            className="shrink-0"
          >
            Hoy
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setWeekOffset((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium capitalize truncate">
            {weekLabel}
          </span>
        </div>
        <div className="hidden sm:block sm:flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="w-full sm:w-auto"
        >
          <Download className="h-3 w-3 mr-1" />
          Exportar
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-lg" />
      ) : (
        <ResponsiveTableWrapper>
          <table className="w-full text-sm min-w-150">
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
                          <AvatarImage src={worker.avatar_url ?? undefined} />
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
                      if (st === "presente" || st === "tardanza") weekPresent++;
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
        </ResponsiveTableWrapper>
      )}
    </div>
  );
}
