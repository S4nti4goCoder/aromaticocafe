import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Monitor, Tablet, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const VIEWPORTS = [
  { key: "desktop", icon: Monitor, width: "100%", label: "Desktop" },
  { key: "tablet", icon: Tablet, width: "768px", label: "Tablet" },
  { key: "mobile", icon: Smartphone, width: "320px", label: "Móvil" },
] as const;

// Embeds the live landing in an iframe at desktop/tablet/mobile widths.
export function ResponsivePreview() {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const current = VIEWPORTS.find((v) => v.key === viewport)!;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ExternalLink className="h-4 w-4" />
            Vista previa del landing
          </CardTitle>
          <div className="flex gap-1 p-1 rounded-lg bg-muted/50 border border-border/50 self-start sm:self-auto">
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
