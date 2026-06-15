import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateHiringPosition } from "@/hooks/useHiringPositions";
import type { HiringPosition } from "@/types";

interface PositionEditModalProps {
  open: boolean;
  onClose: () => void;
  position: HiringPosition | null;
}

const POSITION_LABELS: Record<string, string> = {
  barista: "Barista",
  mesero: "Mesero / Mesera",
  cocina: "Cocina",
  caja: "Cajero / Cajera",
  gerencia: "Gerencia / Administración",
  otro: "Otro",
};

export function PositionEditModal({
  open,
  onClose,
  position,
}: PositionEditModalProps) {
  const updatePosition = useUpdateHiringPosition();
  const [titleCustom, setTitleCustom] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);

  // Sync con la posición seleccionada
  useEffect(() => {
    if (!position) return;
    setTitleCustom(position.title_custom ?? "");
    setDescription(position.description ?? "");
    setRequirements(position.requirements ?? "");
    setIsFeatured(position.is_featured);
    setSortOrder(position.sort_order);
  }, [position]);

  if (!position) return null;

  const handleSave = async () => {
    await updatePosition.mutateAsync({
      id: position.id,
      patch: {
        title_custom: titleCustom.trim() || null,
        description: description.trim() || null,
        requirements: requirements.trim() || null,
        is_featured: isFeatured,
        sort_order: sortOrder,
      },
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar vacante: {POSITION_LABELS[position.position]}
          </DialogTitle>
          <DialogDescription>
            Define el título, descripción y requisitos que verá quien quiera
            postularse. Estos campos son opcionales — si los dejas vacíos, se
            mostrará el cargo genérico.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Título personalizado */}
          <div className="space-y-2">
            <Label htmlFor="title_custom">Título personalizado</Label>
            <Input
              id="title_custom"
              placeholder={`Ej: ${POSITION_LABELS[position.position]} senior turno mañana`}
              value={titleCustom}
              onChange={(e) => setTitleCustom(e.target.value)}
              maxLength={120}
            />
            <p className="text-xs text-muted-foreground">
              Si lo dejas vacío, se usará "{POSITION_LABELS[position.position]}".
            </p>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="¿Qué hace esta persona? ¿Cuál es el ambiente del local?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Requisitos */}
          <div className="space-y-2">
            <Label htmlFor="requirements">Requisitos</Label>
            <Textarea
              id="requirements"
              placeholder={`Ej:\n- Mínimo 1 año de experiencia\n- Disponibilidad turno mañana\n- Manejo de máquina espresso`}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              Usa saltos de línea o guiones para listar varios requisitos.
            </p>
          </div>

          {/* Destacar */}
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
            <Checkbox
              id="is_featured"
              checked={isFeatured}
              onCheckedChange={(checked) => setIsFeatured(checked === true)}
              className="cursor-pointer"
            />
            <div className="flex-1">
              <Label
                htmlFor="is_featured"
                className="cursor-pointer flex items-center gap-2"
              >
                <Star className="h-3.5 w-3.5 text-amber-500" />
                Destacar esta vacante
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Aparecerá primero en la página pública con un badge dorado.
              </p>
            </div>
          </div>

          {/* Orden */}
          <div className="space-y-2">
            <Label htmlFor="sort_order">Orden de aparición</Label>
            <Input
              id="sort_order"
              type="number"
              min={0}
              max={999}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              className="max-w-32"
            />
            <p className="text-xs text-muted-foreground">
              Menor número = aparece primero. Las destacadas siempre van antes.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={updatePosition.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleSave}
              disabled={updatePosition.isPending}
            >
              {updatePosition.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Guardar cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
