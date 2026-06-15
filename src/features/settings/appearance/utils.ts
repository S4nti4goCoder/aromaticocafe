// Returns true for an empty string (optional field) or a parseable URL.
export function isValidUrl(url: string): boolean {
  if (!url.trim()) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
