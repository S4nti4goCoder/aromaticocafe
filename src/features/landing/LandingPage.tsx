import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { useCafeSettings } from "@/hooks/useCafeSettings";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types";

export function LandingPage() {
  const { settings, isLoading } = useCafeSettings();
  const { data: allProducts } = useProducts();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const featuredProducts: Product[] = (allProducts ?? []).filter((p) =>
    (settings?.featured_product_ids ?? []).includes(p.id),
  );

  const primaryColor = settings?.primary_color ?? "#7c3aed";
  const secondaryColor = settings?.secondary_color ?? "#f59e0b";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Coffee className="h-10 w-10 text-amber-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt="Logo"
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <Coffee className="h-6 w-6" style={{ color: secondaryColor }} />
            )}
            <span className="font-bold text-lg tracking-tight">
              {settings?.cafe_name ?? "Aromático Café"}
            </span>
          </div>
          <Link
            to="/login"
            className="text-sm px-4 py-2 rounded-full border border-neutral-700 hover:border-neutral-400 transition-colors"
          >
            Acceder
          </Link>
        </div>
      </motion.nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Imagen de fondo */}
        {settings?.cover_url ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${settings.cover_url})` }}
          >
            <div className="absolute inset-0 bg-neutral-950/70" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-neutral-950 via-neutral-900 to-neutral-950">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle at 30% 50%, ${primaryColor}40, transparent 60%),
                                  radial-gradient(circle at 70% 50%, ${secondaryColor}30, transparent 60%)`,
              }}
            />
          </div>
        )}

        {/* Contenido hero */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p
              className="text-sm font-medium tracking-[0.3em] uppercase mb-4"
              style={{ color: secondaryColor }}
            >
              Bienvenidos a
            </p>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 leading-none">
              {settings?.cafe_name ?? "Aromático Café"}
            </h1>
            <p className="text-xl sm:text-2xl text-neutral-300 mb-10 font-light">
              {settings?.slogan ?? "El mejor café de la ciudad"}
            </p>
            <motion.a
              href="#menu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold transition-all"
              style={{
                backgroundColor: primaryColor,
                color: "#fff",
              }}
            >
              Ver nuestro menú
              <ChevronDown className="h-4 w-4" />
            </motion.a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown className="h-6 w-6 text-neutral-500" />
        </motion.div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      {featuredProducts.length > 0 && (
        <section id="menu" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <p
                className="text-sm font-medium tracking-[0.3em] uppercase mb-3"
                style={{ color: secondaryColor }}
              >
                Lo mejor de nuestra carta
              </p>
              <h2 className="text-4xl font-bold tracking-tight">
                Productos Destacados
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-600 transition-all duration-300"
                >
                  {product.image_url ? (
                    <div className="h-52 overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div
                      className="h-52 flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <Coffee
                        className="h-16 w-16 opacity-30"
                        style={{ color: primaryColor }}
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-1">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-neutral-400 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xl font-bold"
                        style={{ color: secondaryColor }}
                      >
                        ${product.price?.toLocaleString("es-CO")}
                      </span>
                      {product.discount_price && (
                        <span className="text-sm text-neutral-500 line-through">
                          ${product.discount_price?.toLocaleString("es-CO")}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HORARIOS Y CONTACTO */}
      <section className="py-24 px-6 bg-neutral-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p
              className="text-sm font-medium tracking-[0.3em] uppercase mb-3"
              style={{ color: secondaryColor }}
            >
              Visítanos
            </p>
            <h2 className="text-4xl font-bold tracking-tight">
              Horarios y Contacto
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Horarios */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Clock className="h-5 w-5" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-xl font-semibold">Horarios</h3>
              </div>
              <div className="space-y-4">
                {settings?.monday_friday && (
                  <div className="flex justify-between items-center py-3 border-b border-neutral-800">
                    <span className="text-neutral-400">Lunes — Viernes</span>
                    <span className="font-medium">
                      {settings.monday_friday}
                    </span>
                  </div>
                )}
                {settings?.saturday && (
                  <div className="flex justify-between items-center py-3 border-b border-neutral-800">
                    <span className="text-neutral-400">Sábado</span>
                    <span className="font-medium">{settings.saturday}</span>
                  </div>
                )}
                {settings?.sunday && (
                  <div className="flex justify-between items-center py-3">
                    <span className="text-neutral-400">Domingo</span>
                    <span className="font-medium">{settings.sunday}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Contacto */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Phone className="h-5 w-5" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-xl font-semibold">Contacto</h3>
              </div>
              <div className="space-y-4">
                {settings?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-neutral-500 mt-0.5 shrink-0" />
                    <span className="text-neutral-300">{settings.address}</span>
                  </div>
                )}
                {settings?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-neutral-500 shrink-0" />

                    <a
                      href={`tel:${settings.phone}`}
                      className="text-neutral-300 hover:text-white transition-colors"
                    >
                      {settings.phone}
                    </a>
                  </div>
                )}
                {settings?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-neutral-500 shrink-0" />

                    <a
                      href={`mailto:${settings.email}`}
                      className="text-neutral-300 hover:text-white transition-colors"
                    >
                      {settings.email}
                    </a>
                  </div>
                )}
              </div>

              {/* Redes sociales */}
              <div className="mt-6 pt-6 border-t border-neutral-800 flex items-center gap-3">
                {settings?.instagram_url && (
                  <motion.a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors"
                  >
                    <AtSign className="h-4 w-4" />
                  </motion.a>
                )}
                {settings?.facebook_url && (
                  <motion.a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </motion.a>
                )}
                {settings?.whatsapp && (
                  <motion.a
                    href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </motion.a>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Coffee className="h-4 w-4" style={{ color: secondaryColor }} />
            <span className="text-sm text-neutral-400">
              {settings?.cafe_name ?? "Aromático Café"}
            </span>
          </div>
          <p className="text-xs text-neutral-600">
            © {new Date().getFullYear()} Todos los derechos reservados
          </p>
        </div>
      </footer>

      {/* BOTÓN WHATSAPP FLOTANTE */}
      {settings?.whatsapp && (
        <motion.a
          href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: "spring" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl"
          style={{ backgroundColor: "#25D366" }}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </motion.a>
      )}
    </div>
  );
}
