// Modal para gestionar un cliente desde el panel:
//   · editar nombre y teléfono
//   · ajustar sellos/puntos a mano (con razón, queda auditado)
//   · anonimizar (borra los datos personales por habeas data)
// Todo via RPCs SECURITY DEFINER; solo gerente/super_admin llegan aquí.
import { useState } from "react";
import { Loader2, ShieldOff } from "lucide-react";
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
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  useUpdateCustomer,
  useAnonymizeCustomer,
  useAdjustCustomerLoyalty,
} from "@/hooks/useCustomers";
import { normalizePhone } from "@/lib/phone";
import type { Customer } from "@/types";

interface CustomerFormModalProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loyaltyMode: "sellos" | "puntos";
  stampsRequired: number;
}

export function CustomerFormModal({
  customer,
  open,
  onOpenChange,
  loyaltyMode,
  stampsRequired,
}: CustomerFormModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [stamps, setStamps] = useState("");
  const [points, setPoints] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [anonOpen, setAnonOpen] = useState(false);
  const [anonReason, setAnonReason] = useState("");

  const update = useUpdateCustomer();
  const adjust = useAdjustCustomerLoyalty();
  const anonymize = useAnonymizeCustomer();

  // Rellena los campos cada vez que se abre con un cliente distinto.
  const [loadedId, setLoadedId] = useState<string | null>(null);
  if (customer && customer.id !== loadedId) {
    setLoadedId(customer.id);
    setName(customer.name ?? "");
    setPhone(customer.phone);
    setStamps(String(customer.stamps));
    setPoints(String(customer.points));
    setAdjustReason("");
  }

  if (!customer) return null;

  const phonePreview = normalizePhone(phone);
  const canSaveData =
    phonePreview.length > 0 && !update.isPending;

  const stampsNum = parseInt(stamps || "0", 10) || 0;
  const pointsNum = parseInt(points || "0", 10) || 0;
  const loyaltyChanged =
    loyaltyMode === "sellos"
      ? stampsNum !== customer.stamps
      : pointsNum !== customer.points;
  const canAdjust =
    loyaltyChanged && adjustReason.trim().length >= 3 && !adjust.isPending;

  const handleSaveData = async () => {
    try {
      await update.mutateAsync({ id: customer.id, name, phone });
      onOpenChange(false);
    } catch {
      // el toast del hook ya muestra el error
    }
  };

  const handleAdjust = async () => {
    try {
      await adjust.mutateAsync({
        id: customer.id,
        stamps: stampsNum,
        points: pointsNum,
        reason: adjustReason.trim(),
      });
      setAdjustReason("");
    } catch {
      // toast del hook
    }
  };

  const handleAnonymize = async () => {
    try {
      await anonymize.mutateAsync({
        id: customer.id,
        reason: anonReason.trim(),
      });
      setAnonOpen(false);
      setAnonReason("");
      onOpenChange(false);
    } catch {
      // toast del hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
          <DialogDescription>
            Corrige sus datos, ajusta su fidelización o borra sus datos
            personales.
          </DialogDescription>
        </DialogHeader>

        {/* Datos */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="cust-name">Nombre</Label>
            <Input
              id="cust-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del cliente"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cust-phone">Teléfono</Label>
            <Input
              id="cust-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="3001234567"
            />
            {phonePreview !== phone.replace(/\s/g, "") && phonePreview && (
              <p className="text-[11px] text-muted-foreground">
                Se guardará como: {phonePreview}
              </p>
            )}
          </div>
          <Button
            className="w-full"
            onClick={handleSaveData}
            disabled={!canSaveData}
          >
            {update.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Guardar datos
          </Button>
        </div>

        {/* Ajuste de fidelización */}
        <div className="space-y-3 border-t pt-4">
          <Label className="text-sm font-medium">Ajustar fidelización</Label>
          {loyaltyMode === "sellos" ? (
            <div className="space-y-1.5">
              <Label htmlFor="cust-stamps" className="text-xs">
                Sellos (de {stampsRequired})
              </Label>
              <Input
                id="cust-stamps"
                type="number"
                min="0"
                value={stamps}
                onChange={(e) => setStamps(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="cust-points" className="text-xs">
                Puntos
              </Label>
              <Input
                id="cust-points"
                type="number"
                min="0"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="cust-reason" className="text-xs">
              Razón del ajuste
            </Label>
            <Input
              id="cust-reason"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="Ej: cortesía, corrección de error"
            />
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleAdjust}
            disabled={!canAdjust}
          >
            {adjust.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Aplicar ajuste
          </Button>
        </div>

        {/* Zona de peligro */}
        <div className="space-y-2 border-t border-destructive/30 pt-4">
          <Label className="text-sm font-medium text-destructive">
            Borrar datos personales
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Borra nombre y teléfono del cliente y de sus ventas. Conserva el
            saldo de fidelización y las cifras del negocio. No se puede
            deshacer.
          </p>
          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
            onClick={() => setAnonOpen(true)}
          >
            <ShieldOff className="mr-2 h-4 w-4" />
            Anonimizar cliente
          </Button>
        </div>
      </DialogContent>

      <ConfirmDialog
        open={anonOpen}
        onOpenChange={(o) => {
          setAnonOpen(o);
          if (!o) setAnonReason("");
        }}
        title="Anonimizar cliente"
        description="Esto borra el nombre y el teléfono de forma permanente. Escribe una razón para la auditoría."
        confirmLabel="Anonimizar"
        destructive
        loading={anonymize.isPending}
        disabled={anonReason.trim().length < 5}
        onConfirm={handleAnonymize}
      >
        <Input
          value={anonReason}
          onChange={(e) => setAnonReason(e.target.value)}
          placeholder="Ej: el cliente pidió borrar sus datos"
          className="mt-2"
        />
      </ConfirmDialog>
    </Dialog>
  );
}
