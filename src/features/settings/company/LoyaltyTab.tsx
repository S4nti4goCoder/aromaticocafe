import type { UseFormRegister } from "react-hook-form";
import { Gift, Stamp, Star } from "lucide-react";
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

interface LoyaltyTabProps {
  register: UseFormRegister<CompanyFormData>;
  loyaltyEnabled: boolean;
  onLoyaltyEnabledChange: (value: boolean) => void;
  loyaltyMode: "sellos" | "puntos";
  onLoyaltyModeChange: (mode: "sellos" | "puntos") => void;
  activeProducts: { id: string; name: string }[];
  currencySymbol: string;
  settings: SystemSettings | null | undefined;
}

// "Fidelización" tab: enable toggle + sellos/puntos config with previews.
export function LoyaltyTab({
  register,
  loyaltyEnabled,
  onLoyaltyEnabledChange,
  loyaltyMode,
  onLoyaltyModeChange,
  activeProducts,
  currencySymbol,
  settings,
}: LoyaltyTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Programa de fidelización
        </CardTitle>
        <CardDescription>
          Premia a tus clientes frecuentes con sellos o puntos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Enable toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl border">
          <div>
            <p className="font-medium text-sm">Activar fidelización</p>
            <p className="text-xs text-muted-foreground">
              Habilita el programa en la caja al cobrar.
            </p>
          </div>
          <input
            type="checkbox"
            checked={loyaltyEnabled}
            onChange={(e) => onLoyaltyEnabledChange(e.target.checked)}
            className="h-4 w-4 cursor-pointer"
          />
        </div>

        {loyaltyEnabled && (
          <>
            {/* Mode selector */}
            <div className="space-y-2">
              <Label className="text-xs">Modelo</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onLoyaltyModeChange("sellos")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-colors cursor-pointer ${
                    loyaltyMode === "sellos"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/30 hover:border-primary/40"
                  }`}
                >
                  <Stamp className="h-4 w-4" />
                  Sellos
                </button>
                <button
                  type="button"
                  onClick={() => onLoyaltyModeChange("puntos")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-colors cursor-pointer ${
                    loyaltyMode === "puntos"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/30 hover:border-primary/40"
                  }`}
                >
                  <Star className="h-4 w-4" />
                  Puntos
                </button>
              </div>
            </div>

            {/* Stamps ("sellos") config */}
            {loyaltyMode === "sellos" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sellos para el premio</Label>
                  <Input
                    type="number"
                    min={2}
                    max={50}
                    placeholder="10"
                    {...register("loyalty_stamps_required")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Compra esta cantidad y la siguiente es el premio.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Premio (texto que ve el cliente)</Label>
                  <Input
                    placeholder="Café gratis"
                    {...register("loyalty_reward")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Solo descriptivo (ej: "Café gratis").
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Producto del premio (opcional)</Label>
                  <select
                    {...register("loyalty_reward_product_id")}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">— Cualquiera (usar tope) —</option>
                    {activeProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    El descuento del premio será el precio de ESTE producto, no
                    el más caro del carrito.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Valor máximo del premio (opcional)</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder={`Ej: 4000`}
                    {...register("loyalty_reward_max_value")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tope del descuento ({currencySymbol}). Evita que se lleven
                    algo caro gratis.
                  </p>
                </div>

                <div className="md:col-span-2 p-4 rounded-xl border bg-muted/30">
                  <p className="text-sm font-medium mb-1">Vista previa</p>
                  <p className="text-xs text-muted-foreground">
                    "Junta {settings?.loyalty_stamps_required ?? 10} sellos y
                    reclama: {settings?.loyalty_reward ?? "Producto gratis"}"
                  </p>
                </div>
              </div>
            )}

            {/* Points ("puntos") config */}
            {loyaltyMode === "puntos" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Puntos por cada {currencySymbol}1.000</Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="1"
                    {...register("loyalty_points_per_thousand")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor de 1 punto ({currencySymbol})</Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="10"
                    {...register("loyalty_points_value")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mínimo para canjear</Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="100"
                    {...register("loyalty_points_redeem_min")}
                  />
                </div>
                <div className="md:col-span-3 p-4 rounded-xl border bg-muted/30">
                  <p className="text-sm font-medium mb-1">Vista previa</p>
                  <p className="text-xs text-muted-foreground">
                    Por cada {currencySymbol}1.000 gana{" "}
                    {settings?.loyalty_points_per_thousand ?? 1} punto(s).
                    Canjea desde {settings?.loyalty_points_redeem_min ?? 100}{" "}
                    puntos (1 punto = {currencySymbol}
                    {settings?.loyalty_points_value ?? 10}).
                  </p>
                </div>
              </div>
            )}

            {/* Min purchase to earn (both modes) */}
            <div className="space-y-2 max-w-sm">
              <Label>Compra mínima para ganar (opcional)</Label>
              <Input
                type="number"
                min={0}
                placeholder="Ej: 3000"
                {...register("loyalty_min_purchase")}
              />
              <p className="text-xs text-muted-foreground">
                Monto mínimo ({currencySymbol}) que debe gastar para sumar
                sello/puntos. Evita que sumen comprando lo más barato. Déjalo
                vacío para que cualquier compra cuente.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
