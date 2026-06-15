import { useEffect, useState } from "react";

/**
 * Tracks browser connectivity via the native online/offline events.
 * Note: this reflects whether the device has a network connection, not
 * whether Supabase is reachable — the sale flow also treats a failed
 * request as "offline" and queues it, so this is only for UI signalling.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
