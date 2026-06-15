import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { CompanyFormData } from "@/features/settings/company/types";

// Single-country deployment: only COP for now. To support more currencies
// later, add entries here (code must be a valid ISO 4217 code — Intl uses it)
// and to SYMBOL_OPTIONS; the dropdown + auto-fill handle the rest.
const CURRENCIES = [
  { code: "COP", name: "Peso colombiano", symbol: "$", thousands: ".", decimal: "," },
];

const SYMBOL_OPTIONS = ["$"];

interface CurrencyTabProps {
  register: UseFormRegister<CompanyFormData>;
  setValue: UseFormSetValue<CompanyFormData>;
  watch: UseFormWatch<CompanyFormData>;
}

// "Moneda" tab: currency code/symbol via dropdowns (auto-filling separators),
// editable separators, and a live format preview.
export function CurrencyTab({ register, setValue, watch }: CurrencyTabProps) {
  const code = watch("currency_code") ?? "";
  const symbol = watch("currency_symbol") ?? "";
  const thousands = watch("currency_thousands_separator") ?? ".";

  const dirty = { shouldDirty: true };

  const handleCodeChange = (newCode: string) => {
    setValue("currency_code", newCode, dirty);
    const preset = CURRENCIES.find((c) => c.code === newCode);
    if (preset) {
      setValue("currency_symbol", preset.symbol, dirty);
      setValue("currency_thousands_separator", preset.thousands, dirty);
      setValue("currency_decimal_separator", preset.decimal, dirty);
    }
  };

  // Keep any saved code/symbol that isn't in our presets selectable.
  const codeOptions = CURRENCIES.some((c) => c.code === code)
    ? CURRENCIES
    : [{ code, name: code, symbol: "", thousands: "", decimal: "" }, ...CURRENCIES];
  const symbolOptions =
    symbol && !SYMBOL_OPTIONS.includes(symbol)
      ? [symbol, ...SYMBOL_OPTIONS]
      : SYMBOL_OPTIONS;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Configuración de Moneda
        </CardTitle>
        <CardDescription>
          Define el formato de precios en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Código de moneda</Label>
          <select
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {codeOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name ? `${c.code} — ${c.name}` : c.code}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Define los decimales y el formato (estándar ISO).
          </p>
        </div>
        <div className="space-y-2">
          <Label>Símbolo</Label>
          <select
            value={symbol}
            onChange={(e) =>
              setValue("currency_symbol", e.target.value, dirty)
            }
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {symbolOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Se autocompleta con la moneda; puedes cambiarlo.
          </p>
        </div>
        <div className="space-y-2">
          <Label>Separador de miles</Label>
          <Input placeholder="." {...register("currency_thousands_separator")} />
          <p className="text-xs text-muted-foreground">Ej: . o ,</p>
        </div>
        <div className="space-y-2">
          <Label>Separador decimal</Label>
          <Input placeholder="," {...register("currency_decimal_separator")} />
          <p className="text-xs text-muted-foreground">Ej: , o .</p>
        </div>

        <div className="md:col-span-2 p-4 rounded-xl border bg-muted/30">
          <p className="text-sm font-medium mb-2">Vista previa</p>
          <p className="text-xs text-muted-foreground">
            Formato:{" "}
            <span className="font-mono font-medium text-sm">
              {symbol || "$"}10{thousands || "."}000
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
