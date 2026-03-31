import { useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadImage } from "@/hooks/useUploadImage";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder = "general",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useUploadImage();
  const [preview, setPreview] = useState<string | null>(value);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    const result = await upload(file, folder);
    if (result) {
      onChange(result.url);
      setPreview(result.url);
    } else {
      setPreview(value);
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
                PNG, JPG, WEBP — máx. 5MB
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
