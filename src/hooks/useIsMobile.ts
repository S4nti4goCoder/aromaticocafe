import { useEffect, useState } from "react";

/**
 * Reactive media-query hook that returns true while the viewport is below the
 * given breakpoint (defaults to lg = 1024px). Updates live on window resize.
 */
export function useIsMobile(maxWidth = 1023) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width: ${maxWidth}px)`).matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [maxWidth]);

  return isMobile;
}
