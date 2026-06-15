import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Coffee } from "lucide-react";
import { useCafeSettings } from "@/hooks/useCafeSettings";
import { useBrandSettings } from "@/hooks/useBrandSettings";
import { useProducts } from "@/hooks/useProducts";
import { usePromotions } from "@/hooks/usePromotions";
import { useCategories } from "@/hooks/useCategories";
import { usePageMeta } from "@/hooks/usePageMeta";
import { logoToFaviconHref } from "@/lib/logo";
import type { CafeSettings, Product } from "@/types";
import { CAFE, buildCafeTheme, type NavLink } from "./cafeTheme";
import { Navbar } from "./sections/Navbar";
import { TopBar, TOP_BAR_HEIGHT } from "./sections/TopBar";
import { HeroSection } from "./sections/HeroSection";

const AboutSection = lazy(() =>
  import("./sections/AboutSection").then((m) => ({ default: m.AboutSection })),
);
const FeaturedProductsSection = lazy(() =>
  import("./sections/FeaturedProductsSection").then((m) => ({
    default: m.FeaturedProductsSection,
  })),
);
const CategoriesSection = lazy(() =>
  import("./sections/CategoriesSection").then((m) => ({
    default: m.CategoriesSection,
  })),
);
const PromotionsSection = lazy(() =>
  import("./sections/PromotionsSection").then((m) => ({
    default: m.PromotionsSection,
  })),
);
const StoreShowcaseSection = lazy(() =>
  import("./sections/StoreShowcaseSection").then((m) => ({
    default: m.StoreShowcaseSection,
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
  const { settings: systemSettings } = useBrandSettings();
  const { data: allProducts } = useProducts();
  const { data: allPromotions } = usePromotions();
  const { data: allCategories } = useCategories();

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

  const effectiveSettings = useMemo(() => {
    const base = previewOverrides
      ? ({ ...settings, ...previewOverrides } as CafeSettings)
      : settings;
    if (!base) return base;
    return {
      ...base,
      cafe_name: systemSettings?.cafe_name ?? base.cafe_name ?? "Aromático Café",
      logo_url: systemSettings?.logo_url ?? base.logo_url ?? null,
    } as CafeSettings;
  }, [settings, systemSettings, previewOverrides]);

  const theme = useMemo(
    () =>
      buildCafeTheme(
        effectiveSettings?.theme_mode,
        effectiveSettings?.primary_color,
        effectiveSettings?.secondary_color,
      ),
    [
      effectiveSettings?.theme_mode,
      effectiveSettings?.primary_color,
      effectiveSettings?.secondary_color,
    ],
  );

  usePageMeta(
    effectiveSettings?.cafe_name ?? "Aromático Café",
    logoToFaviconHref(effectiveSettings?.logo_url),
  );
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [reservaModalOpen, setReservaModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [menuModalCategoryId, setMenuModalCategoryId] = useState<string | undefined>(undefined);
  const { scrollY } = useScroll();

  // Si llegamos con ?reservar=1 (desde una página legal u otro link externo),
  // abrimos el modal de reserva y limpiamos el query para no reabrirlo al refresh.
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get("reservar") === "1") {
      setReservaModalOpen(true);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("reservar");
          return next;
        },
        { replace: true },
      );
    }
  }, [searchParams, setSearchParams]);

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

  // Track which section is currently in view (for navbar active link indicator).
  useEffect(() => {
    const sectionIds = [
      "nosotros",
      "menu",
      "categorias",
      "promociones",
      "espacio",
      "contacto",
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry with the largest visible portion in the viewport.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveSection(visible.target.id);
        }
      },
      {
        // Trigger when ~40% of the section is visible — feels natural.
        threshold: [0.4],
        rootMargin: "-80px 0px -40% 0px",
      },
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
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
      id: "categorias",
      label: "Categorías",
      show:
        !!effectiveSettings?.show_categories &&
        !!(allCategories && allCategories.length > 0),
    },
    {
      id: "promociones",
      label: "Promociones",
      show: !!(effectiveSettings?.show_promotions && activePromotions.length > 0),
    },
    {
      id: "espacio",
      label: "Nuestro espacio",
      show:
        effectiveSettings?.show_gallery !== false &&
        !!(effectiveSettings?.gallery_urls && effectiveSettings.gallery_urls.length > 0),
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

  const handleSelectCategory = (categoryId: string) => {
    setMenuModalCategoryId(categoryId);
    setMenuModalOpen(true);
  };

  const handleTopBarAction = () => {
    const type = effectiveSettings?.top_bar_action_type;
    const target = effectiveSettings?.top_bar_action_target;
    if (!type || type === "none" || !target) return;
    if (type === "section") {
      handleNavClick(target);
    } else if (type === "modal") {
      if (target === "reservation") setReservaModalOpen(true);
      else if (target === "menu") setMenuModalOpen(true);
    } else if (type === "promotion") {
      // Scroll to the promotions section; per-promo highlight comes later.
      handleNavClick("promociones");
    }
  };

  const topBarVisible = !!(
    effectiveSettings?.top_bar_enabled && effectiveSettings.top_bar_message
  );

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
      <TopBar
        settings={effectiveSettings}
        theme={theme}
        onAction={handleTopBarAction}
      />

      <Navbar
        settings={effectiveSettings}
        scrolled={scrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navLinks={navLinks}
        activeSection={activeSection}
        onNavClick={handleNavClick}
        onScrollToTop={scrollToTop}
        onOpenReserva={() => setReservaModalOpen(true)}
        theme={theme}
        topOffset={topBarVisible ? TOP_BAR_HEIGHT : 0}
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
          <FeaturedProductsSection
            products={featuredProducts}
            settings={effectiveSettings}
            theme={theme}
            onOpenMenu={() => {
              setMenuModalCategoryId(undefined);
              setMenuModalOpen(true);
            }}
          />
        )}

        {!!effectiveSettings?.show_categories &&
          !!(allCategories && allCategories.length > 0) && (
            <CategoriesSection
              categories={allCategories}
              products={allProducts ?? []}
              settings={effectiveSettings}
              theme={theme}
              onSelectCategory={handleSelectCategory}
              onOpenMenu={() => {
                setMenuModalCategoryId(undefined);
                setMenuModalOpen(true);
              }}
            />
          )}

        {!!effectiveSettings?.show_promotions && activePromotions.length > 0 && (
          <PromotionsSection
            promotions={activePromotions}
            settings={effectiveSettings}
            theme={theme}
          />
        )}

        {effectiveSettings?.show_gallery !== false &&
          !!effectiveSettings?.gallery_urls?.length && (
            <StoreShowcaseSection
              photoUrls={effectiveSettings.gallery_urls}
              settings={effectiveSettings}
              theme={theme}
            />
          )}

        {effectiveSettings?.show_contact !== false && (
          <ContactSection settings={effectiveSettings} theme={theme} />
        )}

        <Footer
          settings={effectiveSettings}
          navLinks={navLinks}
          onNavClick={handleNavClick}
          onScrollToTop={scrollToTop}
          onOpenReserva={() => setReservaModalOpen(true)}
          theme={theme}
        />

        {reservaModalOpen && (
          <ReservaModal
            open={reservaModalOpen}
            onClose={() => setReservaModalOpen(false)}
            whatsapp={effectiveSettings?.reservation_whatsapp ?? effectiveSettings?.whatsapp}
            cafeName={effectiveSettings?.cafe_name}
            theme={theme}
          />
        )}
        {menuModalOpen && (
          <MenuModal
            open={menuModalOpen}
            onClose={() => {
              setMenuModalOpen(false);
              setMenuModalCategoryId(undefined);
            }}
            cafeName={effectiveSettings?.cafe_name}
            theme={theme}
            initialCategoryId={menuModalCategoryId}
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
