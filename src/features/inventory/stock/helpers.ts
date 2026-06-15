// Shared types + pure helpers for the Stock screen (status derivation and
// CSV exporters). Kept free of JSX so both the page shell and tabs can use them.
import type { useInventoryMovements } from "@/hooks/useInventory";
import type { InventoryMovementType, Product, ProductStock } from "@/types";

export type StatusFilter = "all" | "ok" | "bajo" | "agotado";
export type MovementTypeFilter = "all" | InventoryMovementType;

export type InventoryMovement = NonNullable<
  ReturnType<typeof useInventoryMovements>["data"]
>[number];

export const getStockStatus = (item: ProductStock): StatusFilter => {
  if (item.stock <= 0) return "agotado";
  if (item.stock <= item.min_stock) return "bajo";
  return "ok";
};

const csvEscape = (val: unknown) => {
  const s = String(val ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const downloadCsv = (csv: string, filename: string) => {
  // Prepend a UTF-8 BOM so Excel detects the encoding correctly.
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportStockCsv = (rows: ProductStock[]) => {
  const data = rows.map((p) => ({
    producto: p.product_name,
    categoria: p.category_name ?? "",
    stock: p.stock,
    stock_minimo: p.min_stock,
    estado:
      getStockStatus(p) === "agotado"
        ? "Agotado"
        : getStockStatus(p) === "bajo"
          ? "Stock bajo"
          : "OK",
  }));
  const headers = ["producto", "categoria", "stock", "stock_minimo", "estado"];
  const csv = [
    headers.join(","),
    ...data.map((r) =>
      headers.map((h) => csvEscape(r[h as keyof typeof r])).join(","),
    ),
  ].join("\n");
  downloadCsv(csv, `stock-${new Date().toISOString().slice(0, 10)}.csv`);
};

export const exportMovementsCsv = (
  movements: InventoryMovement[],
  products: Product[],
) => {
  const data = movements.map((m) => {
    const product = products.find((p) => p.id === m.product_id);
    return {
      fecha: new Date(m.created_at).toISOString(),
      tipo: m.type,
      producto: product?.name ?? "Producto eliminado",
      cantidad: m.quantity,
      stock_anterior: m.previous_stock,
      stock_nuevo: m.new_stock,
      motivo: m.reason ?? "",
    };
  });
  const headers = [
    "fecha",
    "tipo",
    "producto",
    "cantidad",
    "stock_anterior",
    "stock_nuevo",
    "motivo",
  ];
  const csv = [
    headers.join(","),
    ...data.map((r) =>
      headers.map((h) => csvEscape(r[h as keyof typeof r])).join(","),
    ),
  ].join("\n");
  downloadCsv(csv, `movimientos-${new Date().toISOString().slice(0, 10)}.csv`);
};
