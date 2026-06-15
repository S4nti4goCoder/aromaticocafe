import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Navigation } from "lucide-react";
import type { CafeSettings } from "@/types";
import type { CafeTheme } from "../cafeTheme";

interface StoreShowcaseSectionProps {
  photoUrls: string[];
  settings: CafeSettings | undefined;
  theme: CafeTheme;
}

export function StoreShowcaseSection({
  photoUrls,
  settings,
  theme,
}: StoreShowcaseSectionProps) {
  const autoplayEnabled = settings?.store_section_autoplay ?? true;
  const kicker = settings?.store_section_kicker || "Nuestro espacio";
  const title = settings?.store_section_title || "Visítanos";
  const subtitle =
    settings?.store_section_subtitle ||
    "Te esperamos para vivir la experiencia";
  const ctaText = settings?.store_section_cta_text || "Visítanos";

  const directionsHref = settings?.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        settings.address,
      )}`
    : null;

  const autoplayPlugin = autoplayEnabled
    ? [Autoplay({ delay: 5000, stopOnInteraction: true })]
    : [];

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, autoplayPlugin);
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

  if (photoUrls.length === 0) return null;

  return (
    <section
      id="espacio"
      className="min-h-screen fluid-section-px fluid-section-py flex flex-col justify-center"
      style={{ backgroundColor: theme.bg }}
    >
      <div className="max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-[clamp(1rem,4vh,3rem)] text-center"
        >
          <p
            className="text-xs font-bold tracking-[0.4em] uppercase mb-[clamp(0.5rem,1.5vh,1rem)]"
            style={{ color: theme.gold }}
          >
            {kicker}
          </p>
          <h2
            className="fluid-h2 font-black mb-[clamp(0.5rem,1.5vh,1rem)]"
            style={{ color: theme.text }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className="text-base sm:text-lg max-w-2xl mx-auto"
              style={{ color: theme.textMuted }}
            >
              {subtitle}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden"
          style={{ border: `1px solid ${theme.border}` }}
        >
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {photoUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative shrink-0 w-full"
                  style={{ flex: "0 0 100%" }}
                >
                  <img
                    src={url}
                    alt={`Foto del local ${index + 1}`}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="w-full object-cover"
                    style={{ height: "clamp(300px, 52vh, 580px)" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {photoUrls.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full cursor-pointer transition-all hover:scale-110"
                style={{
                  backgroundColor: `${theme.bg}cc`,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                  backdropFilter: "blur(8px)",
                }}
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={scrollNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full cursor-pointer transition-all hover:scale-110"
                style={{
                  backgroundColor: `${theme.bg}cc`,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                  backdropFilter: "blur(8px)",
                }}
                aria-label="Foto siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
                {photoUrls.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollTo(i)}
                    className="h-2 rounded-full transition-all cursor-pointer"
                    style={{
                      width: i === selectedIndex ? "24px" : "8px",
                      backgroundColor:
                        i === selectedIndex
                          ? theme.gold
                          : "rgba(255,255,255,0.5)",
                    }}
                    aria-label={`Ir a foto ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>

        {directionsHref && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-[clamp(1rem,3vh,2.5rem)] flex justify-center"
          >
            <motion.a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${theme.gold}, ${theme.amber})`,
                color: theme.bg,
                boxShadow: `0 8px 24px ${theme.gold}40`,
              }}
            >
              <Navigation className="h-4 w-4" />
              {ctaText}
            </motion.a>
          </motion.div>
        )}
      </div>
    </section>
  );
}
