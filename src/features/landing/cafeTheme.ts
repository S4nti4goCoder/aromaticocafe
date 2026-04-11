// Default (fallback) theme – used while settings load
export const CAFE = {
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

/** Build a theme using dynamic primary/secondary from cafe_settings */
export function buildCafeTheme(primary?: string, secondary?: string) {
  return {
    ...CAFE,
    gold: primary || CAFE.gold,
    goldLight: primary ? `${primary}cc` : CAFE.goldLight,
    amber: secondary || CAFE.amber,
    borderGold: primary ? `${primary}88` : CAFE.borderGold,
  };
}

export type CafeTheme = ReturnType<typeof buildCafeTheme>;

export type NavLink = {
  id: string;
  label: string;
  show: boolean;
};
