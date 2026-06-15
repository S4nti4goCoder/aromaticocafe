import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonRows } from "@/components/shared/SkeletonRows";
import { useReservations } from "@/hooks/useReservations";
import { useTables } from "@/hooks/useTables";
import { useZones } from "@/hooks/useZones";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import {
  useBusinessHours,
  dayKey,
  dayLabel,
  hoursOn,
} from "@/hooks/useBusinessHours";
import { ReservationDetailModal } from "@/features/reservations/ReservationDetailModal";
import { localDateString } from "@/lib/localDate";
import type { ReservationStatus } from "@/types";

const STATUS_BG: Record<ReservationStatus, string> = {
  pendiente: "bg-amber-500",
  confirmada: "bg-green-600",
  cancelada: "bg-red-600",
  completada: "bg-blue-600",
  no_show: "bg-gray-600",
};

const PX_PER_HOUR = 80;

function shiftDate(dateISO: string, days: number): string {
  const d = new Date(dateISO + "T12:00:00");
  d.setDate(d.getDate() + days);
  return localDateString(d);
}

function minutesFromMidnight(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function CalendarPage() {
  const [date, setDate] = useState(() => localDateString());
  const [zoneFilter, setZoneFilter] = useState<string>("");
  // Id en vez de objeto: el modal lee la fila fresca tras cada refetch.
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { settings } = useSystemSettings();
  const slotMinutes = settings?.reservation_slot_minutes ?? 120;
  const hoursCfg = useBusinessHours();
  const dayHours = hoursOn(hoursCfg, date);
  const dKey = dayKey(date);

  const { data: tables = [] } = useTables();
  const { data: zones = [] } = useZones();
  const { data: reservationsResult, isLoading } = useReservations(
    { fromDate: date, toDate: date, status: "all" },
    1,
  );
  const allReservations = reservationsResult?.rows ?? [];
  const selected = selectedId
    ? (allReservations.find((r) => r.id === selectedId) ?? null)
    : null;

  const activeTables = useMemo(
    () =>
      tables
        .filter((t) => t.is_active)
        .filter((t) => !zoneFilter || t.zone_id === zoneFilter),
    [tables, zoneFilter],
  );

  const tablesByZone = useMemo(() => {
    const m = new Map<string, typeof activeTables>();
    for (const t of activeTables) {
      const key = t.zone_id ?? "__none__";
      const arr = m.get(key) ?? [];
      arr.push(t);
      m.set(key, arr);
    }
    return m;
  }, [activeTables]);

  const zoneName = (id: string) =>
    id === "__none__"
      ? "Sin zona"
      : (zones.find((z) => z.id === id)?.name ?? "Sin zona");

  const unassigned = allReservations.filter(
    (r) => !r.table_id && r.status !== "cancelada",
  );

  // Time columns derived from business hours, fall back to 8–22 when null.
  const openHour = dayHours ? parseInt(dayHours.open.split(":")[0], 10) : 8;
  const closeHour = dayHours
    ? Math.max(openHour + 1, parseInt(dayHours.close.split(":")[0], 10))
    : 22;
  const hourCols: number[] = [];
  for (let h = openHour; h < closeHour; h++) hourCols.push(h);

  const blockStyle = (time: string) => {
    const startMin = minutesFromMidnight(time);
    const left = ((startMin - openHour * 60) / 60) * PX_PER_HOUR;
    const width = (slotMinutes / 60) * PX_PER_HOUR;
    return { left, width };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Calendario</h2>
        <p className="text-muted-foreground text-sm">
          Vista por día de todas las mesas y sus reservas
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-lg border bg-card p-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Fecha</p>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 w-40"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Zona</p>
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">Todas</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </div>
        <div className="ml-auto flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDate(shiftDate(date, -1))}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDate(localDateString())}
          >
            Hoy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDate(shiftDate(date, 1))}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {!dayHours ? (
        <EmptyState
          icon={CalendarDays}
          title={`Cerrado los ${dayLabel(dKey)}`}
          description="Configura el horario de operación en Ajustes → Horario para abrir este día."
        />
      ) : isLoading ? (
        <SkeletonRows count={4} />
      ) : activeTables.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Sin mesas activas"
          description="Crea mesas en Reservas → Mesas para verlas aquí."
        />
      ) : (
        <div className="rounded-lg border bg-card overflow-x-auto">
          {/* Header row with hours */}
          <div
            className="flex border-b bg-muted/40 sticky top-0 z-10"
            style={{ minWidth: 200 + hourCols.length * PX_PER_HOUR }}
          >
            <div className="w-50 shrink-0 px-3 py-2 text-xs font-medium border-r">
              Mesa
            </div>
            <div className="flex">
              {hourCols.map((h) => (
                <div
                  key={h}
                  className="border-r px-2 py-2 text-xs text-muted-foreground"
                  style={{ width: PX_PER_HOUR }}
                >
                  {String(h).padStart(2, "0")}:00
                </div>
              ))}
            </div>
          </div>

          {/* Rows per zone */}
          {Array.from(tablesByZone.entries()).map(([zoneKey, list]) => (
            <div key={zoneKey}>
              <div className="px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground bg-muted/20 border-b">
                {zoneName(zoneKey)}
              </div>
              {list.map((t) => {
                const reservs = allReservations.filter(
                  (r) => r.table_id === t.id,
                );
                return (
                  <div
                    key={t.id}
                    className="flex border-b min-h-14 relative hover:bg-muted/10"
                    style={{ minWidth: 200 + hourCols.length * PX_PER_HOUR }}
                  >
                    <div className="w-50 shrink-0 px-3 py-2 text-sm border-r">
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Capacidad {t.capacity}
                      </p>
                    </div>
                    <div
                      className="relative flex-1"
                      style={{ minWidth: hourCols.length * PX_PER_HOUR }}
                    >
                      {/* Grid lines */}
                      {hourCols.map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 border-r border-border/40"
                          style={{ left: i * PX_PER_HOUR, width: PX_PER_HOUR }}
                        />
                      ))}
                      {/* Reservation blocks */}
                      {reservs.map((r) => {
                        const time = r.reservation_time.slice(0, 5);
                        const pos = blockStyle(time);
                        return (
                          <motion.button
                            key={r.id}
                            type="button"
                            onClick={() => setSelectedId(r.id)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`absolute top-1.5 bottom-1.5 rounded-md text-white text-xs px-2 text-left ${STATUS_BG[r.status]} hover:opacity-90`}
                            style={pos}
                            title={`${r.customer_name} · ${r.party_size} personas`}
                          >
                            <p className="font-medium truncate">
                              {time} · {r.customer_name}
                            </p>
                            <p className="opacity-80 truncate">
                              {r.party_size} pers.
                            </p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Unassigned section */}
      {dayHours && unassigned.length > 0 && (
        <div className="rounded-lg border bg-card">
          <div className="px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
            Sin asignar ({unassigned.length})
          </div>
          <div className="divide-y">
            {unassigned.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/20"
              >
                <span>
                  {r.reservation_time.slice(0, 5)} · {r.customer_name} ·{" "}
                  {r.party_size} pers.
                </span>
                <Badge className={`${STATUS_BG[r.status]} text-white`}>
                  {r.status}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      <ReservationDetailModal
        reservation={selected}
        onOpenChange={(o) => {
          if (!o) setSelectedId(null);
        }}
      />
    </div>
  );
}
