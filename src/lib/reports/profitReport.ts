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

export interface ProfitReportInput {
  stats: Stats;
  prevStats: Stats | null;
  range: DateRange;
  prevRange: DateRange | null;
  brand: Brand;
}

const REPORT_TITLE = "Reporte de Rentabilidad";

export async function generateProfitXlsx(
  input: ProfitReportInput,
): Promise<void> {
  const { stats, prevStats, range, prevRange } = input;
  const sheets: Sheet[] = [];

  const summaryHeader: (string | null)[] = [
    "Métrica",
    "Actual",
    prevRange ? "Período anterior" : null,
    prevRange ? "Variación" : null,
  ];
  const summary: (string | number | null)[][] = [
    summaryHeader.filter((c): c is string => c !== null),
    [
      "Ingresos",
      stats.month.total,
      ...(prevStats
        ? [
            prevStats.month.total,
            formatPctDelta(stats.month.total, prevStats.month.total),
          ]
        : []),
    ],
    [
      "COGS",
      stats.profit.cogs,
      ...(prevStats
        ? [
            prevStats.profit.cogs,
            formatPctDelta(stats.profit.cogs, prevStats.profit.cogs),
          ]
        : []),
    ],
    [
      "Utilidad bruta",
      stats.profit.gross,
      ...(prevStats
        ? [
            prevStats.profit.gross,
            formatPctDelta(stats.profit.gross, prevStats.profit.gross),
          ]
        : []),
    ],
    [
      "Margen %",
      `${stats.profit.marginPct.toFixed(1)}%`,
      ...(prevStats
        ? [
            `${prevStats.profit.marginPct.toFixed(1)}%`,
            formatPctDelta(
              stats.profit.marginPct,
              prevStats.profit.marginPct,
            ),
          ]
        : []),
    ],
  ];
  sheets.push({
    name: "Resumen",
    rows: [["Rango", formatRangeLabel(range)], [], ...summary],
  });

  const topTotal = stats.profit.topProfitable.reduce(
    (sum, p) => sum + p.profit,
    0,
  );
  sheets.push({
    name: "Top rentables",
    rows: [
      ["Producto", "Utilidad", "% del total"],
      ...stats.profit.topProfitable.map((p) => [
        p.name,
        p.profit,
        topTotal > 0 ? `${((p.profit / topTotal) * 100).toFixed(1)}%` : "—",
      ]),
    ],
  });

  await writeWorkbook("reporte-rentabilidad", sheets);
}

export async function generateProfitPdf(
  input: ProfitReportInput,
): Promise<void> {
  const { stats, prevStats, brand, range, prevRange } = input;
  const doc = await newDoc();
  const prevLabel = prevRange ? formatRangeLabel(prevRange) : undefined;
  let y = drawHeader(doc, brand, REPORT_TITLE, formatRangeLabel(range), prevLabel);

  y = drawSectionTitle(doc, "Resumen", y);
  const summaryHeaders = prevStats
    ? ["Métrica", "Actual", "Anterior", "Variación"]
    : ["Métrica", "Actual"];
  const summaryWidths = prevStats ? [160, 110, 110, 100] : [200, 200];
  const summaryRows = [
    [
      "Ingresos",
      formatCop(stats.month.total),
      ...(prevStats
        ? [
            formatCop(prevStats.month.total),
            deltaCell(formatPctDelta(stats.month.total, prevStats.month.total)),
          ]
        : []),
    ],
    [
      "COGS",
      formatCop(stats.profit.cogs),
      ...(prevStats
        ? [
            formatCop(prevStats.profit.cogs),
            deltaCell(
              formatPctDelta(stats.profit.cogs, prevStats.profit.cogs),
            ),
          ]
        : []),
    ],
    [
      "Utilidad bruta",
      formatCop(stats.profit.gross),
      ...(prevStats
        ? [
            formatCop(prevStats.profit.gross),
            deltaCell(
              formatPctDelta(stats.profit.gross, prevStats.profit.gross),
            ),
          ]
        : []),
    ],
    [
      "Margen %",
      `${stats.profit.marginPct.toFixed(1)}%`,
      ...(prevStats
        ? [
            `${prevStats.profit.marginPct.toFixed(1)}%`,
            deltaCell(
              formatPctDelta(
                stats.profit.marginPct,
                prevStats.profit.marginPct,
              ),
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

  y = drawSectionTitle(doc, "Top productos más rentables", y + 6);
  const topTotal = stats.profit.topProfitable.reduce(
    (sum, p) => sum + p.profit,
    0,
  );
  const topRows = stats.profit.topProfitable.slice(0, 10).map((p) => [
    p.name,
    formatCop(p.profit),
    topTotal > 0 ? `${((p.profit / topTotal) * 100).toFixed(1)}%` : "—",
  ]);
  drawTable(
    doc,
    {
      headers: ["Producto", "Utilidad", "% del total"],
      rows: topRows,
      colWidths: [260, 130, 110],
    },
    y,
  );

  savePdf(doc, "reporte-rentabilidad");
}

function formatCop(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}
