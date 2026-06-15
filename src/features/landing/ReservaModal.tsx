import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  Users,
  User,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { localDateString } from "@/lib/localDate";
import { normalizePhone } from "@/lib/phone";
import {
  useBusinessHours,
  dayKey,
  dayLabel,
  hoursOn,
} from "@/hooks/useBusinessHours";
import type { CafeTheme } from "./cafeTheme";

interface ReservaModalProps {
  open: boolean;
  onClose: () => void;
  whatsapp?: string | null;
  cafeName?: string | null;
  theme: CafeTheme;
}

export function ReservaModal({
  open,
  onClose,
  whatsapp,
  cafeName,
  theme,
}: ReservaModalProps) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [personas, setPersonas] = useState("2");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const resetForm = () => {
    setNombre("");
    setTelefono("");
    setFecha("");
    setHora("");
    setPersonas("2");
    setNotas("");
    setError("");
    setConfirmed(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const hours = useBusinessHours();
  const dayInfo = fecha ? hoursOn(hours, fecha) : null;
  const dayClosed = fecha !== "" && dayInfo === null;
  const dayLabelStr = fecha ? dayLabel(dayKey(fecha)) : "";
  const hoursHint = dayClosed
    ? `Cerrado los ${dayLabelStr}, elige otra fecha`
    : dayInfo
      ? `Atendemos de ${dayInfo.open} a ${dayInfo.close} los ${dayLabelStr}`
      : "";

  const handleEnviar = async () => {
    if (!nombre || !telefono || !fecha || !hora || !personas) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }
    if (dayClosed) {
      setError(`Cerrado los ${dayLabelStr}, elige otra fecha.`);
      return;
    }
    setError("");
    setIsSubmitting(true);

    const numeroDestino = (whatsapp ?? "").replace(/\D/g, "");
    const telefonoCliente = normalizePhone(telefono);
    const mensaje = `Hola ${cafeName ?? ""}! Me gustaría reservar una mesa 🙌

👤 Nombre: ${nombre}
📞 Teléfono: ${telefonoCliente}
📅 Fecha: ${new Date(fecha + "T12:00:00").toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
⏰ Hora: ${hora}
👥 Personas: ${personas}${notas ? `\n📝 Notas: ${notas}` : ""}`;
    const url = `https://wa.me/${numeroDestino}?text=${encodeURIComponent(mensaje)}`;

    // 1. Persist to DB.
    const { error: rpcError } = await supabase.rpc("create_public_reservation", {
      payload: {
        customer_name: nombre,
        customer_phone: telefonoCliente,
        reservation_date: fecha,
        reservation_time: hora,
        party_size: personas === "más de 10" ? 11 : Number(personas),
        notes: notas || null,
      } as never,
    });

    setIsSubmitting(false);

    if (rpcError) {
      // Hour-window or validation errors come back here with a Spanish message.
      setError(rpcError.message || "No pudimos guardar la reserva.");
      toast.error(rpcError.message || "No pudimos guardar la reserva");
      return;
    }

    toast.success("Reserva recibida, te confirmamos pronto");

    // 2. Open WhatsApp regardless — the gerente sees both.
    window.open(url, "_blank");

    // 3. Show the confirmation screen instead of closing immediately.
    setConfirmed(true);
  };

  // Fecha mínima = hoy LOCAL. Con toISOString (UTC) un cliente no podía
  // reservar para hoy mismo después de las 7 p.m. hora Colombia.
  const today = localDateString();

  const inputStyle = {
    backgroundColor: theme.bgLight,
    border: `1px solid ${theme.border}`,
    color: theme.text,
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "14px",
    outline: "none",
    width: "100%",
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: 600,
    color: theme.textMuted,
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
            onClick={handleClose}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
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
                backgroundColor: theme.bg,
                border: `1px solid ${theme.border}`,
                boxShadow: `0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px ${theme.borderGold}20`,
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-7 py-6"
                style={{ borderBottom: `1px solid ${theme.border}` }}
              >
                <div>
                  <p
                    className="text-xs font-bold tracking-[0.3em] uppercase mb-1"
                    style={{ color: theme.gold }}
                  >
                    Reserva
                  </p>
                  <h2
                    className="text-xl font-black"
                    style={{ color: theme.text }}
                  >
                    Reservar una mesa
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2.5 rounded-full cursor-pointer transition-all hover:opacity-70"
                  style={{
                    backgroundColor: theme.bgLight,
                    border: `1px solid ${theme.border}`,
                    color: theme.textMuted,
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {confirmed ? (
                /* Confirmation screen */
                <div className="px-7 py-10 flex flex-col items-center text-center gap-3">
                  <div
                    className="rounded-full p-3"
                    style={{
                      backgroundColor: "rgba(34,197,94,0.15)",
                      border: "1px solid rgba(34,197,94,0.35)",
                    }}
                  >
                    <CheckCircle2
                      className="h-10 w-10"
                      style={{ color: "#22c55e" }}
                    />
                  </div>
                  <h3
                    className="text-lg font-black"
                    style={{ color: theme.text }}
                  >
                    ¡Reserva recibida!
                  </h3>
                  <p
                    className="text-sm leading-relaxed max-w-xs"
                    style={{ color: theme.textMuted }}
                  >
                    Hola <strong style={{ color: theme.text }}>{nombre}</strong>,
                    tu solicitud quedó registrada para el{" "}
                    <strong style={{ color: theme.text }}>
                      {new Date(fecha + "T12:00:00").toLocaleDateString(
                        "es-CO",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        },
                      )}
                    </strong>{" "}
                    a las <strong style={{ color: theme.text }}>{hora}</strong>{" "}
                    para{" "}
                    <strong style={{ color: theme.text }}>
                      {personas} persona{personas === "1" ? "" : "s"}
                    </strong>
                    .
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: theme.textFaint }}
                  >
                    Te confirmaremos por WhatsApp lo antes posible. Si abrimos
                    una pestaña nueva, también podés enviarnos el mensaje desde
                    ahí.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-4 py-3 px-8 rounded-xl text-sm font-bold cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${theme.gold}, ${theme.amber})`,
                      color: theme.bg,
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
              <>
              {/* Form */}
              <div className="px-7 py-6 space-y-4">
                {/* Name */}
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

                {/* Phone */}
                <div>
                  <label style={labelStyle}>
                    <span className="flex items-center gap-2">
                      <MessageCircle className="h-3.5 w-3.5" />
                      Teléfono (WhatsApp) *
                    </span>
                  </label>
                  <input
                    type="tel"
                    placeholder="3001234567"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {/* Date and time */}
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
                      disabled={dayClosed}
                      style={{
                        ...inputStyle,
                        opacity: dayClosed ? 0.5 : 1,
                      }}
                    />
                    {hoursHint && (
                      <p
                        className="text-xs mt-1"
                        style={{
                          color: dayClosed ? "#ef4444" : theme.textMuted,
                        }}
                      >
                        {hoursHint}
                      </p>
                    )}
                  </div>
                </div>

                {/* Party size */}
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
                        style={{ backgroundColor: theme.bgCard }}
                      >
                        {n} {n === 1 ? "persona" : "personas"}
                      </option>
                    ))}
                    <option
                      value="más de 10"
                      style={{ backgroundColor: theme.bgCard }}
                    >
                      Más de 10
                    </option>
                  </select>
                </div>

                {/* Notes */}
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
                style={{ borderTop: `1px solid ${theme.border}` }}
              >
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all hover:opacity-70"
                  style={{
                    border: `1px solid ${theme.border}`,
                    color: theme.textMuted,
                  }}
                >
                  Cancelar
                </button>
                <div className="flex-1 flex flex-col items-center">
                  <motion.button
                    onClick={handleEnviar}
                    whileHover={{
                      scale: dayClosed || isSubmitting ? 1 : 1.02,
                    }}
                    whileTap={{ scale: dayClosed || isSubmitting ? 1 : 0.98 }}
                    disabled={dayClosed || isSubmitting}
                    className="w-full py-3 rounded-xl text-sm font-bold cursor-pointer flex items-center justify-center gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${theme.gold}, ${theme.amber})`,
                      color: theme.bg,
                      opacity: dayClosed || isSubmitting ? 0.5 : 1,
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    {isSubmitting ? "Enviando..." : "Enviar reserva"}
                  </motion.button>
                  <p
                    className="text-[10px] mt-1"
                    style={{ color: theme.textFaint }}
                  >
                    Te confirmaremos por WhatsApp
                  </p>
                </div>
              </div>
              </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
