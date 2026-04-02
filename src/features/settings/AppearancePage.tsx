import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  Store,
  Image,
  Palette,
  Globe,
  Clock,
  Star,
  Save,
  Loader2,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Link,
  AtSign,
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
import { useCafeSettings } from "@/hooks/useCafeSettings";
import { useProducts } from "@/hooks/useProducts";
import type { CafeSettings, Product } from "@/types";

type FormData = Omit<
  CafeSettings,
  "id" | "updated_at" | "logo_url" | "cover_url" | "featured_product_ids"
>;

export function AppearancePage() {
  const { settings, isLoading, updateSettings, isSaving } = useCafeSettings();
  const { data: products } = useProducts();
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<FormData>();

  useEffect(() => {
    if (settings) {
      reset({
        cafe_name: settings.cafe_name,
        slogan: settings.slogan ?? "",
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        facebook_url: settings.facebook_url ?? "",
        instagram_url: settings.instagram_url ?? "",
        whatsapp: settings.whatsapp ?? "",
        email: settings.email ?? "",
        phone: settings.phone ?? "",
        address: settings.address ?? "",
        monday_friday: settings.monday_friday ?? "",
        saturday: settings.saturday ?? "",
        sunday: settings.sunday ?? "",
      });
      setFeaturedIds(settings.featured_product_ids ?? []);
      setLogoUrl(settings.logo_url ?? null);
      setCoverUrl(settings.cover_url ?? null);
    }
  }, [settings, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await updateSettings({
        ...data,
        logo_url: logoUrl,
        cover_url: coverUrl,
        featured_product_ids: featuredIds,
      });
      toast.success("Configuración guardada correctamente");
    } catch {
      toast.error("Error al guardar la configuración");
    }
  };

  const toggleFeatured = (productId: string) => {
    setFeaturedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : prev.length < 6
          ? [...prev, productId]
          : prev,
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeProducts: Product[] = (products ?? []).filter((p) => p.is_active);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Apariencia</h1>
        <p className="text-muted-foreground">
          Personaliza la landing page pública de tu cafetería
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Imágenes</span>
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Colores</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Contacto</span>
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Destacados</span>
            </TabsTrigger>
          </TabsList>

          {/* GENERAL */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Información General
                </CardTitle>
                <CardDescription>
                  Nombre y eslogan que aparecerán en la landing page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cafe_name">Nombre del café</Label>
                  <Input
                    id="cafe_name"
                    placeholder="Aromático Café"
                    {...register("cafe_name", { required: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slogan">Eslogan</Label>
                  <Input
                    id="slogan"
                    placeholder="El mejor café de la ciudad"
                    {...register("slogan")}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IMÁGENES */}
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Imágenes
                </CardTitle>
                <CardDescription>
                  Logo y foto de portada de la landing page
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Logo del café</Label>
                  <div className="flex flex-col items-center gap-3 p-4 border-2 border-dashed rounded-lg">
                    {logoUrl && (
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="h-24 w-24 object-cover rounded-lg"
                      />
                    )}
                    <Input
                      placeholder="URL del logo"
                      value={logoUrl ?? ""}
                      onChange={(e) => setLogoUrl(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recomendado: formato cuadrado, mínimo 200x200px
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Imagen de portada</Label>
                  <div className="flex flex-col items-center gap-3 p-4 border-2 border-dashed rounded-lg">
                    {coverUrl && (
                      <img
                        src={coverUrl}
                        alt="Portada"
                        className="h-24 w-full object-cover rounded-lg"
                      />
                    )}
                    <Input
                      placeholder="URL de la portada"
                      value={coverUrl ?? ""}
                      onChange={(e) => setCoverUrl(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recomendado: 1920x1080px o similar panorámico
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COLORES */}
          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Colores del Tema
                </CardTitle>
                <CardDescription>
                  Colores principales que se usarán en la landing page
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Color primario</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="primary_color"
                      className="h-10 w-14 rounded-md border border-input cursor-pointer"
                      {...register("primary_color")}
                    />
                    <Input
                      placeholder="#7c3aed"
                      className="font-mono"
                      {...register("primary_color")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Color secundario</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="secondary_color"
                      className="h-10 w-14 rounded-md border border-input cursor-pointer"
                      {...register("secondary_color")}
                    />
                    <Input
                      placeholder="#f59e0b"
                      className="font-mono"
                      {...register("secondary_color")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONTACTO */}
          <TabsContent value="contact">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Redes Sociales y Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Link className="h-4 w-4 text-blue-500" />
                      Facebook
                    </Label>
                    <Input
                      placeholder="https://facebook.com/tucafe"
                      {...register("facebook_url")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <AtSign className="h-4 w-4 text-pink-500" />
                      Instagram
                    </Label>
                    <Input
                      placeholder="https://instagram.com/tucafe"
                      {...register("instagram_url")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-green-500" />
                      WhatsApp
                    </Label>
                    <Input
                      placeholder="+57 300 000 0000"
                      {...register("whatsapp")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Teléfono
                    </Label>
                    <Input
                      placeholder="+57 1 000 0000"
                      {...register("phone")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Correo electrónico
                    </Label>
                    <Input
                      placeholder="contacto@aromaticocafe.com"
                      {...register("email")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Dirección
                    </Label>
                    <Input
                      placeholder="Calle 123 #45-67, Bogotá"
                      {...register("address")}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Horarios de Atención
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Lunes a Viernes</Label>
                    <Input
                      placeholder="7:00 AM - 8:00 PM"
                      {...register("monday_friday")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sábado</Label>
                    <Input
                      placeholder="8:00 AM - 6:00 PM"
                      {...register("saturday")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Domingo</Label>
                    <Input placeholder="Cerrado" {...register("sunday")} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PRODUCTOS DESTACADOS */}
          <TabsContent value="featured">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Productos Destacados
                </CardTitle>
                <CardDescription>
                  Selecciona hasta 6 productos para mostrar en la landing page (
                  {featuredIds.length}/6 seleccionados)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeProducts.map((product) => {
                    const isSelected = featuredIds.includes(product.id);
                    return (
                      <motion.div
                        key={product.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => toggleFeatured(product.id)}
                        className={[
                          "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50",
                          !isSelected && featuredIds.length >= 6
                            ? "opacity-50 cursor-not-allowed"
                            : "",
                        ].join(" ")}
                      >
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                            <Store className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ${product.price?.toLocaleString("es-CO")}
                          </p>
                        </div>
                        {isSelected && (
                          <Star className="h-4 w-4 text-primary fill-primary shrink-0" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
                Guardar cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
