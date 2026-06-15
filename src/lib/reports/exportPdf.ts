import type { Brand } from "@/lib/reports/types";

/**
 * Tiny abstraction over jsPDF. Each public function takes the live `doc`,
 * mutates it, and returns the new `y` cursor so callers can chain sections.
 *
 * No autoTable plugin — we draw simple grids with `doc.text` + `doc.line` so
 * the bundle stays small.
 */

type JsPdfDoc = import("jspdf").jsPDF;

const PAGE_MARGIN = 40;
const LINE_HEIGHT = 14;
const HEADER_COLOR: [number, number, number] = [40, 40, 40];
const MUTED_COLOR: [number, number, number] = [110, 110, 110];
const POSITIVE_COLOR: [number, number, number] = [22, 163, 74];
const NEGATIVE_COLOR: [number, number, number] = [220, 38, 38];

export interface PdfTable {
  headers: string[];
  rows: (string | { text: string; color?: [number, number, number] })[][];
  /** Column widths in PDF points; widths must sum to <= page-width - 2*margin. */
  colWidths: number[];
}

export async function newDoc(): Promise<JsPdfDoc> {
  const { jsPDF } = await import("jspdf");
  return new jsPDF({ unit: "pt", format: "letter", orientation: "portrait" });
}

/** Draws a 3-line branded header. Returns the y-cursor below it. */
export function drawHeader(
  doc: JsPdfDoc,
  brand: Brand,
  reportTitle: string,
  rangeLabel: string,
  comparativeLabel?: string,
): number {
  let y = PAGE_MARGIN;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...HEADER_COLOR);
  doc.text(brand.name, PAGE_MARGIN, y);
  y += LINE_HEIGHT + 4;

  const subtitleParts = [brand.nit, brand.city, brand.phone].filter(
    (p): p is string => !!p && p.trim().length > 0,
  );
  if (subtitleParts.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED_COLOR);
    doc.text(subtitleParts.join(" · "), PAGE_MARGIN, y);
    y += LINE_HEIGHT;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...HEADER_COLOR);
  const titleLine = comparativeLabel
    ? `${reportTitle} — ${rangeLabel} (vs ${comparativeLabel})`
    : `${reportTitle} — ${rangeLabel}`;
  doc.text(titleLine, PAGE_MARGIN, y);
  y += LINE_HEIGHT;

  doc.setDrawColor(220, 220, 220);
  doc.line(PAGE_MARGIN, y, doc.internal.pageSize.getWidth() - PAGE_MARGIN, y);
  y += LINE_HEIGHT;
  return y;
}

export function drawSectionTitle(
  doc: JsPdfDoc,
  title: string,
  y: number,
): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...HEADER_COLOR);
  doc.text(title, PAGE_MARGIN, y);
  return y + LINE_HEIGHT;
}

export function drawTable(
  doc: JsPdfDoc,
  table: PdfTable,
  startY: number,
): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = startY;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...HEADER_COLOR);
  let x = PAGE_MARGIN;
  for (let i = 0; i < table.headers.length; i++) {
    doc.text(table.headers[i], x, y);
    x += table.colWidths[i];
  }
  y += 4;
  doc.setDrawColor(180, 180, 180);
  doc.line(
    PAGE_MARGIN,
    y,
    PAGE_MARGIN + table.colWidths.reduce((a, b) => a + b, 0),
    y,
  );
  y += LINE_HEIGHT;

  doc.setFont("helvetica", "normal");
  for (const row of table.rows) {
    if (y > pageHeight - PAGE_MARGIN) {
      doc.addPage();
      y = PAGE_MARGIN;
    }
    x = PAGE_MARGIN;
    for (let i = 0; i < row.length; i++) {
      const cell = row[i];
      const width = table.colWidths[i];
      if (typeof cell === "string") {
        doc.setTextColor(...HEADER_COLOR);
        doc.text(truncate(cell, width), x, y);
      } else {
        doc.setTextColor(...(cell.color ?? HEADER_COLOR));
        doc.text(truncate(cell.text, width), x, y);
      }
      x += width;
    }
    y += LINE_HEIGHT;
  }
  return y + 6;
}

function truncate(text: string, widthPt: number): string {
  const maxChars = Math.max(4, Math.floor(widthPt / 5));
  return text.length > maxChars ? `${text.slice(0, maxChars - 1)}…` : text;
}

/** Convenience cell builder for "+12.4%" green / "-3.1%" red / "—" neutral. */
export function deltaCell(text: string): {
  text: string;
  color: [number, number, number];
} {
  if (text.startsWith("+")) return { text, color: POSITIVE_COLOR };
  if (text.startsWith("-")) return { text, color: NEGATIVE_COLOR };
  return { text, color: MUTED_COLOR };
}

/** Triggers a download named `<baseName>-<YYYY-MM-DD>.pdf`. */
export function savePdf(doc: JsPdfDoc, baseName: string): void {
  const date = new Date().toISOString().slice(0, 10);
  doc.save(`${baseName}-${date}.pdf`);
}
