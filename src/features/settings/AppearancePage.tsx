import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  Store,
  Image,
  ImagePlus,
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
  ExternalLink,
  AlertCircle,
  GripVertical,
  Undo2,
  Check,
  X,
  ImageOff,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Sparkles,
  MousePointerClick,
  CalendarDays,
  Coffee,
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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
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
import { useUploadImage } from "@/hooks/useUploadImage";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";
import type { CafeSettings, Product } from "@/types";

type Testimonial = { name: string; comment: string; rating: number };
type TestimonialWithId = Testimonial & { _id: string };

let testimonialCounter = 0;
const makeTestimonialId = () => `t_${Date.now()}_${++testimonialCounter}`;

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
  | "custom_palettes"
>;

// ── Tab config ──
const TABS = [
  { value: "sections", label: "Secciones", icon: Eye, accent: "text-fuchsia-400" },
  { value: "general", label: "General", icon: Store, accent: "text-amber-400" },
  { value: "media", label: "Imágenes", icon: Image, accent: "text-sky-400" },
  { value: "colors", label: "Colores", icon: Palette, accent: "text-rose-400" },
  { value: "contact", label: "Contacto", icon: Globe, accent: "text-emerald-400" },
  { value: "about", label: "Nosotros", icon: Users, accent: "text-violet-400" },
  { value: "gallery", label: "Galería", icon: Camera, accent: "text-cyan-400" },
  { value: "testimonials", label: "Reseñas", icon: Quote, accent: "text-orange-400" },
  { value: "featured", label: "Destacados", icon: Star, accent: "text-yellow-400" },
] as const;

// ── Coffee-themed color palettes ──
const COFFEE_PALETTES = [
  { name: "Espresso", primary: "#3C1518", secondary: "#69140E" },
  { name: "Latte", primary: "#A0522D", secondary: "#C8864A" },
  { name: "Mocha", primary: "#4A2C2A", secondary: "#8B5E3C" },
  { name: "Cappuccino", primary: "#6F4E37", secondary: "#C4A882" },
  { name: "Caramelo", primary: "#8B4513", secondary: "#D2691E" },
  { name: "Menta", primary: "#2D5016", secondary: "#4A7C3F" },
  { name: "Vainilla", primary: "#8B7355", secondary: "#F5DEB3" },
  { name: "Cereza", primary: "#8B0000", secondary: "#CD5C5C" },
  { name: "Canela", primary: "#7B3F00", secondary: "#D2691E" },
  { name: "Ámbar", primary: "#B8860B", secondary: "#DAA520" },
];

