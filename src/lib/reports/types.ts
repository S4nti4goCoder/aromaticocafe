import type { DateRange, DateRangeKey } from "@/hooks/useDashboard";

/** Branding for PDF headers, sourced from system_settings. */
export interface Brand {
  name: string;
  nit: string | null;
  city: string | null;
  phone: string | null;
}

const RANGE_LABELS: Record<DateRangeKey, string> = {
  today: "Hoy",
  "7d": "Últimos 7 días",
  "30d": "Últimos 30 días",
  month: "Mes actual",
  custom: "Personalizado",
};

const ISO_DATE = (d: Date) => d.toISOString().split("T")[0];

export function formatRangeLabel(range: DateRange): string {
  if (range.key === "today") return `Hoy (${ISO_DATE(range.from)})`;
  if (range.key === "month") {
    const m = range.from.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
    });
    return `${RANGE_LABELS.month} (${m})`;
  }
  return `${RANGE_LABELS[range.key]} (${ISO_DATE(range.from)} → ${ISO_DATE(range.to)})`;
}

/**
 * Returns the immediately-prior period of the same length.
 * Returns `null` for "custom" — comparatives only fire on natural periods.
 */
export function previousRange(range: DateRange): DateRange | null {
  if (range.key === "custom") return null;

  if (range.key === "today") {
    const from = new Date(range.from);
    from.setDate(from.getDate() - 1);
    const to = new Date(range.to);
    to.setDate(to.getDate() - 1);
    return { key: "today", from, to };
  }

  if (range.key === "month") {
    const now = range.from;
    const prevFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const prevTo = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { key: "month", from: prevFrom, to: prevTo };
  }

  // "7d" / "30d": shift both endpoints back by the period length.
  const ms = range.to.getTime() - range.from.getTime();
  const from = new Date(range.from.getTime() - ms - 1);
  const to = new Date(range.to.getTime() - ms - 1);
  return { key: range.key, from, to };
}

/** Builds "+12.4%" / "-3.1%" / "—" (when previous is 0 / undefined). */
export function formatPctDelta(
  current: number,
  previous: number | null | undefined,
): string {
  if (previous == null || previous === 0) return "—";
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

/** Numeric variant for color coding (positive = green, negative = red). */
export function pctDelta(
  current: number,
  previous: number | null | undefined,
): number | null {
  if (previous == null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}
