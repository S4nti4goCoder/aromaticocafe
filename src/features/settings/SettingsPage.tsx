import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  Building2,
  Receipt,
  DollarSign,
  Download,
  Save,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  useSystemSettings,
  type SystemSettings,
} from "@/hooks/useSystemSettings";
import { supabase } from "@/lib/supabase";

type FormData = Omit<SystemSettings, "id" | "updated_at">;

export function SettingsPage() {
  const { settings, isLoading, updateSettings, isSaving } = useSystemSettings();
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxIncluded, setTaxIncluded] = useState(true);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const { register, handleSubmit, reset } = useForm<FormData>();

  useEffect(() => {
    if (settings) {
      reset({
        business_name: settings.business_name ?? "",
        business_nit: settings.business_nit ?? "",
        business_address: settings.business_address ?? "",
        business_city: settings.business_city ?? "",
        business_phone: settings.business_phone ?? "",
        business_email: settings.business_email ?? "",
        tax_enabled: settings.tax_enabled,
        tax_percentage: settings.tax_percentage,
        tax_name: settings.tax_name ?? "",
        tax_included_in_price: settings.tax_included_in_price,
        currency_code: settings.currency_code ?? "",
        currency_symbol: settings.currency_symbol ?? "",
        currency_decimal_separator: settings.currency_decimal_separator ?? "",
        currency_thousands_separator:
          settings.currency_thousands_separator ?? "",
      });
      setTaxEnabled(settings.tax_enabled);
      setTaxIncluded(settings.tax_included_in_price);
    }
  }, [settings, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await updateSettings({
        ...data,
        tax_enabled: taxEnabled,
        tax_included_in_price: taxIncluded,
      });
      toast.success("Ajustes guardados correctamente");
    } catch {
      toast.error("Error al guardar los ajustes");
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });
      if (error) throw error;
      toast.success("Contraseña actualizada correctamente");
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch {
      toast.error("Error al cambiar la contraseña");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportData = async (table: string) => {
    try {
      const { data, error } = await supabase
        .from(table as "products")
        .select("*");
      if (error) throw error;
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${table}_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${table} exportado correctamente`);
    } catch {
      toast.error(`Error al exportar ${table}`);
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
        <h1 className="text-3xl font-bold tracking-tight">Ajustes</h1>
        <p className="text-muted-foreground">
          Configuración general del sistema
        </p>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Negocio</span>
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">IVA</span>
          </TabsTrigger>
          <TabsTrigger value="currency" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Moneda</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Seguridad</span>
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* NEGOCIO */}
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Información del Negocio
                </CardTitle>
                <CardDescription>
                  Datos fiscales y de contacto del negocio
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Razón social</Label>
                  <Input
                    placeholder="Aromático Café S.A.S"
                    {...register("business_name")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>NIT</Label>
                  <Input
                    placeholder="900.123.456-7"
                    {...register("business_nit")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  <Input placeholder="Bogotá" {...register("business_city")} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Dirección fiscal</Label>
                  <Input
                    placeholder="Calle 123 #45-67, Bogotá"
                    {...register("business_address")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    placeholder="+57 1 234 5678"
                    {...register("business_phone")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Correo electrónico</Label>
                  <Input
                    placeholder="admin@aromaticocafe.com"
                    {...register("business_email")}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IVA */}
          <TabsContent value="tax">
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
                    onChange={(e) => setTaxEnabled(e.target.checked)}
                    className="h-4 w-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border">
                  <div>
                    <p className="font-medium text-sm">
                      IVA incluido en el precio
                    </p>
                    <p className="text-xs text-muted-foreground">
                      El precio mostrado ya incluye el IVA (se desglosa en la
                      tirilla)
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={taxIncluded}
                    onChange={(e) => setTaxIncluded(e.target.checked)}
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
                    {settings?.tax_name ?? "IVA"} (
                    {settings?.tax_percentage ?? 8}%):{" "}
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
          </TabsContent>

          {/* MONEDA */}
          <TabsContent value="currency">
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
                  <Input placeholder="COP" {...register("currency_code")} />
                  <p className="text-xs text-muted-foreground">
                    Ej: COP, USD, EUR
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Símbolo</Label>
                  <Input placeholder="$" {...register("currency_symbol")} />
                  <p className="text-xs text-muted-foreground">Ej: $, €, £</p>
                </div>
                <div className="space-y-2">
                  <Label>Separador de miles</Label>
                  <Input
                    placeholder="."
                    {...register("currency_thousands_separator")}
                  />
                  <p className="text-xs text-muted-foreground">Ej: . o ,</p>
                </div>
                <div className="space-y-2">
                  <Label>Separador decimal</Label>
                  <Input
                    placeholder=","
                    {...register("currency_decimal_separator")}
                  />
                  <p className="text-xs text-muted-foreground">Ej: , o .</p>
                </div>

                <div className="md:col-span-2 p-4 rounded-xl border bg-muted/30">
                  <p className="text-sm font-medium mb-2">Vista previa</p>
                  <p className="text-xs text-muted-foreground">
                    Formato:{" "}
                    <span className="font-mono font-medium text-sm">
                      {settings?.currency_symbol ?? "$"}10
                      {settings?.currency_thousands_separator ?? "."}000
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BOTÓN GUARDAR */}
          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={isSaving} size="lg">
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
        </form>

        {/* SEGURIDAD — fuera del form */}
        <TabsContent value="security">
          <div className="space-y-4">
            {/* Cambiar contraseña */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Cambiar Contraseña
                </CardTitle>
                <CardDescription>
                  Actualiza la contraseña de tu cuenta de Super Admin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirmar contraseña</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repite la nueva contraseña"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="w-full"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cambiando...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Cambiar contraseña
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Exportar datos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Copia de Seguridad
                </CardTitle>
                <CardDescription>
                  Exporta los datos del sistema en formato JSON
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { label: "Productos", table: "products" },
                    { label: "Categorías", table: "categories" },
                    { label: "Ventas", table: "sales" },
                    { label: "Transacciones", table: "transactions" },
                    { label: "Trabajadores", table: "workers" },
                    { label: "Promociones", table: "promotions" },
                  ].map((item) => (
                    <Button
                      key={item.table}
                      variant="outline"
                      onClick={() => handleExportData(item.table)}
                      className="flex items-center gap-2 h-auto py-3"
                    >
                      <Download className="h-4 w-4 shrink-0" />
                      <div className="text-left">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">
                          Exportar JSON
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
