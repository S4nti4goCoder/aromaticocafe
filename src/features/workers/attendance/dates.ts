import { localDateString } from "@/lib/localDate";

// Today's date as a local ISO day string (yyyy-mm-dd), evaluated at module load.
// localDateString (no UTC): de noche en Colombia toISOString daría mañana.
export const today = localDateString();

// Returns the 7 ISO day strings (Mon→Sun) of the week `offset` weeks from now.
export function getWeekDates(offset: number) {
  const now = new Date();
  now.setDate(now.getDate() + offset * 7);
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    // localDateString, no toISOString: cada día es local; con UTC se corría
    // al día anterior en horario nocturno.
    dates.push(localDateString(d));
  }
  return dates;
}

// Returns every ISO day string of the given month (month is 0-based).
export function getMonthDates(year: number, month: number) {
  const dates: string[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    dates.push(
      `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    );
  }
  return dates;
}
