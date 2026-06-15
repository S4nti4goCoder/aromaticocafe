// Normaliza un teléfono a solo dígitos. Si quedan 12 empezando en 57
// (indicativo de Colombia), quita el 57. Gemela de la función SQL
// normalize_phone: el frontend normaliza antes de guardar para que el
// teléfono de la venta/reserva coincida con el del cliente, y la base lo
// vuelve a normalizar como red de seguridad. Sin esto, "300 123 4567" y
// "3001234567" crearían dos clientes distintos.
export function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return "";
  let d = phone.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("57")) {
    d = d.slice(2);
  }
  return d;
}
