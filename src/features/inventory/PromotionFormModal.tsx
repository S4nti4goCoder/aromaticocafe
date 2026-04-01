import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useCreatePromotion, useUpdatePromotion } from "@/hooks/usePromotions";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import type { Promotion, PromotionFormData } from "@/types";

interface PromotionFormModalProps {
  open: boolean;
  onClose: () => void;
  promotion?: Promotion | null;
}

const defaultValues: PromotionFormData = {
  name: "",
  description: "",
  type: "descuento_porcentaje",
  value: "",
  applies_to: "todos",
  product_id: "",
  category_id: "",
  is_active: true,
  starts_at: new Date().toISOString().slice(0, 16),
  ends_at: "",
};

const typeLabels = {
  descuento_porcentaje: "Descuento %",
  descuento_precio: "Descuento precio fijo",
  "2x1": "2x1",
  precio_fijo: "Precio fijo",
};

const typeValueLabel = {
  descuento_porcentaje: "Porcentaje de descuento (%)",
  descuento_precio: "Monto de descuento ($)",
  "2x1": "N/A",
  precio_fijo: "Precio final ($)",
};

export function PromotionFormModal({
  open,
  onClose,
  promotion,
}: PromotionFormModalProps) {
  const isEditing = !!promotion;
  const createPromotion = useCreatePromotion();
  const updatePromotion = useUpdatePromotion();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<PromotionFormData>({ defaultValues });

  const appliesTo = watch("applies_to");
  const promotionType = watch("type");
  const isPending = createPromotion.isPending || updatePromotion.isPending;

  useEffect(() => {
    if (promotion) {
      reset({
        name: promotion.name,
        description: promotion.description ?? "",
        type: promotion.type,
        value: promotion.value.toString(),
        applies_to: promotion.applies_to,
        product_id: promotion.product_id ?? "",
        category_id: promotion.category_id ?? "",
        is_active: promotion.is_active,
        starts_at: promotion.starts_at.slice(0, 16),
        ends_at: promotion.ends_at?.slice(0, 16) ?? "",
      });
    } else {
      reset(defaultValues);
    }
  }, [promotion, reset]);

  const onSubmit = async (data: PromotionFormData) => {
    if (isEditing && promotion) {
      await updatePromotion.mutateAsync({ id: promotion.id, ...data });
    } else {
      await createPromotion.mutateAsync(data);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar promoción" : "Nueva promoción"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos de la promoción."
              : "Configura una nueva promoción."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              placeholder="Ej: 2x1 en bebidas frías"
              {...register("name", { required: "El nombre es requerido" })}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Descripción opcional..."
              rows={2}
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de promoción *</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {Object.entries(typeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {promotionType !== "2x1" && (
            <div className="space-y-2">
              <Label htmlFor="value">{typeValueLabel[promotionType]} *</Label>
              <Input
                id="value"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                {...register("value", {
                  required:
                    (promotionType as string) !== "2x1"
                      ? "Este campo es requerido"
                      : false,
                })}
              />
              {errors.value && (
                <p className="text-xs text-destructive">
                  {errors.value.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Aplica a *</Label>
            <Controller
              name="applies_to"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="todos">Todos los productos</SelectItem>
                    <SelectItem value="categoria">Una categoría</SelectItem>
                    <SelectItem value="producto">
                      Un producto específico
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {appliesTo === "categoria" && (
            <div className="space-y-2">
              <Label>Categoría *</Label>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {appliesTo === "producto" && (
            <div className="space-y-2">
              <Label>Producto *</Label>
              <Controller
                name="product_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="starts_at">Fecha inicio *</Label>
              <Input
                id="starts_at"
                type="datetime-local"
                {...register("starts_at", {
                  required: "La fecha de inicio es requerida",
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ends_at">Fecha fin</Label>
              <Input
                id="ends_at"
                type="datetime-local"
                {...register("ends_at")}
              />
            </div>
          </div>

          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-3">
                <Checkbox
                  id="is_active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Promoción activa
                </Label>
              </div>
            )}
          />

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
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear promoción"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
