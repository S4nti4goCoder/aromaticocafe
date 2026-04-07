import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Users, User, MessageCircle } from "lucide-react";

const CAFE = {
  bg: "#0f0d0b",
  bgCard: "#1a1612",
  bgLight: "#1f1a15",
  border: "#2a2318",
  borderGold: "#8b6914",
  gold: "#d4a847",
  amber: "#c8864a",
  text: "#f5f0e8",
  textMuted: "#a89880",
  textFaint: "#5a4f42",
};

interface ReservaModalProps {
  open: boolean;
  onClose: () => void;
  whatsapp?: string | null;
  cafeName?: string | null;
}

export function ReservaModal({
  open,
  onClose,
  whatsapp,
  cafeName,
}: ReservaModalProps) {
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [personas, setPersonas] = useState("2");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState("");

  const handleEnviar = () => {
    if (!nombre || !fecha || !hora || !personas) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }
    setError("");

    const numero = (whatsapp ?? "").replace(/\D/g, "");
    const mensaje = `Hola ${cafeName ?? ""}! Me gustaría reservar una mesa 🙌

👤 Nombre: ${nombre}
📅 Fecha: ${new Date(fecha + "T12:00:00").toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
⏰ Hora: ${hora}
👥 Personas: ${personas}${notas ? `\n📝 Notas: ${notas}` : ""}`;

    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
    onClose();
  };

  // Fecha mínima = hoy
  const today = new Date().toISOString().split("T")[0];

  const inputStyle = {
    backgroundColor: CAFE.bgLight,
    border: `1px solid ${CAFE.border}`,
    color: CAFE.text,
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "14px",
    outline: "none",
    width: "100%",
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: 600,
    color: CAFE.textMuted,
    marginBottom: "6px",
    display: "block",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-md pointer-events-auto rounded-3xl overflow-hidden"
              style={{
                backgroundColor: CAFE.bg,
                border: `1px solid ${CAFE.border}`,
                boxShadow: `0 25px 80px rgba(0,0,0,0.8), 0 0 0 1px ${CAFE.borderGold}20`,
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-7 py-6"
                style={{ borderBottom: `1px solid ${CAFE.border}` }}
              >
                <div>
                  <p
                    className="text-xs font-bold tracking-[0.3em] uppercase mb-1"
                    style={{ color: CAFE.gold }}
                  >
                    Reserva
                  </p>
                  <h2
                    className="text-xl font-black"
                    style={{ color: CAFE.text }}
                  >
                    Reservar una mesa
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-full cursor-pointer transition-all hover:opacity-70"
                  style={{
                    backgroundColor: CAFE.bgLight,
                    border: `1px solid ${CAFE.border}`,
                    color: CAFE.textMuted,
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Formulario */}
              <div className="px-7 py-6 space-y-4">
                {/* Nombre */}
                <div>
                  <label style={labelStyle}>
                    <span className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5" />
                      Nombre completo *
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {/* Fecha y hora */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>
                      <span className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        Fecha *
                      </span>
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      <span className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        Hora *
                      </span>
                    </label>
                    <input
                      type="time"
                      value={hora}
                      onChange={(e) => setHora(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Personas */}
                <div>
                  <label style={labelStyle}>
                    <span className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" />
                      Número de personas *
                    </span>
                  </label>
                  <select
                    value={personas}
                    onChange={(e) => setPersonas(e.target.value)}
                    style={inputStyle}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option
                        key={n}
                        value={n}
                        style={{ backgroundColor: CAFE.bgCard }}
                      >
                        {n} {n === 1 ? "persona" : "personas"}
                      </option>
                    ))}
                    <option
                      value="más de 10"
                      style={{ backgroundColor: CAFE.bgCard }}
                    >
                      Más de 10
                    </option>
                  </select>
                </div>

                {/* Notas */}
                <div>
                  <label style={labelStyle}>Notas adicionales (opcional)</label>
                  <textarea
                    placeholder="Alguna solicitud especial, alergias, ocasión especial..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    rows={3}
                    style={{
                      ...inputStyle,
                      resize: "none",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                {/* Error */}
                {error && (
                  <p
                    className="text-xs px-4 py-3 rounded-xl"
                    style={{
                      backgroundColor: "rgba(220,38,38,0.1)",
                      border: "1px solid rgba(220,38,38,0.2)",
                      color: "#ef4444",
                    }}
                  >
                    {error}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div
                className="px-7 py-5 flex items-center gap-3"
                style={{ borderTop: `1px solid ${CAFE.border}` }}
              >
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all hover:opacity-70"
                  style={{
                    border: `1px solid ${CAFE.border}`,
                    color: CAFE.textMuted,
                  }}
                >
                  Cancelar
                </button>
                <motion.button
                  onClick={handleEnviar}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-xl text-sm font-bold cursor-pointer flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${CAFE.gold}, ${CAFE.amber})`,
                    color: "#0f0d0b",
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Enviar por WhatsApp
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
