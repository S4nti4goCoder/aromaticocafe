/**
 * Spanish relative-time formatting: "Ahora", "Hace 5 min", "Hace 2 h", "Hace 3 días".
 */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return "Ahora";
  const sec = Math.floor(diff / 1000);
  if (sec < 45) return "Ahora";
  const min = Math.floor(sec / 60);
  if (min < 60) return `Hace ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `Hace ${hr} h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `Hace ${day} día${day === 1 ? "" : "s"}`;
  const wk = Math.floor(day / 7);
  if (wk < 4) return `Hace ${wk} sem`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `Hace ${mo} mes${mo === 1 ? "" : "es"}`;
  const yr = Math.floor(day / 365);
  return `Hace ${yr} año${yr === 1 ? "" : "s"}`;
}
