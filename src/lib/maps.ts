// Validates a Google Maps embed URL before it's used as an <iframe src>.
// Only an https google.com /maps URL is allowed — blocks "javascript:",
// plain http, and arbitrary hosts that could be injected via settings.
export function isSafeMapsEmbedUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      /(^|\.)google\.com$/.test(url.hostname) &&
      url.pathname.includes("/maps")
    );
  } catch {
    return false;
  }
}
