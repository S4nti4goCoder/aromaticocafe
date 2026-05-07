import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Coffee } from "lucide-react";
import { useCafeSettings } from "@/hooks/useCafeSettings";
import { useProducts } from "@/hooks/useProducts";
import { usePromotions } from "@/hooks/usePromotions";
import type { CafeSettings, Product } from "@/types";
import { CAFE, buildCafeTheme, type NavLink } from "./cafeTheme";
import { Navbar } from "./sections/Navbar";
import { HeroSection } from "./sections/HeroSection";

const AboutSection = lazy(() =>
  import("./sections/AboutSection").then((m) => ({ default: m.AboutSection })),
);
const FeaturedProductsSection = lazy(() =>
  import("./sections/FeaturedProductsSection").then((m) => ({
    default: m.FeaturedProductsSection,
  })),
);
const PromotionsSection = lazy(() =>
  import("./sections/PromotionsSection").then((m) => ({
    default: m.PromotionsSection,
  })),
);
const GallerySection = lazy(() =>
  import("./sections/GallerySection").then((m) => ({
    default: m.GallerySection,
  })),
);
const TestimonialsSection = lazy(() =>
  import("./sections/TestimonialsSection").then((m) => ({
    default: m.TestimonialsSection,
  })),
);
const ContactSection = lazy(() =>
  import("./sections/ContactSection").then((m) => ({
    default: m.ContactSection,
  })),
);
const Footer = lazy(() =>
  import("./sections/Footer").then((m) => ({ default: m.Footer })),
);
const FloatingButtons = lazy(() =>
  import("./sections/FloatingButtons").then((m) => ({
    default: m.FloatingButtons,
  })),
);
const MenuModal = lazy(() =>
  import("@/features/landing/MenuModal").then((m) => ({ default: m.MenuModal })),
);
const ReservaModal = lazy(() =>
  import("@/features/landing/ReservaModal").then((m) => ({
    default: m.ReservaModal,
  })),
);

export function LandingPage() {
  const { settings, isLoading } = useCafeSettings();
  const { data: allProducts } = useProducts();
  const { data: allPromotions } = usePromotions();

  // Live preview: when rendered inside an iframe, accept settings overrides via postMessage.
  const [previewOverrides, setPreviewOverrides] = useState<Partial<CafeSettings> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || window.parent === window) return;

    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "preview-update" && e.data.settings) {
        setPreviewOverrides(e.data.settings as Partial<CafeSettings>);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const effectiveSettings = useMemo(
    () =>
      previewOverrides
        ? ({ ...settings, ...previewOverrides } as CafeSettings)
        : settings,
    [settings, previewOverrides],
  );

  const theme = useMemo(
    () => buildCafeTheme(effectiveSettings?.primary_color, effectiveSettings?.secondary_color),
    [effectiveSettings?.primary_color, effectiveSettings?.secondary_color],
  );
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [reservaModalOpen, setReservaModalOpen] = useState(false);
  const { scrollY } = useScroll();

  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.08]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 60;
      setScrolled(isScrolled);
      if (isScrolled) setMobileMenuOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const featuredProducts: Product[] = (allProducts ?? []).filter(
    (p) => p.is_active && (effectiveSettings?.featured_product_ids ?? []).includes(p.id),
  );

  const activePromotions = (allPromotions ?? []).filter((p) => p.is_active);

  const navLinks: NavLink[] = [
    {
      id: "nosotros",
      label: "Nuestra historia",
      show:
        effectiveSettings?.show_about !== false &&
        !!(effectiveSettings?.about_title || effectiveSettings?.about_description),
    },
    {
      id: "menu",
      label: "Favoritos",
      show: effectiveSettings?.show_featured !== false && featuredProducts.length > 0,
    },
    {
      id: "promociones",
      label: "Promociones",
      show: !!(effectiveSettings?.show_promotions && activePromotions.length > 0),
    },
    {
      id: "galeria",
      label: "Galería",
      show:
        effectiveSettings?.show_gallery !== false &&
        !!(effectiveSettings?.gallery_urls && effectiveSettings.gallery_urls.length > 0),
    },
    {
      id: "resenas",
      label: "Reseñas",
      show:
        effectiveSettings?.show_testimonials !== false &&
        !!(effectiveSettings?.testimonials && effectiveSettings.testimonials.length > 0),
    },
    {
      id: "contacto",
      label: "Contacto",
      show:
        effectiveSettings?.show_contact !== false &&
        !!(
          effectiveSettings?.address ||
          effectiveSettings?.maps_embed_url ||
          effectiveSettings?.phone
        ),
    },
  ].filter((l) => l.show);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: CAFE.bg }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        >
          <Coffee className="h-10 w-10" style={{ color: theme.gold }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-sans overflow-x-hidden"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      <Navbar
        settings={effectiveSettings}
        scrolled={scrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navLinks={navLinks}
        onNavClick={handleNavClick}
        onScrollToTop={scrollToTop}
        onOpenReserva={() => setReservaModalOpen(true)}
        theme={theme}
      />

      <HeroSection
        settings={effectiveSettings}
        heroOpacity={heroOpacity}
        heroScale={heroScale}
        onOpenMenu={() => setMenuModalOpen(true)}
        theme={theme}
      />

      <Suspense fallback={null}>
        {effectiveSettings?.show_about !== false &&
          effectiveSettings &&
          (effectiveSettings.about_title || effectiveSettings.about_description) && (
            <AboutSection settings={effectiveSettings} theme={theme} />
          )}

        {effectiveSettings?.show_featured !== false && featuredProducts.length > 0 && (
          <FeaturedProductsSection products={featuredProducts} theme={theme} />
        )}

        {!!effectiveSettings?.show_promotions && activePromotions.length > 0 && (
          <PromotionsSection promotions={activePromotions} theme={theme} />
        )}

        {effectiveSettings?.show_gallery !== false &&
          !!effectiveSettings?.gallery_urls?.length && (
            <GallerySection galleryUrls={effectiveSettings.gallery_urls} theme={theme} />
          )}

        {effectiveSettings?.show_testimonials !== false &&
          !!effectiveSettings?.testimonials?.length && (
            <TestimonialsSection testimonials={effectiveSettings.testimonials} theme={theme} />
          )}

        {effectiveSettings?.show_contact !== false && (
          <ContactSection settings={effectiveSettings} theme={theme} />
        )}

        <Footer
          settings={effectiveSettings}
          navLinks={navLinks}
          onNavClick={handleNavClick}
          onScrollToTop={scrollToTop}
          theme={theme}
        />

        {reservaModalOpen && (
          <ReservaModal
            open={reservaModalOpen}
            onClose={() => setReservaModalOpen(false)}
            whatsapp={effectiveSettings?.reservation_whatsapp ?? effectiveSettings?.whatsapp}
            cafeName={effectiveSettings?.cafe_name}
          />
        )}
        {menuModalOpen && (
          <MenuModal
            open={menuModalOpen}
            onClose={() => setMenuModalOpen(false)}
            cafeName={effectiveSettings?.cafe_name}
          />
        )}

        <FloatingButtons
          settings={effectiveSettings}
          scrolled={scrolled}
          hidden={menuModalOpen}
          onScrollToTop={scrollToTop}
          theme={theme}
        />
      </Suspense>
    </div>
  );
}
