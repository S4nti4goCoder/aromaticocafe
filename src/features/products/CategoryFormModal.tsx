import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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

  const {
    register,
    handleSubmit,
    reset,
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
      });
    } else {
      reset(defaultValues);
    }
  }, [category, reset]);

  const isPending = createCategory.isPending || updateCategory.isPending;

  const onSubmit = async (data: CategoryFormData) => {
    if (isEditing && category) {
      await updateCategory.mutateAsync({ id: category.id, ...data });
    } else {
      await createCategory.mutateAsync(data);
    }
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Editar categoría" : "Nueva categoría"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Modifica los datos de la categoría."
              : "Completa los datos para crear una nueva categoría."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              className="h-4 w-4"
              {...register("is_active")}
            />
            <Label htmlFor="is_active">Categoría activa</Label>
          </div>

          <div className="flex gap-2 pt-4">
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
      </SheetContent>
    </Sheet>
  );
}
