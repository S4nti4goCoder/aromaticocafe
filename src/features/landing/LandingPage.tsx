import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Coffee } from "lucide-react";
import { useCafeSettings } from "@/hooks/useCafeSettings";
import { useProducts } from "@/hooks/useProducts";
import { usePromotions } from "@/hooks/usePromotions";
import type { Product } from "@/types";
import { MenuModal } from "@/features/landing/MenuModal";
import { ReservaModal } from "@/features/landing/ReservaModal";
import { CAFE, type NavLink } from "./cafeTheme";
import { Navbar } from "./sections/Navbar";
import { HeroSection } from "./sections/HeroSection";
import { AboutSection } from "./sections/AboutSection";
import { FeaturedProductsSection } from "./sections/FeaturedProductsSection";
import { PromotionsSection } from "./sections/PromotionsSection";
import { GallerySection } from "./sections/GallerySection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { ReservationBanner } from "./sections/ReservationBanner";
import { ContactSection } from "./sections/ContactSection";
import { Footer } from "./sections/Footer";
import { FloatingButtons } from "./sections/FloatingButtons";

export function LandingPage() {
  const { settings, isLoading } = useCafeSettings();
  const { data: allProducts } = useProducts();
  const { data: allPromotions } = usePromotions();
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
    (p) => p.is_active && (settings?.featured_product_ids ?? []).includes(p.id),
  );

  const activePromotions = (allPromotions ?? []).filter((p) => p.is_active);

  const navLinks: NavLink[] = [
    {
      id: "nosotros",
      label: "Nuestra historia",
      show: !!(settings?.about_title || settings?.about_description),
    },
    {
      id: "menu",
      label: "Favoritos",
      show: featuredProducts.length > 0,
    },
    {
      id: "promociones",
      label: "Promociones",
      show: !!(settings?.show_promotions && activePromotions.length > 0),
    },
    {
      id: "galeria",
      label: "Galería",
      show: !!(settings?.gallery_urls && settings.gallery_urls.length > 0),
    },
    {
      id: "resenas",
      label: "Reseñas",
      show: !!(settings?.testimonials && settings.testimonials.length > 0),
    },
    {
      id: "contacto",
      label: "Contacto",
      show: !!(
        settings?.address ||
        settings?.maps_embed_url ||
        settings?.phone
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
          <Coffee className="h-10 w-10" style={{ color: CAFE.gold }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-sans overflow-x-hidden"
      style={{ backgroundColor: CAFE.bg, color: CAFE.text }}
    >
      <Navbar
        settings={settings}
        scrolled={scrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navLinks={navLinks}
        onNavClick={handleNavClick}
        onScrollToTop={scrollToTop}
        onOpenReserva={() => setReservaModalOpen(true)}
      />

      <HeroSection
        settings={settings}
        heroOpacity={heroOpacity}
        heroScale={heroScale}
        onOpenMenu={() => setMenuModalOpen(true)}
      />

      {settings && (settings.about_title || settings.about_description) && (
        <AboutSection settings={settings} />
      )}

      {featuredProducts.length > 0 && (
        <FeaturedProductsSection products={featuredProducts} />
      )}

      {settings?.show_promotions && activePromotions.length > 0 && (
        <PromotionsSection promotions={activePromotions} />
      )}

      {settings?.gallery_urls && settings.gallery_urls.length > 0 && (
        <GallerySection galleryUrls={settings.gallery_urls} />
      )}

      {settings?.testimonials && settings.testimonials.length > 0 && (
        <TestimonialsSection testimonials={settings.testimonials} />
      )}

      {settings?.reservation_title && (
        <ReservationBanner settings={settings} />
      )}

      <ContactSection settings={settings} />

      <Footer
        settings={settings}
        navLinks={navLinks}
        onNavClick={handleNavClick}
        onScrollToTop={scrollToTop}
      />

      <ReservaModal
        open={reservaModalOpen}
        onClose={() => setReservaModalOpen(false)}
        whatsapp={settings?.reservation_whatsapp ?? settings?.whatsapp}
        cafeName={settings?.cafe_name}
      />
      <MenuModal
        open={menuModalOpen}
        onClose={() => setMenuModalOpen(false)}
        cafeName={settings?.cafe_name}
      />

      <FloatingButtons
        settings={settings}
        scrolled={scrolled}
        hidden={menuModalOpen}
        onScrollToTop={scrollToTop}
      />
    </div>
  );
}
