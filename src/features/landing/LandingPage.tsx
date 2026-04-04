import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  AtSign,
  ExternalLink,
  Coffee,
  ChevronDown,
  Star,
  Quote,
  Camera,
  Users,
  Calendar,
  Menu,
  X,
} from "lucide-react";
import { useCafeSettings } from "@/hooks/useCafeSettings";
import { useProducts } from "@/hooks/useProducts";
import { usePromotions } from "@/hooks/usePromotions";
import type { Product } from "@/types";

const CAFE = {
  bg: "#0f0d0b",
  bgCard: "#1a1612",
  bgSection: "#141210",
  bgLight: "#1f1a15",
  border: "#2a2318",
  borderGold: "#8b6914",
  gold: "#d4a847",
  goldLight: "#e8c76a",
  amber: "#c8864a",
  text: "#f5f0e8",
  textMuted: "#a89880",
  textFaint: "#5a4f42",
  white: "#ffffff",
};

export function LandingPage() {
  const { settings, isLoading } = useCafeSettings();
  const { data: allProducts } = useProducts();
  const { data: allPromotions } = usePromotions();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.08]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (scrolled) setMobileMenuOpen(false);
  }, [scrolled]);

  const featuredProducts: Product[] = (allProducts ?? []).filter(
    (p) => p.is_active && (settings?.featured_product_ids ?? []).includes(p.id),
  );

  const activePromotions = (allPromotions ?? []).filter((p) => p.is_active);

  const navLinks = [
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
      {/* ── NAVBAR ── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: scrolled ? "rgba(15,13,11,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
          borderBottom: scrolled ? `1px solid ${CAFE.border}` : "none",
          paddingTop: scrolled ? "14px" : "24px",
          paddingBottom: scrolled ? "14px" : "24px",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-3 shrink-0 cursor-pointer group"
          >
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt="Logo"
                className="h-9 w-9 rounded-full object-cover transition-all group-hover:opacity-80"
                style={{ border: `2px solid ${CAFE.borderGold}` }}
              />
            ) : (
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center transition-all group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${CAFE.gold}, ${CAFE.amber})`,
                }}
              >
                <Coffee className="h-4 w-4 text-black" />
              </div>
            )}
            <span
              className="font-bold text-sm tracking-wide transition-opacity group-hover:opacity-70"
              style={{ color: CAFE.text }}
            >
              {settings?.cafe_name ?? "Aromático Café"}
            </span>
          </button>

          {/* Links desktop */}
          {navLinks.length > 0 && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className="text-sm px-4 py-2 rounded-full transition-all duration-200 font-semibold cursor-pointer hover:text-white"
                  style={{ color: CAFE.text }}
                >
                  {link.label}
                </button>
              ))}
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-3 shrink-0">
            {settings?.reservation_whatsapp && (
              <motion.a
                href={`https://wa.me/${settings.reservation_whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="hidden sm:flex items-center gap-2 text-xs px-5 py-2.5 rounded-full font-semibold cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${CAFE.gold}, ${CAFE.amber})`,
                  color: "#0f0d0b",
                }}
              >
                <Calendar className="h-3 w-3" />
                Reservar
              </motion.a>
            )}
            <Link
              to="/login"
              className="text-xs px-5 py-2.5 rounded-full transition-all duration-300 font-medium cursor-pointer"
              style={{
                border: `1px solid ${CAFE.border}`,
                color: CAFE.textMuted,
              }}
            >
              Acceder
            </Link>

            {navLinks.length > 0 && (
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="md:hidden p-2.5 rounded-full transition-all cursor-pointer"
                style={{
                  backgroundColor: CAFE.bgCard,
                  border: `1px solid ${CAFE.border}`,
                  color: CAFE.textMuted,
                }}
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Menú móvil */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="md:hidden px-6 pb-5 pt-3 flex flex-col gap-1"
            style={{
              backgroundColor: "rgba(15,13,11,0.97)",
              borderBottom: `1px solid ${CAFE.border}`,
            }}
          >
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="text-sm text-left px-4 py-3 rounded-xl transition-all font-medium cursor-pointer hover:text-white"
                style={{ color: CAFE.textMuted }}
              >
                {link.label}
              </button>
            ))}
            {settings?.reservation_whatsapp && (
              
              <a  href={`https://wa.me/${settings.reservation_whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl font-semibold mt-2 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${CAFE.gold}, ${CAFE.amber})`,
                  color: "#0f0d0b",
                }}
              >
                <Calendar className="h-4 w-4" />
                Reservar mesa
              </a>
            )}
          </motion.div>
        )}
      </motion.nav>

      {/* ── HERO ── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ scale: heroScale }}>
          {settings?.cover_url ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${settings.cover_url})` }}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ backgroundColor: CAFE.bgLight }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    radial-gradient(ellipse at 20% 50%, ${CAFE.gold}10 0%, transparent 60%),
                    radial-gradient(ellipse at 80% 20%, ${CAFE.amber}08 0%, transparent 50%)
                  `,
                }}
              />
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{
              background: settings?.cover_url
                ? "linear-gradient(to bottom, rgba(15,13,11,0.55) 0%, rgba(15,13,11,0.3) 40%, rgba(15,13,11,0.85) 100%)"
                : "transparent",
            }}
          />
        </motion.div>

        <motion.div
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase"
              style={{
                backgroundColor: `${CAFE.gold}15`,
                border: `1px solid ${CAFE.borderGold}`,
                color: CAFE.gold,
              }}
            >
              <Coffee className="h-3 w-3" />
              Bienvenidos
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="font-black tracking-tight leading-none mb-6"
            style={{
              color: CAFE.white,
              fontSize: "clamp(3rem, 10vw, 8rem)",
              textShadow: "0 4px 40px rgba(0,0,0,0.5)",
            }}
          >
            {settings?.cafe_name ?? "Aromático Café"}
          </motion.h1>

          {settings?.slogan && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed"
              style={{ color: "rgba(245,240,232,0.75)" }}
            >
              {settings.slogan}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <motion.button
              onClick={() => handleNavClick("menu")}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${CAFE.gold}, ${CAFE.amber})`,
                color: "#0f0d0b",
                boxShadow: `0 8px 32px ${CAFE.gold}30`,
              }}
            >
              <Coffee className="h-4 w-4" />
              Ver menú
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <span
            className="text-xs tracking-[0.3em] uppercase font-medium"
            style={{ color: CAFE.textFaint }}
          >
            Scroll
          </span>
          <ChevronDown className="h-4 w-4" style={{ color: CAFE.textFaint }} />
        </motion.div>
      </section>

      {/* ── SOBRE NOSOTROS ── */}
      {(settings?.about_title || settings?.about_description) && (
        <section
          id="nosotros"
          className="min-h-screen px-6 flex flex-col justify-center py-24"
          style={{ backgroundColor: CAFE.bgSection }}
        >
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <p
                  className="text-xs font-bold tracking-[0.4em] uppercase mb-5"
                  style={{ color: CAFE.gold }}
                >
                  Quiénes somos
                </p>
                <h2
                  className="text-4xl sm:text-6xl font-black mb-8 leading-tight"
                  style={{ color: CAFE.text }}
                >
                  {settings.about_title}
                </h2>
                <div
                  className="h-px w-16 mb-8"
                  style={{
                    background: `linear-gradient(90deg, ${CAFE.gold}, transparent)`,
                  }}
                />
                <p
                  className="leading-relaxed text-base"
                  style={{ color: CAFE.textMuted }}
                >
                  {settings.about_description}
                </p>
                <div className="grid grid-cols-3 gap-4 mt-10">
                  {[
                    { value: "6+", label: "Años" },
                    { value: "50+", label: "Productos" },
                    { value: "1K+", label: "Clientes" },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="text-center p-5 rounded-2xl"
                      style={{
                        backgroundColor: CAFE.bgCard,
                        border: `1px solid ${CAFE.border}`,
                      }}
                    >
                      <p
                        className="text-3xl font-black"
                        style={{ color: CAFE.gold }}
                      >
                        {stat.value}
                      </p>
                      <p
                        className="text-xs mt-1 font-medium"
                        style={{ color: CAFE.textFaint }}
                      >
                        {stat.label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {settings.about_image_url ? (
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="relative"
                >
                  <img
                    src={settings.about_image_url}
                    alt="Sobre nosotros"
                    className="w-full h-125 object-cover rounded-3xl"
                    style={{ border: `1px solid ${CAFE.border}` }}
                  />
                  <div
                    className="absolute -bottom-5 -right-5 p-5 rounded-2xl shadow-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${CAFE.gold}, ${CAFE.amber})`,
                    }}
                  >
                    <Users className="h-6 w-6 text-black" />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="relative h-100 rounded-3xl flex items-center justify-center"
                  style={{
                    backgroundColor: CAFE.bgCard,
                    border: `1px solid ${CAFE.border}`,
                  }}
                >
                  <Coffee
                    className="h-24 w-24 opacity-10"
                    style={{ color: CAFE.gold }}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── PRODUCTOS DESTACADOS ── */}
      {featuredProducts.length > 0 && (
        <section
          id="menu"
          className="min-h-screen px-6 flex flex-col justify-center py-24"
          style={{ backgroundColor: CAFE.bg }}
        >
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <p
                className="text-xs font-bold tracking-[0.4em] uppercase mb-4"
                style={{ color: CAFE.gold }}
              >
                Selección especial
              </p>
              <h2
                className="text-4xl sm:text-6xl font-black leading-tight"
                style={{ color: CAFE.text }}
              >
                Nuestros{" "}
                <span style={{ color: CAFE.gold }}>Favoritos</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="group rounded-2xl overflow-hidden cursor-pointer"
                  style={{
                    backgroundColor: CAFE.bgCard,
                    border: `1px solid ${CAFE.border}`,
                  }}
                >
                  <div className="relative h-56 overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: CAFE.bgLight }}
                      >
                        <Coffee
                          className="h-16 w-16 opacity-10"
                          style={{ color: CAFE.gold }}
                        />
                      </div>
                    )}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(to top, ${CAFE.bg}90, transparent)`,
                      }}
                    />
                    <div
                      className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${CAFE.gold}, ${CAFE.amber})`,
                        color: "#0f0d0b",
                      }}
                    >
                      ${product.price?.toLocaleString("es-CO")}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3
                      className="font-bold text-lg mb-2"
                      style={{ color: CAFE.text }}
                    >
                      {product.name}
                    </h3>
                    {product.description && (
                      <p
                        className="text-sm line-clamp-2 leading-relaxed"
                        style={{ color: CAFE.textMuted }}
                      >
                        {product.description}
                      </p>
                    )}
                  </div>
                  <div
                    className="h-0.5 w-0 group-hover:w-full transition-all duration-500"
                    style={{
                      background: `linear-gradient(90deg, ${CAFE.gold}, ${CAFE.amber})`,
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PROMOCIONES ── */}
      {settings?.show_promotions && activePromotions.length > 0 && (
        <section
          id="promociones"
          className="min-h-screen px-6 flex flex-col justify-center py-24"
          style={{ backgroundColor: CAFE.bgSection }}
        >
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <p
                className="text-xs font-bold tracking-[0.4em] uppercase mb-4"
                style={{ color: CAFE.gold }}
              >
                Ofertas especiales
              </p>
              <h2
                className="text-4xl sm:text-6xl font-black"
                style={{ color: CAFE.text }}
              >
                Promociones
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePromotions.map((promo, index) => (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="p-7 rounded-2xl relative overflow-hidden"
                  style={{
                    backgroundColor: CAFE.bgCard,
                    border: `1px solid ${CAFE.border}`,
                  }}
                >
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-12 translate-x-12 opacity-5"
                    style={{ backgroundColor: CAFE.gold }}
                  />
                  <div className="relative z-10">
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5"
                      style={{
                        backgroundColor: `${CAFE.gold}12`,
                        border: `1px solid ${CAFE.borderGold}`,
                        color: CAFE.gold,
                      }}
                    >
                      <Star className="h-3 w-3 fill-current" />
                      {promo.type === "2x1"
                        ? "2x1"
                        : promo.type === "descuento_porcentaje"
                          ? `${promo.value}% OFF`
                          : promo.type === "precio_fijo"
                            ? `$${promo.value?.toLocaleString("es-CO")}`
                            : "Oferta"}
                    </div>
                    <h3
                      className="font-bold text-xl mb-3"
                      style={{ color: CAFE.text }}
                    >
                      {promo.name}
                    </h3>
                    {promo.description && (
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: CAFE.textMuted }}
                      >
                        {promo.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── GALERÍA ── */}
      {settings?.gallery_urls && settings.gallery_urls.length > 0 && (
        <section
          id="galeria"
          className="min-h-screen px-6 flex flex-col justify-center py-24"
          style={{ backgroundColor: CAFE.bg }}
        >
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <p
                className="text-xs font-bold tracking-[0.4em] uppercase mb-4"
                style={{ color: CAFE.gold }}
              >
                Nuestro espacio
              </p>
              <h2
                className="text-4xl sm:text-6xl font-black"
                style={{ color: CAFE.text }}
              >
                Galería
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {settings.gallery_urls.map((url, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ scale: 1.03 }}
                  className={`relative overflow-hidden rounded-2xl cursor-pointer ${index === 0 ? "col-span-2 row-span-2" : ""}`}
                  style={{ border: `1px solid ${CAFE.border}` }}
                >
                  <img
                    src={url}
                    alt={`Galería ${index + 1}`}
                    className={`w-full object-cover transition-transform duration-700 hover:scale-110 ${index === 0 ? "h-64 sm:h-80" : "h-36 sm:h-48"}`}
                  />
                  <div
                    className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                    style={{ backgroundColor: "rgba(15,13,11,0.5)" }}
                  >
                    <Camera
                      className="h-8 w-8"
                      style={{ color: CAFE.goldLight }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIOS ── */}
      {settings?.testimonials && settings.testimonials.length > 0 && (
        <section
          id="resenas"
          className="min-h-screen px-6 flex flex-col justify-center py-24"
          style={{ backgroundColor: CAFE.bgSection }}
        >
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <p
                className="text-xs font-bold tracking-[0.4em] uppercase mb-4"
                style={{ color: CAFE.gold }}
              >
                Lo que dicen
              </p>
              <h2
                className="text-4xl sm:text-6xl font-black"
                style={{ color: CAFE.text }}
              >
                Nuestros Clientes
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {settings.testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="p-7 rounded-2xl"
                  style={{
                    backgroundColor: CAFE.bgCard,
                    border: `1px solid ${CAFE.border}`,
                  }}
                >
                  <Quote
                    className="h-8 w-8 mb-5 opacity-30"
                    style={{ color: CAFE.gold }}
                  />
                  <p
                    className="text-sm leading-relaxed mb-6 italic"
                    style={{ color: CAFE.textMuted }}
                  >
                    "{testimonial.comment}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{
                          background: `linear-gradient(135deg, ${CAFE.gold}20, ${CAFE.amber}20)`,
                          border: `1px solid ${CAFE.borderGold}`,
                          color: CAFE.gold,
                        }}
                      >
                        {testimonial.name.charAt(0)}
                      </div>
                      <p
                        className="font-semibold text-sm"
                        style={{ color: CAFE.text }}
                      >
                        {testimonial.name}
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-3.5 w-3.5"
                          style={{
                            color:
                              i < testimonial.rating ? CAFE.gold : CAFE.border,
                            fill:
                              i < testimonial.rating
                                ? CAFE.gold
                                : "transparent",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BANNER RESERVAS ── */}
      {settings?.reservation_title && (
        <section className="py-24 px-6 relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${CAFE.gold}18 0%, ${CAFE.amber}10 50%, ${CAFE.gold}08 100%)`,
              backgroundColor: CAFE.bgLight,
            }}
          />
          <div
            className="absolute inset-0"
            style={{ border: `1px solid ${CAFE.borderGold}` }}
          />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div
                className="inline-flex items-center justify-center p-4 rounded-2xl mb-8"
                style={{
                  backgroundColor: `${CAFE.gold}12`,
                  border: `1px solid ${CAFE.borderGold}`,
                }}
              >
                <Calendar className="h-8 w-8" style={{ color: CAFE.gold }} />
              </div>
              <h2
                className="text-3xl sm:text-5xl font-black mb-5"
                style={{ color: CAFE.text }}
              >
                {settings.reservation_title}
              </h2>
              {settings.reservation_description && (
                <p
                  className="text-lg mb-10 max-w-xl mx-auto leading-relaxed"
                  style={{ color: CAFE.textMuted }}
                >
                  {settings.reservation_description}
                </p>
              )}
              {settings.reservation_whatsapp && (
                <motion.a
                  href={`https://wa.me/${settings.reservation_whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-3 px-9 py-4 rounded-full font-bold text-sm cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${CAFE.gold}, ${CAFE.amber})`,
                    color: "#0f0d0b",
                    boxShadow: `0 8px 40px ${CAFE.gold}30`,
                  }}
                >
                  <MessageCircle className="h-5 w-5" />
                  Reservar por WhatsApp
                </motion.a>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── HORARIOS Y CONTACTO ── */}
      <section
        id="contacto"
        className="min-h-screen px-6 flex flex-col justify-center py-24"
        style={{ backgroundColor: CAFE.bg }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <p
              className="text-xs font-bold tracking-[0.4em] uppercase mb-4"
              style={{ color: CAFE.gold }}
            >
              Encuéntranos
            </p>
            <h2
              className="text-4xl sm:text-6xl font-black"
              style={{ color: CAFE.text }}
            >
              Visítanos
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Horarios */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="rounded-2xl p-8"
              style={{
                backgroundColor: CAFE.bgCard,
                border: `1px solid ${CAFE.border}`,
              }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div
                  className="p-3 rounded-xl"
                  style={{
                    backgroundColor: `${CAFE.gold}10`,
                    border: `1px solid ${CAFE.borderGold}`,
                  }}
                >
                  <Clock className="h-5 w-5" style={{ color: CAFE.gold }} />
                </div>
                <div>
                  <h3
                    className="font-bold text-lg"
                    style={{ color: CAFE.text }}
                  >
                    Horarios
                  </h3>
                  <p className="text-xs" style={{ color: CAFE.textFaint }}>
                    Siempre listos para servirte
                  </p>
                </div>
              </div>
              {[
                { label: "Lunes — Viernes", value: settings?.monday_friday },
                { label: "Sábado", value: settings?.saturday },
                { label: "Domingo", value: settings?.sunday },
              ]
                .filter((h) => h.value)
                .map((horario, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-4"
                    style={{ borderBottom: `1px solid ${CAFE.border}` }}
                  >
                    <span className="text-sm" style={{ color: CAFE.textMuted }}>
                      {horario.label}
                    </span>
                    <span
                      className="text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          horario.value?.toLowerCase() === "cerrado"
                            ? "rgba(220,38,38,0.1)"
                            : `${CAFE.gold}10`,
                        color:
                          horario.value?.toLowerCase() === "cerrado"
                            ? "#ef4444"
                            : CAFE.gold,
                        border: `1px solid ${
                          horario.value?.toLowerCase() === "cerrado"
                            ? "rgba(220,38,38,0.2)"
                            : CAFE.borderGold
                        }`,
                      }}
                    >
                      {horario.value}
                    </span>
                  </div>
                ))}
            </motion.div>

            {/* Contacto */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="rounded-2xl p-8"
              style={{
                backgroundColor: CAFE.bgCard,
                border: `1px solid ${CAFE.border}`,
              }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div
                  className="p-3 rounded-xl"
                  style={{
                    backgroundColor: `${CAFE.gold}10`,
                    border: `1px solid ${CAFE.borderGold}`,
                  }}
                >
                  <Phone className="h-5 w-5" style={{ color: CAFE.gold }} />
                </div>
                <div>
                  <h3
                    className="font-bold text-lg"
                    style={{ color: CAFE.text }}
                  >
                    Contacto
                  </h3>
                  <p className="text-xs" style={{ color: CAFE.textFaint }}>
                    Con gusto te atendemos
                  </p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                {settings?.address && (
                  <div
                    className="flex items-start gap-4 p-4 rounded-xl"
                    style={{
                      backgroundColor: CAFE.bgLight,
                      border: `1px solid ${CAFE.border}`,
                    }}
                  >
                    <MapPin
                      className="h-4 w-4 mt-0.5 shrink-0"
                      style={{ color: CAFE.gold }}
                    />
                    <span className="text-sm" style={{ color: CAFE.textMuted }}>
                      {settings.address}
                    </span>
                  </div>
                )}
                {settings?.phone && (
                  <motion.a
                    href={`tel:${settings.phone}`}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer"
                    style={{
                      backgroundColor: CAFE.bgLight,
                      border: `1px solid ${CAFE.border}`,
                    }}
                  >
                    <Phone
                      className="h-4 w-4 shrink-0"
                      style={{ color: CAFE.gold }}
                    />
                    <span className="text-sm" style={{ color: CAFE.textMuted }}>
                      {settings.phone}
                    </span>
                  </motion.a>
                )}
                {settings?.email && (
                  <motion.a
                    href={`mailto:${settings.email}`}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer"
                    style={{
                      backgroundColor: CAFE.bgLight,
                      border: `1px solid ${CAFE.border}`,
                    }}
                  >
                    <Mail
                      className="h-4 w-4 shrink-0"
                      style={{ color: CAFE.gold }}
                    />
                    <span className="text-sm" style={{ color: CAFE.textMuted }}>
                      {settings.email}
                    </span>
                  </motion.a>
                )}
              </div>
              {(settings?.instagram_url || settings?.facebook_url) && (
                <div
                  className="pt-5"
                  style={{ borderTop: `1px solid ${CAFE.border}` }}
                >
                  <p
                    className="text-xs uppercase tracking-widest mb-4 font-medium"
                    style={{ color: CAFE.textFaint }}
                  >
                    Síguenos
                  </p>
                  <div className="flex items-center gap-3">
                    {settings?.instagram_url && (
                      <motion.a
                        href={settings.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.06, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium cursor-pointer"
                        style={{
                          backgroundColor: CAFE.bgLight,
                          border: `1px solid ${CAFE.border}`,
                          color: CAFE.textMuted,
                        }}
                      >
                        <AtSign className="h-3.5 w-3.5" />
                        Instagram
                      </motion.a>
                    )}
                    {settings?.facebook_url && (
                      <motion.a
                        href={settings.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.06, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium cursor-pointer"
                        style={{
                          backgroundColor: CAFE.bgLight,
                          border: `1px solid ${CAFE.border}`,
                          color: CAFE.textMuted,
                        }}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Facebook
                      </motion.a>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Mapa */}
          {settings?.maps_embed_url && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="rounded-2xl overflow-hidden"
              style={{
                border: `1px solid ${CAFE.border}`,
                height: "400px",
              }}
            >
              <iframe
                src={settings.maps_embed_url}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="py-10 px-6"
        style={{
          backgroundColor: CAFE.bgSection,
          borderTop: `1px solid ${CAFE.border}`,
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={scrollToTop}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${CAFE.gold}, ${CAFE.amber})`,
              }}
            >
              <Coffee className="h-3.5 w-3.5 text-black" />
            </div>
            <span
              className="text-sm font-semibold transition-opacity group-hover:opacity-70"
              style={{ color: CAFE.textMuted }}
            >
              {settings?.cafe_name ?? "Aromático Café"}
            </span>
          </button>

          <div className="flex items-center gap-6 flex-wrap justify-center">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="text-xs cursor-pointer transition-colors hover:text-white"
                style={{ color: CAFE.textFaint }}
              >
                {link.label}
              </button>
            ))}
          </div>

          <p className="text-xs" style={{ color: CAFE.textFaint }}>
            © {new Date().getFullYear()} · Todos los derechos reservados
          </p>
        </div>
      </footer>

      {/* ── BOTONES FLOTANTES ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
        {(settings?.whatsapp || settings?.reservation_whatsapp) && (
          <motion.a
            href={`https://wa.me/${(settings?.whatsapp || settings?.reservation_whatsapp)?.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 rounded-full cursor-pointer"
            style={{
              backgroundColor: "#25D366",
              boxShadow: "0 8px 32px rgba(37,211,102,0.35)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="white"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </motion.a>
        )}

        <motion.button
          onClick={scrollToTop}
          initial={{ scale: 0, opacity: 0 }}
          animate={
            scrolled ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }
          }
          transition={{ duration: 0.2 }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.95 }}
          className="p-4 rounded-full cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${CAFE.gold}, ${CAFE.amber})`,
            boxShadow: `0 8px 32px ${CAFE.gold}35`,
          }}
        >
          <ChevronDown className="h-6 w-6 text-black rotate-180" />
        </motion.button>
      </div>
    </div>
  );
}