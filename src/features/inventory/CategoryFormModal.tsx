import { useEffect, useState } from "react";
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
import { ImageUpload } from "@/components/shared/ImageUpload";
import type { Category, CategoryFormData } from "@/types";
import { useCreateCategory, useUpdateCategory } from "@/hooks/useCategories";

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  category?: Category | null;
}

const defaultValues: CategoryFormData = {
  name: "",
  description: "",
  is_active: true,
  image_url: null,
};

export function CategoryFormModal({
  open,
  onClose,
  category,
}: CategoryFormModalProps) {
  const isEditing = !!category;
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues,
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description ?? "",
        is_active: category.is_active,
        image_url: category.image_url,
      });
      setImageUrl(category.image_url);
    } else {
      reset(defaultValues);
      setImageUrl(null);
    }
  }, [category, reset]);

  const isPending = createCategory.isPending || updateCategory.isPending;

  const onSubmit = async (data: CategoryFormData) => {
    const payload = { ...data, image_url: imageUrl };
    if (isEditing && category) {
      await updateCategory.mutateAsync({ id: category.id, ...payload });
    } else {
      await createCategory.mutateAsync(payload);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar categoría" : "Nueva categoría"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos de la categoría."
              : "Completa los datos para crear una nueva categoría."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Imagen</Label>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              folder="categories"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              placeholder="Ej: Bebidas calientes"
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
              rows={3}
              {...register("description")}
            />
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
                  Categoría activa
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
              {isEditing ? "Guardar cambios" : "Crear categoría"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
