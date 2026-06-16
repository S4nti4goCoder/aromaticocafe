import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
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
  History,
  Ban,
  Printer,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  FileText,
  PauseCircle,
  PlayCircle,
  Star,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import {
  useTodayCashRegister,
  useOpenCashRegister,
  useCloseCashRegister,
  useCreateTransaction,
  useTransactions,
  useLastClosedTodayCashRegister,
} from "@/hooks/useAccounting";
import { useProfile } from "@/hooks/useProfile";
import {
  useTodaySales,
  useCreateSale,
  useVoidSale,
  usePendingSales,
} from "@/hooks/useSales";
import { useProductStock } from "@/hooks/useInventory";
import { useActivePromotions } from "@/hooks/usePromotions";
import { applyLoyalty } from "@/hooks/useCustomers";
import { normalizePhone } from "@/lib/phone";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { ReceiptModal } from "@/features/caja/ReceiptModal";
import {
  CashClosingReportModal,
  type ClosingReportData,
} from "@/features/caja/CashClosingReportModal";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
import { loadParked, saveParked, type ParkedOrder } from "@/features/caja/parking";
import {
  loadCurrentCart,
  saveCurrentCart,
} from "@/features/caja/currentCart";
import { DENOMINATIONS, ITEM_TAGS } from "@/features/caja/constants";
import { formatCurrency } from "@/features/caja/format";
import { OpenCashModal } from "@/features/caja/OpenCashModal";
import { CloseCashModal } from "@/features/caja/CloseCashModal";
import { CheckoutModal } from "@/features/caja/CheckoutModal";
import { ParkSaveModal } from "@/features/caja/ParkSaveModal";
import { ParkingModal } from "@/features/caja/ParkingModal";
import { MovementModal } from "@/features/caja/MovementModal";
import { ReopenCashModal } from "@/features/caja/ReopenCashModal";
import type {
  CartItem,
  Customer,
  PaymentMethod,
  Promotion,
  Sale,
  TransactionType,
} from "@/types";

