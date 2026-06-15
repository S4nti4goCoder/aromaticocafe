// Carrito en curso ("pedido actual") persistido en localStorage para que el
// cajero no pierda lo que ya agregó si se cierra el navegador, se va la luz, o
// se recarga la pestaña por error.
//
// Patrón idéntico al de parking.ts. Cuando una venta se cobra exitosamente,
// la página llama clearCurrentCart() para limpiar.
import type { CartItem } from "@/types";

const CURRENT_CART_KEY = "caja_current_cart_v1";

export const loadCurrentCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CURRENT_CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

export const saveCurrentCart = (cart: CartItem[]) => {
  try {
    if (cart.length === 0) {
      localStorage.removeItem(CURRENT_CART_KEY);
    } else {
      localStorage.setItem(CURRENT_CART_KEY, JSON.stringify(cart));
    }
  } catch {
    // Sin localStorage no se rompe el flujo de venta; el cajero pierde la
    // persistencia pero puede seguir cobrando.
  }
};

export const clearCurrentCart = () => {
  try {
    localStorage.removeItem(CURRENT_CART_KEY);
  } catch {
    // ignore
  }
};
