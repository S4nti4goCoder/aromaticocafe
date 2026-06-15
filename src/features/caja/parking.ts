// Parked orders ("pedidos en espera") persisted in localStorage so the cashier
// can hold a cart aside and resume it later.
import type { CartItem } from "@/types";

const PARKING_KEY = "caja_parked_orders_v1";

export interface ParkedOrder {
  id: string;
  name: string;
  cart: CartItem[];
  createdAt: string;
}

export const loadParked = (): ParkedOrder[] => {
  try {
    const raw = localStorage.getItem(PARKING_KEY);
    return raw ? (JSON.parse(raw) as ParkedOrder[]) : [];
  } catch {
    return [];
  }
};

export const saveParked = (orders: ParkedOrder[]) => {
  localStorage.setItem(PARKING_KEY, JSON.stringify(orders));
};
