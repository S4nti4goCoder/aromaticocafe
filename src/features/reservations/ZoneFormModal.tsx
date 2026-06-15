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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateZone, useUpdateZone } from "@/hooks/useZones";
import type { Zone } from "@/types";

interface ZoneFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone: Zone | null;
}

export function ZoneFormModal({
  open,
  onOpenChange,
  zone,
}: ZoneFormModalProps) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const createMut = useCreateZone();
  const updateMut = useUpdateZone();
  const isEditing = !!zone;

  useEffect(() => {
    if (open) {
      setName(zone?.name ?? "");
      setNotes(zone?.notes ?? "");
    }
  }, [open, zone]);

  const handleSave = async () => {
    if (!name.trim()) return;
    if (isEditing && zone) {
      await updateMut.mutateAsync({ id: zone.id, input: { name, notes } });
    } else {
      await createMut.mutateAsync({ name, notes });
    }
    onOpenChange(false);
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar zona" : "Nueva zona"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="zone-name">Nombre</Label>
            <Input
              id="zone-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Interior, Terraza, Privado..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="zone-notes">Notas (opcional)</Label>
            <Textarea
              id="zone-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles internos, capacidad total, etc."
              rows={3}
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
