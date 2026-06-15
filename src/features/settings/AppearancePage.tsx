import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
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
  Plus,
  Trash2,
  ExternalLink,
  GripVertical,
  Undo2,
  Check,
  X,
  Eye,
  Sparkles,
  MousePointerClick,
  CalendarDays,
  Coffee,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCafeSettings } from "@/hooks/useCafeSettings";
import { useProducts } from "@/hooks/useProducts";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";
import type { CafeSettings, Product } from "@/types";
import {
  COFFEE_PALETTES,
  SOLID_COLORS,
  isValidUrl,
  ImagePreview,
  UrlInput,
  ColorPreview,
  SectionToggleRow,
  ImageUploadWithUrl,
  GalleryUploader,
  ResponsivePreview,
} from "./appearance";
import type { ThemePalette, ThemePaletteMode } from "./appearance";

type FormData = Omit<
  CafeSettings,
  | "id"
  | "updated_at"
  | "logo_url"
  | "cover_url"
  | "featured_product_ids"
  | "gallery_urls"
  | "show_promotions"
  | "about_image_url"
  | "custom_palettes"
  | "top_bar_enabled"
  | "store_section_autoplay"
>;

// ── Tab config ──
const TABS = [
  { value: "sections", label: "Secciones", icon: Eye, accent: "text-fuchsia-400" },
  { value: "general", label: "General", icon: Store, accent: "text-amber-400" },
  { value: "topbar", label: "Barra superior", icon: Megaphone, accent: "text-pink-400" },
  { value: "categories", label: "Categorías", icon: Coffee, accent: "text-orange-400" },
  { value: "promotions", label: "Promociones", icon: Sparkles, accent: "text-yellow-400" },
  { value: "media", label: "Imágenes", icon: Image, accent: "text-sky-400" },
  { value: "colors", label: "Colores", icon: Palette, accent: "text-rose-400" },
  { value: "contact", label: "Contacto", icon: Globe, accent: "text-emerald-400" },
  { value: "about", label: "Nosotros", icon: Users, accent: "text-violet-400" },
  { value: "gallery", label: "Nuestro Espacio", icon: Camera, accent: "text-cyan-400" },
  { value: "featured", label: "Destacados", icon: Star, accent: "text-yellow-400" },
] as const;

// (Palettes, helpers and the self-contained subcomponents now live in ./appearance)

// ════════════════════════════════════════════════════
// ── Main Component ──
// ════════════════════════════════════════════════════

