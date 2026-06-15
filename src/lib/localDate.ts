// Fecha local en formato YYYY-MM-DD. No usar toISOString().split("T")[0]
// para "hoy": eso devuelve el día en UTC, y en Colombia (UTC-5) después de
// las 7 p.m. ya es el día siguiente — caja, ventas y reportes quedarían en
// la fecha equivocada.
export function localDateString(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Inicio del día local (00:00:00.000) como ISO UTC, para filtrar timestamptz. */
export function localDayStartIso(d: Date = new Date()): string {
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

/** Fin del día local (23:59:59.999) como ISO UTC, para filtrar timestamptz. */
export function localDayEndIso(d: Date = new Date()): string {
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return end.toISOString();
}
