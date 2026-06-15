import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
import { formatCurrency } from "@/lib/currency";
import { useProducts } from "@/hooks/useProducts";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useCreatePurchase } from "@/hooks/usePurchases";
import { localDateString } from "@/lib/localDate";

interface Line {
  product_id: string;
  quantity: string;
  unit_cost: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const todayISO = () => localDateString();

export function PurchaseFormModal({ open, onClose }: Props) {
  const { data: products = [] } = useProducts();
  const { data: suppliers = [] } = useSuppliers();
  const createPurchase = useCreatePurchase();

  const [supplierId, setSupplierId] = useState("");
  const [invoice, setInvoice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(todayISO());
  const [paymentMethod, setPaymentMethod] = useState("transferencia");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { product_id: "", quantity: "1", unit_cost: "" },
  ]);

  const reset = () => {
    setSupplierId("");
    setInvoice("");
    setPurchaseDate(todayISO());
    setPaymentMethod("transferencia");
    setNotes("");
    setLines([{ product_id: "", quantity: "1", unit_cost: "" }]);
  };

  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const addLine = () =>
    setLines((prev) => [...prev, { product_id: "", quantity: "1", unit_cost: "" }]);
  const removeLine = (i: number) =>
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));

  const lineSubtotal = (l: Line) =>
    (parseFloat(l.quantity || "0") || 0) * (parseFloat(l.unit_cost || "0") || 0);
  const total = lines.reduce((sum, l) => sum + lineSubtotal(l), 0);

  const validLines = lines.filter(
    (l) => l.product_id && parseInt(l.quantity) > 0 && parseFloat(l.unit_cost) >= 0,
  );
  const canSave = validLines.length > 0 && !createPurchase.isPending;

  const handleSave = async () => {
    await createPurchase.mutateAsync({
      supplier_id: supplierId || null,
      invoice_number: invoice,
      purchase_date: purchaseDate,
      notes,
      payment_method: paymentMethod,
      items: validLines.map((l) => {
        const product = products.find((p) => p.id === l.product_id);
        return {
          product_id: l.product_id,
          product_name: product?.name ?? "",
          quantity: parseInt(l.quantity),
          unit_cost: parseFloat(l.unit_cost),
        };
      }),
    });
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva compra</DialogTitle>
          <DialogDescription>
            Suma stock, actualiza el costo del producto y registra el egreso.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Proveedor</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Fecha</Label>
              <Input
                id="purchase_date"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="invoice">N° de factura</Label>
              <Input id="invoice" value={invoice} onChange={(e) => setInvoice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Método de pago</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Productos</Label>
            {lines.map((line, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Select
                    value={line.product_id}
                    onValueChange={(v) => setLine(i, { product_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Producto" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  className="w-16"
                  placeholder="Cant"
                  value={line.quantity}
                  onChange={(e) => setLine(i, { quantity: e.target.value })}
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-24"
                  placeholder="Costo u."
                  value={line.unit_cost}
                  onChange={(e) => setLine(i, { unit_cost: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => removeLine(i)}
                  disabled={lines.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addLine}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar producto
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="flex justify-between items-center border-t pt-3 font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={createPurchase.isPending}>
              Cancelar
            </Button>
            <Button type="button" className="flex-1" onClick={handleSave} disabled={!canSave}>
              {createPurchase.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar compra
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
