import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import type { CafeTheme } from "../cafeTheme";

interface GallerySectionProps {
  galleryUrls: string[];
  theme: CafeTheme;
}

export function GallerySection({ galleryUrls, theme }: GallerySectionProps) {
  return (
    <section
      id="galeria"
      className="min-h-screen px-6 flex flex-col justify-center py-24"
      style={{ backgroundColor: theme.bg }}
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
            style={{ color: theme.gold }}
          >
            Nuestro espacio
          </p>
          <h2
            className="text-4xl sm:text-6xl font-black"
            style={{ color: theme.text }}
          >
            Galería
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {galleryUrls.map((url, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ scale: 1.03 }}
              className={`relative overflow-hidden rounded-2xl cursor-pointer ${index === 0 ? "col-span-2 row-span-2" : ""}`}
              style={{ border: `1px solid ${theme.border}` }}
            >
              <img
                src={url}
                alt={`Galería ${index + 1}`}
                loading="lazy"
                decoding="async"
                className={`w-full object-cover transition-transform duration-700 hover:scale-110 ${index === 0 ? "h-64 sm:h-80" : "h-36 sm:h-48"}`}
              />
              <div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                style={{ backgroundColor: "rgba(15,13,11,0.5)" }}
              >
                <Camera
                  className="h-8 w-8"
                  style={{ color: theme.goldLight }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
