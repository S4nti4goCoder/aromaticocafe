/**
 * Minimal helpers over the dynamically-imported `xlsx` library.
 *
 * A `Sheet` is just "an array-of-arrays plus a name" so consumers stay
 * declarative and don't need to know about `xlsx` cell objects.
 */

export interface Sheet {
  name: string;
  rows: (string | number | null)[][];
  /** Optional fixed column widths in "characters". Auto-derived if omitted. */
  colWidths?: number[];
}

const MAX_COL_WIDTH = 40;

function deriveWidths(rows: (string | number | null)[][]): number[] {
  if (rows.length === 0) return [];
  const cols = Math.max(...rows.map((r) => r.length));
  const widths: number[] = [];
  for (let c = 0; c < cols; c++) {
    let max = 8;
    for (const r of rows) {
      const v = r[c];
      if (v == null) continue;
      const len = String(v).length;
      if (len > max) max = len;
    }
    widths.push(Math.min(max + 2, MAX_COL_WIDTH));
  }
  return widths;
}

/** Builds and triggers a download of `<baseName>-<YYYY-MM-DD>.xlsx`. */
export async function writeWorkbook(
  baseName: string,
  sheets: Sheet[],
): Promise<void> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  for (const s of sheets) {
    const ws = XLSX.utils.aoa_to_sheet(s.rows);
    const widths = s.colWidths ?? deriveWidths(s.rows);
    ws["!cols"] = widths.map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, s.name.slice(0, 31));
  }
  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${baseName}-${date}.xlsx`);
}
