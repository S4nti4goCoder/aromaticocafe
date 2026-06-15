import { useEffect, Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/shared/Sidebar";
import { RouteFallback } from "@/components/shared/RouteFallback";
import { Header } from "@/components/shared/Header";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { useUIStore } from "@/store/uiStore";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { logoToFaviconHref } from "@/lib/logo";
import { setCurrencyConfig } from "@/lib/currency";

export function AdminLayout() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
  const { settings: systemSettings } = useSystemSettings();
  const { pendingCount, isSyncing } = useOfflineSync();
  useRealtimeSync();

  // Drive the shared currency formatter from the owner's configured currency.
  useEffect(() => {
    if (!systemSettings) return;
    setCurrencyConfig({
      code: systemSettings.currency_code,
      symbol: systemSettings.currency_symbol,
      thousandsSeparator: systemSettings.currency_thousands_separator,
      decimalSeparator: systemSettings.currency_decimal_separator,
    });
  }, [systemSettings]);

  const brandName = systemSettings?.cafe_name ?? "Aromático Café";
  usePageMeta(
    `Panel · ${brandName}`,
    logoToFaviconHref(systemSettings?.logo_url, "/favicon-admin.svg"),
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      {/* Mobile backdrop — visible only when drawer is open below lg */}
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden cursor-pointer"
        />
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <OfflineBanner pendingCount={pendingCount} isSyncing={isSyncing} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
