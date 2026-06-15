import { useSystemSettings } from "@/hooks/useSystemSettings";
import type { BusinessHours, DayHours, DayKey } from "@/types";

const DEFAULT_HOURS: BusinessHours = {
  monday: { open: "08:00", close: "21:00" },
  tuesday: { open: "08:00", close: "21:00" },
  wednesday: { open: "08:00", close: "21:00" },
  thursday: { open: "08:00", close: "21:00" },
  friday: { open: "08:00", close: "22:00" },
  saturday: { open: "09:00", close: "22:00" },
  sunday: null,
};

const DAY_LABELS: Record<DayKey, string> = {
  monday: "lunes",
  tuesday: "martes",
  wednesday: "miércoles",
  thursday: "jueves",
  friday: "viernes",
  saturday: "sábados",
  sunday: "domingos",
};

const DAY_ORDER: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

/** "YYYY-MM-DD" → `DayKey`. */
export function dayKey(dateISO: string): DayKey {
  // JS Date.getDay(): 0=Sun, 1=Mon, …, 6=Sat
  const d = new Date(`${dateISO}T12:00:00`);
  const map: DayKey[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return map[d.getDay()];
}

export function dayLabel(key: DayKey): string {
  return DAY_LABELS[key];
}

export const BUSINESS_HOURS_DAYS = DAY_ORDER;

export function useBusinessHours(): BusinessHours {
  const { settings } = useSystemSettings();
  return settings?.business_hours ?? DEFAULT_HOURS;
}

/** Returns the hours for a given date, or `null` if closed. */
export function hoursOn(
  hours: BusinessHours,
  dateISO: string,
): DayHours | null {
  return hours[dayKey(dateISO)];
}

/** True iff the given date is open AND the given time falls within hours. */
export function isOpenAt(
  hours: BusinessHours,
  dateISO: string,
  timeHHMM: string,
): boolean {
  const dh = hoursOn(hours, dateISO);
  if (!dh) return false;
  return timeHHMM >= dh.open && timeHHMM < dh.close;
}

export { DEFAULT_HOURS };
