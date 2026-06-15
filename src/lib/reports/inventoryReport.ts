import type { Brand } from "@/lib/reports/types";
import type { ProductStock } from "@/types";
import { writeWorkbook, type Sheet } from "@/lib/reports/exportXlsx";
import {
  drawHeader,
  drawSectionTitle,
  drawTable,
  newDoc,
  savePdf,
} from "@/lib/reports/exportPdf";

export interface InventoryRow {
  stock: ProductStock;
  cost: number | null;
}

export interface InventoryReportInput {
  rows: InventoryRow[];
  brand: Brand;
  /** Pass `false` when the caller doesn't have costs (e.g. cajero). */
  showCosts: boolean;
}

const REPORT_TITLE = "Reporte de Inventario";
const SNAPSHOT_LABEL = () =>
  new Date().toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

function statusOf(item: ProductStock): "OK" | "Bajo" | "Agotado" {
  if (item.stock <= 0) return "Agotado";
  if (item.stock <= item.min_stock) return "Bajo";
  return "OK";
}

export async function generateInventoryXlsx(
  input: InventoryReportInput,
): Promise<void> {
  const { rows, showCosts } = input;
  const header: (string | null)[] = showCosts
    ? [
        "Producto",
        "Categoría",
        "Stock",
        "Stock mínimo",
        "Estado",
        "Costo unitario",
        "Valor (stock × costo)",
      ]
    : ["Producto", "Categoría", "Stock", "Stock mínimo", "Estado"];

  const bodyRows: (string | number | null)[][] = rows.map(({ stock, cost }) => {
    const base: (string | number | null)[] = [
      stock.product_name,
      stock.category_name ?? "—",
      stock.stock,
      stock.min_stock,
      statusOf(stock),
    ];
    if (showCosts) {
      const value = cost != null ? cost * stock.stock : null;
      base.push(cost, value);
    }
    return base;
  });

  let totalValue = 0;
  let low = 0;
  let out = 0;
  for (const { stock, cost } of rows) {
    const s = statusOf(stock);
    if (s === "Bajo") low++;
    if (s === "Agotado") out++;
    if (showCosts && cost != null) totalValue += cost * stock.stock;
  }

  const totalsRow: (string | number | null)[] = showCosts
    ? [
        "Totales",
        `${rows.length} productos`,
        "",
        `Bajo: ${low}`,
        `Agotado: ${out}`,
        "",
        totalValue,
      ]
    : [
        "Totales",
        `${rows.length} productos`,
        "",
        `Bajo: ${low}`,
        `Agotado: ${out}`,
      ];

  const sheet: Sheet = {
    name: "Inventario",
    rows: [
      ["Snapshot", SNAPSHOT_LABEL()],
      [],
      header,
      ...bodyRows,
      [],
      totalsRow,
    ],
  };

  await writeWorkbook("reporte-inventario", [sheet]);
}

export async function generateInventoryPdf(
  input: InventoryReportInput,
): Promise<void> {
  const { rows, brand, showCosts } = input;
  const doc = await newDoc();
  let y = drawHeader(
    doc,
    brand,
    REPORT_TITLE,
    `Snapshot ${SNAPSHOT_LABEL()}`,
  );
  y = drawSectionTitle(doc, "Productos", y);

  const headers = showCosts
    ? ["Producto", "Categoría", "Stock", "Mín.", "Estado", "Costo", "Valor"]
    : ["Producto", "Categoría", "Stock", "Mín.", "Estado"];
  const widths = showCosts
    ? [140, 90, 50, 40, 60, 70, 80]
    : [220, 130, 60, 50, 90];

  const body = rows.map(({ stock, cost }) => {
    const base: (string | { text: string; color?: [number, number, number] })[] =
      [
        stock.product_name,
        stock.category_name ?? "—",
        String(stock.stock),
        String(stock.min_stock),
        statusOf(stock),
      ];
    if (showCosts) {
      base.push(cost != null ? formatCop(cost) : "—");
      base.push(cost != null ? formatCop(cost * stock.stock) : "—");
    }
    return base;
  });

  y = drawTable(doc, { headers, rows: body, colWidths: widths }, y);

  let totalValue = 0;
  let low = 0;
  let out = 0;
  for (const { stock, cost } of rows) {
    const s = statusOf(stock);
    if (s === "Bajo") low++;
    if (s === "Agotado") out++;
    if (showCosts && cost != null) totalValue += cost * stock.stock;
  }
  const totalsRow: string[] = showCosts
    ? [
        `${rows.length} productos`,
        "",
        "",
        "",
        `Bajo: ${low} · Agotado: ${out}`,
        "",
        formatCop(totalValue),
      ]
    : [
        `${rows.length} productos`,
        "",
        "",
        "",
        `Bajo: ${low} · Agotado: ${out}`,
      ];

  drawTable(
    doc,
    { headers: headers.map(() => ""), rows: [totalsRow], colWidths: widths },
    y + 6,
  );

  savePdf(doc, "reporte-inventario");
}

function formatCop(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}
