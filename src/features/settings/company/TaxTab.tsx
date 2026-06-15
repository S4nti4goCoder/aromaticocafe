import type { UseFormRegister } from "react-hook-form";
import { Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { SystemSettings } from "@/hooks/useSystemSettings";
import type { CompanyFormData } from "@/features/settings/company/types";

interface TaxTabProps {
  register: UseFormRegister<CompanyFormData>;
  taxEnabled: boolean;
  onTaxEnabledChange: (value: boolean) => void;
  taxIncluded: boolean;
  onTaxIncludedChange: (value: boolean) => void;
  settings: SystemSettings | null | undefined;
}

// "IVA" tab: enable/included toggles, name/percentage, and a price preview.
export function TaxTab({
  register,
  taxEnabled,
  onTaxEnabledChange,
  taxIncluded,
  onTaxIncludedChange,
  settings,
}: TaxTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Configuración de IVA
        </CardTitle>
        <CardDescription>
          Define cómo se aplica el impuesto en las ventas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between p-4 rounded-xl border">
          <div>
            <p className="font-medium text-sm">Aplicar IVA</p>
            <p className="text-xs text-muted-foreground">
              Habilita o deshabilita el IVA en todas las ventas
            </p>
          </div>
          <input
            type="checkbox"
            checked={taxEnabled}
            onChange={(e) => onTaxEnabledChange(e.target.checked)}
            className="h-4 w-4 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border">
          <div>
            <p className="font-medium text-sm">IVA incluido en el precio</p>
            <p className="text-xs text-muted-foreground">
              El precio mostrado ya incluye el IVA (se desglosa en la tirilla)
            </p>
          </div>
          <input
            type="checkbox"
            checked={taxIncluded}
            onChange={(e) => onTaxIncludedChange(e.target.checked)}
            className="h-4 w-4 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nombre del impuesto</Label>
            <Input placeholder="IVA" {...register("tax_name")} />
          </div>
          <div className="space-y-2">
            <Label>Porcentaje (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              placeholder="8"
              {...register("tax_percentage")}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-muted/30">
          <p className="text-sm font-medium mb-2">Vista previa</p>
          <p className="text-xs text-muted-foreground">
            Precio del producto:{" "}
            <span className="font-mono font-medium">$10.000</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Base gravable:{" "}
            <span className="font-mono font-medium">
              $
              {(
                10000 /
                (1 + (settings?.tax_percentage ?? 8) / 100)
              ).toLocaleString("es-CO", { maximumFractionDigits: 0 })}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            {settings?.tax_name ?? "IVA"} ({settings?.tax_percentage ?? 8}%):{" "}
            <span className="font-mono font-medium">
              $
              {(
                10000 -
                10000 / (1 + (settings?.tax_percentage ?? 8) / 100)
              ).toLocaleString("es-CO", { maximumFractionDigits: 0 })}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
