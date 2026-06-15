// Single source of truth for currency formatting across the app.
//
// Uses Intl.NumberFormat for correct grouping/decimals, then swaps the symbol
// and separator tokens for the values configured in system settings. With the
// COP defaults below the output is identical to a plain
// `Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" })`.
//
// The config is module-level (not React state) so `formatCurrency` stays a
// plain function callable anywhere. It's synced once from system settings in
// AdminLayout via `setCurrencyConfig`.

interface CurrencyConfig {
  locale: string;
  code: string;
  symbol: string;
  thousandsSeparator: string;
  decimalSeparator: string;
}

const config: CurrencyConfig = {
  locale: "es-CO",
  code: "COP",
  symbol: "$",
  thousandsSeparator: ".",
  decimalSeparator: ",",
};

/** Updates the currency config. Empty/undefined fields keep their current value. */
export function setCurrencyConfig(partial: {
  code?: string | null;
  symbol?: string | null;
  thousandsSeparator?: string | null;
  decimalSeparator?: string | null;
}) {
  if (partial.code) config.code = partial.code;
  if (partial.symbol) config.symbol = partial.symbol;
  if (partial.thousandsSeparator)
    config.thousandsSeparator = partial.thousandsSeparator;
  if (partial.decimalSeparator)
    config.decimalSeparator = partial.decimalSeparator;
}

export function formatCurrency(amount: number): string {
  let parts: Intl.NumberFormatPart[];
  try {
    parts = new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      minimumFractionDigits: 0,
    }).formatToParts(amount);
  } catch {
    // Invalid currency code → fall back to the COP default.
    parts = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).formatToParts(amount);
  }
  return parts
    .map((part) => {
      if (part.type === "currency") return config.symbol;
      if (part.type === "group") return config.thousandsSeparator;
      if (part.type === "decimal") return config.decimalSeparator;
      return part.value;
    })
    .join("");
}
