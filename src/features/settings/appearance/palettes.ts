// Theme palettes for the public landing page.
// A palette is a primary/secondary color pair plus a background mode
// (dark = coffee/black background, light = cream/paper background).

export type ThemePaletteMode = "dark" | "light";

export interface ThemePalette {
  name: string;
  mode: ThemePaletteMode;
  primary: string;
  secondary: string;
}

export const COFFEE_PALETTES: ThemePalette[] = [
  // Dark mode (coffee/black background)
  { name: "Espresso", mode: "dark", primary: "#3C1518", secondary: "#69140E" },
  { name: "Mocha", mode: "dark", primary: "#4A2C2A", secondary: "#8B5E3C" },
  { name: "Cappuccino", mode: "dark", primary: "#6F4E37", secondary: "#C4A882" },
  { name: "Caramelo", mode: "dark", primary: "#8B4513", secondary: "#D2691E" },
  { name: "Cereza", mode: "dark", primary: "#8B0000", secondary: "#CD5C5C" },
  { name: "Canela", mode: "dark", primary: "#7B3F00", secondary: "#D2691E" },
  { name: "Ámbar", mode: "dark", primary: "#B8860B", secondary: "#DAA520" },
  { name: "Menta", mode: "dark", primary: "#2D5016", secondary: "#4A7C3F" },

  // Light mode (cream/paper background)
  { name: "Papel", mode: "light", primary: "#A0522D", secondary: "#C8864A" },
  { name: "Latte", mode: "light", primary: "#8B5E3C", secondary: "#C4A882" },
  { name: "Vainilla", mode: "light", primary: "#8B7355", secondary: "#D4A847" },
  { name: "Crema", mode: "light", primary: "#6F4E37", secondary: "#D2691E" },
  { name: "Capuccino Claro", mode: "light", primary: "#7B3F00", secondary: "#C8A85A" },
  { name: "Menta Suave", mode: "light", primary: "#3F6B36", secondary: "#7CA56B" },
];

// Single solid colors (no gradient — primary === secondary).
export interface SolidColor {
  name: string;
  mode: ThemePaletteMode;
  color: string;
}

export const SOLID_COLORS: SolidColor[] = [
  // Dark mode
  { name: "Café", mode: "dark", color: "#6F4E37" },
  { name: "Espresso", mode: "dark", color: "#3C1518" },
  { name: "Terracota", mode: "dark", color: "#A0522D" },
  { name: "Dorado", mode: "dark", color: "#B8860B" },
  { name: "Bosque", mode: "dark", color: "#2D5016" },
  // Light mode
  { name: "Café", mode: "light", color: "#6F4E37" },
  { name: "Terracota", mode: "light", color: "#A0522D" },
  { name: "Caramelo", mode: "light", color: "#C8864A" },
  { name: "Oliva", mode: "light", color: "#3F6B36" },
  { name: "Vino", mode: "light", color: "#8B0000" },
];
