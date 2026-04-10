import { useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateTransaction,
  useUpdateTransaction,
} from "@/hooks/useAccounting";
import type { Transaction, TransactionFormData, TransactionType } from "@/types";

interface TransactionFormModalProps {
  open: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  cashRegisterId: string | null;
  editTransaction?: Transaction | null;
}

const ingresoCategories = ["Venta", "Propina", "Otro ingreso"];
const egresoCategories = [
  "Insumos",
  "Servicios",
  "Nómina",
  "Arriendo",
  "Mantenimiento",
  "Otro egreso",
];

const defaultValues: TransactionFormData = {
  type: "ingreso",
  amount: "",
  category: "",
  description: "",
  payment_method: "efectivo",
};

export function TransactionFormModal({
  open,
  onClose,
  defaultType = "ingreso",
  cashRegisterId,
  editTransaction,
}: TransactionFormModalProps) {
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const isEditing = !!editTransaction;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<TransactionFormData>({
    defaultValues: { ...defaultValues, type: defaultType },
  });

  useEffect(() => {
    if (editTransaction) {
      reset({
        type: editTransaction.type,
        amount: String(editTransaction.amount),
        category: editTransaction.category,
        description: editTransaction.description ?? "",
        payment_method: editTransaction.payment_method,
      });
    } else {
      reset({ ...defaultValues, type: defaultType });
    }
  }, [editTransaction, defaultType, reset]);

  const transactionType = useWatch({ control, name: "type" });
  const categories =
    transactionType === "ingreso" ? ingresoCategories : egresoCategories;

  const isPending = createTransaction.isPending || updateTransaction.isPending;

  const onSubmit = async (data: TransactionFormData) => {
    if (isEditing) {
      await updateTransaction.mutateAsync({
        id: editTransaction.id,
        formData: data,
      });
    } else {
      await createTransaction.mutateAsync({ formData: data, cashRegisterId });
    }
    reset({ ...defaultValues, type: defaultType });
    onClose();
  };

  const title = isEditing
    ? "Editar transacción"
    : defaultType === "ingreso"
      ? "Registrar ingreso"
      : "Registrar egreso";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos de la transacción."
              : "Completa los datos de la transacción."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isEditing && (
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="ingreso">Ingreso</SelectItem>
                      <SelectItem value="egreso">Egreso</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Monto *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="100"
              placeholder="0"
              {...register("amount", { required: "El monto es requerido" })}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Categoría *</Label>
            <Controller
              name="category"
              control={control}
              rules={{ required: "La categoría es requerida" }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-xs text-destructive">
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Método de pago *</Label>
            <Controller
              name="payment_method"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Descripción opcional..."
              rows={3}
              {...register("description")}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isPending}
              variant={
                isEditing
                  ? "default"
                  : defaultType === "egreso"
                    ? "destructive"
                    : "default"
              }
            >
              {isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing
                ? "Guardar cambios"
                : defaultType === "ingreso"
                  ? "Registrar ingreso"
                  : "Registrar egreso"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
