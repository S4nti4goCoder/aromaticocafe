export function isLogoImage(value: string | null | undefined): boolean {
  if (!value) return false;
  const v = value.trim();
  return (
    v.startsWith("http://") ||
    v.startsWith("https://") ||
    v.startsWith("data:") ||
    v.startsWith("blob:") ||
    v.startsWith("/")
  );
}

export function isLogoEmoji(value: string | null | undefined): boolean {
  if (!value) return false;
  return !isLogoImage(value);
}

/**
 * Turns a logo value into a favicon href:
 * - image/URL → used directly
 * - emoji → rendered into an SVG data URI
 * - empty → falls back to the provided default
 */
export function logoToFaviconHref(
  value: string | null | undefined,
  fallback = "/favicon.svg",
): string {
  if (!value) return fallback;
  if (isLogoImage(value)) return value;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="20">${value}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
