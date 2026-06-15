import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCreateSupplier, useUpdateSupplier } from "@/hooks/useSuppliers";
import type { Supplier, SupplierFormData } from "@/types";

const defaults: SupplierFormData = {
  name: "",
  contact_name: "",
  phone: "",
  email: "",
  nit: "",
  address: "",
  notes: "",
  is_active: true,
};

interface Props {
  open: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
}

export function SupplierFormModal({ open, onClose, supplier }: Props) {
  const isEditing = !!supplier;
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormData>({ defaultValues: defaults });

  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name,
        contact_name: supplier.contact_name ?? "",
        phone: supplier.phone ?? "",
        email: supplier.email ?? "",
        nit: supplier.nit ?? "",
        address: supplier.address ?? "",
        notes: supplier.notes ?? "",
        is_active: supplier.is_active,
      });
    } else {
      reset(defaults);
    }
  }, [supplier, reset]);

  const isPending = createSupplier.isPending || updateSupplier.isPending;

  const onSubmit = async (data: SupplierFormData) => {
    if (isEditing && supplier) {
      await updateSupplier.mutateAsync({ id: supplier.id, form: data });
    } else {
      await createSupplier.mutateAsync(data);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle>
          <DialogDescription>Datos de contacto del proveedor.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" {...register("name", { required: "El nombre es requerido" })} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_name">Persona de contacto</Label>
            <Input id="contact_name" {...register("contact_name")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nit">NIT</Label>
              <Input id="nit" {...register("nit")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" type="email" {...register("email")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" {...register("address")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" rows={2} {...register("notes")} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
