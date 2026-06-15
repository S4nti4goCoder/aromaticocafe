import { useState } from "react";
import { ImageOff, Loader2 } from "lucide-react";
import { isValidUrl } from "./utils";

// Shows an image from a URL with loading/error fallbacks.
export function ImagePreview({
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
