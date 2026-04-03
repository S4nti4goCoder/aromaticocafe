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
  Users,
  Camera,
  Quote,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";
import type { CafeSettings, Product } from "@/types";

type Testimonial = { name: string; comment: string; rating: number };

type FormData = Omit<
  CafeSettings,
  | "id"
  | "updated_at"
  | "logo_url"
  | "cover_url"
  | "featured_product_ids"
  | "gallery_urls"
  | "testimonials"
  | "show_promotions"
  | "about_image_url"
>;

export function AppearancePage() {
  const { settings, isLoading, updateSettings, isSaving } = useCafeSettings();
  const { data: products } = useProducts();

  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [aboutImageUrl, setAboutImageUrl] = useState<string | null>(null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [showPromotions, setShowPromotions] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

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
        about_title: settings.about_title ?? "",
        about_description: settings.about_description ?? "",
        maps_embed_url: settings.maps_embed_url ?? "",
        reservation_title: settings.reservation_title ?? "",
        reservation_description: settings.reservation_description ?? "",
        reservation_whatsapp: settings.reservation_whatsapp ?? "",
      });
      setFeaturedIds(settings.featured_product_ids ?? []);
      setLogoUrl(settings.logo_url ?? null);
      setCoverUrl(settings.cover_url ?? null);
      setAboutImageUrl(settings.about_image_url ?? null);
      setGalleryUrls(settings.gallery_urls ?? []);
      setShowPromotions(settings.show_promotions ?? true);
      setTestimonials(settings.testimonials ?? []);
    }
  }, [settings, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await updateSettings({
        ...data,
        logo_url: logoUrl,
        cover_url: coverUrl,
        about_image_url: aboutImageUrl,
        gallery_urls: galleryUrls,
        show_promotions: showPromotions,
        testimonials,
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

  const addGalleryUrl = () => {
    if (newGalleryUrl.trim() && galleryUrls.length < 8) {
      setGalleryUrls((prev) => [...prev, newGalleryUrl.trim()]);
      setNewGalleryUrl("");
    }
  };

  const removeGalleryUrl = (index: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const addTestimonial = () => {
    setTestimonials((prev: Testimonial[]) => [
      ...prev,
      { name: "", comment: "", rating: 5 },
    ]);
  };

  const updateTestimonial = (
    index: number,
    field: "name" | "comment" | "rating",
    value: string | number,
  ) => {
    setTestimonials((prev: Testimonial[]) =>
      prev.map((t: Testimonial, i: number) =>
        i === index ? { ...t, [field]: value } : t,
      ),
    );
  };

  const removeTestimonial = (index: number) => {
    setTestimonials((prev: Testimonial[]) =>
      prev.filter((_: Testimonial, i: number) => i !== index),
    );
  };

  const activeProducts: Product[] = (products ?? []).filter((p) => p.is_active);

  const {
    currentPage: featuredPage,
    totalPages: featuredTotalPages,
    totalItems: featuredTotalItems,
    itemsPerPage: featuredItemsPerPage,
    paginatedItems: paginatedProducts,
    handlePageChange: handleFeaturedPageChange,
    handleItemsPerPageChange: handleFeaturedItemsPerPageChange,
  } = usePagination(activeProducts);

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
        <h1 className="text-3xl font-bold tracking-tight">Apariencia</h1>
        <p className="text-muted-foreground">
          Personaliza la landing page pública de tu cafetería
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1">
            <TabsTrigger value="general" className="flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">General</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-1.5">
              <Image className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Imágenes</span>
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Colores</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Contacto</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Nosotros</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Galería</span>
            </TabsTrigger>
            <TabsTrigger
              value="testimonials"
              className="flex items-center gap-1.5"
            >
              <Quote className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Reseñas</span>
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Destacados</span>
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
                  Imágenes Principales
                </CardTitle>
                <CardDescription>
                  Logo y foto de portada de la landing page
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Logo del café</Label>
                  <div className="flex flex-col gap-3 p-4 border-2 border-dashed rounded-lg">
                    {logoUrl && (
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="h-24 w-24 object-cover rounded-lg mx-auto"
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
                  <div className="flex flex-col gap-3 p-4 border-2 border-dashed rounded-lg">
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
                      placeholder="#a0522d"
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
                      placeholder="#c8864a"
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Mapa de Ubicación
                  </CardTitle>
                  <CardDescription>
                    URL de embed de Google Maps para mostrar en la landing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    {...register("maps_embed_url")}
                  />
                  <p className="text-xs text-muted-foreground">
                    En Google Maps → Compartir → Incorporar un mapa → copia la
                    URL del src
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Banner de Reservas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título del banner</Label>
                    <Input
                      placeholder="¿Quieres reservar una mesa?"
                      {...register("reservation_title")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Input
                      placeholder="Escríbenos por WhatsApp..."
                      {...register("reservation_description")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp para reservas</Label>
                    <Input
                      placeholder="573110000000"
                      {...register("reservation_whatsapp")}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SOBRE NOSOTROS */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Sobre Nosotros
                </CardTitle>
                <CardDescription>
                  Historia y descripción del café que aparecerá en la landing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    placeholder="Nuestra Historia"
                    {...register("about_title")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea
                    placeholder="Contanos la historia de tu café..."
                    rows={5}
                    {...register("about_description")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Imagen de la sección</Label>
                  <div className="flex flex-col gap-3 p-4 border-2 border-dashed rounded-lg">
                    {aboutImageUrl && (
                      <img
                        src={aboutImageUrl}
                        alt="Sobre nosotros"
                        className="h-32 w-full object-cover rounded-lg"
                      />
                    )}
                    <Input
                      placeholder="URL de la imagen"
                      value={aboutImageUrl ?? ""}
                      onChange={(e) => setAboutImageUrl(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GALERÍA */}
          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Galería de Fotos
                </CardTitle>
                <CardDescription>
                  Agrega hasta 8 fotos del local ({galleryUrls.length}/8)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="URL de la foto"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addGalleryUrl();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addGalleryUrl}
                    disabled={galleryUrls.length >= 8}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {galleryUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative group rounded-lg overflow-hidden"
                    >
                      <img
                        src={url}
                        alt={`Foto ${index + 1}`}
                        className="h-24 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryUrl(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TESTIMONIOS */}
          <TabsContent value="testimonials">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Quote className="h-5 w-5" />
                  Reseñas de Clientes
                </CardTitle>
                <CardDescription>
                  Agrega testimonios de clientes satisfechos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {testimonials.length} reseña(s) agregada(s)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTestimonial}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar reseña
                  </Button>
                </div>
                <div className="space-y-4">
                  {testimonials.map((t, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          Reseña #{index + 1}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeTestimonial(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Nombre del cliente</Label>
                          <Input
                            placeholder="María García"
                            value={t.name}
                            onChange={(e) =>
                              updateTestimonial(index, "name", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Calificación (1-5)</Label>
                          <Input
                            type="number"
                            min={1}
                            max={5}
                            value={t.rating}
                            onChange={(e) =>
                              updateTestimonial(
                                index,
                                "rating",
                                parseInt(e.target.value),
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Comentario</Label>
                        <Textarea
                          placeholder="El mejor café que he probado..."
                          rows={2}
                          value={t.comment}
                          onChange={(e) =>
                            updateTestimonial(index, "comment", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                  Selecciona hasta 6 productos ({featuredIds.length}/6
                  seleccionados)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4 p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">
                      Mostrar sección de promociones
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Muestra las promociones activas en la landing page
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showPromotions}
                    onChange={(e) => setShowPromotions(e.target.checked)}
                    className="h-4 w-4 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {paginatedProducts.map((product) => {
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

                <Pagination
                  currentPage={featuredPage}
                  totalPages={featuredTotalPages}
                  totalItems={featuredTotalItems}
                  itemsPerPage={featuredItemsPerPage}
                  onPageChange={handleFeaturedPageChange}
                  onItemsPerPageChange={handleFeaturedItemsPerPageChange}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* BOTÓN GUARDAR GENERAL */}
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
