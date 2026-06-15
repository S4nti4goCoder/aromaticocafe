import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Download, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ResponsiveTableWrapper } from "@/components/shared/ResponsiveTableWrapper";
import { useAttendance } from "@/hooks/useAttendance";
import { useWorkers } from "@/hooks/useWorkers";
import { cn } from "@/lib/utils";
import type { Attendance } from "@/types";
import { getMonthDates } from "@/features/workers/attendance/dates";

export function MonthlyView() {
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
  const handleExport = async () => {
    const XLSX = await import("xlsx");
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
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
            className="shrink-0"
          >
            <CalendarDays className="h-3 w-3 mr-1" />
            Hoy
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={goForward}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium capitalize truncate">
            {monthLabel}
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
                <th className="text-left px-4 py-2 font-medium">Trabajador</th>
                <th className="text-center px-3 py-2 font-medium">Presentes</th>
                <th className="text-center px-3 py-2 font-medium">Tardanzas</th>
                <th className="text-center px-3 py-2 font-medium">Ausencias</th>
                <th className="text-center px-3 py-2 font-medium">Permisos</th>
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
                        <AvatarImage src={s.worker.avatar_url ?? undefined} />
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
        </ResponsiveTableWrapper>
      )}
    </div>
  );
}