export function CajaPage() {
  const [search, setSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const PRODUCTS_PER_PAGE = isMobile ? 6 : 9;
  // Cargamos el carrito desde localStorage para sobrevivir un refresh o cierre
  // accidental del navegador. Se persiste en cada cambio (useEffect abajo) y se
  // limpia al cobrar exitosamente o al "Limpiar" / "Aparcar".
  const [cart, setCart] = useState<CartItem[]>(loadCurrentCart);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [discount, setDiscount] = useState("");
  const [notes, setNotes] = useState("");
  const [openCashModal, setOpenCashModal] = useState(false);
  const [closeCashModal, setCloseCashModal] = useState(false);
  const [reopenModal, setReopenModal] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [receiptModal, setReceiptModal] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [lastCartItems, setLastCartItems] = useState<CartItem[]>([]);
  const [closingReport, setClosingReport] = useState<ClosingReportData | null>(
    null,
  );
  const [lastLoyalty, setLastLoyalty] = useState<{
    mode: "sellos" | "puntos";
    stamps: number;
    points: number;
    stampsRequired: number;
    reward: string;
  } | null>(null);
  const [openingAmount, setOpeningAmount] = useState("");
  const [closingAmount, setClosingAmount] = useState("");
  const [voidModal, setVoidModal] = useState<Sale | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [isMixto, setIsMixto] = useState(false);
  const [mixtoCash, setMixtoCash] = useState("");
  const [mixtoCard, setMixtoCard] = useState("");
  const [historyReceiptSale, setHistoryReceiptSale] = useState<Sale | null>(
    null,
  );

  // Optional customer
  // Estado del módulo de cliente del modal de cobro. "idle" = sin cliente.
  // "selected" = cliente existente cargado de BD. "creating" = cajero quiere
  // registrarlo como cliente nuevo. "note" = solo nota en el recibo.
  const [customerMode, setCustomerMode] = useState<
    "idle" | "searching" | "selected" | "creating" | "note"
  >("idle");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loyaltyCustomer, setLoyaltyCustomer] = useState<Customer | null>(null);
  const [redeemLoyalty, setRedeemLoyalty] = useState(false);

  // Parking
  const [parkedOrders, setParkedOrders] = useState<ParkedOrder[]>(loadParked);
  const [parkingModal, setParkingModal] = useState(false);
  const [parkName, setParkName] = useState("");
  const [parkSaveModal, setParkSaveModal] = useState(false);

  // Manual movements
  const [movementModal, setMovementModal] = useState(false);
  const [movementType, setMovementType] = useState<TransactionType>("egreso");
  const [movementAmount, setMovementAmount] = useState("");
  const [movementCategory, setMovementCategory] = useState("");
  const [movementDescription, setMovementDescription] = useState("");

  // Denominated cash count
  const [denominations, setDenominations] = useState<Record<number, string>>(
    {},
  );

  const { data: cashRegister, isLoading: loadingCash } = useTodayCashRegister();
  // Solo se carga cuando no hay caja activa, para ofrecer reapertura del
  // último cierre del día (recuperación de error). El servidor + RLS también
  // limita quién puede usar el RPC.
  const { data: lastClosed } = useLastClosedTodayCashRegister();
  const { data: profile } = useProfile();
  const canReopen =
    profile?.role === "super_admin" || profile?.role === "gerente";
  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: serverSales = [] } = useTodaySales(cashRegister?.id);
  const pendingSales = usePendingSales(cashRegister?.id);
  // Merge queued offline sales (deduped by id) so totals/history reflect them
  // immediately, even before they sync.
  const todaySales = useMemo(() => {
    if (pendingSales.length === 0) return serverSales;
    const serverIds = new Set(serverSales.map((s) => s.id));
    const extras = pendingSales.filter((p) => !serverIds.has(p.id));
    return [...extras, ...serverSales];
  }, [serverSales, pendingSales]);
  const { data: productStock = [] } = useProductStock();
  const { data: activePromotions = [] } = useActivePromotions();
  const { settings: systemSettings } = useSystemSettings();
  const openCash = useOpenCashRegister();
  const closeCash = useCloseCashRegister();
  const createSale = useCreateSale();
  const voidSale = useVoidSale();
  const createTransaction = useCreateTransaction();

  // Las transacciones se filtran por inicio de la sesión activa, no por
  // inicio del día, para soportar múltiples sesiones por día. Si no hay
  // sesión activa (caja cerrada) se usa el inicio del día como fallback para
  // que los reportes preliminares sigan funcionando.
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const sessionStart = cashRegister?.opened_at ?? todayStart.toISOString();
  const { data: todayTransactions = [] } = useTransactions({
    startDate: sessionStart,
  });

  const stockMap = new Map(
    productStock.map((s) => [s.product_id, s.stock]),
  );
  const getStock = (productId: string) =>
    stockMap.get(productId) ?? Number.POSITIVE_INFINITY;

  const IVA_RATE = systemSettings?.tax_enabled
    ? (systemSettings.tax_percentage ?? 8) / 100
    : 0;
  const TAX_NAME = systemSettings?.tax_name ?? "IVA";
  const TAX_PERCENT = systemSettings?.tax_percentage ?? 8;
  const calcIVA = (amount: number) => amount - amount / (1 + IVA_RATE);
  const calcBase = (amount: number) => amount / (1 + IVA_RATE);

  const isCashOpen = cashRegister?.status === "abierta";

  // Normaliza tildes para que "cafe" encuentre "Café" y viceversa.
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");

  const filteredProducts = products.filter((p) => {
    if (!p.is_active) return false;
    const matchesSearch = normalize(p.name).includes(normalize(search));
    const matchesCategory =
      selectedCategory === "all" || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );

  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory]);

  // Sincroniza el carrito con localStorage en cada cambio para que sobreviva
  // un refresh o cierre accidental del navegador. Si el carrito queda vacío
  // (por cobro/limpieza/aparcado) el helper borra la entrada.
  useEffect(() => {
    saveCurrentCart(cart);
  }, [cart]);

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
    // Stock validation
    const available = getStock(product.id);
    const inCartQty =
      cart.find((i) => i.product_id === product.id)?.quantity ?? 0;
    if (available <= 0) {
      toast.error(`${product.name} está agotado`);
      return;
    }
    if (inCartQty + 1 > available) {
      toast.warning(
        `Solo quedan ${available} unidades de ${product.name} en stock`,
      );
      return;
    }

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

    if (delta > 0) {
      const available = getStock(productId);
      const current =
        cart.find((i) => i.product_id === productId)?.quantity ?? 0;
      if (current + delta > available) {
        toast.warning(
          `Solo quedan ${available} unidades de ${product.name} en stock`,
        );
        return;
      }
    }

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

  const toggleItemTag = (productId: string, tag: string) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product_id !== productId) return item;
        const current = item.notes ?? [];
        const has = current.includes(tag);
        return {
          ...item,
          notes: has ? current.filter((t) => t !== tag) : [...current, tag],
        };
      }),
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = parseFloat(discount) || 0;

  // ── Loyalty ──
  const loyaltyOn = !!systemSettings?.loyalty_enabled && cart.length > 0;
  const loyaltyMode = systemSettings?.loyalty_mode ?? "sellos";
  const stampsRequired = systemSettings?.loyalty_stamps_required ?? 10;
  const pointsValue = systemSettings?.loyalty_points_value ?? 10;
  const pointsRedeemMin = systemSettings?.loyalty_points_redeem_min ?? 100;
  const canRedeemStamps =
    loyaltyOn &&
    loyaltyMode === "sellos" &&
    !!loyaltyCustomer &&
    loyaltyCustomer.stamps >= stampsRequired;
  const canRedeemPoints =
    loyaltyOn &&
    loyaltyMode === "puntos" &&
    !!loyaltyCustomer &&
    loyaltyCustomer.points >= pointsRedeemMin;
  // Stamps reward: a specific product's price (if configured), else the most
  // expensive item in the cart — always capped by the optional max value and
  // by the cart total. Prevents redeeming a cheap card on an expensive item.
  const minPurchase = systemSettings?.loyalty_min_purchase ?? 0;
  const rewardProductId = systemSettings?.loyalty_reward_product_id ?? null;
  const rewardMaxValue = systemSettings?.loyalty_reward_max_value ?? 0;
  const rewardProduct = rewardProductId
    ? products.find((p) => p.id === rewardProductId)
    : null;
  const maxUnitPrice = cart.reduce((m, i) => Math.max(m, i.product_price), 0);
  const preLoyaltyTotal = Math.max(0, subtotal - discountAmount);
  let rewardBase = rewardProduct ? rewardProduct.price : maxUnitPrice;
  if (rewardMaxValue && rewardMaxValue > 0)
    rewardBase = Math.min(rewardBase, rewardMaxValue);
  rewardBase = Math.min(rewardBase, preLoyaltyTotal);
  const stampsDiscount = redeemLoyalty && canRedeemStamps ? rewardBase : 0;
  // Points: redeem as many as fit into the sale.
  const pointsToRedeem =
    redeemLoyalty && canRedeemPoints && loyaltyCustomer
      ? Math.min(loyaltyCustomer.points, Math.floor(preLoyaltyTotal / pointsValue))
      : 0;
  const pointsDiscount = pointsToRedeem * pointsValue;
  const loyaltyDiscount = stampsDiscount + pointsDiscount;
  // Does this sale qualify to earn (passed the minimum purchase)?
  const earnsLoyalty = !minPurchase || preLoyaltyTotal >= minPurchase;

  const total = Math.max(0, subtotal - discountAmount - loyaltyDiscount);
  const totalIVA = calcIVA(subtotal);
  const totalBase = calcBase(subtotal);
  const totalAhorro = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.product_id);
    if (!product) return sum;
    return sum + (product.price * item.quantity - item.subtotal);
  }, 0);

  const validSales = todaySales.filter((s) => !s.is_voided);
  const todayTotal = validSales.reduce((sum, s) => sum + s.total, 0);

  // Today's top products
  const topProductIds = (() => {
    const counts = new Map<string, number>();
    validSales.forEach((s) =>
      s.items?.forEach((it) => {
        if (!it.product_id) return;
        counts.set(it.product_id, (counts.get(it.product_id) ?? 0) + it.quantity);
      }),
    );
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id]) => id);
  })();
  const topProducts = topProductIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is (typeof products)[0] => !!p && p.is_active);

  // Closing summary
  const salesByMethod = validSales.reduce<Record<string, number>>(
    (acc, s) => {
      acc[s.payment_method] = (acc[s.payment_method] ?? 0) + s.total;
      return acc;
    },
    {},
  );
  const totalDiscounts = validSales.reduce((sum, s) => sum + (s.discount ?? 0), 0);
  const voidedCount = todaySales.filter((s) => s.is_voided).length;
  // Exclude the auto-created "Venta" transactions so these reflect only manual
  // cash movements (otherwise sales get double-counted in the arqueo/report).
  const todayIngresos = todayTransactions
    .filter((t) => t.type === "ingreso" && t.category !== "Venta")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const todayEgresos = todayTransactions
    .filter((t) => t.type === "egreso" && t.category !== "Venta")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expectedInCash =
    (cashRegister?.opening_amount ?? 0) +
    (salesByMethod.efectivo ?? 0) +
    todayIngresos -
    todayEgresos;

  // Denominated cash count total
  const denomTotal = DENOMINATIONS.reduce(
    (sum, d) => sum + d * (parseInt(denominations[d] || "0") || 0),
    0,
  );
  const denomDiff = denomTotal - expectedInCash;

  const handleOpenCash = async () => {
    if (!openingAmount) return;
    await openCash.mutateAsync({ opening_amount: parseFloat(openingAmount) });
    setOpeningAmount("");
    setOpenCashModal(false);
  };

  const handleCloseCash = async () => {
    if (!cashRegister) return;
    const finalAmount = denomTotal > 0 ? denomTotal : parseFloat(closingAmount);
    if (!finalAmount && finalAmount !== 0) return;
    const denomNote =
      denomTotal > 0
        ? "Arqueo: " +
          DENOMINATIONS.filter((d) => parseInt(denominations[d] || "0") > 0)
            .map((d) => `${formatCurrency(d)}×${denominations[d]}`)
            .join(", ")
        : undefined;
    // Snapshot the day's figures for the closing report before resetting state.
    const report: ClosingReportData = {
      cafeName: systemSettings?.cafe_name ?? "Aromático Café",
      businessName: systemSettings?.business_name ?? "Aromático Café",
      businessNit: systemSettings?.business_nit ?? null,
      date: cashRegister.date,
      openedAt: cashRegister.opened_at,
      closedAt: new Date().toISOString(),
      openingAmount: cashRegister.opening_amount ?? 0,
      salesCount: validSales.length,
      salesTotal: todayTotal,
      salesByMethod,
      totalDiscounts,
      voidedCount,
      ingresos: todayIngresos,
      egresos: todayEgresos,
      expectedCash: expectedInCash,
      countedCash: finalAmount,
      difference: finalAmount - expectedInCash,
      taxEnabled: !!systemSettings?.tax_enabled,
      taxName: systemSettings?.tax_name ?? "IVA",
      taxPercent: systemSettings?.tax_percentage ?? 8,
    };

    await closeCash.mutateAsync({
      id: cashRegister.id,
      closing_amount: finalAmount,
      notes: denomNote,
    });
    setClosingAmount("");
    setDenominations({});
    setCloseCashModal(false);
    setClosingReport(report);
  };

  const handleViewReport = () => {
    if (!cashRegister) return;
    setClosingReport({
      cafeName: systemSettings?.cafe_name ?? "Aromático Café",
      businessName: systemSettings?.business_name ?? "Aromático Café",
      businessNit: systemSettings?.business_nit ?? null,
      date: cashRegister.date,
      openedAt: cashRegister.opened_at,
      closedAt: null,
      openingAmount: cashRegister.opening_amount ?? 0,
      salesCount: validSales.length,
      salesTotal: todayTotal,
      salesByMethod,
      totalDiscounts,
      voidedCount,
      ingresos: todayIngresos,
      egresos: todayEgresos,
      expectedCash: expectedInCash,
      countedCash: expectedInCash,
      difference: 0,
      taxEnabled: !!systemSettings?.tax_enabled,
      taxName: systemSettings?.tax_name ?? "IVA",
      taxPercent: systemSettings?.tax_percentage ?? 8,
      preliminary: true,
    });
  };

  const cashReceivedNum = parseFloat(cashReceived) || 0;
  const change = Math.max(0, cashReceivedNum - total);
  const cashShort = paymentMethod === "efectivo" && cashReceivedNum < total;

  const mixtoCashNum = parseFloat(mixtoCash) || 0;
  const mixtoCardNum = parseFloat(mixtoCard) || 0;
  const mixtoSum = mixtoCashNum + mixtoCardNum;
  const mixtoShort = isMixto && mixtoSum < total;

  const canConfirm = isMixto
    ? !mixtoShort && mixtoCashNum > 0 && mixtoCardNum > 0
    : paymentMethod === "efectivo"
      ? !cashShort
      : true;

  const handleCheckout = async () => {
    if (!cashRegister || cart.length === 0) return;
    if (!canConfirm) return;

    let finalPaymentMethod: PaymentMethod = paymentMethod;
    let finalNotes = notes;

    if (isMixto) {
      finalPaymentMethod = "otro";
      const mixtoNote = `Pago mixto: Efectivo ${formatCurrency(
        mixtoCashNum,
      )} + Tarjeta ${formatCurrency(mixtoCardNum)}`;
      finalNotes = notes ? `${mixtoNote} — ${notes}` : mixtoNote;
    } else if (paymentMethod === "efectivo" && cashReceivedNum > 0) {
      const cashNote = `Recibido ${formatCurrency(
        cashReceivedNum,
      )} — Vuelto ${formatCurrency(change)}`;
      finalNotes = notes ? `${cashNote} — ${notes}` : cashNote;
    }

    if (
      customerMode !== "idle" &&
      (customerName.trim() || customerPhone.trim())
    ) {
      const parts = [customerName.trim(), customerPhone.trim()].filter(Boolean);
      const customerNote = `Cliente: ${parts.join(" / ")}`;
      finalNotes = finalNotes ? `${customerNote} — ${finalNotes}` : customerNote;
    }

    const itemNotes = cart
      .filter((i) => i.notes && i.notes.length > 0)
      .map((i) => `${i.product_name}: ${i.notes!.join(", ")}`)
      .join(" | ");
    if (itemNotes) {
      finalNotes = finalNotes ? `${finalNotes} — ${itemNotes}` : itemNotes;
    }

    const saleTotal = total;

    // Computed loyalty deltas for this sale, persisted on the sale record so
    // they can be rolled back later from /sales (anulación or devolución parcial).
    const earnedStamps =
      loyaltyOn && loyaltyMode === "sellos" && earnsLoyalty ? 1 : 0;
    const earnedPoints =
      loyaltyOn && loyaltyMode === "puntos" && earnsLoyalty
        ? Math.floor(saleTotal / 1000) *
          (systemSettings?.loyalty_points_per_thousand ?? 1)
        : 0;
    const redeemedValue = loyaltyDiscount > 0 ? loyaltyDiscount : null;
    const redeemedMode: "sellos" | "puntos" | null =
      loyaltyDiscount > 0 ? loyaltyMode : null;
    const customerPhoneForSale =
      loyaltyOn && customerPhone.trim() ? normalizePhone(customerPhone) : null;

    const { sale } = await createSale.mutateAsync({
      cartItems: cart,
      cashRegisterId: cashRegister.id,
      paymentMethod: finalPaymentMethod,
      discount: discountAmount + loyaltyDiscount,
      notes: finalNotes || undefined,
      customerPhone: customerPhoneForSale,
      loyaltyStampsAwarded: earnedStamps,
      loyaltyPointsAwarded: earnedPoints,
      loyaltyRedeemedValue: redeemedValue,
      loyaltyRedeemedMode: redeemedMode,
    });

    // Loyalty (online only — needs the customers table).
    setLastLoyalty(null);
    if (
      loyaltyOn &&
      customerPhone.trim() &&
      typeof navigator !== "undefined" &&
      navigator.onLine
    ) {
      try {
        const updated = await applyLoyalty({
          phone: normalizePhone(customerPhone),
          name: customerName.trim() || null,
          current: loyaltyCustomer,
          saleTotal,
          mode: loyaltyMode,
          pointsPerThousand: systemSettings?.loyalty_points_per_thousand ?? 1,
          stampsRequired,
          earns: earnsLoyalty,
          stampsRedeemed: redeemLoyalty && canRedeemStamps ? stampsRequired : 0,
          pointsRedeemed: pointsToRedeem,
        });
        setLastLoyalty({
          mode: loyaltyMode,
          stamps: updated.stamps,
          points: updated.points,
          stampsRequired,
          reward: systemSettings?.loyalty_reward ?? "Producto gratis",
        });
      } catch {
        toast.error("La venta se registró, pero no se pudo actualizar la fidelización");
      }
    }

    setLastSale(sale);
    setLastCartItems([...cart]);
    setCart([]);
    setSearch("");
    setDiscount("");
    setNotes("");
    setCashReceived("");
    setIsMixto(false);
    setMixtoCash("");
    setMixtoCard("");
    setCustomerMode("idle");
    setCustomerName("");
    setCustomerPhone("");
    setLoyaltyCustomer(null);
    setRedeemLoyalty(false);
    setCheckoutModal(false);
    setReceiptModal(true);
  };

  // Parking
  const handleParkOrder = () => {
    if (cart.length === 0 || !parkName.trim()) return;
    const updated: ParkedOrder[] = [
      ...parkedOrders,
      {
        id: crypto.randomUUID(),
        name: parkName.trim(),
        cart: [...cart],
        createdAt: new Date().toISOString(),
      },
    ];
    setParkedOrders(updated);
    saveParked(updated);
    setCart([]);
    setParkName("");
    setParkSaveModal(false);
    toast.success("Pedido guardado en espera");
  };

  const handleResumeParked = (order: ParkedOrder) => {
    if (cart.length > 0) {
      toast.error("Limpia el pedido actual antes de retomar otro");
      return;
    }
    setCart(order.cart);
    const filtered = parkedOrders.filter((o) => o.id !== order.id);
    setParkedOrders(filtered);
    saveParked(filtered);
    setParkingModal(false);
    toast.success(`Pedido "${order.name}" retomado`);
  };

  const handleDeleteParked = (id: string) => {
    const filtered = parkedOrders.filter((o) => o.id !== id);
    setParkedOrders(filtered);
    saveParked(filtered);
  };

  // Manual movement
  const handleCreateMovement = async () => {
    if (!cashRegister || !movementAmount || !movementCategory.trim()) return;
    await createTransaction.mutateAsync({
      cashRegisterId: cashRegister.id,
      formData: {
        type: movementType,
        amount: movementAmount,
        category: movementCategory.trim(),
        description: movementDescription.trim(),
        payment_method: "efectivo",
      },
    });
    setMovementAmount("");
    setMovementCategory("");
    setMovementDescription("");
    setMovementModal(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (filteredProducts.length === 0) {
      toast.error("No se encontró ningún producto");
      return;
    }
    addToCart(filteredProducts[0]);
    setSearch("");
  };

  const productPickerJSX = (
    <>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar producto o escanear código..."
            className="pl-9 pr-9 h-10 focus-visible:ring-1 focus-visible:ring-ring/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="w-full sm:w-40">
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

      <div className="flex flex-col space-y-3 lg:flex-1 lg:min-h-0">
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
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:overflow-y-auto">
              {paginatedProducts.map((product) => {
                const price = getProductPrice(product);
                const promo = getPromoForProduct(product);
                const inCart = cart.find(
                  (i) => i.product_id === product.id,
                );
                const stock = getStock(product.id);
                const isOutOfStock = stock <= 0;
                const isLowStock = stock > 0 && stock <= 5;

                return (
                  <motion.button
                    key={product.id}
                    whileTap={isOutOfStock ? {} : { scale: 0.97 }}
                    onClick={() => {
                      addToCart(product);
                      if (isMobile) setPickerOpen(false);
                    }}
                    disabled={isOutOfStock}
                    className={cn(
                      "relative rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary",
                      inCart ? "border-primary bg-primary/5" : "",
                      isOutOfStock &&
                        "opacity-50 cursor-not-allowed hover:border-border",
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
                    {inCart && !isOutOfStock && (
                      <Badge className="absolute top-2 right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {inCart.quantity}
                      </Badge>
                    )}
                    {isOutOfStock ? (
                      <Badge
                        variant="destructive"
                        className="absolute top-2 right-2 text-xs"
                      >
                        Sin stock
                      </Badge>
                    ) : isLowStock ? (
                      <Badge
                        variant="outline"
                        className="absolute bottom-2 right-2 text-[10px] px-1 py-0 border-amber-500 text-amber-600"
                      >
                        {stock} und.
                      </Badge>
                    ) : null}
                  </motion.button>
                );
              })}
            </div>
          </>
        )}

        {filteredProducts.length > PRODUCTS_PER_PAGE && (
          <div className="flex items-center justify-between border-t pt-2 mt-auto">
            <p className="text-xs text-muted-foreground">
              {(currentPage - 1) * PRODUCTS_PER_PAGE + 1}-
              {Math.min(
                currentPage * PRODUCTS_PER_PAGE,
                filteredProducts.length,
              )}{" "}
              de {filteredProducts.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div
      className={cn(
        "flex flex-col space-y-4 lg:h-full",
        cart.length > 0 && "pb-20 lg:pb-0",
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3">
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
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            {lastClosed && canReopen && (
              <Button
                variant="outline"
                onClick={() => setReopenModal(true)}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reabrir última sesión
              </Button>
            )}
            <Button
              onClick={() => setOpenCashModal(true)}
              className="w-full sm:w-auto"
            >
              <LockKeyholeOpen className="mr-2 h-4 w-4" />
              Abrir caja
            </Button>
          </div>
        ) : isCashOpen ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Badge variant="default" className="w-fit bg-green-600">
              Caja abierta
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMovementModal(true)}
              className="w-full sm:w-auto"
            >
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Movimiento
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewReport}
              className="w-full sm:w-auto"
            >
              <FileText className="mr-2 h-4 w-4" />
              Ver reporte
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCloseCashModal(true)}
              className="w-full sm:w-auto"
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
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
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-1 mb-1.5">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <p className="text-xs text-muted-foreground">Más vendidos hoy</p>
            </div>
            {topProducts.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                Sin ventas aún
              </p>
            ) : (
              <div className="space-y-0.5 max-h-16 overflow-y-auto">
                {topProducts.slice(0, 3).map((product, i) => {
                  const qty =
                    validSales
                      .flatMap((s) => s.items ?? [])
                      .filter((it) => it.product_id === product.id)
                      .reduce((sum, it) => sum + it.quantity, 0);
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="flex items-center gap-2 w-full text-left text-xs rounded px-1 py-0.5 hover:bg-muted transition-colors"
                    >
                      <span className="text-muted-foreground">{i + 1}.</span>
                      <span className="font-medium truncate flex-1">
                        {product.name}
                      </span>
                      <span className="text-muted-foreground shrink-0">
                        ×{qty}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
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
        <Tabs defaultValue="pos" className="flex flex-col lg:flex-1 lg:min-h-0">
          <TabsList className="w-full lg:w-fit">
            <TabsTrigger value="pos" className="gap-2">
              <ShoppingCart className="hidden h-4 w-4 sm:inline-block" />
              Punto de venta
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="hidden h-4 w-4 sm:inline-block" />
              Historial ({todaySales.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pos" className="mt-4 lg:flex-1 lg:min-h-0">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:grid-rows-[auto_1fr] lg:gap-4 lg:h-full lg:min-h-0">
          {/* Products (desktop inline) */}
          <div className="hidden lg:flex lg:flex-col lg:col-span-2 lg:row-start-1 lg:row-span-2 lg:space-y-3 lg:min-h-0">
            {productPickerJSX}
          </div>

          {/* Mobile trigger button + Sheet (hidden on lg+) */}
          <Button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="order-1 w-full gap-2 lg:hidden"
            size="lg"
          >
            <Plus className="h-4 w-4" />
            Agregar productos
          </Button>
          <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto lg:hidden">
              <DialogHeader>
                <DialogTitle>Agregar productos</DialogTitle>
                <DialogDescription>
                  Busca y selecciona productos para agregarlos al pedido.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                {productPickerJSX}
              </div>
            </DialogContent>
          </Dialog>

          {/* Cart */}
          <div className="order-2 flex flex-col border rounded-lg bg-card lg:order-0 lg:col-start-3 lg:row-start-1 lg:row-span-2 lg:overflow-hidden">
            <div className="p-3 border-b flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <ShoppingCart className="h-4 w-4 shrink-0" />
                <span className="font-medium text-sm truncate">
                  Pedido actual
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {parkedOrders.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setParkingModal(true)}
                    title={`En espera (${parkedOrders.length})`}
                    className="px-2"
                  >
                    <PlayCircle className="h-3.5 w-3.5 lg:mr-1" />
                    <span className="hidden lg:inline">
                      En espera ({parkedOrders.length})
                    </span>
                    <span className="lg:hidden text-xs ml-1">
                      {parkedOrders.length}
                    </span>
                  </Button>
                )}
                {cart.length > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setParkSaveModal(true)}
                      title="Guardar"
                      className="px-2"
                    >
                      <PauseCircle className="h-3.5 w-3.5 lg:mr-1" />
                      <span className="hidden lg:inline">Guardar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCart([])}
                      title="Limpiar"
                      className="px-2"
                    >
                      <X className="h-3.5 w-3.5 lg:mr-1" />
                      <span className="hidden lg:inline">Limpiar</span>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
                <div className="text-center">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Agrega productos al pedido</p>
                </div>
              </div>
            ) : (
              <div className="p-2 flex gap-2 overflow-x-auto snap-x snap-mandatory lg:flex-1 lg:flex-col lg:gap-0 lg:space-y-2 lg:overflow-x-visible lg:overflow-y-auto lg:snap-none">
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
                        className="w-64 shrink-0 snap-start rounded-lg border p-2 bg-background space-y-1 lg:w-auto lg:shrink lg:snap-align-none"
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

                        <div className="flex flex-wrap gap-1 pt-1">
                          {ITEM_TAGS.map((tag) => {
                            const active = item.notes?.includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() =>
                                  toggleItemTag(item.product_id, tag)
                                }
                                className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded-full border transition-colors",
                                  active
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "border-border text-muted-foreground hover:border-primary/50",
                                )}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>

                        {systemSettings?.tax_enabled && (
                          <div className="flex justify-between items-center pt-1 border-t border-dashed">
                            <span className="text-xs text-muted-foreground">
                              {TAX_NAME} {TAX_PERCENT}%:{" "}
                              {formatCurrency(calcIVA(item.subtotal))}
                            </span>
                            <span className="text-xs font-bold">
                              {formatCurrency(item.subtotal)}
                            </span>
                          </div>
                        )}

                        {!systemSettings?.tax_enabled && (
                          <div className="flex justify-between items-center pt-1 border-t border-dashed">
                            <span className="text-xs font-bold">
                              {formatCurrency(item.subtotal)}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            <div className="p-3 border-t space-y-1.5 text-sm">
              {systemSettings?.tax_enabled && (
                <>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Base gravable</span>
                    <span>{formatCurrency(totalBase)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>
                      {TAX_NAME} {TAX_PERCENT}%
                    </span>
                    <span>{formatCurrency(totalIVA)}</span>
                  </div>
                </>
              )}
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
                className="hidden w-full mt-1 lg:flex"
                disabled={cart.length === 0}
                onClick={() => setCheckoutModal(true)}
              >
                <Receipt className="mr-2 h-4 w-4" />
                Cobrar {formatCurrency(total)}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile-only floating checkout bar: appears when cart has items */}
        {cart.length > 0 && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 p-3 backdrop-blur supports-backdrop-filter:bg-background/80">
            <div className="mx-auto flex max-w-md items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  {cart.reduce((n, i) => n + i.quantity, 0)} ítem
                  {cart.reduce((n, i) => n + i.quantity, 0) === 1 ? "" : "s"}
                </p>
                <p className="text-base font-bold text-primary truncate">
                  {formatCurrency(total)}
                </p>
              </div>
              <Button
                onClick={() => setCheckoutModal(true)}
                className="shrink-0"
              >
                <Receipt className="mr-2 h-4 w-4" />
                Cobrar
              </Button>
            </div>
          </div>
        )}
          </TabsContent>

          <TabsContent
            value="history"
            className="flex-1 mt-4 min-h-0 overflow-y-auto"
          >
            {todaySales.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <History className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aún no hay ventas registradas hoy</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {todaySales.map((sale) => {
                  const isVoided = sale.is_voided;
                  return (
                    <div
                      key={sale.id}
                      className={cn(
                        "rounded-lg border bg-card p-3 flex items-start justify-between gap-3",
                        isVoided && "opacity-60",
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={cn(
                              "font-medium text-sm",
                              isVoided && "line-through",
                            )}
                          >
                            Venta #
                            {sale.sale_number ?? sale.id.slice(0, 8)}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(sale.created_at).toLocaleTimeString(
                              "es-CO",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {sale.payment_method}
                          </Badge>
                          {isVoided && (
                            <Badge variant="destructive" className="text-xs">
                              Anulada
                            </Badge>
                          )}
                        </div>
                        <p
                          className={cn(
                            "text-lg font-bold text-primary mt-1",
                            isVoided && "line-through",
                          )}
                        >
                          {formatCurrency(sale.total)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sale.items?.length ?? 0} producto
                          {(sale.items?.length ?? 0) === 1 ? "" : "s"}
                        </p>
                        {isVoided && sale.void_reason && (
                          <div className="mt-2 flex items-start gap-1 text-xs text-destructive">
                            <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                            <span>{sale.void_reason}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setHistoryReceiptSale(sale)}
                        >
                          <Printer className="h-3 w-3 mr-1" />
                          Recibo
                        </Button>
                        {!isVoided && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setVoidReason("");
                              setVoidModal(sale);
                            }}
                          >
                            <Ban className="h-3 w-3 mr-1" />
                            Anular
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Open-register modal */}
      <OpenCashModal
        open={openCashModal}
        onOpenChange={setOpenCashModal}
        openingAmount={openingAmount}
        onOpeningAmountChange={setOpeningAmount}
        onConfirm={handleOpenCash}
        isPending={openCash.isPending}
      />

      {/* Reopen last-closed register (recuperación de error) */}
      <ReopenCashModal
        open={reopenModal}
        onClose={() => setReopenModal(false)}
        cashRegister={lastClosed ?? null}
      />

      {/* Close-register modal */}
      <CloseCashModal
        open={closeCashModal}
        onOpenChange={setCloseCashModal}
        salesCount={validSales.length}
        voidedCount={voidedCount}
        todayTotal={todayTotal}
        totalDiscounts={totalDiscounts}
        salesByMethod={salesByMethod}
        topProducts={topProducts}
        todayIngresos={todayIngresos}
        todayEgresos={todayEgresos}
        openingAmount={cashRegister?.opening_amount ?? 0}
        expectedInCash={expectedInCash}
        denominations={denominations}
        onDenominationsChange={setDenominations}
        denomTotal={denomTotal}
        denomDiff={denomDiff}
        closingAmount={closingAmount}
        onClosingAmountChange={setClosingAmount}
        onConfirm={handleCloseCash}
        isPending={closeCash.isPending}
      />

      {/* Checkout modal */}
      <CheckoutModal
        open={checkoutModal}
        onOpenChange={(open) => {
          setCheckoutModal(open);
          // Si se cancela / cierra sin cobrar, limpiar los campos del modal
          // para que la próxima apertura aparezca con valores vacíos. Tras un
          // cobro exitoso estos ya están vacíos, así que el reset es idempotente.
          if (!open) {
            setCashReceived("");
            setIsMixto(false);
            setMixtoCash("");
            setMixtoCard("");
            setDiscount("");
          }
        }}
        businessName={systemSettings?.business_name}
        cart={cart}
        products={products}
        getPromoForProduct={getPromoForProduct}
        taxEnabled={!!systemSettings?.tax_enabled}
        taxName={TAX_NAME}
        taxPercent={TAX_PERCENT}
        totalBase={totalBase}
        totalIVA={totalIVA}
        discountAmount={discountAmount}
        total={total}
        discount={discount}
        onDiscountChange={setDiscount}
        isMixto={isMixto}
        onToggleMixto={() => {
          setIsMixto((v) => !v);
          setCashReceived("");
        }}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={(m) => {
          setPaymentMethod(m);
          setCashReceived("");
        }}
        cashReceived={cashReceived}
        onCashReceivedChange={setCashReceived}
        cashReceivedNum={cashReceivedNum}
        cashShort={cashShort}
        change={change}
        mixtoCash={mixtoCash}
        onMixtoCashChange={setMixtoCash}
        mixtoCard={mixtoCard}
        onMixtoCardChange={setMixtoCard}
        mixtoSum={mixtoSum}
        mixtoShort={mixtoShort}
        notes={notes}
        onNotesChange={setNotes}
        customerMode={customerMode}
        onCustomerModeChange={setCustomerMode}
        customerName={customerName}
        onCustomerNameChange={setCustomerName}
        customerPhone={customerPhone}
        onCustomerPhoneChange={setCustomerPhone}
        loyaltyOn={loyaltyOn}
        loyaltyCustomer={loyaltyCustomer}
        onLoyaltyCustomerChange={setLoyaltyCustomer}
        loyaltyMode={loyaltyMode}
        stampsRequired={stampsRequired}
        canRedeemStamps={canRedeemStamps}
        canRedeemPoints={canRedeemPoints}
        redeemLoyalty={redeemLoyalty}
        onRedeemLoyaltyChange={setRedeemLoyalty}
        rewardBase={rewardBase}
        pointsDiscount={pointsDiscount}
        rewardLabel={systemSettings?.loyalty_reward}
        canConfirm={canConfirm}
        onConfirm={handleCheckout}
        isPending={createSale.isPending}
      />

      {/* Receipt modal */}
      <ReceiptModal
        open={receiptModal}
        onClose={() => setReceiptModal(false)}
        sale={lastSale}
        cartItems={lastCartItems}
        promotions={activePromotions}
        loyalty={lastLoyalty}
      />

      {/* Cash closing report */}
      <CashClosingReportModal
        open={!!closingReport}
        onClose={() => setClosingReport(null)}
        data={closingReport}
      />

      {/* Reprint-from-history modal */}
      <ReceiptModal
        open={!!historyReceiptSale}
        onClose={() => setHistoryReceiptSale(null)}
        sale={historyReceiptSale}
        cartItems={
          historyReceiptSale?.items?.map((it) => ({
            product_id: it.product_id ?? "",
            product_name: it.product_name,
            product_price: it.product_price,
            quantity: it.quantity,
            subtotal: it.subtotal,
          })) ?? []
        }
        promotions={activePromotions}
      />

      {/* Void sale */}
      <Dialog
        open={!!voidModal}
        onOpenChange={(open) => {
          if (!open) {
            setVoidModal(null);
            setVoidReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-destructive/10 p-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Anular venta</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Marca la venta como anulada, devuelve el stock al inventario y
              registra un egreso compensatorio. No se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {voidModal && (
            <div className="rounded-lg border bg-muted/30 p-2 text-xs space-y-0.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Venta</span>
                <span className="font-medium">
                  #{voidModal.sale_number ?? voidModal.id.slice(0, 8)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold text-primary">
                  {formatCurrency(voidModal.total)}
                </span>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label>Motivo de anulación *</Label>
            <Textarea
              placeholder="Ej: Producto devuelto, cobro duplicado..."
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setVoidModal(null);
                setVoidReason("");
              }}
              disabled={voidSale.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={!voidReason.trim() || voidSale.isPending}
              onClick={async () => {
                if (!voidModal || !voidReason.trim()) return;
                await voidSale.mutateAsync({
                  sale: voidModal,
                  reason: voidReason.trim(),
                });
                setVoidModal(null);
                setVoidReason("");
              }}
            >
              {voidSale.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Anular venta
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Park-order modal */}
      <ParkSaveModal
        open={parkSaveModal}
        onOpenChange={setParkSaveModal}
        parkName={parkName}
        onParkNameChange={setParkName}
        onSave={handleParkOrder}
      />

      {/* Parked orders modal */}
      <ParkingModal
        open={parkingModal}
        onOpenChange={setParkingModal}
        orders={parkedOrders}
        onResume={handleResumeParked}
        onDelete={handleDeleteParked}
      />

      {/* Manual movement modal */}
      <MovementModal
        open={movementModal}
        onOpenChange={setMovementModal}
        type={movementType}
        onTypeChange={setMovementType}
        amount={movementAmount}
        onAmountChange={setMovementAmount}
        category={movementCategory}
        onCategoryChange={setMovementCategory}
        description={movementDescription}
        onDescriptionChange={setMovementDescription}
        onSubmit={handleCreateMovement}
        isPending={createTransaction.isPending}
      />
    </div>
  );
}
