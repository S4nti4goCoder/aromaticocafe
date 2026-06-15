import { PlayCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/features/caja/format";
import type { ParkedOrder } from "@/features/caja/parking";

interface ParkingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: ParkedOrder[];
  onResume: (order: ParkedOrder) => void;
  onDelete: (id: string) => void;
}

// Lists parked orders so the cashier can resume or delete them.
export function ParkingModal({
  open,
  onOpenChange,
  orders,
  onResume,
  onDelete,
}: ParkingModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pedidos en espera</DialogTitle>
          <DialogDescription>
            Retoma un pedido guardado o elimínalo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay pedidos en espera
            </p>
          ) : (
            orders.map((order) => {
              const total = order.cart.reduce((s, i) => s + i.subtotal, 0);
              return (
                <div
                  key={order.id}
                  className="rounded-lg border p-3 flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{order.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.cart.length} producto
                      {order.cart.length === 1 ? "" : "s"} •{" "}
                      {formatCurrency(total)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleTimeString("es-CO", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button size="sm" onClick={() => onResume(order)}>
                      <PlayCircle className="h-3 w-3 mr-1" />
                      Retomar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDelete(order.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
