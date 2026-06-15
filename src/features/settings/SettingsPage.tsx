import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  Building2,
  Receipt,
  DollarSign,
  Save,
  Loader2,
  Download,
  ImagePlus,
  Undo2,
  Gift,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  useSystemSettings,
  type SystemSettings,
} from "@/hooks/useSystemSettings";
import { useProducts } from "@/hooks/useProducts";
import { isLogoImage } from "@/lib/logo";
import type { CompanyFormData } from "@/features/settings/company/types";
import { BusinessTab } from "@/features/settings/company/BusinessTab";
import { LogoTab } from "@/features/settings/company/LogoTab";
import { TaxTab } from "@/features/settings/company/TaxTab";
import { CurrencyTab } from "@/features/settings/company/CurrencyTab";
import { LoyaltyTab } from "@/features/settings/company/LoyaltyTab";
import { SecurityTab } from "@/features/settings/company/SecurityTab";
import { ScheduleTab } from "@/features/settings/company/ScheduleTab";

export function SettingsPage() {
  const { settings, isLoading, updateSettings, isSaving } = useSystemSettings();
  const [activeTab, setActiveTab] = useState("business");
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxIncluded, setTaxIncluded] = useState(true);
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(false);
  const [loyaltyMode, setLoyaltyMode] = useState<"sellos" | "puntos">("sellos");
  const [logoValue, setLogoValue] = useState<string | null>(null);
  const [logoMode, setLogoMode] = useState<"image" | "url" | "emoji">("image");
  const [logoUrlInput, setLogoUrlInput] = useState("");
  const [logoEmojiInput, setLogoEmojiInput] = useState("");

  const { register, handleSubmit, reset, formState, setValue, watch } =
    useForm<CompanyFormData>();
  const currencySymbol = settings?.currency_symbol ?? "$";
  const { data: products = [] } = useProducts();
  const activeProducts = products.filter((p) => p.is_active);

  const resetToSettings = (s: SystemSettings) => {
    reset({
      business_name: s.business_name ?? "",
      business_nit: s.business_nit ?? "",
      business_address: s.business_address ?? "",
      business_city: s.business_city ?? "",
      business_phone: s.business_phone ?? "",
      business_email: s.business_email ?? "",
      cafe_name: s.cafe_name ?? "",
      tax_enabled: s.tax_enabled,
      tax_percentage: s.tax_percentage,
      tax_name: s.tax_name ?? "",
      tax_included_in_price: s.tax_included_in_price,
      currency_code: s.currency_code ?? "",
      currency_symbol: s.currency_symbol ?? "",
      currency_decimal_separator: s.currency_decimal_separator ?? "",
      currency_thousands_separator: s.currency_thousands_separator ?? "",
      loyalty_stamps_required: s.loyalty_stamps_required ?? 10,
      loyalty_reward: s.loyalty_reward ?? "Producto gratis",
      loyalty_reward_product_id: s.loyalty_reward_product_id ?? "",
      loyalty_reward_max_value: s.loyalty_reward_max_value ?? null,
      loyalty_min_purchase: s.loyalty_min_purchase ?? null,
      loyalty_points_per_thousand: s.loyalty_points_per_thousand ?? 1,
      loyalty_points_value: s.loyalty_points_value ?? 10,
      loyalty_points_redeem_min: s.loyalty_points_redeem_min ?? 100,
    });
    setTaxEnabled(s.tax_enabled);
    setTaxIncluded(s.tax_included_in_price);
    setLoyaltyEnabled(s.loyalty_enabled ?? false);
    setLoyaltyMode(s.loyalty_mode ?? "sellos");
    setLogoValue(s.logo_url ?? null);
    setLogoUrlInput("");
    if (s.logo_url && !isLogoImage(s.logo_url)) {
      setLogoMode("emoji");
      setLogoEmojiInput(s.logo_url);
    } else {
      setLogoMode("image");
      setLogoEmojiInput("");
    }
  };

  useEffect(() => {
    if (settings) {
      resetToSettings(settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const isDirty =
    formState.isDirty ||
    logoValue !== (settings?.logo_url ?? null) ||
    taxEnabled !== (settings?.tax_enabled ?? true) ||
    taxIncluded !== (settings?.tax_included_in_price ?? true) ||
    loyaltyEnabled !== (settings?.loyalty_enabled ?? false) ||
    loyaltyMode !== (settings?.loyalty_mode ?? "sellos");

  const handleDiscard = () => {
    if (!settings) return;
    resetToSettings(settings);
    toast.success("Cambios descartados");
  };

  const onSubmit = async (data: CompanyFormData) => {
    try {
      const cleanNumber = (v: unknown): number | null => {
        const n = Number(v);
        return v === "" || v === null || Number.isNaN(n) ? null : n;
      };
      await updateSettings({
        ...data,
        logo_url: logoValue,
        tax_enabled: taxEnabled,
        tax_included_in_price: taxIncluded,
        loyalty_enabled: loyaltyEnabled,
        loyalty_mode: loyaltyMode,
        loyalty_reward_product_id: data.loyalty_reward_product_id || null,
        loyalty_reward_max_value: cleanNumber(data.loyalty_reward_max_value),
        loyalty_min_purchase: cleanNumber(data.loyalty_min_purchase),
      });
      toast.success("Ajustes guardados correctamente");
    } catch {
      toast.error("Error al guardar los ajustes");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Empresa</h1>
        <p className="text-muted-foreground">
          Datos del negocio, logo, impuestos, moneda y fidelización
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7">
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Negocio</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Horario</span>
          </TabsTrigger>
          <TabsTrigger value="logo" className="flex items-center gap-2">
            <ImagePlus className="h-4 w-4" />
            <span className="hidden sm:inline">Logo</span>
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">IVA</span>
          </TabsTrigger>
          <TabsTrigger value="currency" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Moneda</span>
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            <span className="hidden sm:inline">Fidelización</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Respaldos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <ScheduleTab />
        </TabsContent>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TabsContent value="business">
            <BusinessTab register={register} />
          </TabsContent>

          <TabsContent value="logo">
            <LogoTab
              logoValue={logoValue}
              onLogoValueChange={setLogoValue}
              logoMode={logoMode}
              onLogoModeChange={setLogoMode}
              logoUrlInput={logoUrlInput}
              onLogoUrlInputChange={setLogoUrlInput}
              logoEmojiInput={logoEmojiInput}
              onLogoEmojiInputChange={setLogoEmojiInput}
            />
          </TabsContent>

          <TabsContent value="tax">
            <TaxTab
              register={register}
              taxEnabled={taxEnabled}
              onTaxEnabledChange={setTaxEnabled}
              taxIncluded={taxIncluded}
              onTaxIncludedChange={setTaxIncluded}
              settings={settings}
            />
          </TabsContent>

          <TabsContent value="currency">
            <CurrencyTab
              register={register}
              setValue={setValue}
              watch={watch}
            />
          </TabsContent>

          <TabsContent value="loyalty">
            <LoyaltyTab
              register={register}
              loyaltyEnabled={loyaltyEnabled}
              onLoyaltyEnabledChange={setLoyaltyEnabled}
              loyaltyMode={loyaltyMode}
              onLoyaltyModeChange={setLoyaltyMode}
              activeProducts={activeProducts}
              currencySymbol={currencySymbol}
              settings={settings}
            />
          </TabsContent>

          {/* Action buttons — hidden on the Security tab */}
          {activeTab !== "security" && (
            <div className="flex flex-col sm:flex-row gap-2 mt-6 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleDiscard}
                disabled={!isDirty || isSaving}
                className="w-full sm:w-auto"
              >
                <Undo2 className="h-4 w-4 mr-2" />
                Descartar cambios
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !isDirty}
                size="lg"
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar ajustes
                  </>
                )}
              </Button>
            </div>
          )}
        </form>

        {/* SECURITY — outside the form */}
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
