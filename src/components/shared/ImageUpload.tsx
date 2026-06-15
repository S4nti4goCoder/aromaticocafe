import { useRef, useState, useEffect } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useUploadImage } from "@/hooks/useUploadImage";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
}

// Límite de tamaño (debe coincidir con file_size_limit del bucket "images").
const MAX_MB = 10;

export function ImageUpload({
  value,
  onChange,
  folder = "general",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useUploadImage();
  const [preview, setPreview] = useState<string | null>(value);

  // Sincroniza la vista previa cuando el valor llega o cambia desde el padre
  // (p. ej. el avatar del perfil se carga de forma asíncrona tras el fetch).
  // Sin esto, el componente se queda con el valor del primer render y no
  // muestra la imagen ya guardada. No pisa el preview durante una subida
  // porque el padre solo cambia value vía onChange (misma URL).
  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones con aviso claro (antes el error se tragaba en silencio).
    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen (PNG, JPG o WEBP).");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(
        `La imagen pesa demasiado (máx. ${MAX_MB} MB). Usa una más liviana.`,
      );
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    const result = await upload(file, folder);
    if (result) {
      onChange(result.url);
      setPreview(result.url);
    } else {
      setPreview(value);
      toast.error("No se pudo subir la imagen. Intenta de nuevo.");
    }

    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
        disabled={isUploading}
      />

      {preview ? (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border">
          <img
            src={preview}
            alt="Vista previa"
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-full h-40 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted/30 transition-colors"
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <>
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Haz clic para subir una imagen
              </span>
              <span className="text-xs text-muted-foreground/60">
                PNG, JPG, WEBP — máx. {MAX_MB}MB
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
