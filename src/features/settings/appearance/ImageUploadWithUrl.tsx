import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, Link, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUploadImage } from "@/hooks/useUploadImage";
import { UrlInput } from "./UrlInput";
import { isValidUrl } from "./utils";

// Image field that accepts either a Storage upload or a pasted URL.
export function ImageUploadWithUrl({
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
          {/* Hover overlay (desktop) */}
          <div className="hidden lg:flex absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors items-center justify-center">
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
          {/* Mobile delete button (always visible) */}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="lg:hidden absolute top-2 right-2 h-8 w-8 shadow-lg"
            onClick={() => onChange(null)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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
