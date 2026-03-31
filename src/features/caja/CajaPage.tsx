import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  LockKeyholeOpen,
  LockKeyhole,
  Loader2,
  Receipt,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import {
  useTodayCashRegister,
  useOpenCashRegister,
  useCloseCashRegister,
} from "@/hooks/useAccounting";
import { useTodaySales, useCreateSale } from "@/hooks/useSales";
import type { CartItem, PaymentMethod } from "@/types";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);

export function CajaPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [discount, setDiscount] = useState("");
  const [notes, setNotes] = useState("");
  const [openCashModal, setOpenCashModal] = useState(false);
  const [closeCashModal, setCloseCashModal] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [openingAmount, setOpeningAmount] = useState("");
  const [closingAmount, setClosingAmount] = useState("");

  const { data: cashRegister, isLoading: loadingCash } = useTodayCashRegister();
  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: todaySales = [] } = useTodaySales(cashRegister?.id);
  const openCash = useOpenCashRegister();
  const closeCash = useCloseCashRegister();
  const createSale = useCreateSale();

  const isCashOpen = cashRegister?.status === "abierta";

  const filteredProducts = products.filter((p) => {
    if (!p.is_active) return false;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: (typeof products)[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.product_price,
              }
            : item,
        );
      }
      const price =
        product.discount_price ??
        (product.discount_percentage
          ? product.price * (1 - product.discount_percentage / 100)
          : product.price);

      return [
        ...prev,
        {
          product_id: product.id,
          product_name: product.name,
          product_price: price,
          quantity: 1,
          subtotal: price,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product_id !== productId) return item;
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        return {
          ...item,
          quantity: newQty,
          subtotal: newQty * item.product_price,
        };
      }),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = parseFloat(discount) || 0;
  const total = Math.max(0, subtotal - discountAmount);

  const handleOpenCash = async () => {
    if (!openingAmount) return;
    await openCash.mutateAsync({ opening_amount: parseFloat(openingAmount) });
    setOpeningAmount("");
    setOpenCashModal(false);
  };

  const handleCloseCash = async () => {
    if (!cashRegister || !closingAmount) return;
    await closeCash.mutateAsync({
      id: cashRegister.id,
      closing_amount: parseFloat(closingAmount),
    });
    setClosingAmount("");
    setCloseCashModal(false);
  };

  const handleCheckout = async () => {
    if (!cashRegister || cart.length === 0) return;
    await createSale.mutateAsync({
      cartItems: cart,
      cashRegisterId: cashRegister.id,
      paymentMethod,
      discount: discountAmount,
      notes: notes || undefined,
    });
    setCart([]);
    setDiscount("");
    setNotes("");
    setCheckoutModal(false);
  };

  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Caja</h2>
          <p className="text-muted-foreground text-sm">
            {new Date().toLocaleDateString("es-CO", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {loadingCash ? (
          <Skeleton className="h-9 w-32" />
        ) : !cashRegister ? (
          <Button onClick={() => setOpenCashModal(true)}>
            <LockKeyholeOpen className="mr-2 h-4 w-4" />
            Abrir caja
          </Button>
        ) : isCashOpen ? (
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-600">
              Caja abierta
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCloseCashModal(true)}
            >
              <LockKeyhole className="mr-2 h-4 w-4" />
              Cerrar caja
            </Button>
          </div>
        ) : (
          <Badge variant="secondary">Caja cerrada</Badge>
        )}
      </div>

      {/* KPIs del día */}
      {cashRegister && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border bg-card p-3">
            <p className="text-xs text-muted-foreground">Ventas hoy</p>
            <p className="text-xl font-bold">{todaySales.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <p className="text-xs text-muted-foreground">Total del día</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(todayTotal)}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <p className="text-xs text-muted-foreground">Apertura</p>
            <p className="text-xl font-bold">
              {formatCurrency(cashRegister.opening_amount)}
            </p>
          </div>
        </div>
      )}

      {!isCashOpen ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">La caja está cerrada</p>
            <p className="text-sm">
              Abre la caja para comenzar a registrar ventas
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
          {/* Productos */}
          <div className="lg:col-span-2 flex flex-col space-y-3">
            {/* Filtros */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar producto..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grid de productos */}
            {loadingProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-lg" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p>No hay productos disponibles</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto">
                {filteredProducts.map((product) => {
                  const price =
                    product.discount_price ??
                    (product.discount_percentage
                      ? product.price * (1 - product.discount_percentage / 100)
                      : product.price);
                  const inCart = cart.find((i) => i.product_id === product.id);

                  return (
                    <motion.button
                      key={product.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => addToCart(product)}
                      className={cn(
                        "relative rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary",
                        inCart ? "border-primary bg-primary/5" : "",
                      )}
                    >
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-16 object-cover rounded-md mb-2"
                        />
                      )}
                      <p className="text-sm font-medium line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-sm font-bold text-primary">
                        {formatCurrency(price)}
                      </p>
                      {product.discount_percentage && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                      {inCart && (
                        <Badge className="absolute top-2 right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {inCart.quantity}
                        </Badge>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Carrito */}
          <div className="flex flex-col border rounded-lg bg-card overflow-hidden">
            <div className="p-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="font-medium text-sm">Pedido actual</span>
              </div>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setCart([])}>
                  <X className="h-3 w-3 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
                <div className="text-center">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Agrega productos al pedido</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div
                      key={item.product_id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-2 rounded-lg border p-2 bg-background"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-1">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.product_price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.product_id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-xs w-4 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.product_id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => removeFromCart(item.product_id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs font-bold w-16 text-right">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Totales y cobrar */}
            <div className="p-3 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
              <Button
                className="w-full"
                disabled={cart.length === 0}
                onClick={() => setCheckoutModal(true)}
              >
                <Receipt className="mr-2 h-4 w-4" />
                Cobrar {formatCurrency(total)}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal abrir caja */}
      <Dialog open={openCashModal} onOpenChange={setOpenCashModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Abrir caja</DialogTitle>
            <DialogDescription>
              Ingresa el monto inicial de la caja.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Monto de apertura *</Label>
              <Input
                type="number"
                min="0"
                step="1000"
                placeholder="0"
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setOpenCashModal(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleOpenCash}
                disabled={!openingAmount || openCash.isPending}
              >
                {openCash.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Abrir caja
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal cerrar caja */}
      <Dialog open={closeCashModal} onOpenChange={setCloseCashModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cerrar caja</DialogTitle>
            <DialogDescription>
              Ingresa el monto final contado en caja.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ventas del día</span>
                <span className="font-medium">
                  {formatCurrency(todayTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Apertura</span>
                <span className="font-medium">
                  {formatCurrency(cashRegister?.opening_amount ?? 0)}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Esperado en caja</span>
                <span>
                  {formatCurrency(
                    (cashRegister?.opening_amount ?? 0) + todayTotal,
                  )}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Monto contado *</Label>
              <Input
                type="number"
                min="0"
                step="1000"
                placeholder="0"
                value={closingAmount}
                onChange={(e) => setClosingAmount(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCloseCashModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCloseCash}
                disabled={!closingAmount || closeCash.isPending}
              >
                {closeCash.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Cerrar caja
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal cobrar */}
      <Dialog open={checkoutModal} onOpenChange={setCheckoutModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cobrar pedido</DialogTitle>
            <DialogDescription>
              Confirma el método de pago y aplica descuentos si aplica.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-3 space-y-1 text-sm max-h-40 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.product_id} className="flex justify-between">
                  <span>
                    {item.quantity}x {item.product_name}
                  </span>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Descuento</Label>
              <Input
                type="number"
                min="0"
                step="100"
                placeholder="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Método de pago</Label>
              <Select
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notas</Label>
              <Input
                placeholder="Observaciones..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="rounded-lg bg-primary/10 p-3 flex justify-between font-bold">
              <span>Total a cobrar</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCheckoutModal(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleCheckout}
                disabled={createSale.isPending}
              >
                {createSale.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirmar cobro
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
