import localforage from "localforage";

const store = localforage.createInstance({
  name: "aromaticocafe",
  storeName: "pending_sales",
  description: "Ventas registradas sin conexión, pendientes de sincronizar",
});

/** Payload that mirrors what the `create_sale` RPC needs to replay a sale. */
export interface PendingSalePayload {
  sale_id: string;
  cash_register_id: string;
  seller_id: string | null;
  payment_method: string;
  discount: number;
  notes: string | null;
  total: number;
  customer_phone?: string | null;
  loyalty_stamps_awarded?: number | null;
  loyalty_points_awarded?: number | null;
  loyalty_redeemed_value?: number | null;
  loyalty_redeemed_mode?: "sellos" | "puntos" | null;
  items: {
    product_id: string;
    product_name: string;
    product_price: number;
    quantity: number;
    subtotal: number;
  }[];
}

export interface PendingSale {
  /** Client-generated UUID — also used as the sale's primary key. */
  id: string;
  payload: PendingSalePayload;
  /** ISO timestamp of when the sale happened (offline). */
  createdAt: string;
}

const CHANGED_EVENT = "pending-sales-changed";

function notifyChange() {
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

export function onPendingSalesChange(handler: () => void): () => void {
  window.addEventListener(CHANGED_EVENT, handler);
  return () => window.removeEventListener(CHANGED_EVENT, handler);
}

export async function enqueueSale(sale: PendingSale): Promise<void> {
  await store.setItem(sale.id, sale);
  notifyChange();
}

export async function getPendingSales(): Promise<PendingSale[]> {
  const sales: PendingSale[] = [];
  await store.iterate<PendingSale, void>((value) => {
    sales.push(value);
  });
  return sales.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function removePendingSale(id: string): Promise<void> {
  await store.removeItem(id);
  notifyChange();
}

export async function countPendingSales(): Promise<number> {
  return store.length();
}

// ── Cash register operations (open/close) ─────────────────────────────
const cashStore = localforage.createInstance({
  name: "aromaticocafe",
  storeName: "pending_cash_ops",
  description: "Aperturas/cierres de caja sin conexión, pendientes de sincronizar",
});

// The locally-open cash register (when opened offline) lives in its own store
// so useTodayCashRegister can return it while offline.
const localCashStore = localforage.createInstance({
  name: "aromaticocafe",
  storeName: "local_cash_register",
});

export interface CashOpenPayload {
  id: string;
  date: string;
  opening_amount: number;
  notes: string | null;
  opened_by: string | null;
  opened_at: string;
}

export interface CashClosePayload {
  id: string;
  closing_amount: number;
  notes: string | null;
  closed_by: string | null;
  closed_at: string;
}

export interface PendingCashOp {
  /** `${type}:${cashRegisterId}` so re-queueing the same op overwrites. */
  key: string;
  type: "open" | "close";
  payload: CashOpenPayload | CashClosePayload;
  createdAt: string;
}

export async function enqueueCashOp(op: PendingCashOp): Promise<void> {
  await cashStore.setItem(op.key, op);
  notifyChange();
}

export async function getPendingCashOps(): Promise<PendingCashOp[]> {
  const ops: PendingCashOp[] = [];
  await cashStore.iterate<PendingCashOp, void>((value) => {
    ops.push(value);
  });
  // Opens before closes, then by time.
  return ops.sort((a, b) => {
    if (a.type !== b.type) return a.type === "open" ? -1 : 1;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

export async function removeCashOp(key: string): Promise<void> {
  await cashStore.removeItem(key);
  notifyChange();
}

/** The cash register opened while offline (or null). Used as a local fallback. */
export async function setLocalCashRegister(
  register: Record<string, unknown> | null,
): Promise<void> {
  if (register) {
    await localCashStore.setItem("current", register);
  } else {
    await localCashStore.removeItem("current");
  }
  notifyChange();
}

export async function getLocalCashRegister<T = Record<string, unknown>>(): Promise<T | null> {
  return (await localCashStore.getItem<T>("current")) ?? null;
}
