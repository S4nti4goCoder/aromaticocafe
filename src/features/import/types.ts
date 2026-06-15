export interface ColumnSpec {
  /** Canonical key used inside the app. */
  key: string;
  /** Accepted header variants (case- and accent-insensitive). */
  aliases?: string[];
  /** Whether the column is required for a row to be valid. */
  required?: boolean;
  /** Example value used for the downloadable template. */
  example?: string | number | boolean;
}

export type RowResult<T> =
  | { status: "valid"; value: T; rowIndex: number }
  | { status: "error"; message: string; rowIndex: number }
  | { status: "duplicate"; rowIndex: number };

export interface ImportConfig<TInsert> {
  /** Human label, e.g. "Categorías". Used in headings and toast messages. */
  entityLabel: string;
  /** Filename base for the template, e.g. "categorias". */
  templateBaseName: string;
  /** Column specs in display order. */
  columns: ColumnSpec[];
  /** 1-2 example rows used to seed the downloadable template. */
  templateExample: Record<string, unknown>[];
  /** Per-row validation; receives the normalized record (canonical keys). */
  validateRow: (raw: Record<string, unknown>, rowIndex: number) => RowResult<TInsert>;
  /** Inserts a chunk of validated rows. May also touch related tables. */
  importChunk: (rows: TInsert[]) => Promise<void>;
  /** Called after a successful import (toast already shown). Used to invalidate queries. */
  onDone: () => void;
}
