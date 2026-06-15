export type ThemeMode = "dark" | "light";

// Dark base — current default
export const CAFE_DARK = {
  mode: "dark" as ThemeMode,
  bg: "#0f0d0b",
  bgCard: "#1a1612",
  bgSection: "#141210",
  bgLight: "#1f1a15",
  border: "#2a2318",
  borderGold: "#8b6914",
  gold: "#d4a847",
  goldLight: "#e8c76a",
  amber: "#c8864a",
  text: "#f5f0e8",
  textMuted: "#a89880",
  textFaint: "#5a4f42",
  white: "#ffffff",
};

// Light base — cream / paper
export const CAFE_LIGHT = {
  mode: "light" as ThemeMode,
  bg: "#faf6ef",
  bgCard: "#ffffff",
  bgSection: "#f3ede2",
  bgLight: "#f9f3e7",
  border: "#e6dccb",
  borderGold: "#c8a85a",
  gold: "#a0522d",
  goldLight: "#c8864a",
  amber: "#8b5e3c",
  text: "#2a1f17",
  textMuted: "#6b574a",
  textFaint: "#a89880",
  white: "#ffffff",
};

// Default export (used as fallback while settings load) — keeps current behavior
export const CAFE = CAFE_DARK;

/** Build a theme from mode + dynamic primary/secondary from cafe_settings */
export function buildCafeTheme(
  mode: ThemeMode | undefined,
  primary?: string,
  secondary?: string,
) {
  const base = mode === "light" ? CAFE_LIGHT : CAFE_DARK;
  return {
    ...base,
    gold: primary || base.gold,
    goldLight: primary ? `${primary}cc` : base.goldLight,
    amber: secondary || base.amber,
    borderGold: primary ? `${primary}88` : base.borderGold,
  };
}

export type CafeTheme = ReturnType<typeof buildCafeTheme>;

export type NavLink = {
  id: string;
  label: string;
  show: boolean;
};
