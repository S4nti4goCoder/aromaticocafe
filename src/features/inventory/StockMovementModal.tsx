import { useForm, Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateStock } from "@/hooks/useInventory";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import type { InventoryMovementType } from "@/types";

interface StockMovementModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  category_id: string;
  product_id: string;
  type: InventoryMovementType;
  quantity: string;
  reason: string;
}

const defaultValues: FormData = {
  category_id: "",
  product_id: "",
  type: "entrada",
  quantity: "",
  reason: "",
};

export function StockMovementModal({ open, onClose }: StockMovementModalProps) {
  const updateStock = useUpdateStock();
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();

  const { register, handleSubmit, reset, control, watch } = useForm<FormData>({
    defaultValues,
  });

  const selectedCategoryId = watch("category_id");
  const selectedProductId = watch("product_id");
  const selectedType = watch("type");
  const quantity = watch("quantity");

  const filteredProducts = products.filter(
    (p) =>
      p.is_active &&
      (selectedCategoryId === "all" || p.category_id === selectedCategoryId),
  );

  const onSubmit = async (data: FormData) => {
    if (!data.product_id || !data.quantity) return;

    await updateStock.mutateAsync({
      productId: data.product_id,
      type: data.type,
      quantity: parseInt(data.quantity),
      reason: data.reason || undefined,
    });

    reset(defaultValues);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        reset(defaultValues);
        onClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar movimiento de inventario</DialogTitle>
          <DialogDescription>
            Selecciona el producto y registra la entrada, salida o ajuste de
            stock.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Categoría */}
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="all">Todas las categorías</SelectItem>
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

          {/* Producto */}
          <div className="space-y-2">
            <Label>Producto *</Label>
            <Controller
              name="product_id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {filteredProducts.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No hay productos
                      </SelectItem>
                    ) : (
                      filteredProducts.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo de movimiento *</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="entrada">
                      Entrada (agregar stock)
                    </SelectItem>
                    <SelectItem value="salida">
                      Salida (reducir stock)
                    </SelectItem>
                    <SelectItem value="ajuste">
                      Ajuste (fijar cantidad exacta)
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label>
              {selectedType === "ajuste"
                ? "Nueva cantidad total *"
                : "Cantidad *"}
            </Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              {...register("quantity", { required: true })}
            />
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label>Motivo</Label>
            <Input
              placeholder="Ej: Compra a proveedor, merma, ajuste de inventario..."
              {...register("reason")}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                reset(defaultValues);
                onClose();
              }}
              disabled={updateStock.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={
                !selectedProductId || !quantity || updateStock.isPending
              }
            >
              {updateStock.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Registrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
