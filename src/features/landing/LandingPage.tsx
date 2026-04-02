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
  Leaf,
  Star,
  Quote,
  Camera,
  Users,
  Calendar,
} from "lucide-react";
import { useCafeSettings } from "@/hooks/useCafeSettings";
import { useProducts } from "@/hooks/useProducts";
import { usePromotions } from "@/hooks/usePromotions";
import type { Product } from "@/types";

const CAFE = {
  bg: "#faf6f1",
  bgCard: "#ffffff",
  bgSection: "#f3ede4",
  bgDark: "#1c1410",
  border: "#e8ddd0",
  borderLight: "#f0e8dc",
  primary: "#a0522d",
  secondary: "#c8864a",
  text: "#1c1410",
  textMuted: "#7a6555",
  textFaint: "#c4b5a5",
  white: "#ffffff",
};

export function LandingPage() {
  const { settings, isLoading } = useCafeSettings();
  const { data: allProducts } = useProducts();
  const { data: allPromotions } = usePromotions();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  const heroY = useTransform(scrollY, [0, 600], [0, 160]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const featuredProducts: Product[] = (allProducts ?? []).filter(
    (p) => p.is_active && (settings?.featured_product_ids ?? []).includes(p.id),
  );

  const activePromotions = (allPromotions ?? []).filter((p) => p.is_active);

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
          <Coffee className="h-10 w-10" style={{ color: CAFE.primary }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-sans overflow-x-hidden"
      style={{ backgroundColor: CAFE.bg, color: CAFE.text }}
    >
      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: scrolled ? `${CAFE.bg}f5` : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? `1px solid ${CAFE.border}` : "none",
          paddingTop: scrolled ? "12px" : "20px",
          paddingBottom: scrolled ? "12px" : "20px",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt="Logo"
                className="h-8 w-8 rounded-full object-cover"
                style={{ border: `1px solid ${CAFE.border}` }}
              />
            ) : (
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: CAFE.primary }}
              >
                <Coffee className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="font-bold text-sm" style={{ color: CAFE.text }}>
              {settings?.cafe_name ?? "Aromático Café"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {settings?.reservation_whatsapp && (
              <motion.a
                href={`https://wa.me/${settings.reservation_whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="hidden sm:flex items-center gap-2 text-xs px-4 py-2 rounded-full font-medium transition-all"
                style={{ backgroundColor: CAFE.primary, color: CAFE.white }}
              >
                <Calendar className="h-3 w-3" />
                Reservar mesa
              </motion.a>
            )}
            <Link
              to="/login"
              className="text-xs px-5 py-2 rounded-full transition-all duration-300 font-medium"
              style={{
                border: `1px solid ${CAFE.border}`,
                color: CAFE.textMuted,
                backgroundColor: CAFE.white,
              }}
            >
              Acceder
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          {settings?.cover_url ? (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center scale-110"
                style={{ backgroundImage: `url(${settings.cover_url})` }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to bottom, ${CAFE.bg}80, ${CAFE.bg}50, ${CAFE.bg})`,
                }}
              />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{ backgroundColor: CAFE.bg }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                  radial-gradient(ellipse at 15% 50%, ${CAFE.secondary}18 0%, transparent 55%),
                  radial-gradient(ellipse at 85% 30%, ${CAFE.primary}12 0%, transparent 50%)
                `,
                }}
              />
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage: `radial-gradient(circle, ${CAFE.border} 1px, transparent 1px)`,
                  backgroundSize: "32px 32px",
                }}
              />
            </div>
          )}
        </motion.div>

        <motion.div
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div
              className="p-4 rounded-2xl shadow-sm"
              style={{
                backgroundColor: CAFE.white,
                border: `1px solid ${CAFE.border}`,
              }}
            >
              <Coffee className="h-7 w-7" style={{ color: CAFE.primary }} />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xs font-semibold tracking-[0.4em] uppercase mb-5"
            style={{ color: CAFE.secondary }}
          >
            Bienvenidos
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="text-6xl sm:text-8xl font-black tracking-tight mb-5 leading-none"
            style={{ color: CAFE.text }}
          >
            {settings?.cafe_name ?? "Aromático Café"}
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div
              className="h-px w-14"
              style={{ backgroundColor: CAFE.border }}
            />
            <Leaf className="h-3.5 w-3.5" style={{ color: CAFE.secondary }} />
            <div
              className="h-px w-14"
              style={{ backgroundColor: CAFE.border }}
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="text-base sm:text-lg mb-10 max-w-lg mx-auto leading-relaxed"
            style={{ color: CAFE.textMuted }}
          >
            {settings?.slogan ?? "El mejor café de la ciudad"}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="flex items-center justify-center gap-3 flex-wrap"
          >
            <motion.a
              href="#menu"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold shadow-md"
              style={{
                backgroundColor: CAFE.primary,
                color: CAFE.white,
                boxShadow: `0 4px 20px ${CAFE.primary}30`,
              }}
            >
              <Coffee className="h-4 w-4" />
              Ver menú
            </motion.a>
            {settings?.whatsapp && (
              <motion.a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: CAFE.white,
                  border: `1px solid ${CAFE.border}`,
                  color: CAFE.textMuted,
                }}
              >
                <MessageCircle className="h-4 w-4" />
                Escríbenos
              </motion.a>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <span
            className="text-xs tracking-widest uppercase"
            style={{ color: CAFE.textFaint }}
          >
            Scroll
          </span>
          <ChevronDown className="h-4 w-4" style={{ color: CAFE.textFaint }} />
        </motion.div>
      </section>

      {/* SOBRE NOSOTROS */}
      {(settings?.about_title || settings?.about_description) && (
        <section
          className="py-28 px-6"
          style={{ backgroundColor: CAFE.bgSection }}
        >
          <div
            className="h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${CAFE.border}, transparent)`,
            }}
          />
          <div className="max-w-6xl mx-auto pt-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <p
                  className="text-xs font-semibold tracking-[0.4em] uppercase mb-4"
                  style={{ color: CAFE.secondary }}
                >
                  Quiénes somos
                </p>
                <h2
                  className="text-4xl sm:text-5xl font-black mb-6"
                  style={{ color: CAFE.text }}
                >
                  {settings.about_title}
                </h2>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="h-px w-10"
                    style={{ backgroundColor: CAFE.border }}
                  />
                  <Coffee
                    className="h-3 w-3"
                    style={{ color: CAFE.secondary }}
                  />
                </div>
                <p
                  className="leading-relaxed text-base"
                  style={{ color: CAFE.textMuted }}
                >
                  {settings.about_description}
                </p>
                <div className="grid grid-cols-3 gap-4 mt-8">
                  {[
                    { value: "6+", label: "Años de experiencia" },
                    { value: "50+", label: "Productos en menú" },
                    { value: "1000+", label: "Clientes felices" },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="text-center p-4 rounded-2xl"
                      style={{
                        backgroundColor: CAFE.bgCard,
                        border: `1px solid ${CAFE.border}`,
                      }}
                    >
                      <p
                        className="text-2xl font-black"
                        style={{ color: CAFE.primary }}
                      >
                        {stat.value}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: CAFE.textMuted }}
                      >
                        {stat.label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {settings.about_image_url && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="relative"
                >
                  <img
                    src={settings.about_image_url}
                    alt="Sobre nosotros"
                    className="w-full h-96 object-cover rounded-3xl shadow-lg"
                  />
                  <div
                    className="absolute -bottom-4 -left-4 p-4 rounded-2xl shadow-lg"
                    style={{ backgroundColor: CAFE.primary }}
                  >
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* PRODUCTOS DESTACADOS */}
      {featuredProducts.length > 0 && (
        <section
          id="menu"
          className="py-28 px-6"
          style={{ backgroundColor: CAFE.bg }}
        >
          <div
            className="h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${CAFE.border}, transparent)`,
            }}
          />
          <div className="max-w-6xl mx-auto pt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p
                className="text-xs font-semibold tracking-[0.4em] uppercase mb-3"
                style={{ color: CAFE.secondary }}
              >
                Selección especial
              </p>
              <h2
                className="text-4xl sm:text-5xl font-black mb-4"
                style={{ color: CAFE.text }}
              >
                Nuestros Favoritos
              </h2>
              <div className="flex items-center justify-center gap-3">
                <div
                  className="h-px w-10"
                  style={{ backgroundColor: CAFE.border }}
                />
                <Coffee className="h-3 w-3" style={{ color: CAFE.secondary }} />
                <div
                  className="h-px w-10"
                  style={{ backgroundColor: CAFE.border }}
                />
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  whileHover={{ y: -5 }}
                  className="group rounded-2xl overflow-hidden transition-all duration-300"
                  style={{
                    backgroundColor: CAFE.bgCard,
                    border: `1px solid ${CAFE.border}`,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <div className="relative h-52 overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: CAFE.bgSection }}
                      >
                        <Coffee
                          className="h-12 w-12 opacity-20"
                          style={{ color: CAFE.primary }}
                        />
                      </div>
                    )}
                    <div
                      className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-md"
                      style={{
                        backgroundColor: CAFE.primary,
                        color: CAFE.white,
                      }}
                    >
                      ${product.price?.toLocaleString("es-CO")}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3
                      className="font-bold text-base mb-1.5"
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
                    style={{ backgroundColor: CAFE.primary }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PROMOCIONES */}
      {settings?.show_promotions && activePromotions.length > 0 && (
        <section
          className="py-28 px-6"
          style={{ backgroundColor: CAFE.bgSection }}
        >
          <div
            className="h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${CAFE.border}, transparent)`,
            }}
          />
          <div className="max-w-6xl mx-auto pt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p
                className="text-xs font-semibold tracking-[0.4em] uppercase mb-3"
                style={{ color: CAFE.secondary }}
              >
                Ofertas especiales
              </p>
              <h2
                className="text-4xl sm:text-5xl font-black mb-4"
                style={{ color: CAFE.text }}
              >
                Promociones
              </h2>
              <div className="flex items-center justify-center gap-3">
                <div
                  className="h-px w-10"
                  style={{ backgroundColor: CAFE.border }}
                />
                <Star className="h-3 w-3" style={{ color: CAFE.secondary }} />
                <div
                  className="h-px w-10"
                  style={{ backgroundColor: CAFE.border }}
                />
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activePromotions.map((promo, index) => (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="p-6 rounded-2xl relative overflow-hidden"
                  style={{
                    backgroundColor: CAFE.bgCard,
                    border: `1px solid ${CAFE.border}`,
                  }}
                >
                  <div
                    className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 opacity-10"
                    style={{ backgroundColor: CAFE.primary }}
                  />
                  <div className="relative z-10">
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4"
                      style={{
                        backgroundColor: `${CAFE.primary}15`,
                        color: CAFE.primary,
                        border: `1px solid ${CAFE.border}`,
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
                      className="font-bold text-lg mb-2"
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

      {/* GALERÍA */}
      {settings?.gallery_urls && settings.gallery_urls.length > 0 && (
        <section className="py-28 px-6" style={{ backgroundColor: CAFE.bg }}>
          <div
            className="h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${CAFE.border}, transparent)`,
            }}
          />
          <div className="max-w-6xl mx-auto pt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p
                className="text-xs font-semibold tracking-[0.4em] uppercase mb-3"
                style={{ color: CAFE.secondary }}
              >
                Nuestro espacio
              </p>
              <h2
                className="text-4xl sm:text-5xl font-black mb-4"
                style={{ color: CAFE.text }}
              >
                Galería
              </h2>
              <div className="flex items-center justify-center gap-3">
                <div
                  className="h-px w-10"
                  style={{ backgroundColor: CAFE.border }}
                />
                <Camera className="h-3 w-3" style={{ color: CAFE.secondary }} />
                <div
                  className="h-px w-10"
                  style={{ backgroundColor: CAFE.border }}
                />
              </div>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {settings.gallery_urls.map((url, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ scale: 1.03 }}
                  className={`relative overflow-hidden rounded-2xl ${index === 0 ? "col-span-2 row-span-2" : ""}`}
                  style={{ border: `1px solid ${CAFE.border}` }}
                >
                  <img
                    src={url}
                    alt={`Galería ${index + 1}`}
                    className={`w-full object-cover ${index === 0 ? "h-64 sm:h-80" : "h-36 sm:h-48"} group-hover:scale-105 transition-transform duration-500`}
                  />
                  <div
                    className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                    style={{ backgroundColor: `${CAFE.primary}20` }}
                  >
                    <Camera className="h-8 w-8" style={{ color: CAFE.white }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIOS */}
      {settings?.testimonials && settings.testimonials.length > 0 && (
        <section
          className="py-28 px-6"
          style={{ backgroundColor: CAFE.bgSection }}
        >
          <div
            className="h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${CAFE.border}, transparent)`,
            }}
          />
          <div className="max-w-6xl mx-auto pt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p
                className="text-xs font-semibold tracking-[0.4em] uppercase mb-3"
                style={{ color: CAFE.secondary }}
              >
                Lo que dicen
              </p>
              <h2
                className="text-4xl sm:text-5xl font-black mb-4"
                style={{ color: CAFE.text }}
              >
                Nuestros Clientes
              </h2>
              <div className="flex items-center justify-center gap-3">
                <div
                  className="h-px w-10"
                  style={{ backgroundColor: CAFE.border }}
                />
                <Quote className="h-3 w-3" style={{ color: CAFE.secondary }} />
                <div
                  className="h-px w-10"
                  style={{ backgroundColor: CAFE.border }}
                />
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {settings.testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-2xl relative"
                  style={{
                    backgroundColor: CAFE.bgCard,
                    border: `1px solid ${CAFE.border}`,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  <Quote
                    className="h-8 w-8 mb-4 opacity-20"
                    style={{ color: CAFE.primary }}
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
                        className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{
                          backgroundColor: `${CAFE.primary}15`,
                          color: CAFE.primary,
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
                              i < testimonial.rating
                                ? CAFE.secondary
                                : CAFE.border,
                            fill:
                              i < testimonial.rating
                                ? CAFE.secondary
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

      {/* BANNER DE RESERVAS */}
      {settings?.reservation_title && (
        <section
          className="py-20 px-6"
          style={{ backgroundColor: CAFE.primary }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Calendar className="h-12 w-12 mx-auto mb-6 opacity-80 text-white" />
              <h2 className="text-3xl sm:text-4xl font-black mb-4 text-white">
                {settings.reservation_title}
              </h2>
              {settings.reservation_description && (
                <p className="text-lg mb-8 opacity-80 text-white max-w-xl mx-auto">
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
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-sm shadow-lg"
                  style={{ backgroundColor: CAFE.white, color: CAFE.primary }}
                >
                  <MessageCircle className="h-5 w-5" />
                  Reservar por WhatsApp
                </motion.a>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* HORARIOS Y CONTACTO */}
      <section className="py-28 px-6" style={{ backgroundColor: CAFE.bg }}>
        <div
          className="h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${CAFE.border}, transparent)`,
          }}
        />
        <div className="max-w-6xl mx-auto pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p
              className="text-xs font-semibold tracking-[0.4em] uppercase mb-3"
              style={{ color: CAFE.secondary }}
            >
              Encuéntranos
            </p>
            <h2
              className="text-4xl sm:text-5xl font-black mb-4"
              style={{ color: CAFE.text }}
            >
              Visítanos
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div
                className="h-px w-10"
                style={{ backgroundColor: CAFE.border }}
              />
              <Leaf className="h-3 w-3" style={{ color: CAFE.secondary }} />
              <div
                className="h-px w-10"
                style={{ backgroundColor: CAFE.border }}
              />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {/* Horarios */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl p-7"
              style={{
                backgroundColor: CAFE.bgCard,
                border: `1px solid ${CAFE.border}`,
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}
            >
              <div className="flex items-center gap-3 mb-7">
                <div
                  className="p-2.5 rounded-xl"
                  style={{
                    backgroundColor: `${CAFE.primary}12`,
                    border: `1px solid ${CAFE.border}`,
                  }}
                >
                  <Clock className="h-4 w-4" style={{ color: CAFE.primary }} />
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: CAFE.text }}>
                    Horarios
                  </h3>
                  <p className="text-xs" style={{ color: CAFE.textMuted }}>
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
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex justify-between items-center py-3.5"
                    style={{ borderBottom: `1px solid ${CAFE.borderLight}` }}
                  >
                    <span className="text-sm" style={{ color: CAFE.textMuted }}>
                      {horario.label}
                    </span>
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor:
                          horario.value?.toLowerCase() === "cerrado"
                            ? "#fff0f0"
                            : `${CAFE.primary}12`,
                        color:
                          horario.value?.toLowerCase() === "cerrado"
                            ? "#dc2626"
                            : CAFE.primary,
                        border: `1px solid ${horario.value?.toLowerCase() === "cerrado" ? "#fecaca" : CAFE.border}`,
                      }}
                    >
                      {horario.value}
                    </span>
                  </motion.div>
                ))}
            </motion.div>

            {/* Contacto */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl p-7"
              style={{
                backgroundColor: CAFE.bgCard,
                border: `1px solid ${CAFE.border}`,
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}
            >
              <div className="flex items-center gap-3 mb-7">
                <div
                  className="p-2.5 rounded-xl"
                  style={{
                    backgroundColor: `${CAFE.primary}12`,
                    border: `1px solid ${CAFE.border}`,
                  }}
                >
                  <Phone className="h-4 w-4" style={{ color: CAFE.primary }} />
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: CAFE.text }}>
                    Contacto
                  </h3>
                  <p className="text-xs" style={{ color: CAFE.textMuted }}>
                    Con gusto te atendemos
                  </p>
                </div>
              </div>
              <div className="space-y-2.5 mb-6">
                {settings?.address && (
                  <div
                    className="flex items-start gap-3 p-3.5 rounded-xl"
                    style={{
                      backgroundColor: CAFE.bgSection,
                      border: `1px solid ${CAFE.borderLight}`,
                    }}
                  >
                    <MapPin
                      className="h-4 w-4 mt-0.5 shrink-0"
                      style={{ color: CAFE.primary }}
                    />
                    <span className="text-sm" style={{ color: CAFE.textMuted }}>
                      {settings.address}
                    </span>
                  </div>
                )}
                {settings?.phone && (
                  <motion.a
                    href={`tel:${settings.phone}`}
                    whileHover={{ x: 3 }}
                    className="flex items-center gap-3 p-3.5 rounded-xl transition-all"
                    style={{
                      backgroundColor: CAFE.bgSection,
                      border: `1px solid ${CAFE.borderLight}`,
                    }}
                  >
                    <Phone
                      className="h-4 w-4 shrink-0"
                      style={{ color: CAFE.primary }}
                    />
                    <span className="text-sm" style={{ color: CAFE.textMuted }}>
                      {settings.phone}
                    </span>
                  </motion.a>
                )}
                {settings?.email && (
                  <motion.a
                    href={`mailto:${settings.email}`}
                    whileHover={{ x: 3 }}
                    className="flex items-center gap-3 p-3.5 rounded-xl transition-all"
                    style={{
                      backgroundColor: CAFE.bgSection,
                      border: `1px solid ${CAFE.borderLight}`,
                    }}
                  >
                    <Mail
                      className="h-4 w-4 shrink-0"
                      style={{ color: CAFE.primary }}
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
                  style={{ borderTop: `1px solid ${CAFE.borderLight}` }}
                >
                  <p
                    className="text-xs uppercase tracking-widest mb-3"
                    style={{ color: CAFE.textFaint }}
                  >
                    Síguenos
                  </p>
                  <div className="flex items-center gap-2.5">
                    {settings?.instagram_url && (
                      <motion.a
                        href={settings.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all"
                        style={{
                          backgroundColor: CAFE.bgSection,
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
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all"
                        style={{
                          backgroundColor: CAFE.bgSection,
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

          {/* MAPA */}
          {settings?.maps_embed_url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${CAFE.border}`, height: "400px" }}
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

      {/* FOOTER */}
      <footer className="py-10 px-6" style={{ backgroundColor: CAFE.bgDark }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Coffee className="h-4 w-4" style={{ color: CAFE.secondary }} />
            <span
              className="text-sm font-medium"
              style={{ color: CAFE.textFaint }}
            >
              {settings?.cafe_name ?? "Aromático Café"}
            </span>
          </div>
          <p className="text-xs" style={{ color: "#3a3530" }}>
            © {new Date().getFullYear()} · Todos los derechos reservados
          </p>
        </div>
      </footer>

      {/* WHATSAPP FLOTANTE */}
      {settings?.whatsapp && (
        <motion.a
          href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full"
          style={{
            backgroundColor: "#25D366",
            boxShadow: "0 8px 30px #25D36640",
          }}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </motion.a>
      )}
    </div>
  );
}
