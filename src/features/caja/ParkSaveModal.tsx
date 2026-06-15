import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ParkSaveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parkName: string;
  onParkNameChange: (value: string) => void;
  onSave: () => void;
}

// Asks for a name before parking the current cart.
export function ParkSaveModal({
  open,
  onOpenChange,
  parkName,
  onParkNameChange,
  onSave,
}: ParkSaveModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Guardar pedido en espera</DialogTitle>
          <DialogDescription>
            Asigna un nombre para identificarlo después.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre / mesa *</Label>
            <Input
              placeholder="Ej: Mesa 3, Juan, Para llevar..."
              value={parkName}
              onChange={(e) => onParkNameChange(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={onSave}
              disabled={!parkName.trim()}
            >
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
