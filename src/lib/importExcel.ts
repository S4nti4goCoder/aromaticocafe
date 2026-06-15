import type { ColumnSpec } from "@/features/import/types";

const DIACRITICS_RE = /[̀-ͯ]/g;

/** Lowercase + strip accents + strip "*" used for required-marker headers. */
export function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(DIACRITICS_RE, "")
    .toLowerCase()
    .replace(/\*/g, "")
    .trim();
}

/** Lowercase + strip accents — used to compare names for dedup / resolution. */
export function normalizeName(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(DIACRITICS_RE, "")
    .toLowerCase()
    .trim();
}

export function parseBoolCell(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  const s = String(value ?? "").trim().toLowerCase();
  if (!s) return fallback;
  return ["si", "sí", "yes", "true", "1", "activo", "activa", "x"].includes(s);
}

export function parseNumberCell(value: unknown): number | null {
  if (value === "" || value == null) return null;
  const n = typeof value === "number" ? value : parseFloat(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function parseIntegerCell(value: unknown): number | null {
  const n = parseNumberCell(value);
  return n == null ? null : Math.trunc(n);
}

/** Accepts "YYYY-MM-DD", "DD/MM/YYYY", or an Excel serial date. */
export function parseDateCell(value: unknown): string | null {
  if (value === "" || value == null) return null;
  if (typeof value === "number") {
    // Excel uses days since 1899-12-30 (the 1900-leap-year quirk is built in).
    const epoch = Date.UTC(1899, 11, 30);
    const d = new Date(epoch + value * 86400000);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().split("T")[0];
  }
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const dm = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (dm) return `${dm[3]}-${dm[2].padStart(2, "0")}-${dm[1].padStart(2, "0")}`;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
}

/**
 * Parse an .xlsx file into rows keyed by each column's canonical `key`. Headers
 * are matched case- and accent-insensitively against `columns[].key` and
 * `columns[].aliases`. Unknown columns in the file are ignored.
 */
export async function parseXlsx(
  file: File,
  columns: ColumnSpec[],
): Promise<Record<string, unknown>[]> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return [];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
  if (json.length === 0) return [];

  const headerToKey = new Map<string, string>();
  for (const header of Object.keys(json[0])) {
    const norm = normalizeHeader(header);
    const match = columns.find(
      (c) =>
        normalizeHeader(c.key) === norm ||
        (c.aliases ?? []).some((a) => normalizeHeader(a) === norm),
    );
    if (match) headerToKey.set(header, match.key);
  }

  return json.map((row) => {
    const out: Record<string, unknown> = {};
    for (const [header, value] of Object.entries(row)) {
      const key = headerToKey.get(header);
      if (key) out[key] = value;
    }
    return out;
  });
}

/**
 * Build and download a `.xlsx` template with one header row (marking required
 * columns with a trailing `*`) and the supplied example rows.
 */
export async function downloadTemplate(
  templateBaseName: string,
  columns: ColumnSpec[],
  examples: Record<string, unknown>[],
): Promise<void> {
  const XLSX = await import("xlsx");
  const headers = columns.map((c) => (c.required ? `${c.key}*` : c.key));
  const dataRows = examples.map((ex) =>
    columns.map((c) => ex[c.key] ?? c.example ?? ""),
  );
  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
  XLSX.writeFile(wb, `plantilla_${templateBaseName}.xlsx`);
}
