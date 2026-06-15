// Mini landing mockup that previews a palette's colors in dark or light mode.
export function ColorPreview({
  primary,
  secondary,
  cafeName,
  mode,
}: {
  primary: string;
  secondary: string;
  cafeName: string;
  mode: "dark" | "light";
}) {
  const isLight = mode === "light";
  const bg = isLight ? "#faf6ef" : "#0f0d0b";
  const cardBg = isLight ? "#ffffff" : "#1a1612";
  const text = isLight ? "#2a1f17" : "#f5f0e8";
  const textMuted = isLight ? "#6b574a" : "#a89880";

  return (
    <div className="rounded-lg border overflow-hidden text-xs" style={{ backgroundColor: bg }}>
      {/* Navbar (theme bg) */}
      <div
        className="px-3 py-2 flex items-center justify-between border-b"
        style={{ backgroundColor: bg, borderColor: isLight ? "#e6dccb" : "#2a2318" }}
      >
        <span className="font-bold truncate" style={{ color: text }}>
          {cafeName || "Mi Café"}
        </span>
        <div className="flex gap-2">
          <div className="w-6 h-1.5 rounded-full" style={{ backgroundColor: primary }} />
          <div className="w-6 h-1.5 rounded-full" style={{ backgroundColor: secondary }} />
        </div>
      </div>
      {/* Hero (cover image + dark overlay always) */}
      <div className="px-3 py-4 bg-linear-to-b from-black/80 to-black/40 text-white text-center">
        <p className="font-bold text-sm">{cafeName || "Mi Café"}</p>
        <p className="text-[10px] opacity-70">El mejor café de la ciudad</p>
        <div
          className="mt-2 mx-auto px-3 py-1 rounded-full text-[10px] font-medium inline-block"
          style={{ backgroundColor: secondary, color: bg }}
        >
          Ver menú
        </div>
      </div>
      {/* Body (theme bg + cards) */}
      <div className="p-2 space-y-1.5" style={{ backgroundColor: bg }}>
        <p className="text-[10px] font-semibold" style={{ color: text }}>
          Nuestros Favoritos
        </p>
        <div className="flex gap-1.5">
          <div className="h-6 flex-1 rounded" style={{ backgroundColor: cardBg }} />
          <div className="h-6 flex-1 rounded" style={{ backgroundColor: cardBg }} />
          <div className="h-6 flex-1 rounded" style={{ backgroundColor: cardBg }} />
        </div>
        <div className="h-1 rounded-full" style={{ backgroundColor: primary, opacity: 0.4 }} />
        <div className="flex gap-1.5">
          <div className="h-8 flex-1 rounded" style={{ backgroundColor: cardBg }} />
          <div className="h-8 flex-1 rounded" style={{ backgroundColor: cardBg }} />
        </div>
        <p className="text-[9px]" style={{ color: textMuted }}>
          {isLight ? "Tema claro · fondo crema" : "Tema oscuro · fondo café"}
        </p>
      </div>
      {/* Footer (primary) */}
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
