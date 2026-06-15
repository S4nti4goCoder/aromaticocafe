import type { useDashboardStats, DateRange } from "@/hooks/useDashboard";
import type { Brand } from "@/lib/reports/types";
import { formatPctDelta, formatRangeLabel } from "@/lib/reports/types";
import { writeWorkbook, type Sheet } from "@/lib/reports/exportXlsx";
import {
  deltaCell,
  drawHeader,
  drawSectionTitle,
  drawTable,
  newDoc,
  savePdf,
} from "@/lib/reports/exportPdf";

type Stats = NonNullable<ReturnType<typeof useDashboardStats>["data"]>;

export interface SalesReportInput {
  stats: Stats;
  prevStats: Stats | null;
  range: DateRange;
  prevRange: DateRange | null;
  brand: Brand;
}

const REPORT_TITLE = "Reporte de Ventas";

export async function generateSalesXlsx(input: SalesReportInput): Promise<void> {
  const { stats, prevStats, range, prevRange } = input;
  const rangeLabel = formatRangeLabel(range);
  const sheets: Sheet[] = [];

  const summaryHeader: (string | null)[] = [
    "Métrica",
    "Valor actual",
    prevRange ? "Período anterior" : null,
    prevRange ? "Variación" : null,
  ];
  const summaryRows: (string | number | null)[][] = [
    summaryHeader.filter((c): c is string => c !== null),
    [
      "Total vendido",
      stats.month.total,
      ...(prevStats
        ? [
            prevStats.month.total,
            formatPctDelta(stats.month.total, prevStats.month.total),
          ]
        : []),
    ],
    [
      "Transacciones",
      stats.month.count,
      ...(prevStats
        ? [
            prevStats.month.count,
            formatPctDelta(stats.month.count, prevStats.month.count),
          ]
        : []),
    ],
    [
      "Ticket promedio",
      stats.month.avgTicket,
      ...(prevStats
        ? [
            prevStats.month.avgTicket,
            formatPctDelta(stats.month.avgTicket, prevStats.month.avgTicket),
          ]
        : []),
    ],
  ];
  sheets.push({
    name: "Resumen",
    rows: [["Rango", rangeLabel], [], ...summaryRows],
  });

  sheets.push({
    name: "Por día",
    rows: [
      ["Fecha", "Total"],
      ...stats.salesChartData.map((d) => [d.date, d.total]),
    ],
  });

  sheets.push({
    name: "Top productos",
    rows: [
      ["Producto", "Cantidad", "Ingresos"],
      ...stats.topProducts.map((p) => [p.name, p.quantity, p.total]),
    ],
  });

  const paymentTotal = stats.paymentMethods.reduce(
    (sum, m) => sum + m.total,
    0,
  );
  sheets.push({
    name: "Métodos de pago",
    rows: [
      ["Método", "Total", "% del total"],
      ...stats.paymentMethods.map((m) => [
        m.method,
        m.total,
        paymentTotal > 0
          ? `${((m.total / paymentTotal) * 100).toFixed(1)}%`
          : "—",
      ]),
    ],
  });

  await writeWorkbook("reporte-ventas", sheets);
}

export async function generateSalesPdf(input: SalesReportInput): Promise<void> {
  const { stats, prevStats, brand, range, prevRange } = input;
  const doc = await newDoc();
  const rangeLabel = formatRangeLabel(range);
  const prevRangeLabel = prevRange ? formatRangeLabel(prevRange) : undefined;

  let y = drawHeader(doc, brand, REPORT_TITLE, rangeLabel, prevRangeLabel);

  y = drawSectionTitle(doc, "Resumen", y);
  const summaryHeaders = prevStats
    ? ["Métrica", "Actual", "Anterior", "Variación"]
    : ["Métrica", "Actual"];
  const summaryWidths = prevStats ? [160, 110, 110, 100] : [200, 200];
  const summaryRows = [
    [
      "Total vendido",
      formatCop(stats.month.total),
      ...(prevStats
        ? [
            formatCop(prevStats.month.total),
            deltaCell(formatPctDelta(stats.month.total, prevStats.month.total)),
          ]
        : []),
    ],
    [
      "Transacciones",
      String(stats.month.count),
      ...(prevStats
        ? [
            String(prevStats.month.count),
            deltaCell(formatPctDelta(stats.month.count, prevStats.month.count)),
          ]
        : []),
    ],
    [
      "Ticket promedio",
      formatCop(stats.month.avgTicket),
      ...(prevStats
        ? [
            formatCop(prevStats.month.avgTicket),
            deltaCell(
              formatPctDelta(stats.month.avgTicket, prevStats.month.avgTicket),
            ),
          ]
        : []),
    ],
  ];
  y = drawTable(
    doc,
    { headers: summaryHeaders, rows: summaryRows, colWidths: summaryWidths },
    y,
  );

  y = drawSectionTitle(doc, "Ventas por día", y + 6);
  const dailyRows = stats.salesChartData
    .slice(-14)
    .map((d) => [d.date, formatCop(d.total)]);
  y = drawTable(
    doc,
    { headers: ["Fecha", "Total"], rows: dailyRows, colWidths: [200, 200] },
    y,
  );

  y = drawSectionTitle(doc, "Top productos", y + 6);
  const topRows = stats.topProducts
    .slice(0, 10)
    .map((p) => [p.name, String(p.quantity), formatCop(p.total)]);
  y = drawTable(
    doc,
    {
      headers: ["Producto", "Cant.", "Ingresos"],
      rows: topRows,
      colWidths: [260, 80, 120],
    },
    y,
  );

  y = drawSectionTitle(doc, "Métodos de pago", y + 6);
  const paymentTotal = stats.paymentMethods.reduce(
    (sum, m) => sum + m.total,
    0,
  );
  const paymentRows = stats.paymentMethods.map((m) => [
    m.method,
    formatCop(m.total),
    paymentTotal > 0
      ? `${((m.total / paymentTotal) * 100).toFixed(1)}%`
      : "—",
  ]);
  drawTable(
    doc,
    {
      headers: ["Método", "Total", "% del total"],
      rows: paymentRows,
      colWidths: [200, 140, 120],
    },
    y,
  );

  savePdf(doc, "reporte-ventas");
}

function formatCop(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}
