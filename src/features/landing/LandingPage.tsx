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
} from "lucide-react";
import { useCafeSettings } from "@/hooks/useCafeSettings";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types";

const CAFE = {
  bg: "#faf6f1", // beige muy claro
  bgCard: "#ffffff", // blanco puro para cards
  bgSection: "#f3ede4", // beige medio para secciones alternas
  bgDark: "#1c1410", // café oscuro para footer/contraste
  border: "#e8ddd0", // borde beige
  borderLight: "#f0e8dc", // borde muy claro
  primary: "#a0522d", // sienna — marrón cálido
  secondary: "#c8864a", // ámbar
  accent: "#6b3a1f", // café oscuro para hover
  text: "#1c1410", // casi negro cálido
  textMuted: "#7a6555", // marrón medio
  textFaint: "#c4b5a5", // beige apagado
  white: "#ffffff",
};

export function LandingPage() {
  const { settings, isLoading } = useCafeSettings();
  const { data: allProducts } = useProducts();
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
                style={{
                  backgroundColor: CAFE.primary,
                }}
              >
                <Coffee className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="font-bold text-sm" style={{ color: CAFE.text }}>
              {settings?.cafe_name ?? "Aromático Café"}
            </span>
          </div>

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
              {/* Manchas decorativas cálidas */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    radial-gradient(ellipse at 15% 50%, ${CAFE.secondary}18 0%, transparent 55%),
                    radial-gradient(ellipse at 85% 30%, ${CAFE.primary}12 0%, transparent 50%),
                    radial-gradient(ellipse at 50% 80%, ${CAFE.secondary}10 0%, transparent 40%)
                  `,
                }}
              />
              {/* Patrón de puntos sutiles */}
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
          {/* Ícono */}
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

          {/* Label */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xs font-semibold tracking-[0.4em] uppercase mb-5"
            style={{ color: CAFE.secondary }}
          >
            Bienvenidos
          </motion.p>

          {/* Título */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="text-6xl sm:text-8xl font-black tracking-tight mb-5 leading-none"
            style={{ color: CAFE.text }}
          >
            {settings?.cafe_name ?? "Aromático Café"}
          </motion.h1>

          {/* Separador */}
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

          {/* Eslogan */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="text-base sm:text-lg mb-10 max-w-lg mx-auto leading-relaxed"
            style={{ color: CAFE.textMuted }}
          >
            {settings?.slogan ?? "El mejor café de la ciudad"}
          </motion.p>

          {/* CTAs */}
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
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold shadow-md transition-all"
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
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: CAFE.white,
                  border: `1px solid ${CAFE.border}`,
                  color: CAFE.textMuted,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <MessageCircle className="h-4 w-4" />
                Escríbenos
              </motion.a>
            )}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
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

      {/* PRODUCTOS DESTACADOS */}
      {featuredProducts.length > 0 && (
        <section
          id="menu"
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

      {/* HORARIOS Y CONTACTO */}
      <section className="py-28 px-6" style={{ backgroundColor: CAFE.bg }}>
        <div
          className="h-px mb-0"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                        border: `1px solid ${
                          horario.value?.toLowerCase() === "cerrado"
                            ? "#fecaca"
                            : CAFE.border
                        }`,
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

              {(settings?.instagram_url ||
                settings?.facebook_url ||
                settings?.whatsapp) && (
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
        </div>
      </section>

      {/* FOOTER OSCURO */}
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