export function AppearancePage() {
  const { settings, isLoading, updateSettings, isSaving } = useCafeSettings();
  const { data: products } = useProducts();

  const [activeTab, setActiveTab] = useState("sections");
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [aboutImageUrl, setAboutImageUrl] = useState<string | null>(null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [showPromotions, setShowPromotions] = useState(true);
  const [topBarEnabled, setTopBarEnabled] = useState(false);
  const [storeSectionAutoplay, setStoreSectionAutoplay] = useState(true);
  const [customPalettes, setCustomPalettes] = useState<ThemePalette[]>([]);
  const [themeMode, setThemeMode] = useState<ThemePaletteMode>("dark");
  const [sectionFlags, setSectionFlags] = useState({
    show_about: true,
    show_featured: true,
    show_categories: false,
    show_gallery: true,
    show_contact: true,
    show_reserve_button: true,
    show_menu_button: true,
    show_whatsapp_float: true,
  });
  const [paletteModalOpen, setPaletteModalOpen] = useState(false);
  const [newPaletteSolid, setNewPaletteSolid] = useState(false);
  const [newPalette, setNewPalette] = useState<ThemePalette>({
    name: "",
    mode: "dark",
    primary: "#6F4E37",
    secondary: "#C4A882",
  });

  const { register, handleSubmit, reset, watch, getValues, setValue } = useForm<FormData>();

  // Watch colors for live preview
  const watchedPrimary = watch("primary_color");
  const watchedSecondary = watch("secondary_color");
  const watchedCafeName = watch("cafe_name");
  // Watch top bar action type to drive the conditional "target" selector.
  const watchedActionType = watch("top_bar_action_type");

  const [lastSyncedSettings, setLastSyncedSettings] = useState<typeof settings | null>(null);
  if (settings && settings !== lastSyncedSettings) {
    setLastSyncedSettings(settings);
    reset({
      cafe_name: settings.cafe_name,
      slogan: settings.slogan ?? "",
      primary_color: settings.primary_color,
      secondary_color: settings.secondary_color,
      facebook_url: settings.facebook_url ?? "",
      instagram_url: settings.instagram_url ?? "",
      tiktok_url: settings.tiktok_url ?? "",
      whatsapp: settings.whatsapp ?? "",
      email: settings.email ?? "",
      phone: settings.phone ?? "",
      address: settings.address ?? "",
      monday_friday: settings.monday_friday ?? "",
      saturday: settings.saturday ?? "",
      sunday: settings.sunday ?? "",
      about_kicker: settings.about_kicker ?? "",
      about_title: settings.about_title ?? "",
      about_description: settings.about_description ?? "",
      maps_embed_url: settings.maps_embed_url ?? "",
      reservation_title: settings.reservation_title ?? "",
      reservation_description: settings.reservation_description ?? "",
      reservation_whatsapp: settings.reservation_whatsapp ?? "",
      top_bar_message: settings.top_bar_message ?? "",
      top_bar_action_type: settings.top_bar_action_type ?? "none",
      top_bar_action_target: settings.top_bar_action_target ?? "",
      featured_section_kicker: settings.featured_section_kicker ?? "",
      featured_section_title: settings.featured_section_title ?? "",
      categories_section_kicker: settings.categories_section_kicker ?? "",
      categories_section_title: settings.categories_section_title ?? "",
      promotions_section_kicker: settings.promotions_section_kicker ?? "",
      promotions_section_title: settings.promotions_section_title ?? "",
      contact_section_kicker: settings.contact_section_kicker ?? "",
      contact_section_title: settings.contact_section_title ?? "",
      contact_section_hours_subtitle: settings.contact_section_hours_subtitle ?? "",
      contact_section_contact_subtitle: settings.contact_section_contact_subtitle ?? "",
      store_section_kicker: settings.store_section_kicker ?? "",
      store_section_title: settings.store_section_title ?? "",
      store_section_subtitle: settings.store_section_subtitle ?? "",
      store_section_cta_text: settings.store_section_cta_text ?? "",
    });
    setFeaturedIds(settings.featured_product_ids ?? []);
    setLogoUrl(settings.logo_url ?? null);
    setCoverUrl(settings.cover_url ?? null);
    setAboutImageUrl(settings.about_image_url ?? null);
    setGalleryUrls(settings.gallery_urls ?? []);
    setShowPromotions(settings.show_promotions ?? true);
    setTopBarEnabled(settings.top_bar_enabled ?? false);
    setStoreSectionAutoplay(settings.store_section_autoplay ?? true);
    setCustomPalettes(
      (settings.custom_palettes ?? []).map((p) => ({
        ...p,
        mode: p.mode ?? "dark",
      })),
    );
    setThemeMode(settings.theme_mode ?? "dark");
    setSectionFlags({
      show_about: settings.show_about ?? true,
      show_featured: settings.show_featured ?? true,
      show_categories: settings.show_categories ?? false,
      show_gallery: settings.show_gallery ?? true,
      show_contact: settings.show_contact ?? true,
      show_reserve_button: settings.show_reserve_button ?? true,
      show_menu_button: settings.show_menu_button ?? true,
      show_whatsapp_float: settings.show_whatsapp_float ?? true,
    });
  }

  // ── Unsaved changes detection ──
  const hasUnsavedChanges = useMemo(() => {
    if (!settings) return false;
    const formVals = getValues();
    const formChanged =
      formVals.cafe_name !== settings.cafe_name ||
      (formVals.slogan ?? "") !== (settings.slogan ?? "") ||
      formVals.primary_color !== settings.primary_color ||
      formVals.secondary_color !== settings.secondary_color;
    const stateChanged =
      JSON.stringify(featuredIds) !== JSON.stringify(settings.featured_product_ids ?? []) ||
      logoUrl !== (settings.logo_url ?? null) ||
      coverUrl !== (settings.cover_url ?? null) ||
      aboutImageUrl !== (settings.about_image_url ?? null) ||
      JSON.stringify(galleryUrls) !== JSON.stringify(settings.gallery_urls ?? []) ||
      showPromotions !== (settings.show_promotions ?? true) ||
      topBarEnabled !== (settings.top_bar_enabled ?? false) ||
      storeSectionAutoplay !== (settings.store_section_autoplay ?? true) ||
      JSON.stringify(customPalettes) !== JSON.stringify(settings.custom_palettes ?? []) ||
      themeMode !== (settings.theme_mode ?? "dark") ||
      JSON.stringify(sectionFlags) !== JSON.stringify({
        show_about: settings.show_about ?? true,
        show_featured: settings.show_featured ?? true,
        show_categories: settings.show_categories ?? false,
        show_gallery: settings.show_gallery ?? true,
        show_contact: settings.show_contact ?? true,
        show_reserve_button: settings.show_reserve_button ?? true,
        show_menu_button: settings.show_menu_button ?? true,
        show_whatsapp_float: settings.show_whatsapp_float ?? true,
      });
    return formChanged || stateChanged;
    // watchedPrimary/Secondary/CafeName aren't read here but force a recompute
    // when those form fields change (getValues() is a non-reactive snapshot).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, featuredIds, logoUrl, coverUrl, aboutImageUrl, galleryUrls, showPromotions, topBarEnabled, storeSectionAutoplay, customPalettes, themeMode, sectionFlags, getValues, watchedPrimary, watchedSecondary, watchedCafeName]);

  const onSubmit = async (data: FormData) => {
    // Validate all URLs before saving
    const urls = [logoUrl, coverUrl, aboutImageUrl, ...galleryUrls].filter(Boolean);
    const invalidUrls = urls.filter((u) => !isValidUrl(u!));
    if (invalidUrls.length > 0) {
      toast.error("Hay URLs de imágenes inválidas. Corrígelas antes de guardar.");
      return;
    }

    try {
      await updateSettings({
        ...data,
        logo_url: logoUrl,
        cover_url: coverUrl,
        about_image_url: aboutImageUrl,
        gallery_urls: galleryUrls,
        show_promotions: showPromotions,
        top_bar_enabled: topBarEnabled,
        store_section_autoplay: storeSectionAutoplay,
        featured_product_ids: featuredIds,
        custom_palettes: customPalettes,
        theme_mode: themeMode,
        ...sectionFlags,
      });
      toast.success("Configuración guardada correctamente");
    } catch {
      toast.error("Error al guardar la configuración");
    }
  };

  // ── Live preview dispatcher: posts merged settings to the ResponsivePreview iframe ──
  useEffect(() => {
    const sendPreview = () => {
      const frame = document.querySelector<HTMLIFrameElement>(
        'iframe[title="Landing preview"]',
      );
      if (!frame) return;
      const formValues = getValues();
      const payload = {
        ...settings,
        ...formValues,
        logo_url: logoUrl,
        cover_url: coverUrl,
        about_image_url: aboutImageUrl,
        gallery_urls: galleryUrls,
        show_promotions: showPromotions,
        top_bar_enabled: topBarEnabled,
        store_section_autoplay: storeSectionAutoplay,
        featured_product_ids: featuredIds,
        custom_palettes: customPalettes,
        theme_mode: themeMode,
        ...sectionFlags,
      };
      frame.contentWindow?.postMessage(
        { type: "preview-update", settings: payload },
        window.location.origin,
      );
    };

    sendPreview();

    // RHF's watch() returns a subscription — the documented way to react to
    // form-field edits for the live preview; cleaned up on unmount below.
    const subscription = watch(() => sendPreview());
    return () => subscription.unsubscribe();
  }, [
    settings,
    logoUrl,
    coverUrl,
    aboutImageUrl,
    galleryUrls,
    showPromotions,
    topBarEnabled,
    storeSectionAutoplay,
    featuredIds,
    customPalettes,
    themeMode,
    sectionFlags,
    watch,
    getValues,
  ]);

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
    const url = newGalleryUrl.trim();
    if (!url || galleryUrls.length >= 8) return;
    if (!isValidUrl(url)) {
      toast.error("La URL no es válida");
      return;
    }
    setGalleryUrls((prev) => [...prev, url]);
    setNewGalleryUrl("");
  };

  const removeGalleryUrl = useCallback((index: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const [prevColors, setPrevColors] = useState<{
    primary: string;
    secondary: string;
    mode: ThemePaletteMode;
  } | null>(null);

  const applyPalette = (
    primary: string,
    secondary: string,
    mode: ThemePaletteMode = themeMode,
  ) => {
    const current = getValues();
    setPrevColors({
      primary: current.primary_color,
      secondary: current.secondary_color,
      mode: themeMode,
    });
    reset({ ...current, primary_color: primary, secondary_color: secondary });
    setThemeMode(mode);
  };

  const undoPalette = () => {
    if (!prevColors) return;
    reset({
      ...getValues(),
      primary_color: prevColors.primary,
      secondary_color: prevColors.secondary,
    });
    setThemeMode(prevColors.mode);
    setPrevColors(null);
  };

  const addCustomPalette = () => {
    if (!newPalette.name.trim()) {
      toast.error("Dale un nombre a tu paleta");
      return;
    }
    setCustomPalettes((prev) => [...prev, { ...newPalette, name: newPalette.name.trim() }]);
    setNewPalette({ name: "", mode: "dark", primary: "#6F4E37", secondary: "#C4A882" });
    setNewPaletteSolid(false);
    setPaletteModalOpen(false);
    toast.success("Paleta creada — guarda los cambios para conservarla");
  };

  const removeCustomPalette = (index: number) => {
    setCustomPalettes((prev) => prev.filter((_, i) => i !== index));
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
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Apariencia</h1>
          <p className="text-muted-foreground">
            Personaliza la landing page pública de tu cafetería
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open("/", "_blank")}
          className="w-full sm:w-auto"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Ver landing
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* ── Animated pill tabs ── */}
          <nav className="flex gap-1 p-1.5 rounded-xl bg-muted/40 border border-border/50 backdrop-blur-sm overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.value;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`relative flex-1 min-w-0 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-xs font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground/80"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="appearance-tab-pill"
                      className="absolute inset-0 rounded-lg bg-background shadow-sm border border-border/80"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    <Icon className={`h-3.5 w-3.5 shrink-0 transition-colors duration-200 ${isActive ? tab.accent : ""}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          {/* ── SECTIONS (visibility toggles) ── */}
          <TabsContent value="sections">
            <div className="space-y-4">
              {/* Card 1: Sections */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-fuchsia-400" />
                    Secciones de la landing
                  </CardTitle>
                  <p className="text-xs text-muted-foreground/80 mt-1.5 leading-relaxed">
                    Activa o desactiva qué aparece en la página pública. Los cambios se ven en tiempo real en la vista previa.
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  <SectionToggleRow
                    icon={Users}
                    iconColor="text-violet-400"
                    iconBg="bg-violet-500/10"
                    label="Nuestra historia"
                    description="Cuenta el origen y los valores del café"
                    checked={sectionFlags.show_about}
                    onChange={(v) => setSectionFlags((s) => ({ ...s, show_about: v }))}
                  />
                  <SectionToggleRow
                    icon={Star}
                    iconColor="text-yellow-400"
                    iconBg="bg-yellow-500/10"
                    label="Favoritos"
                    description="Productos destacados que elegiste para la landing"
                    checked={sectionFlags.show_featured}
                    onChange={(v) => setSectionFlags((s) => ({ ...s, show_featured: v }))}
                  />
                  <SectionToggleRow
                    icon={Coffee}
                    iconColor="text-orange-400"
                    iconBg="bg-orange-500/10"
                    label="Categorías"
                    description="Grid de categorías del menú con foto"
                    checked={sectionFlags.show_categories}
                    onChange={(v) => setSectionFlags((s) => ({ ...s, show_categories: v }))}
                  />
                  <SectionToggleRow
                    icon={Sparkles}
                    iconColor="text-amber-400"
                    iconBg="bg-amber-500/10"
                    label="Promociones"
                    description="Ofertas activas del mes"
                    checked={showPromotions}
                    onChange={setShowPromotions}
                  />
                  <SectionToggleRow
                    icon={Camera}
                    iconColor="text-cyan-400"
                    iconBg="bg-cyan-500/10"
                    label="Nuestro espacio"
                    description="Fotos del local en formato carrusel"
                    checked={sectionFlags.show_gallery}
                    onChange={(v) => setSectionFlags((s) => ({ ...s, show_gallery: v }))}
                  />
                  <SectionToggleRow
                    icon={MapPin}
                    iconColor="text-emerald-400"
                    iconBg="bg-emerald-500/10"
                    label="Contacto"
                    description="Dirección, horarios, redes sociales y mapa"
                    checked={sectionFlags.show_contact}
                    onChange={(v) => setSectionFlags((s) => ({ ...s, show_contact: v }))}
                    isLast
                  />
                </CardContent>
              </Card>

              {/* Card 2: CTA buttons */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MousePointerClick className="h-5 w-5 text-fuchsia-400" />
                    Botones de acción
                  </CardTitle>
                  <p className="text-xs text-muted-foreground/80 mt-1.5 leading-relaxed">
                    Controla los CTAs principales que aparecen sobre la landing.
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  <SectionToggleRow
                    icon={CalendarDays}
                    iconColor="text-emerald-400"
                    iconBg="bg-emerald-500/10"
                    label='Botón "Reservar" (Navbar)'
                    description="Aparece arriba a la derecha en desktop y en el menú móvil"
                    checked={sectionFlags.show_reserve_button}
                    onChange={(v) =>
                      setSectionFlags((s) => ({ ...s, show_reserve_button: v }))
                    }
                    hint={
                      sectionFlags.show_reserve_button && !watch("reservation_whatsapp")
                        ? "Configura el WhatsApp de reservas en la pestaña Contacto para que el botón aparezca"
                        : undefined
                    }
                  />
                  <SectionToggleRow
                    icon={Coffee}
                    iconColor="text-amber-400"
                    iconBg="bg-amber-500/10"
                    label='Botón "Ver menú" (Hero)'
                    description="Botón principal en el banner superior de la landing"
                    checked={sectionFlags.show_menu_button}
                    onChange={(v) =>
                      setSectionFlags((s) => ({ ...s, show_menu_button: v }))
                    }
                  />
                  <SectionToggleRow
                    icon={MessageCircle}
                    iconColor="text-green-500"
                    iconBg="bg-green-500/10"
                    label="WhatsApp flotante"
                    description="Botón verde que aparece en la esquina inferior derecha"
                    checked={sectionFlags.show_whatsapp_float}
                    onChange={(v) =>
                      setSectionFlags((s) => ({ ...s, show_whatsapp_float: v }))
                    }
                    hint={
                      sectionFlags.show_whatsapp_float &&
                      !watch("whatsapp") &&
                      !watch("reservation_whatsapp")
                        ? "Necesitas configurar al menos un número de WhatsApp en Contacto"
                        : undefined
                    }
                    isLast
                  />
                </CardContent>
              </Card>

              {/* Live preview is the global ResponsivePreview rendered below the Tabs */}
            </div>
          </TabsContent>

          {/* ── GENERAL ── */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Información General
                </CardTitle>
                <CardDescription>
                  Eslogan que aparece en el hero de la landing.
                  <br />
                  <span className="text-xs">
                    El logo y el nombre se gestionan en{" "}
                    <a
                      href="/settings/general"
                      className="underline underline-offset-2 hover:text-foreground"
                    >
                      Empresa
                    </a>
                    .
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

          {/* ── TOP BAR ── */}
          <TabsContent value="topbar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  Barra superior
                </CardTitle>
                <CardDescription>
                  Mensaje promocional o de eventos que aparece en lo más alto del landing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-start justify-between gap-4 p-4 rounded-lg border">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">
                      Activar barra superior
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Muestra una franja arriba del navbar
                    </p>
                  </div>
                  <Switch
                    checked={topBarEnabled}
                    onCheckedChange={setTopBarEnabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mensaje</Label>
                  <Input
                    placeholder="¡Reserva tu mesa para el fin de semana!"
                    {...register("top_bar_message")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Acción al hacer clic</Label>
                  <select
                    {...register("top_bar_action_type", {
                      onChange: () => setValue("top_bar_action_target", ""),
                    })}
                    className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                  >
                    <option value="none">Sin acción (solo texto)</option>
                    <option value="section">Ir a sección del landing</option>
                    <option value="modal">Abrir modal</option>
                    <option value="promotion">Ir a promociones</option>
                  </select>
                </div>

                {watchedActionType === "section" && (
                  <div className="space-y-2">
                    <Label>Sección destino</Label>
                    <select
                      {...register("top_bar_action_target")}
                      className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                    >
                      <option value="">Selecciona una sección...</option>
                      <option value="nosotros">Nuestra historia</option>
                      <option value="menu">Favoritos / Productos</option>
                      <option value="promociones">Promociones</option>
                      <option value="espacio">Nuestro espacio</option>
                      <option value="contacto">Contacto</option>
                    </select>
                  </div>
                )}

                {watchedActionType === "modal" && (
                  <div className="space-y-2">
                    <Label>Modal destino</Label>
                    <select
                      {...register("top_bar_action_target")}
                      className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                    >
                      <option value="">Selecciona un modal...</option>
                      <option value="reservation">Reservar mesa</option>
                      <option value="menu">Ver menú completo</option>
                    </select>
                  </div>
                )}

                {watchedActionType === "promotion" && (
                  <p className="text-xs text-muted-foreground p-3 rounded-md bg-muted">
                    La barra llevará a la sección de promociones del landing.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── CATEGORIES SECTION TEXT ── */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="h-5 w-5" />
                  Sección Categorías
                </CardTitle>
                <CardDescription>
                  Configura los textos de la sección "Categorías" del landing.
                  Las categorías se crean desde el módulo "Inventario → Categorías".
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Etiqueta (kicker)</Label>
                  <Input
                    placeholder="Nuestro menú"
                    {...register("categories_section_kicker")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Título de la sección</Label>
                  <Input
                    placeholder="Explora por categoría"
                    {...register("categories_section_title")}
                  />
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-sm">Cómo funciona:</p>
                  <ul className="space-y-1 pl-4 list-disc">
                    <li>Se muestra una card por cada categoría que tenga productos activos</li>
                    <li>La primera categoría toma el doble de espacio (efecto bento) si hay 5 o más</li>
                    <li>Hacer clic en una categoría abre el menú modal prefiltrado a esa categoría</li>
                    <li>Para activar/desactivar esta sección, ve al tab "Secciones"</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── PROMOTIONS SECTION TEXT ── */}
          <TabsContent value="promotions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Sección Promociones
                </CardTitle>
                <CardDescription>
                  Configura los textos de la sección de promociones del landing.
                  Las promociones se crean desde el módulo "Promociones" del admin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Etiqueta (kicker)</Label>
                  <Input
                    placeholder="Ofertas especiales"
                    {...register("promotions_section_kicker")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Título de la sección</Label>
                  <Input
                    placeholder="Promociones"
                    {...register("promotions_section_title")}
                  />
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-2">
                  <p className="font-medium text-sm">Badges automáticos en las cards:</p>
                  <ul className="space-y-1 pl-4 list-disc">
                    <li><strong>Destacada</strong> (manual): márcala en el form de la promoción</li>
                    <li><strong>Nueva</strong>: promociones creadas en los últimos 7 días</li>
                    <li><strong>Termina pronto</strong>: promociones que vencen en los próximos 3 días</li>
                    <li><strong>Último día</strong>: promociones que vencen hoy</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── IMAGES ── */}
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Imágenes Principales
                </CardTitle>
                <CardDescription>
                  Sube imágenes directamente o pega una URL
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-w-xl">
                  <Label>Imagen de portada</Label>
                  <ImageUploadWithUrl
                    value={coverUrl}
                    onChange={setCoverUrl}
                    folder="cafe/cover"
                    recommendation="Recomendado: 1920x1080px o similar panorámico"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── COLORS ── */}
          <TabsContent value="colors">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Colores del Tema
                  </CardTitle>
                  <CardDescription>
                    Elige una paleta prediseñada o personaliza tus colores
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Solid colors (single color — no gradient) */}
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                      Color único (sólido)
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {SOLID_COLORS.map((solid) => {
                        const isActive =
                          watchedPrimary === solid.color &&
                          watchedSecondary === solid.color &&
                          themeMode === solid.mode;
                        const previewBg =
                          solid.mode === "light" ? "#faf6ef" : "#0f0d0b";
                        return (
                          <button
                            key={`${solid.name}-${solid.mode}`}
                            type="button"
                            onClick={() =>
                              applyPalette(solid.color, solid.color, solid.mode)
                            }
                            className={`group relative p-2 rounded-lg border-2 transition-all text-left ${
                              isActive
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div
                              className="rounded p-1.5 mb-1.5"
                              style={{ backgroundColor: previewBg }}
                            >
                              <div
                                className="h-4 w-full rounded"
                                style={{ backgroundColor: solid.color }}
                              />
                            </div>
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-medium truncate">
                                {solid.name}
                              </p>
                              <span className="text-[10px] shrink-0">
                                {solid.mode === "light" ? "☀️" : "🌙"}
                              </span>
                            </div>
                            {isActive && (
                              <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-2.5 w-2.5 text-primary-foreground" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Palettes */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        Paletas de café (degradado)
                      </Label>
                      <AnimatePresence>
                        {prevColors && (
                          <motion.button
                            type="button"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            onClick={undoPalette}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-muted/50 hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            <Undo2 className="h-3 w-3" />
                            Deshacer
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {COFFEE_PALETTES.map((palette) => {
                        const isActive =
                          watchedPrimary === palette.primary &&
                          watchedSecondary === palette.secondary &&
                          themeMode === palette.mode;
                        const previewBg =
                          palette.mode === "light" ? "#faf6ef" : "#0f0d0b";
                        return (
                          <button
                            key={palette.name}
                            type="button"
                            onClick={() =>
                              applyPalette(
                                palette.primary,
                                palette.secondary,
                                palette.mode,
                              )
                            }
                            className={`group relative p-2 rounded-lg border-2 transition-all text-left ${
                              isActive
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div
                              className="rounded p-1.5 mb-1.5 flex gap-1"
                              style={{ backgroundColor: previewBg }}
                            >
                              <div
                                className="h-4 flex-1 rounded"
                                style={{ backgroundColor: palette.primary }}
                              />
                              <div
                                className="h-4 flex-1 rounded"
                                style={{ backgroundColor: palette.secondary }}
                              />
                            </div>
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-medium truncate">
                                {palette.name}
                              </p>
                              <span className="text-[10px] shrink-0">
                                {palette.mode === "light" ? "☀️" : "🌙"}
                              </span>
                            </div>
                            {isActive && (
                              <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-2.5 w-2.5 text-primary-foreground" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom palettes */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        Mis paletas
                      </Label>
                      <button
                        type="button"
                        onClick={() => setPaletteModalOpen(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-xs font-medium text-primary hover:text-primary transition-colors cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        Crear paleta
                      </button>
                    </div>
                    {customPalettes.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {customPalettes.map((palette, index) => {
                          const palMode = palette.mode ?? "dark";
                          const isActive =
                            watchedPrimary === palette.primary &&
                            watchedSecondary === palette.secondary &&
                            themeMode === palMode;
                          const previewBg =
                            palMode === "light" ? "#faf6ef" : "#0f0d0b";
                          return (
                            <div key={`${palette.name}-${index}`} className="group/custom relative">
                              <button
                                type="button"
                                onClick={() => applyPalette(palette.primary, palette.secondary, palMode)}
                                className={`w-full p-2 rounded-lg border-2 transition-all text-left ${
                                  isActive
                                    ? "border-primary ring-2 ring-primary/20"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                <div
                                  className="rounded p-1.5 mb-1.5 flex gap-1"
                                  style={{ backgroundColor: previewBg }}
                                >
                                  <div className="h-4 flex-1 rounded" style={{ backgroundColor: palette.primary }} />
                                  <div className="h-4 flex-1 rounded" style={{ backgroundColor: palette.secondary }} />
                                </div>
                                <div className="flex items-center justify-between gap-1">
                                  <p className="text-xs font-medium truncate">{palette.name}</p>
                                  <span className="text-[10px] shrink-0">
                                    {palMode === "light" ? "☀️" : "🌙"}
                                  </span>
                                </div>
                                {isActive && (
                                  <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="h-2.5 w-2.5 text-primary-foreground" />
                                  </div>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeCustomPalette(index)}
                                className="absolute -top-1.5 -left-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover/custom:opacity-100 transition-opacity shadow-sm cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-4 rounded-lg border border-dashed border-border/60">
                        <p className="text-xs text-muted-foreground/60">
                          Aún no tienes paletas personalizadas
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Custom pickers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primary_color">Color primario</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          id="primary_color"
                          className="h-10 w-14 rounded-md border border-input cursor-pointer"
                          value={watchedPrimary || "#a0522d"}
                          onChange={(e) =>
                            setValue("primary_color", e.target.value, {
                              shouldDirty: true,
                            })
                          }
                        />
                        <Input
                          placeholder="#a0522d"
                          className="font-mono"
                          value={watchedPrimary || ""}
                          onChange={(e) =>
                            setValue("primary_color", e.target.value, {
                              shouldDirty: true,
                            })
                          }
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
                          value={watchedSecondary || "#c8864a"}
                          onChange={(e) =>
                            setValue("secondary_color", e.target.value, {
                              shouldDirty: true,
                            })
                          }
                        />
                        <Input
                          placeholder="#c8864a"
                          className="font-mono"
                          value={watchedSecondary || ""}
                          onChange={(e) =>
                            setValue("secondary_color", e.target.value, {
                              shouldDirty: true,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live preview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Vista previa</CardTitle>
                </CardHeader>
                <CardContent>
                  <ColorPreview
                    primary={watchedPrimary || "#a0522d"}
                    secondary={watchedSecondary || "#c8864a"}
                    cafeName={watchedCafeName || ""}
                    mode={themeMode}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── CONTACT ── */}
          <TabsContent value="contact">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Textos de la sección
                  </CardTitle>
                  <CardDescription>
                    Encabezado de la sección Contacto en el landing
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Etiqueta (kicker)</Label>
                    <Input
                      placeholder="Encuéntranos"
                      {...register("contact_section_kicker")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Título de la sección</Label>
                    <Input
                      placeholder="Visítanos"
                      {...register("contact_section_title")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtítulo de Horarios</Label>
                    <Input
                      placeholder="Siempre listos para servirte"
                      {...register("contact_section_hours_subtitle")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtítulo de Contacto</Label>
                    <Input
                      placeholder="Con gusto te atendemos"
                      {...register("contact_section_contact_subtitle")}
                    />
                  </div>
                </CardContent>
              </Card>

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
                      <ExternalLink className="h-4 w-4 text-fuchsia-500" />
                      TikTok
                    </Label>
                    <Input
                      placeholder="https://tiktok.com/@tucafe"
                      {...register("tiktok_url")}
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

          {/* ── ABOUT US ── */}
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
                  <Label>Etiqueta (kicker)</Label>
                  <Input
                    placeholder="Quiénes somos"
                    {...register("about_kicker")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Texto pequeño en mayúsculas que aparece sobre el título
                  </p>
                </div>
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
                  <ImageUploadWithUrl
                    value={aboutImageUrl}
                    onChange={setAboutImageUrl}
                    folder="cafe/about"
                    recommendation="Recomendado: imagen horizontal del local o equipo"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── GALLERY ── */}
          <TabsContent value="gallery">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Textos de la sección
                  </CardTitle>
                  <CardDescription>
                    Encabezado y CTA de la sección "Nuestro Espacio" del landing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Etiqueta (kicker)</Label>
                      <Input
                        placeholder="Nuestro espacio"
                        {...register("store_section_kicker")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Título de la sección</Label>
                      <Input
                        placeholder="Visítanos"
                        {...register("store_section_title")}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Subtítulo</Label>
                    <Input
                      placeholder="Te esperamos para vivir la experiencia"
                      {...register("store_section_subtitle")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Texto del botón "Cómo llegar"</Label>
                    <Input
                      placeholder="Visítanos"
                      {...register("store_section_cta_text")}
                    />
                    <p className="text-xs text-muted-foreground">
                      El botón solo aparece si configuras la dirección en el tab Contacto.
                    </p>
                  </div>
                  <div className="flex items-start justify-between gap-4 p-4 rounded-lg border">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">
                        Autoplay del carrusel
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Las fotos rotan automáticamente cada 5 segundos
                      </p>
                    </div>
                    <Switch
                      checked={storeSectionAutoplay}
                      onCheckedChange={setStoreSectionAutoplay}
                    />
                  </div>
                </CardContent>
              </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Fotos del local
                </CardTitle>
                <CardDescription>
                  Sube hasta 8 fotos y arrastra para reordenar ({galleryUrls.length}/8)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload new image */}
                {galleryUrls.length < 8 && (
                  <GalleryUploader
                    onUpload={(url) => setGalleryUrls((prev) => [...prev, url])}
                  />
                )}

                {/* Or add via URL */}
                <div className="flex gap-2">
                  <UrlInput
                    placeholder="O pega una URL de imagen"
                    value={newGalleryUrl}
                    onChange={setNewGalleryUrl}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addGalleryUrl}
                    disabled={galleryUrls.length >= 8 || !newGalleryUrl.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Drag & drop reorder */}
                <Reorder.Group
                  axis="y"
                  values={galleryUrls}
                  onReorder={setGalleryUrls}
                  className="space-y-2"
                >
                  {galleryUrls.map((url, index) => (
                    <Reorder.Item
                      key={url}
                      value={url}
                      className="flex items-center gap-3 p-2 rounded-lg border bg-card cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="h-14 w-20 shrink-0 rounded overflow-hidden">
                        <ImagePreview
                          url={url}
                          alt={`Foto ${index + 1}`}
                          className="h-14 w-20 object-cover"
                          fallbackClassName="h-14 w-20 bg-muted/50 flex items-center justify-center"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground truncate flex-1 min-w-0">
                        {url}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive shrink-0"
                        onClick={() => removeGalleryUrl(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                {galleryUrls.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Camera className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Sube fotos de tu local</p>
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          {/* ── FEATURED PRODUCTS ── */}
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
                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <Label>Etiqueta (kicker)</Label>
                    <Input
                      placeholder="Selección especial"
                      {...register("featured_section_kicker")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Título de la sección</Label>
                    <Input
                      placeholder="Nuestros Favoritos"
                      {...register("featured_section_title")}
                    />
                  </div>
                </div>

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

        {/* ── Responsive Preview ── */}
        <div className="mt-6">
          <ResponsivePreview />
        </div>

        {/* ── SAVE BUTTON (sticky) ── */}
        <motion.div
          className="sticky bottom-4 flex mt-6 z-10 sm:justify-end"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            type="submit"
            disabled={isSaving}
            size="lg"
            className="shadow-lg relative w-full sm:w-auto"
          >
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
            {hasUnsavedChanges && !isSaving && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-500 border-2 border-background animate-pulse" />
            )}
          </Button>
        </motion.div>
      </form>

      {/* ── Create palette modal ── */}
      <Dialog open={paletteModalOpen} onOpenChange={setPaletteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Crear paleta personalizada
            </DialogTitle>
            <DialogDescription>
              Elige tus colores y dale un nombre a tu paleta
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label>Nombre de la paleta</Label>
              <Input
                placeholder="Mi paleta"
                value={newPalette.name}
                onChange={(e) => setNewPalette((p) => ({ ...p, name: e.target.value }))}
                autoFocus
              />
            </div>

            {/* Mode toggle */}
            <div className="space-y-2">
              <Label className="text-xs">Modo del tema</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewPalette((p) => ({ ...p, mode: "dark" }))}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-colors cursor-pointer ${
                    newPalette.mode === "dark"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/30 hover:border-primary/40"
                  }`}
                >
                  🌙 Oscuro
                </button>
                <button
                  type="button"
                  onClick={() => setNewPalette((p) => ({ ...p, mode: "light" }))}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-colors cursor-pointer ${
                    newPalette.mode === "light"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/30 hover:border-primary/40"
                  }`}
                >
                  ☀️ Claro
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Oscuro: fondo café/negro · Claro: fondo crema con texto oscuro
              </p>
            </div>

            {/* Color type toggle */}
            <div className="space-y-2">
              <Label className="text-xs">Tipo de color</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewPaletteSolid(true)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-colors cursor-pointer ${
                    newPaletteSolid
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/30 hover:border-primary/40"
                  }`}
                >
                  ⬛ Color sólido
                </button>
                <button
                  type="button"
                  onClick={() => setNewPaletteSolid(false)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-colors cursor-pointer ${
                    !newPaletteSolid
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/30 hover:border-primary/40"
                  }`}
                >
                  🎨 Degradado
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {newPaletteSolid
                  ? "Un solo color plano en botones y acentos"
                  : "Degradado entre el color primario y secundario"}
              </p>
            </div>

            {/* Color pickers */}
            <div
              className={`grid grid-cols-1 gap-4 ${
                newPaletteSolid ? "" : "sm:grid-cols-2"
              }`}
            >
              <div className="space-y-2">
                <Label className="text-xs">
                  {newPaletteSolid ? "Color" : "Color primario"}
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newPalette.primary}
                    onChange={(e) =>
                      setNewPalette((p) => ({
                        ...p,
                        primary: e.target.value,
                        ...(newPaletteSolid ? { secondary: e.target.value } : {}),
                      }))
                    }
                    className="h-10 w-12 rounded-md border border-input cursor-pointer"
                  />
                  <Input
                    value={newPalette.primary}
                    onChange={(e) =>
                      setNewPalette((p) => ({
                        ...p,
                        primary: e.target.value,
                        ...(newPaletteSolid ? { secondary: e.target.value } : {}),
                      }))
                    }
                    className="font-mono text-xs"
                  />
                </div>
              </div>
              {!newPaletteSolid && (
                <div className="space-y-2">
                  <Label className="text-xs">Color secundario</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newPalette.secondary}
                      onChange={(e) => setNewPalette((p) => ({ ...p, secondary: e.target.value }))}
                      className="h-10 w-12 rounded-md border border-input cursor-pointer"
                    />
                    <Input
                      value={newPalette.secondary}
                      onChange={(e) => setNewPalette((p) => ({ ...p, secondary: e.target.value }))}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Live preview */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Vista previa</Label>
              <div
                className="rounded-lg overflow-hidden border p-4 space-y-2"
                style={{
                  backgroundColor:
                    newPalette.mode === "light" ? "#faf6ef" : "#0f0d0b",
                }}
              >
                <span
                  className="text-sm font-bold"
                  style={{
                    color: newPalette.mode === "light" ? "#2a1f17" : "#f5f0e8",
                  }}
                >
                  {newPalette.name || "Sin nombre"}
                </span>
                {newPaletteSolid ? (
                  <div
                    className="h-8 rounded flex items-center justify-center text-xs font-semibold"
                    style={{
                      backgroundColor: newPalette.primary,
                      color: newPalette.mode === "light" ? "#faf6ef" : "#0f0d0b",
                    }}
                  >
                    Color sólido
                  </div>
                ) : (
                  <div
                    className="h-8 rounded flex items-center justify-center text-xs font-semibold"
                    style={{
                      background: `linear-gradient(135deg, ${newPalette.primary}, ${newPalette.secondary})`,
                      color: newPalette.mode === "light" ? "#faf6ef" : "#0f0d0b",
                    }}
                  >
                    Degradado
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={addCustomPalette}
              disabled={!newPalette.name.trim()}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear paleta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
