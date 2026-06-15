import { useEffect, useMemo, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAvailableTables } from "@/hooks/useAvailableTables";
import { useZones } from "@/hooks/useZones";
import type { RestaurantTable, Reservation } from "@/types";

export type AssignMode = "confirm" | "change";

interface AssignTableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: AssignMode;
  reservation: Reservation;
  /** Called with the chosen table id (or null for "confirm without table"). */
  onSubmit: (tableId: string | null) => Promise<void> | void;
  isPending?: boolean;
}

export function AssignTableModal({
  open,
  onOpenChange,
  mode,
  reservation,
  onSubmit,
  isPending,
}: AssignTableModalProps) {
  const { data: tables = [], isLoading } = useAvailableTables(
    open
      ? {
          date: reservation.reservation_date,
          time: reservation.reservation_time.slice(0, 5),
          partySize: reservation.party_size,
          excludeReservationId: reservation.id,
        }
      : null,
  );
  const { data: zones = [] } = useZones();
  const [selected, setSelected] = useState<string | null>(null);

  // Pre-select the first (smallest fitting) table whenever the list changes.
  useEffect(() => {
    if (!open) return;
    if (tables.length > 0) {
      setSelected(reservation.table_id ?? tables[0].id);
    } else {
      setSelected(null);
    }
  }, [open, tables, reservation.table_id]);

  const noneAvailable = !isLoading && tables.length === 0;

  const grouped = useMemo(() => {
    const byZone = new Map<string, RestaurantTable[]>();
    for (const t of tables) {
      const key = t.zone_id ?? "__none__";
      const arr = byZone.get(key) ?? [];
      arr.push(t);
      byZone.set(key, arr);
    }
    return byZone;
  }, [tables]);

  const zoneName = (id: string) =>
    id === "__none__"
      ? "Sin zona"
      : (zones.find((z) => z.id === id)?.name ?? "Sin zona");

  const handleSubmit = async () => {
    await onSubmit(selected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "confirm" ? "Confirmar reserva" : "Cambiar mesa"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="rounded-md border p-3">
            <p>
              <span className="text-muted-foreground">Fecha: </span>
              {reservation.reservation_date}
            </p>
            <p>
              <span className="text-muted-foreground">Hora: </span>
              {reservation.reservation_time.slice(0, 5)}
            </p>
            <p>
              <span className="text-muted-foreground">Personas: </span>
              {reservation.party_size}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : noneAvailable ? (
            <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm flex gap-2 items-start">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <span>
                No hay mesas disponibles para esa fecha y hora con la
                capacidad solicitada. Puedes{" "}
                {mode === "confirm"
                  ? "confirmar sin mesa"
                  : "guardar sin mesa"}{" "}
                y asignar una más tarde.
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from(grouped.entries()).map(([zoneKey, list]) => (
                <div key={zoneKey} className="space-y-1.5">
                  <Label className="text-xs uppercase text-muted-foreground">
                    {zoneName(zoneKey)}
                  </Label>
                  {list.map((t) => (
                    <label
                      key={t.id}
                      className={`flex items-center justify-between rounded-md border p-2 cursor-pointer ${
                        selected === t.id ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="table"
                          checked={selected === t.id}
                          onChange={() => setSelected(t.id)}
                        />
                        <span className="font-medium">{t.name}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Capacidad {t.capacity}
                      </span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            variant={noneAvailable ? "destructive" : "default"}
          >
            {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            {mode === "confirm"
              ? noneAvailable
                ? "Confirmar sin mesa"
                : "Confirmar con esta mesa"
              : noneAvailable
                ? "Guardar sin mesa"
                : "Cambiar a esta mesa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
