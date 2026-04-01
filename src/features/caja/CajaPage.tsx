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
import { useActivePromotions } from "@/hooks/usePromotions";
import { ReceiptModal } from "@/features/caja/ReceiptModal";
import { cn } from "@/lib/utils";
import type { CartItem, PaymentMethod, Promotion, Sale } from "@/types";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);

const IVA_RATE = 0.08;
const calcIVA = (amount: number) => amount - amount / (1 + IVA_RATE);
const calcBase = (amount: number) => amount / (1 + IVA_RATE);

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
  const [receiptModal, setReceiptModal] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [lastCartItems, setLastCartItems] = useState<CartItem[]>([]);
  const [openingAmount, setOpeningAmount] = useState("");
  const [closingAmount, setClosingAmount] = useState("");

  const { data: cashRegister, isLoading: loadingCash } = useTodayCashRegister();
  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: todaySales = [] } = useTodaySales(cashRegister?.id);
  const { data: activePromotions = [] } = useActivePromotions();
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

  const getPromoForProduct = (
    product: (typeof products)[0],
  ): Promotion | undefined => {
    return activePromotions.find(
      (p) =>
        p.applies_to === "todos" ||
        (p.applies_to === "producto" && p.product_id === product.id) ||
        (p.applies_to === "categoria" && p.category_id === product.category_id),
    );
  };

  const getProductPrice = (product: (typeof products)[0]): number => {
    const basePrice =
      product.discount_price ??
      (product.discount_percentage
        ? product.price * (1 - product.discount_percentage / 100)
        : product.price);

    const promo = getPromoForProduct(product);
    if (!promo || promo.type === "2x1") return basePrice;

    if (promo.type === "descuento_porcentaje")
      return basePrice * (1 - promo.value / 100);
    if (promo.type === "descuento_precio")
      return Math.max(0, basePrice - promo.value);
    if (promo.type === "precio_fijo") return promo.value;

    return basePrice;
  };

  const addToCart = (product: (typeof products)[0]) => {
    const basePrice =
      product.discount_price ??
      (product.discount_percentage
        ? product.price * (1 - product.discount_percentage / 100)
        : product.price);

    const promo = getPromoForProduct(product);
    const unitPrice = getProductPrice(product);

    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);

      if (existing) {
        const newQty = existing.quantity + 1;
        let newSubtotal = newQty * unitPrice;

        if (promo?.type === "2x1") {
          const freeItems = Math.floor(newQty / 2);
          newSubtotal = (newQty - freeItems) * basePrice;
        }

        return prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: newQty, subtotal: newSubtotal }
            : item,
        );
      }

      return [
        ...prev,
        {
          product_id: product.id,
          product_name: product.name,
          product_price: unitPrice,
          quantity: 1,
          subtotal: unitPrice,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const promo = getPromoForProduct(product);
    const basePrice =
      product.discount_price ??
      (product.discount_percentage
        ? product.price * (1 - product.discount_percentage / 100)
        : product.price);
    const unitPrice = getProductPrice(product);

    setCart((prev) =>
      prev.map((item) => {
        if (item.product_id !== productId) return item;
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;

        let newSubtotal = newQty * unitPrice;
        if (promo?.type === "2x1") {
          const freeItems = Math.floor(newQty / 2);
          newSubtotal = (newQty - freeItems) * basePrice;
        }

        return { ...item, quantity: newQty, subtotal: newSubtotal };
      }),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = parseFloat(discount) || 0;
  const total = Math.max(0, subtotal - discountAmount);
  const totalIVA = calcIVA(subtotal);
  const totalBase = calcBase(subtotal);
  const totalAhorro = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.product_id);
    if (!product) return sum;
    return sum + (product.price * item.quantity - item.subtotal);
  }, 0);

  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);

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
    const sale = await createSale.mutateAsync({
      cartItems: cart,
      cashRegisterId: cashRegister.id,
      paymentMethod,
      discount: discountAmount,
      notes: notes || undefined,
    });
    setLastSale(sale);
    setLastCartItems([...cart]);
    setCart([]);
    setDiscount("");
    setNotes("");
    setCheckoutModal(false);
    setReceiptModal(true);
  };

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

      {/* KPIs */}
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
                  const price = getProductPrice(product);
                  const promo = getPromoForProduct(product);
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
                      {product.price !== price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                      {promo && (
                        <Badge className="absolute top-2 left-2 text-xs px-1 py-0 bg-amber-500">
                          {promo.type === "2x1" ? "2x1" : "Promo"}
                        </Badge>
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
                  {cart.map((item) => {
                    const product = products.find(
                      (p) => p.id === item.product_id,
                    );
                    const promo = product
                      ? getPromoForProduct(product)
                      : undefined;
                    const precioOriginal = product
                      ? product.price * item.quantity
                      : item.subtotal;
                    const ahorro = precioOriginal - item.subtotal;

                    return (
                      <motion.div
                        key={item.product_id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="rounded-lg border p-2 bg-background space-y-1"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium line-clamp-1">
                              {item.product_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity}x{" "}
                              {formatCurrency(item.product_price)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                updateQuantity(item.product_id, -1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-xs w-4 text-center font-bold">
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
                        </div>

                        {ahorro > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground line-through">
                              {formatCurrency(precioOriginal)}
                            </span>
                            <span className="text-xs text-green-600 font-medium">
                              Ahorras {formatCurrency(ahorro)}
                            </span>
                          </div>
                        )}

                        {promo && (
                          <div className="flex items-center gap-1">
                            <Badge className="text-xs px-1 py-0 bg-amber-500 h-4">
                              {promo.type === "2x1"
                                ? "2x1"
                                : promo.type === "descuento_porcentaje"
                                  ? `${promo.value}% OFF`
                                  : promo.type === "descuento_precio"
                                    ? `-${formatCurrency(promo.value)}`
                                    : "Promo"}
                            </Badge>
                            <span className="text-xs text-amber-500 truncate">
                              {promo.name}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-1 border-t border-dashed">
                          <span className="text-xs text-muted-foreground">
                            IVA 8%: {formatCurrency(calcIVA(item.subtotal))}
                          </span>
                          <span className="text-xs font-bold">
                            {formatCurrency(item.subtotal)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            <div className="p-3 border-t space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Base gravable</span>
                <span>{formatCurrency(totalBase)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>IVA 8%</span>
                <span>{formatCurrency(totalIVA)}</span>
              </div>
              {totalAhorro > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Ahorro total</span>
                  <span>-{formatCurrency(totalAhorro)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-1 border-t">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
              <Button
                className="w-full mt-1"
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
            <DialogDescription>Confirma el método de pago.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-3 space-y-1 text-sm font-mono bg-muted/30 max-h-48 overflow-y-auto">
              <p className="text-center font-bold">AROMÁTICO CAFÉ</p>
              <div className="border-t border-dashed" />
              {cart.map((item) => {
                const product = products.find((p) => p.id === item.product_id);
                const promo = product ? getPromoForProduct(product) : undefined;
                const precioOriginal = product
                  ? product.price * item.quantity
                  : item.subtotal;
                const ahorro = precioOriginal - item.subtotal;
                return (
                  <div key={item.product_id} className="space-y-0.5">
                    <div className="flex justify-between">
                      <span className="flex-1 truncate">
                        {item.quantity}x {item.product_name}
                      </span>
                      <span className="ml-1 shrink-0">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                    {ahorro > 0 && (
                      <div className="flex justify-between text-xs text-green-600">
                        <span>Descuento</span>
                        <span>-{formatCurrency(ahorro)}</span>
                      </div>
                    )}
                    {promo && (
                      <p className="text-xs text-amber-500">
                        🏷️{" "}
                        {promo.type === "2x1"
                          ? "2x1 aplicado"
                          : promo.type === "descuento_porcentaje"
                            ? `${promo.value}% OFF`
                            : promo.name}
                      </p>
                    )}
                  </div>
                );
              })}
              <div className="border-t border-dashed" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Base gravable</span>
                <span>{formatCurrency(totalBase)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>IVA 8%</span>
                <span>{formatCurrency(totalIVA)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Descuento adicional</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-dashed" />
              <div className="flex justify-between font-bold">
                <span>TOTAL</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descuento adicional</Label>
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

      {/* Modal recibo */}
      <ReceiptModal
        open={receiptModal}
        onClose={() => setReceiptModal(false)}
        sale={lastSale}
        cartItems={lastCartItems}
        promotions={activePromotions}
      />
    </div>
  );
}
