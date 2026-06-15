// Sección de cliente del modal de cobro. Maneja 5 estados:
//
//   idle      → no hay cliente. Solo el botón "Asignar cliente al pedido".
//   searching → buscar por nombre o teléfono. Lista con resultados en vivo.
//   selected  → cliente ya elegido de BD. Si loyalty está activo se ven los
//               puntos/sellos y la opción de canjear.
//   creating  → registrar cliente nuevo (nombre + teléfono obligatorios).
//   note      → "solo nota": nombre y/o teléfono opcionales, NO crea cliente,
//               solo aparecen en el recibo. Útil para clientes que no quieren
//               dar sus datos completos pero quieren que aparezcan en algo.
//
// El componente notifica al padre los datos finales (customerName,
// customerPhone, customerMode) y opcionalmente el cliente seleccionado de BD
// para enganchar puntos / canje.

import { useState } from "react";
import { Loader2, User, Search, Plus, ArrowLeft, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/features/caja/format";
import {
  useCustomerSearch,
  type CustomerSearchResult,
} from "@/hooks/useCustomerSearch";
import type { Customer } from "@/types";

export type CustomerMode =
  | "idle"
  | "searching"
  | "selected"
  | "creating"
  | "note";

interface CustomerSectionProps {
  mode: CustomerMode;
  onModeChange: (mode: CustomerMode) => void;
  customerName: string;
  onCustomerNameChange: (value: string) => void;
  customerPhone: string;
  onCustomerPhoneChange: (value: string) => void;
  loyaltyCustomer: Customer | null;
  onLoyaltyCustomerChange: (customer: Customer | null) => void;
  // Loyalty config + helpers que vienen del padre porque dependen de settings
  // y del total del carrito.
  loyaltyOn: boolean;
  loyaltyMode: "sellos" | "puntos";
  stampsRequired: number;
  canRedeemStamps: boolean;
  canRedeemPoints: boolean;
  redeemLoyalty: boolean;
  onRedeemLoyaltyChange: (value: boolean) => void;
  rewardLabel: string | null | undefined;
  rewardBase: number;
  pointsDiscount: number;
}

export function CustomerSection({
  mode,
  onModeChange,
  customerName,
  onCustomerNameChange,
  customerPhone,
  onCustomerPhoneChange,
  loyaltyCustomer,
  onLoyaltyCustomerChange,
  loyaltyOn,
  loyaltyMode,
  stampsRequired,
  canRedeemStamps,
  canRedeemPoints,
  redeemLoyalty,
  onRedeemLoyaltyChange,
  rewardLabel,
  rewardBase,
  pointsDiscount,
}: CustomerSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: results = [], isFetching } = useCustomerSearch(searchQuery);
  const showNoResults =
    searchQuery.trim().length >= 2 && !isFetching && results.length === 0;

  const goIdle = () => {
    onModeChange("idle");
    onCustomerNameChange("");
    onCustomerPhoneChange("");
    onLoyaltyCustomerChange(null);
    onRedeemLoyaltyChange(false);
    setSearchQuery("");
  };

  const handleSelect = (result: CustomerSearchResult) => {
    onLoyaltyCustomerChange({
      id: result.id,
      name: result.name,
      phone: result.phone,
      stamps: result.stamps,
      points: result.points,
    } as Customer);
    onCustomerNameChange(result.name ?? "");
    onCustomerPhoneChange(result.phone);
    onModeChange("selected");
  };

  // ─── IDLE ────────────────────────────────────────────────────────────────
  if (mode === "idle") {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => onModeChange("searching")}
      >
        <User className="h-3 w-3 mr-1" />
        Asignar cliente al pedido
      </Button>
    );
  }

  // ─── SELECTED ────────────────────────────────────────────────────────────
  if (mode === "selected" && loyaltyCustomer) {
    return (
      <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Cliente del pedido</Label>
          <button
            type="button"
            onClick={goIdle}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Quitar
          </button>
        </div>
        <div className="rounded-md border bg-background px-3 py-2 space-y-0.5">
          <p className="text-sm font-medium">
            {loyaltyCustomer.name ?? "Sin nombre"}
          </p>
          {loyaltyCustomer.phone && (
            <p className="text-xs text-muted-foreground">
              {loyaltyCustomer.phone}
            </p>
          )}
        </div>
        {loyaltyOn && (
          <div className="rounded-md border bg-background p-2.5 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-medium">
              <Gift className="h-3.5 w-3.5 text-primary" />
              {loyaltyMode === "sellos"
                ? `${loyaltyCustomer.stamps} / ${stampsRequired} sellos`
                : `${loyaltyCustomer.points} puntos`}
            </div>
            {loyaltyMode === "sellos" && canRedeemStamps && (
              <label className="flex items-center gap-2 cursor-pointer text-green-600">
                <input
                  type="checkbox"
                  checked={redeemLoyalty}
                  onChange={(e) => onRedeemLoyaltyChange(e.target.checked)}
                  className="h-3.5 w-3.5 cursor-pointer"
                />
                <span>
                  Canjear premio: {rewardLabel ?? "Producto gratis"} (−
                  {formatCurrency(rewardBase)})
                </span>
              </label>
            )}
            {loyaltyMode === "puntos" && canRedeemPoints && (
              <label className="flex items-center gap-2 cursor-pointer text-green-600">
                <input
                  type="checkbox"
                  checked={redeemLoyalty}
                  onChange={(e) => onRedeemLoyaltyChange(e.target.checked)}
                  className="h-3.5 w-3.5 cursor-pointer"
                />
                <span>
                  Canjear puntos (−{formatCurrency(pointsDiscount)})
                </span>
              </label>
            )}
          </div>
        )}
      </div>
    );
  }

  // ─── SEARCHING ───────────────────────────────────────────────────────────
  if (mode === "searching") {
    return (
      <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Buscar cliente</Label>
          <button
            type="button"
            onClick={goIdle}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Cancelar
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Nombre o teléfono…"
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {searchQuery.trim().length < 2 && (
          <p className="text-[11px] text-muted-foreground">
            Escribe al menos 2 caracteres para buscar.
          </p>
        )}
        {isFetching && searchQuery.trim().length >= 2 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Buscando…
          </div>
        )}
        {results.length > 0 && (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelect(r)}
                className="w-full text-left rounded-md border bg-background px-3 py-2 hover:border-primary/50 hover:bg-accent transition-colors"
              >
                <p className="text-sm font-medium truncate">
                  {r.name ?? "Sin nombre"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {r.phone}
                  {loyaltyOn && (
                    <>
                      {" "}
                      ·{" "}
                      {loyaltyMode === "sellos"
                        ? `${r.stamps}/${stampsRequired} sellos`
                        : `${r.points} pts`}
                    </>
                  )}
                </p>
              </button>
            ))}
          </div>
        )}
        {showNoResults && (
          <div className="rounded-md border border-dashed bg-background p-3 space-y-2 text-center">
            <p className="text-xs text-muted-foreground">
              No encontramos a <span className="font-medium">{searchQuery}</span>{" "}
              en el sistema.
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  onCustomerNameChange("");
                  onCustomerPhoneChange("");
                  onModeChange("note");
                }}
              >
                Solo dejar nota
              </Button>
              <Button
                type="button"
                size="sm"
                className="flex-1"
                onClick={() => {
                  // Pre-rellenar con lo que tipearon: si tiene letras → nombre,
                  // si tiene solo dígitos → teléfono.
                  const isPhone = /^[0-9+ ()-]+$/.test(searchQuery.trim());
                  if (isPhone) {
                    onCustomerPhoneChange(searchQuery.trim());
                    onCustomerNameChange("");
                  } else {
                    onCustomerNameChange(searchQuery.trim());
                    onCustomerPhoneChange("");
                  }
                  onModeChange("creating");
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Registrar
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── CREATING ────────────────────────────────────────────────────────────
  if (mode === "creating") {
    const canSave = customerName.trim() && customerPhone.trim();
    return (
      <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onModeChange("searching")}
            className="flex items-center text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Buscar otro
          </button>
          <button
            type="button"
            onClick={goIdle}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Cancelar
          </button>
        </div>
        <Label className="text-xs font-medium">Registrar cliente nuevo</Label>
        <Input
          placeholder="Nombre completo *"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
        />
        <Input
          placeholder="Teléfono *"
          value={customerPhone}
          onChange={(e) => onCustomerPhoneChange(e.target.value)}
        />
        <p className="text-[11px] text-muted-foreground">
          El cliente quedará registrado al cobrar y podrá acumular
          {loyaltyOn ? " puntos en compras futuras." : " un historial de compras."}
        </p>
        {!canSave && (
          <p className="text-[11px] text-destructive">
            Nombre y teléfono son obligatorios para registrar.
          </p>
        )}
      </div>
    );
  }

  // ─── NOTE ────────────────────────────────────────────────────────────────
  if (mode === "note") {
    return (
      <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onModeChange("searching")}
            className="flex items-center text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Buscar otro
          </button>
          <button
            type="button"
            onClick={goIdle}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Cancelar
          </button>
        </div>
        <Label className="text-xs font-medium">Solo nota en el recibo</Label>
        <Input
          placeholder="Nombre (opcional)"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
        />
        <Input
          placeholder="Teléfono (opcional)"
          value={customerPhone}
          onChange={(e) => onCustomerPhoneChange(e.target.value)}
        />
        <p className="text-[11px] text-muted-foreground">
          Estos datos solo aparecerán en el recibo. No se crea un cliente ni se
          acumulan puntos.
        </p>
      </div>
    );
  }

  return null;
}