// ── URL validation ──
function isValidUrl(url: string): boolean {
  if (!url.trim()) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ── Image preview component ──
function ImagePreview({
  url,
  alt,
  className = "h-24 w-full object-cover rounded-lg",
  fallbackClassName = "h-24 w-full rounded-lg bg-muted/50 flex items-center justify-center",
}: {
  url: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    url ? "loading" : "error",
  );

  if (!url || !isValidUrl(url)) {
    return (
      <div className={fallbackClassName}>
        <ImageOff className="h-6 w-6 text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div className="relative">
      {status === "loading" && (
        <div className={fallbackClassName}>
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/50" />
        </div>
      )}
      <img
        src={url}
        alt={alt}
        className={`${className} ${status === "loading" ? "hidden" : ""} ${status === "error" ? "hidden" : ""}`}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
      {status === "error" && (
        <div className={fallbackClassName}>
          <div className="text-center">
            <ImageOff className="h-5 w-5 text-destructive/50 mx-auto" />
            <p className="text-xs text-destructive/70 mt-1">URL inválida</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Clickable star rating ──
function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= (hover || value)
                ? "text-amber-400 fill-amber-400"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── URL Input with validation ──
function UrlInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const valid = isValidUrl(value);

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={!valid ? "border-destructive pr-9" : "pr-9"}
      />
      {value && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {valid ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
        </div>
      )}
    </div>
  );
}

// ── Mini landing preview with colors ──
function ColorPreview({
  primary,
  secondary,
  cafeName,
}: {
  primary: string;
  secondary: string;
  cafeName: string;
}) {
  return (
    <div className="rounded-lg border overflow-hidden text-xs">
      <div
        className="px-3 py-2 flex items-center justify-between"
        style={{ backgroundColor: primary }}
      >
        <span className="font-bold text-white truncate">{cafeName || "Mi Café"}</span>
        <div className="flex gap-2">
          <div className="w-6 h-1.5 rounded-full bg-white/40" />
          <div className="w-6 h-1.5 rounded-full bg-white/40" />
        </div>
      </div>
      <div className="px-3 py-4 bg-linear-to-b from-black/80 to-black/40 text-white text-center">
        <p className="font-bold text-sm">{cafeName || "Mi Café"}</p>
        <p className="text-[10px] opacity-70">El mejor café de la ciudad</p>
        <div
          className="mt-2 mx-auto px-3 py-1 rounded-full text-[10px] font-medium text-white inline-block"
          style={{ backgroundColor: secondary }}
        >
          Ver menú
        </div>
      </div>
      <div className="p-2 space-y-1.5 bg-background">
        <div className="flex gap-1.5">
          <div className="h-6 flex-1 rounded bg-muted" />
          <div className="h-6 flex-1 rounded bg-muted" />
          <div className="h-6 flex-1 rounded bg-muted" />
        </div>
        <div className="h-1 rounded-full" style={{ backgroundColor: primary, opacity: 0.3 }} />
        <div className="flex gap-1.5">
          <div className="h-8 flex-1 rounded bg-muted" />
          <div className="h-8 flex-1 rounded bg-muted" />
        </div>
      </div>
      <div className="px-3 py-1.5" style={{ backgroundColor: primary }}>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full bg-white/30" />
          <div className="w-3 h-3 rounded-full bg-white/30" />
          <div className="w-3 h-3 rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
}

// ── Section visibility toggle row ──
function SectionToggleRow({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  description,
  checked,
  onChange,
  hint,
  isLast,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
  isLast?: boolean;
}) {
  return (
    <div
      className={`group relative flex items-start gap-4 px-6 py-4 transition-colors hover:bg-accent/30 ${
        isLast ? "" : "border-b border-border/40"
      }`}
    >
      <div
        className={`mt-0.5 shrink-0 h-9 w-9 rounded-xl flex items-center justify-center transition-opacity ${iconBg} ${
          checked ? "opacity-100" : "opacity-50"
        }`}
      >
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p
          className={`text-sm font-semibold leading-tight transition-colors ${
            checked ? "text-foreground" : "text-foreground/60"
          }`}
        >
          {label}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">
          {description}
        </p>
        {hint && (
          <p className="text-xs text-amber-400/90 mt-2 flex items-start gap-1.5 leading-relaxed">
            <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
            <span>{hint}</span>
          </p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="cursor-pointer mt-1.5 shrink-0"
      />
    </div>
  );
}

// ── Image upload with URL fallback ──
function ImageUploadWithUrl({
  value,
  onChange,
  folder,
  recommendation,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  folder: string;
  recommendation?: string;
}) {
  const { upload, isUploading } = useUploadImage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [urlValue, setUrlValue] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await upload(file, folder);
    if (result) {
      onChange(result.url);
      toast.success("Imagen subida correctamente");
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const applyUrl = () => {
    const url = urlValue.trim();
    if (!url || !isValidUrl(url)) {
      toast.error("La URL no es válida");
      return;
    }
    onChange(url);
    setUrlValue("");
    setShowUrlInput(false);
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
        disabled={isUploading}
      />

      {/* Preview */}
      {value && (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border group">
          <img src={value} alt="Vista previa" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity shadow-lg cursor-pointer"
              onClick={() => onChange(null)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Eliminar
            </Button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-muted/40 hover:bg-muted hover:border-primary/40 transition-all text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          {isUploading ? "Subiendo..." : value ? "Cambiar archivo" : "Subir imagen"}
        </button>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border transition-all text-sm font-medium cursor-pointer ${
            showUrlInput
              ? "border-primary/50 bg-primary/10 text-foreground"
              : "border-border bg-muted/40 hover:bg-muted hover:border-primary/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Link className="h-4 w-4" />
          Pegar URL
        </button>
      </div>

      {/* URL input */}
      <AnimatePresence>
        {showUrlInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2">
              <UrlInput
                placeholder="https://ejemplo.com/imagen.jpg"
                value={urlValue}
                onChange={setUrlValue}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={applyUrl}
                disabled={!urlValue.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {recommendation && (
        <p className="text-xs text-muted-foreground">{recommendation}</p>
      )}
    </div>
  );
}

// ── Gallery uploader (Supabase Storage) ──
function GalleryUploader({ onUpload }: { onUpload: (url: string) => void }) {
  const { upload, isUploading } = useUploadImage();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await upload(file, "cafe/gallery");
    if (result) {
      onUpload(result.url);
      toast.success("Imagen subida correctamente");
    }
    e.target.value = "";
  };

  return (
    <label className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
        disabled={isUploading}
      />
      {isUploading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <Plus className="h-5 w-5 text-muted-foreground" />
      )}
      <span className="text-sm text-muted-foreground">
        {isUploading ? "Subiendo..." : "Subir imagen"}
      </span>
    </label>
  );
}

// ── Responsive landing preview ──
const VIEWPORTS = [
  { key: "desktop", icon: Monitor, width: "100%", label: "Desktop" },
  { key: "tablet", icon: Tablet, width: "768px", label: "Tablet" },
  { key: "mobile", icon: Smartphone, width: "375px", label: "Móvil" },
] as const;

function ResponsivePreview() {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const current = VIEWPORTS.find((v) => v.key === viewport)!;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ExternalLink className="h-4 w-4" />
            Vista previa del landing
          </CardTitle>
          <div className="flex gap-1 p-1 rounded-lg bg-muted/50 border border-border/50">
            {VIEWPORTS.map((vp) => {
              const Icon = vp.icon;
              const isActive = viewport === vp.key;
              return (
                <button
                  key={vp.key}
                  type="button"
                  onClick={() => setViewport(vp.key)}
                  className={`relative p-1.5 rounded-md transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="preview-viewport-pill"
                      className="absolute inset-0 rounded-md bg-background shadow-sm border border-border/80"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="relative h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <motion.div
            animate={{ width: current.width }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full overflow-hidden rounded-lg border bg-white"
            style={{ maxWidth: current.width }}
          >
            <iframe
              src="/"
              title="Landing preview"
              className="w-full border-0"
              style={{ height: viewport === "mobile" ? "700px" : "600px" }}
            />
          </motion.div>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          {current.label} — {current.width === "100%" ? "ancho completo" : current.width}
        </p>
      </CardContent>
    </Card>
  );
}

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
  const [testimonials, setTestimonials] = useState<TestimonialWithId[]>([]);
  const [customPalettes, setCustomPalettes] = useState<{ name: string; primary: string; secondary: string }[]>([]);
  const [sectionFlags, setSectionFlags] = useState({
    show_about: true,
    show_featured: true,
    show_gallery: true,
    show_testimonials: true,
    show_contact: true,
    show_reserve_button: true,
    show_menu_button: true,
    show_whatsapp_float: true,
  });
  const [paletteModalOpen, setPaletteModalOpen] = useState(false);
  const [newPalette, setNewPalette] = useState({ name: "", primary: "#6F4E37", secondary: "#C4A882" });

  const { register, handleSubmit, reset, watch, getValues, setValue } = useForm<FormData>();

  // Watch colors for live preview
  const watchedPrimary = watch("primary_color");
  const watchedSecondary = watch("secondary_color");
  const watchedCafeName = watch("cafe_name");

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
    setTestimonials(
      (settings.testimonials ?? []).map((t) => ({ ...t, _id: makeTestimonialId() })),
    );
    setCustomPalettes(settings.custom_palettes ?? []);
    setSectionFlags({
      show_about: settings.show_about ?? true,
      show_featured: settings.show_featured ?? true,
      show_gallery: settings.show_gallery ?? true,
      show_testimonials: settings.show_testimonials ?? true,
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
      JSON.stringify(
        testimonials.map((t) => ({ name: t.name, comment: t.comment, rating: t.rating })),
      ) !== JSON.stringify(settings.testimonials ?? []) ||
      JSON.stringify(customPalettes) !== JSON.stringify(settings.custom_palettes ?? []) ||
      JSON.stringify(sectionFlags) !== JSON.stringify({
        show_about: settings.show_about ?? true,
        show_featured: settings.show_featured ?? true,
        show_gallery: settings.show_gallery ?? true,
        show_testimonials: settings.show_testimonials ?? true,
        show_contact: settings.show_contact ?? true,
        show_reserve_button: settings.show_reserve_button ?? true,
        show_menu_button: settings.show_menu_button ?? true,
        show_whatsapp_float: settings.show_whatsapp_float ?? true,
      });
    return formChanged || stateChanged;
  }, [settings, featuredIds, logoUrl, coverUrl, aboutImageUrl, galleryUrls, showPromotions, testimonials, customPalettes, sectionFlags, getValues, watchedPrimary, watchedSecondary, watchedCafeName]);

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
        testimonials: testimonials.map((t) => ({
          name: t.name,
          comment: t.comment,
          rating: t.rating,
        })),
        featured_product_ids: featuredIds,
        custom_palettes: customPalettes,
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
        testimonials: testimonials.map((t) => ({
          name: t.name,
          comment: t.comment,
          rating: t.rating,
        })),
        featured_product_ids: featuredIds,
        custom_palettes: customPalettes,
        ...sectionFlags,
      };
      frame.contentWindow?.postMessage(
        { type: "preview-update", settings: payload },
        window.location.origin,
      );
    };

    sendPreview();

    const subscription = watch(() => sendPreview());
    return () => subscription.unsubscribe();
  }, [
    settings,
    logoUrl,
    coverUrl,
    aboutImageUrl,
    galleryUrls,
    showPromotions,
    testimonials,
    featuredIds,
    customPalettes,
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

  const addTestimonial = () => {
    setTestimonials((prev) => [
      ...prev,
      { name: "", comment: "", rating: 5, _id: makeTestimonialId() },
    ]);
  };

  const updateTestimonial = (
    id: string,
    field: "name" | "comment" | "rating",
    value: string | number,
  ) => {
    setTestimonials((prev) =>
      prev.map((t) => (t._id === id ? { ...t, [field]: value } : t)),
    );
  };

  const removeTestimonial = (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t._id !== id));
  };

  const [prevColors, setPrevColors] = useState<{ primary: string; secondary: string } | null>(null);

  const applyPalette = (primary: string, secondary: string) => {
    const current = getValues();
    setPrevColors({ primary: current.primary_color, secondary: current.secondary_color });
    reset({ ...current, primary_color: primary, secondary_color: secondary });
  };

  const undoPalette = () => {
    if (!prevColors) return;
    reset({ ...getValues(), primary_color: prevColors.primary, secondary_color: prevColors.secondary });
    setPrevColors(null);
  };

  const addCustomPalette = () => {
    if (!newPalette.name.trim()) {
      toast.error("Dale un nombre a tu paleta");
      return;
    }
    setCustomPalettes((prev) => [...prev, { ...newPalette, name: newPalette.name.trim() }]);
    setNewPalette({ name: "", primary: "#6F4E37", secondary: "#C4A882" });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Apariencia</h1>
          <p className="text-muted-foreground">
            Personaliza la landing page pública de tu cafetería
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("/", "_blank")}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver landing
          </Button>
        </div>
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

          {/* ── SECCIONES (visibility toggles) ── */}
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
                    label="Galería"
                    description="Fotos del ambiente y los platos"
                    checked={sectionFlags.show_gallery}
                    onChange={(v) => setSectionFlags((s) => ({ ...s, show_gallery: v }))}
                  />
                  <SectionToggleRow
                    icon={Quote}
                    iconColor="text-orange-400"
                    iconBg="bg-orange-500/10"
                    label="Reseñas"
                    description="Testimonios destacados de clientes"
                    checked={sectionFlags.show_testimonials}
                    onChange={(v) => setSectionFlags((s) => ({ ...s, show_testimonials: v }))}
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

          {/* ── IMÁGENES ── */}
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
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Logo del café</Label>
                  <ImageUploadWithUrl
                    value={logoUrl}
                    onChange={setLogoUrl}
                    folder="cafe/logo"
                    recommendation="Recomendado: formato cuadrado, mínimo 200x200px"
                  />
                </div>
                <div className="space-y-2">
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

          {/* ── COLORES ── */}
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
                  {/* Palettes */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        Paletas de café
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
                          watchedSecondary === palette.secondary;
                        return (
                          <button
                            key={palette.name}
                            type="button"
                            onClick={() =>
                              applyPalette(palette.primary, palette.secondary)
                            }
                            className={`group relative p-2 rounded-lg border-2 transition-all text-left ${
                              isActive
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="flex gap-1 mb-1.5">
                              <div
                                className="h-5 flex-1 rounded"
                                style={{ backgroundColor: palette.primary }}
                              />
                              <div
                                className="h-5 flex-1 rounded"
                                style={{ backgroundColor: palette.secondary }}
                              />
                            </div>
                            <p className="text-xs font-medium truncate">
                              {palette.name}
                            </p>
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
                          const isActive =
                            watchedPrimary === palette.primary &&
                            watchedSecondary === palette.secondary;
                          return (
                            <div key={`${palette.name}-${index}`} className="group/custom relative">
                              <button
                                type="button"
                                onClick={() => applyPalette(palette.primary, palette.secondary)}
                                className={`w-full p-2 rounded-lg border-2 transition-all text-left ${
                                  isActive
                                    ? "border-primary ring-2 ring-primary/20"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                <div className="flex gap-1 mb-1.5">
                                  <div className="h-5 flex-1 rounded" style={{ backgroundColor: palette.primary }} />
                                  <div className="h-5 flex-1 rounded" style={{ backgroundColor: palette.secondary }} />
                                </div>
                                <p className="text-xs font-medium truncate">{palette.name}</p>
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
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── CONTACTO ── */}
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

          {/* ── SOBRE NOSOTROS ── */}
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

          {/* ── GALERÍA ── */}
          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Galería de Fotos
                </CardTitle>
                <CardDescription>
                  Sube hasta 8 fotos y arrastra para reordenar ({galleryUrls.length}/8)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload nueva imagen */}
                {galleryUrls.length < 8 && (
                  <GalleryUploader
                    onUpload={(url) => setGalleryUrls((prev) => [...prev, url])}
                  />
                )}

                {/* O agregar por URL */}
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
          </TabsContent>

          {/* ── TESTIMONIOS ── */}
          <TabsContent value="testimonials">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Quote className="h-5 w-5" />
                  Reseñas de Clientes
                </CardTitle>
                <CardDescription>
                  Agrega testimonios y arrastra para reordenar
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
                <Reorder.Group
                  axis="y"
                  values={testimonials}
                  onReorder={setTestimonials}
                  className="space-y-3"
                >
                  {testimonials.map((t, index) => (
                    <Reorder.Item
                      key={t._id}
                      value={t}
                      className="p-4 rounded-lg border space-y-3 bg-card cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                          <p className="text-sm font-medium">
                            Reseña #{index + 1}
                          </p>
                          <StarRating
                            value={t.rating}
                            onChange={(v) =>
                              updateTestimonial(t._id, "rating", v)
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeTestimonial(t._id)}
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
                              updateTestimonial(t._id, "name", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Comentario</Label>
                          <Textarea
                            placeholder="El mejor café que he probado..."
                            rows={2}
                            value={t.comment}
                            onChange={(e) =>
                              updateTestimonial(t._id, "comment", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                {testimonials.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Quote className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Agrega reseñas de tus clientes</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── PRODUCTOS DESTACADOS ── */}
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

        {/* ── Responsive Preview ── */}
        <div className="mt-6">
          <ResponsivePreview />
        </div>

        {/* ── SAVE BUTTON (sticky) ── */}
        <motion.div
          className="sticky bottom-4 flex justify-end mt-6 z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            type="submit"
            disabled={isSaving}
            size="lg"
            className="shadow-lg relative"
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

            {/* Color pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Color primario</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newPalette.primary}
                    onChange={(e) => setNewPalette((p) => ({ ...p, primary: e.target.value }))}
                    className="h-10 w-12 rounded-md border border-input cursor-pointer"
                  />
                  <Input
                    value={newPalette.primary}
                    onChange={(e) => setNewPalette((p) => ({ ...p, primary: e.target.value }))}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
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
            </div>

            {/* Live preview */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Vista previa</Label>
              <div className="rounded-lg overflow-hidden border">
                <div className="flex">
                  <div className="flex-1 h-12" style={{ backgroundColor: newPalette.primary }} />
                  <div className="flex-1 h-12" style={{ backgroundColor: newPalette.secondary }} />
                </div>
                <div className="px-3 py-2 bg-muted/30 flex items-center justify-between">
                  <span className="text-xs font-medium">
                    {newPalette.name || "Sin nombre"}
                  </span>
                  <div className="flex gap-1">
                    <div className="h-3 w-3 rounded-full border" style={{ backgroundColor: newPalette.primary }} />
                    <div className="h-3 w-3 rounded-full border" style={{ backgroundColor: newPalette.secondary }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={addCustomPalette}
              disabled={!newPalette.name.trim()}
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
