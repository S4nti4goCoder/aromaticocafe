import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  ImagePlus,
  Link as LinkIcon,
  Smile,
  Trash2,
  Coffee,
  Loader2,
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
import { toast } from "sonner";
import { useUploadImage } from "@/hooks/useUploadImage";
import { isLogoImage } from "@/lib/logo";

// Loaded on demand: keeps emoji-picker-react out of the Settings page chunk.
const LazyEmojiPicker = lazy(() => import("./LazyEmojiPicker"));

interface LogoTabProps {
  logoValue: string | null;
  onLogoValueChange: (value: string | null) => void;
  logoMode: "image" | "url" | "emoji";
  onLogoModeChange: (mode: "image" | "url" | "emoji") => void;
  logoUrlInput: string;
  onLogoUrlInputChange: (value: string) => void;
  logoEmojiInput: string;
  onLogoEmojiInputChange: (value: string) => void;
}

// "Logo" tab: pick the company logo via upload, URL or emoji, with live preview.
export function LogoTab({
  logoValue,
  onLogoValueChange,
  logoMode,
  onLogoModeChange,
  logoUrlInput,
  onLogoUrlInputChange,
  logoEmojiInput,
  onLogoEmojiInputChange,
}: LogoTabProps) {
  const { upload, isUploading } = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(
    typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkTheme(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await upload(file, "cafe/logo");
    if (result) {
      onLogoValueChange(result.url);
      toast.success("Logo subido correctamente");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const applyLogoUrl = () => {
    const url = logoUrlInput.trim();
    if (!url) {
      toast.error("Ingresa una URL");
      return;
    }
    try {
      new URL(url);
    } catch {
      toast.error("La URL no es válida");
      return;
    }
    onLogoValueChange(url);
    onLogoUrlInputChange("");
    toast.success("URL aplicada");
  };

  const applyLogoEmoji = (emoji: string) => {
    const value = emoji.trim();
    if (!value) {
      toast.error("Elige o escribe un emoji");
      return;
    }
    onLogoValueChange(value);
    onLogoEmojiInputChange(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImagePlus className="h-5 w-5" />
          Logo de la empresa
        </CardTitle>
        <CardDescription>
          Se muestra en el panel admin, login, landing y pantalla de cambio de
          contraseña.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Preview */}
        <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/30">
          <div className="h-16 w-16 rounded-full bg-background border flex items-center justify-center overflow-hidden shrink-0">
            {isLogoImage(logoValue) ? (
              <img
                src={logoValue!}
                alt="Logo"
                className="h-full w-full object-cover"
              />
            ) : logoValue ? (
              <span className="text-3xl leading-none">{logoValue}</span>
            ) : (
              <Coffee className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Vista previa</p>
            <p className="text-xs text-muted-foreground truncate">
              {logoValue
                ? isLogoImage(logoValue)
                  ? logoValue
                  : `Emoji: ${logoValue}`
                : "Sin logo (se muestra ícono por defecto)"}
            </p>
          </div>
          {logoValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                onLogoValueChange(null);
                onLogoEmojiInputChange("");
                onLogoUrlInputChange("");
              }}
              aria-label="Quitar logo"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Mode selector */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onLogoModeChange("image")}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
              logoMode === "image"
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
            }`}
          >
            <ImagePlus className="h-4 w-4" />
            Subir imagen
          </button>
          <button
            type="button"
            onClick={() => onLogoModeChange("url")}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
              logoMode === "url"
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            URL
          </button>
          <button
            type="button"
            onClick={() => onLogoModeChange("emoji")}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
              logoMode === "emoji"
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
            }`}
          >
            <Smile className="h-4 w-4" />
            Emoji
          </button>
        </div>

        {/* Mode content */}
        {logoMode === "image" && (
          <div className="space-y-2">
            <Label>Subir desde tu dispositivo</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoFile}
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <ImagePlus className="h-4 w-4 mr-2" />
                  {logoValue && isLogoImage(logoValue)
                    ? "Cambiar imagen"
                    : "Seleccionar imagen"}
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Recomendado: PNG/SVG cuadrado, mínimo 128×128 px.
            </p>
          </div>
        )}

        {logoMode === "url" && (
          <div className="space-y-2">
            <Label>URL de la imagen</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://ejemplo.com/logo.png"
                value={logoUrlInput}
                onChange={(e) => onLogoUrlInputChange(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={applyLogoUrl}
                disabled={!logoUrlInput.trim()}
              >
                Aplicar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Pega un link directo a la imagen.
            </p>
          </div>
        )}

        {logoMode === "emoji" && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Emoji actual</Label>
              <div className="flex gap-2">
                <div className="h-10 w-12 rounded-md border bg-muted/40 flex items-center justify-center text-2xl leading-none shrink-0">
                  {logoEmojiInput || "—"}
                </div>
                <Input
                  placeholder="O escribe / pega uno aquí"
                  maxLength={4}
                  value={logoEmojiInput}
                  onChange={(e) => onLogoEmojiInputChange(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => applyLogoEmoji(logoEmojiInput)}
                  disabled={!logoEmojiInput.trim()}
                >
                  Aplicar
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>O elige uno del catálogo</Label>
              <div className="rounded-lg border overflow-hidden">
                <Suspense
                  fallback={
                    <div className="flex h-95 items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  }
                >
                  <LazyEmojiPicker
                    isDark={isDarkTheme}
                    onPick={(emoji) => {
                      onLogoEmojiInputChange(emoji);
                      applyLogoEmoji(emoji);
                    }}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
