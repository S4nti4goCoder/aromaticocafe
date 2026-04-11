import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import type { CafeTheme } from "../cafeTheme";

interface Testimonial {
  name: string;
  comment: string;
  rating: number;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  theme: CafeTheme;
}

export function TestimonialsSection({
  testimonials,
  theme,
}: TestimonialsSectionProps) {
  return (
    <section
      id="resenas"
      className="min-h-screen px-6 flex flex-col justify-center py-24"
      style={{ backgroundColor: theme.bgSection }}
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
            Lo que dicen
          </p>
          <h2
            className="text-4xl sm:text-6xl font-black"
            style={{ color: theme.text }}
          >
            Nuestros Clientes
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-7 rounded-2xl"
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.border}`,
              }}
            >
              <Quote
                className="h-8 w-8 mb-5 opacity-30"
                style={{ color: theme.gold }}
              />
              <p
                className="text-sm leading-relaxed mb-6 italic"
                style={{ color: theme.textMuted }}
              >
                "{testimonial.comment}"
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{
                      background: `linear-gradient(135deg, ${theme.gold}20, ${theme.amber}20)`,
                      border: `1px solid ${theme.borderGold}`,
                      color: theme.gold,
                    }}
                  >
                    {testimonial.name.charAt(0)}
                  </div>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: theme.text }}
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
                          i < testimonial.rating ? theme.gold : theme.border,
                        fill:
                          i < testimonial.rating
                            ? theme.gold
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
  );
}
