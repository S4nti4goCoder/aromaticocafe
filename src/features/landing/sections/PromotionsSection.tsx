import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Star, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import type { CafeSettings, Promotion } from "@/types";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import type { CafeTheme } from "../cafeTheme";

interface PromotionsSectionProps {
  promotions: Promotion[];
  settings: CafeSettings | undefined;
  theme: CafeTheme;
}

// Format an ISO date as "Hasta el 15 de junio" or "Termina hoy".
function formatEndDate(endsAt: string | null): string | null {
  if (!endsAt) return null;
  const end = new Date(endsAt);
  if (isNaN(end.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (endDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays < 0) return null;
  if (diffDays === 0) return "Termina hoy";
  if (diffDays === 1) return "Termina mañana";
  const formatted = end.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
  });
  return `Hasta el ${formatted}`;
}

// Compute automatic + manual badges for a single promotion.
type BadgeKind = "featured" | "new" | "ending-soon" | "last-day";

function computeBadges(promo: Promotion): BadgeKind[] {
  const badges: BadgeKind[] = [];
  if (promo.is_featured) badges.push("featured");

  const created = new Date(promo.created_at);
  const daysSinceCreated =
    (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated <= 7) badges.push("new");

  if (promo.ends_at) {
    const end = new Date(promo.ends_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDay = new Date(end);
    endDay.setHours(0, 0, 0, 0);
    const diffDays = Math.round(
      (endDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0) badges.push("last-day");
    else if (diffDays > 0 && diffDays <= 3) badges.push("ending-soon");
  }
  return badges;
}

const BADGE_STYLES: Record<
  BadgeKind,
  { label: string; bg: string; color: string }
> = {
  featured: { label: "Destacada", bg: "#d4a847", color: "#0f0d0b" },
  new: { label: "Nueva", bg: "#3b82f6", color: "#ffffff" },
  "ending-soon": { label: "Termina pronto", bg: "#f59e0b", color: "#ffffff" },
  "last-day": { label: "Último día", bg: "#dc2626", color: "#ffffff" },
};

export function PromotionsSection({
  promotions,
  settings,
  theme,
}: PromotionsSectionProps) {
  const { data: allProducts = [] } = useProducts();
  const { data: allCategories = [] } = useCategories();
  const productById = new Map(allProducts.map((p) => [p.id, p]));
  const categoryById = new Map(allCategories.map((c) => [c.id, c]));

  const kicker = settings?.promotions_section_kicker || "Ofertas especiales";
  const title = settings?.promotions_section_title || "Promociones";

  // Carrusel horizontal de promos, con loop y autoplay (mismo patrón que la
  // galería del local). Pausa al primer clic/swipe del usuario.
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: true }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (idx: number) => emblaApi?.scrollTo(idx),
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Agrupar las promos en páginas de 3 cards horizontales apiladas verticalmente.
  // Cada "slide" del carrusel muestra hasta 3 promos en columna.
  const PROMOS_PER_SLIDE = 3;
  const chunks = useMemo(() => {
    const result: Promotion[][] = [];
    for (let i = 0; i < promotions.length; i += PROMOS_PER_SLIDE) {
      result.push(promotions.slice(i, i + PROMOS_PER_SLIDE));
    }
    return result;
  }, [promotions]);

  // Render the headline offer for a promotion (e.g., "2×1", "20%", "$5.000").
  const renderOfferDisplay = (promo: Promotion) => {
    if (promo.type === "2x1") {
      return (
        <>
          <span>2</span>
          <span className="opacity-60">×</span>
          <span>1</span>
        </>
      );
    }
    if (promo.type === "descuento_porcentaje") {
      return (
        <>
          <span>{promo.value}</span>
          <span className="text-[0.5em] align-top opacity-70">%</span>
        </>
      );
    }
    if (promo.type === "precio_fijo") {
      return (
        <>
          <span className="text-[0.55em] align-top opacity-70">$</span>
          <span>{promo.value?.toLocaleString("es-CO")}</span>
        </>
      );
    }
    return <span>OFERTA</span>;
  };

  return (
    <section
      id="promociones"
      className="min-h-screen fluid-section-px fluid-section-py flex flex-col justify-center"
      style={{ backgroundColor: theme.bgSection }}
    >
      <div className="max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-[clamp(1rem,4vh,3rem)] flex items-end justify-between gap-6 border-b pb-[clamp(0.75rem,2vh,1.5rem)]"
          style={{ borderColor: theme.border }}
        >
          <div>
            <p
              className="text-xs font-bold tracking-[0.4em] uppercase mb-3"
              style={{ color: theme.gold }}
            >
              {kicker}
            </p>
            <h2
              className="fluid-h2 font-black leading-none"
              style={{ color: theme.text }}
            >
              {title}
            </h2>
          </div>
          <div
            className="hidden sm:block text-[10px] font-bold tracking-[0.3em] uppercase pb-2 whitespace-nowrap"
            style={{ color: theme.textMuted }}
          >
            Edición vigente · {promotions.length}{" "}
            {promotions.length === 1 ? "oferta" : "ofertas"}
          </div>
        </motion.div>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {chunks.map((chunk, chunkIndex) => {
                // Rellenar el último chunk con "huecos" invisibles para que
                // todos los slides ocupen la misma altura y no quede el
                // último flotando con espacio vacío abajo.
                const fillersNeeded = PROMOS_PER_SLIDE - chunk.length;
                return (
                <div
                  key={chunkIndex}
                  className="shrink-0 basis-full px-2 sm:px-3"
                  style={{ flex: "0 0 100%" }}
                >
                  <div className="flex flex-col gap-[clamp(0.75rem,2vh,1.25rem)]">
                    {chunk.map((promo, index) => {
                      const badges = computeBadges(promo);
                      const productImage = promo.product_id
                        ? productById.get(promo.product_id)?.image_url
                        : null;
                      const categoryImage = promo.category_id
                        ? categoryById.get(promo.category_id)?.image_url
                        : null;
                      const heroImage = productImage || categoryImage || null;
                      const vigencia = formatEndDate(promo.ends_at);

                      return (
                        <motion.div
                          key={promo.id}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className="group relative rounded-xl overflow-hidden"
                          style={{
                            backgroundColor: "#e8dcc4",
                            border: "1px solid #d4c19c",
                          }}
                        >
                {/* Hover accent: gold border on left */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500"
                  style={{ backgroundColor: theme.gold }}
                />

                <div className="grid grid-cols-12 gap-3 lg:gap-5 items-center p-[clamp(0.625rem,1.8vh,1.25rem)]">
                  {/* Offer (huge type) — smaller scale for precio_fijo so "$5.000" doesn't dominate */}
                  <div className="col-span-12 sm:col-span-4 lg:col-span-3 min-w-0">
                    <span
                      className="font-black leading-none tracking-tight"
                      style={{
                        color: theme.gold,
                        fontSize:
                          promo.type === "precio_fijo"
                            ? "clamp(1.25rem, 1.5vw + 0.8vh, 2.25rem)"
                            : "clamp(1.75rem, 2.5vw + 1.2vh, 3.5rem)",
                      }}
                    >
                      {renderOfferDisplay(promo)}
                    </span>
                  </div>

                  {/* Title + description */}
                  <div className="col-span-12 sm:col-span-5 lg:col-span-6 min-w-0">
                    <h3
                      className="font-black text-base sm:text-lg lg:text-xl leading-tight mb-1"
                      style={{ color: theme.text }}
                    >
                      {promo.name}
                    </h3>
                    {promo.description && (
                      <p
                        className="text-xs sm:text-sm leading-snug mb-2"
                        style={{ color: theme.textMuted }}
                      >
                        {promo.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      {vigencia && (
                        <div
                          className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-black tracking-wider uppercase px-2.5 py-1 rounded-md shadow-sm"
                          style={{
                            color: "#faf6ef",
                            backgroundColor: theme.gold,
                            border: `1.5px solid ${theme.gold}`,
                          }}
                        >
                          <Clock className="h-3 w-3" />
                          {vigencia}
                        </div>
                      )}
                      {badges.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {badges.map((kind) => {
                            const s = BADGE_STYLES[kind];
                            return (
                              <span
                                key={kind}
                                className="text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 rounded"
                                style={{
                                  backgroundColor: `${s.bg}26`,
                                  border: `1px solid ${s.bg}99`,
                                  color: s.bg,
                                }}
                              >
                                <Star className="h-2.5 w-2.5 fill-current inline mr-1 -mt-0.5" />
                                {s.label}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image accent (small framed thumbnail) */}
                  <div className="col-span-12 sm:col-span-3 lg:col-span-3 flex sm:justify-end">
                    {heroImage ? (
                      <div
                        className="relative rounded-lg overflow-hidden shrink-0 w-[clamp(3.5rem,8vh,5.5rem)] h-[clamp(3.5rem,8vh,5.5rem)]"
                        style={{ border: "1px solid #d4c19c" }}
                      >
                        <img
                          src={heroImage}
                          alt={promo.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                    ) : (
                      <div
                        className="rounded-lg flex items-center justify-center shrink-0 w-[clamp(3.5rem,8vh,5.5rem)] h-[clamp(3.5rem,8vh,5.5rem)]"
                        style={{
                          backgroundColor: "#f9f3e7",
                          border: "1px dashed #d4c19c",
                        }}
                      >
                        <Star className="h-6 w-6 opacity-30" style={{ color: theme.gold }} />
                      </div>
                    )}
                  </div>
                </div>
                        </motion.div>
                      );
                    })}
                    {Array.from({ length: fillersNeeded }).map((_, i) => (
                      <div
                        key={`filler-${i}`}
                        aria-hidden
                        className="rounded-xl pointer-events-none"
                        style={{
                          padding: "clamp(0.625rem,1.8vh,1.25rem)",
                          visibility: "hidden",
                          // Misma estructura visual que una card real para que
                          // ocupe la misma altura aproximada.
                          minHeight: "clamp(5rem,12vh,7.5rem)",
                        }}
                      />
                    ))}
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {chunks.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                className="absolute -left-4 sm:-left-10 lg:-left-14 top-1/2 -translate-y-1/2 p-2 rounded-full cursor-pointer transition-all hover:scale-110 z-20"
                style={{
                  backgroundColor: theme.bg,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                  boxShadow: `0 4px 12px rgba(0,0,0,0.08)`,
                }}
                aria-label="Promoción anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={scrollNext}
                className="absolute -right-4 sm:-right-10 lg:-right-14 top-1/2 -translate-y-1/2 p-2 rounded-full cursor-pointer transition-all hover:scale-110 z-20"
                style={{
                  backgroundColor: theme.bg,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                  boxShadow: `0 4px 12px rgba(0,0,0,0.08)`,
                }}
                aria-label="Promoción siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <div className="flex justify-center gap-2 mt-[clamp(0.75rem,2vh,1.25rem)]">
                {chunks.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollTo(i)}
                    className="h-2 rounded-full transition-all cursor-pointer"
                    style={{
                      width: i === selectedIndex ? "24px" : "8px",
                      backgroundColor:
                        i === selectedIndex ? theme.gold : `${theme.gold}40`,
                    }}
                    aria-label={`Ir a la página ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

