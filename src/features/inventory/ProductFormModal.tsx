import { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
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
import { ImageUpload } from "@/components/shared/ImageUpload";
import type { Product, ProductFormData, Category } from "@/types";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { useProfile } from "@/hooks/useProfile";
import { useProductCosts, useUpsertProductCost } from "@/hooks/useProductCosts";
import { formatCurrency } from "@/lib/currency";

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  categories: Category[];
}

const defaultValues: ProductFormData = {
  name: "",
  description: "",
  price: "",
  cost: "",
  discount_percentage: "",
  discount_price: "",
  category_id: "",
  is_active: true,
  is_new: false,
  image_url: null,
  min_stock: "5",
};

export function ProductFormModal({
  open,
  onClose,
  product,
  categories,
}: ProductFormModalProps) {
  const isEditing = !!product;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { data: profile } = useProfile();
  const canSeeCost =
    profile?.role === "super_admin" || profile?.role === "gerente";
  const { data: costMap = {} } = useProductCosts();
  const upsertCost = useUpsertProductCost();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues,
  });

  const watchedPrice = useWatch({ control, name: "price" });
  const watchedCost = useWatch({ control, name: "cost" });
  const priceNum = parseFloat(watchedPrice || "0") || 0;
  const costNum = parseFloat(watchedCost || "0") || 0;
  const marginValue = priceNum - costNum;
  const marginPct = priceNum > 0 ? (marginValue / priceNum) * 100 : 0;
  // Distinguir "costo escrito" de "costo vacío". Con costo vacío no mostramos
  // margen porque "100%" sería engañoso (no sabemos el costo real, no es que
  // no tenga costo).
  const hasCost =
    watchedCost !== undefined && watchedCost !== null && watchedCost !== "";

  // Sync the form to the selected product when it changes. Done in an effect
  // (not during render) because reset() updates the Controller fields, and
  // updating other components during render is a React error. costMap is omitted
  // from deps on purpose: it's already cached by the time the modal opens, so we
  // read it once here without re-resetting (and clobbering edits) when it settles.
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description ?? "",
        price: product.price.toString(),
        cost: costMap[product.id]?.toString() ?? "",
        discount_percentage: product.discount_percentage?.toString() ?? "",
        discount_price: product.discount_price?.toString() ?? "",
        category_id: product.category_id ?? "",
        is_active: product.is_active,
        is_new: product.is_new ?? false,
        image_url: product.image_url,
        min_stock: product.min_stock?.toString() ?? "5",
      });
    } else {
      reset(defaultValues);
    }
    setImageUrl(product?.image_url ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, reset]);

  const isPending = createProduct.isPending || updateProduct.isPending;

  const onSubmit = async (data: ProductFormData) => {
    const payload = { ...data, image_url: imageUrl };
    let productId = product?.id;
    if (isEditing && product) {
      await updateProduct.mutateAsync({ id: product.id, formData: payload });
    } else {
      const created = await createProduct.mutateAsync(payload);
      productId = created.id;
    }
    if (canSeeCost && productId) {
      // Si el costo quedó vacío, pasamos null para que el hook borre la fila
      // y el dashboard distinga "sin costo registrado" de "costo 0 explícito".
      await upsertCost.mutateAsync({
        productId,
        cost: hasCost ? costNum : null,
      });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar producto" : "Nuevo producto"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos del producto."
              : "Completa los datos para crear un nuevo producto."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Imagen</Label>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              folder="products"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              placeholder="Ej: Café americano"
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
              placeholder="Ej: Leche entera 200ml, café molido 25g..."
              rows={3}
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Precio *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("price", {
                required: "El precio es requerido",
                min: { value: 0, message: "El precio no puede ser negativo" },
              })}
            />
            {errors.price && (
              <p className="text-xs text-destructive">{errors.price.message}</p>
            )}
          </div>

          {canSeeCost && (
            <div className="space-y-2">
              <Label htmlFor="cost">Costo</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("cost", {
                  min: { value: 0, message: "El costo no puede ser negativo" },
                })}
              />
              {priceNum > 0 && hasCost && (
                <p
                  className={`text-xs ${
                    marginValue < 0
                      ? "font-medium text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {marginValue < 0
                    ? `Pérdida: ${formatCurrency(marginValue)} (${marginPct.toFixed(1)}%) — el costo supera al precio`
                    : `Margen: ${formatCurrency(marginValue)} (${marginPct.toFixed(1)}%)`}
                </p>
              )}
              {errors.cost && (
                <p className="text-xs text-destructive">{errors.cost.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="min_stock">Stock mínimo</Label>
            <Input
              id="min_stock"
              type="number"
              min="0"
              step="1"
              placeholder="5"
              {...register("min_stock", {
                min: { value: 0, message: "No puede ser negativo" },
              })}
            />
            <p className="text-xs text-muted-foreground">
              Cuando el stock baje a este valor o menos, el producto aparecerá
              como "Stock bajo".
            </p>
            {errors.min_stock && (
              <p className="text-xs text-destructive">
                {errors.min_stock.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount_percentage">Descuento %</Label>
            <Input
              id="discount_percentage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="0"
              {...register("discount_percentage")}
            />
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sin categoría" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="none">Sin categoría</SelectItem>
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

          <div className="space-y-3">
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
                    Producto activo
                  </Label>
                </div>
              )}
            />
            <Controller
              name="is_new"
              control={control}
              render={({ field }) => (
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="is_new"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="is_new" className="cursor-pointer">
                      Marcar como Nuevo
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground pl-7">
                    El badge "Nuevo" solo aparece si este producto está en la
                    sección "Favoritos" del landing (Configuración &rarr;
                    Apariencia).
                  </p>
                </div>
              )}
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
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear producto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
