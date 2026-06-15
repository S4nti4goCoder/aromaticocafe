import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useCreateTable, useUpdateTable } from "@/hooks/useTables";
import { useZones } from "@/hooks/useZones";
import type { RestaurantTable } from "@/types";

interface TableFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: RestaurantTable | null;
}

export function TableFormModal({
  open,
  onOpenChange,
  table,
}: TableFormModalProps) {
  const { data: zones = [] } = useZones();
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("4");
  const [zoneId, setZoneId] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const createMut = useCreateTable();
  const updateMut = useUpdateTable();
  const isEditing = !!table;

  useEffect(() => {
    if (open) {
      setName(table?.name ?? "");
      setCapacity(String(table?.capacity ?? 4));
      setZoneId(table?.zone_id ?? "");
      setIsActive(table?.is_active ?? true);
    }
  }, [open, table]);

  const handleSave = async () => {
    const cap = parseInt(capacity, 10);
    if (!name.trim() || Number.isNaN(cap) || cap <= 0) return;
    const input = {
      name,
      capacity: cap,
      zone_id: zoneId || null,
      is_active: isActive,
    };
    if (isEditing && table) {
      await updateMut.mutateAsync({ id: table.id, input });
    } else {
      await createMut.mutateAsync(input);
    }
    onOpenChange(false);
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar mesa" : "Nueva mesa"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="table-name">Nombre</Label>
            <Input
              id="table-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mesa 1, Barra A..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="table-capacity">Capacidad (personas)</Label>
            <Input
              id="table-capacity"
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="table-zone">Zona (opcional)</Label>
            <select
              id="table-zone"
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">Sin zona</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <Label htmlFor="table-active" className="text-sm">
              Mesa activa
            </Label>
            <Switch
              id="table-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isPending}>
            {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
