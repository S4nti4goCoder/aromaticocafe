import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "@/components/shared/AdminLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RoleRoute } from "@/routes/RoleRoute";
import { AdminRoute } from "@/routes/AdminRoute";
import { RouteFallback } from "@/components/shared/RouteFallback";
import { ScrollToTop } from "@/components/shared/ScrollToTop";

// Pages are lazy-loaded so each route ships in its own chunk, keeping the
// initial bundle small. Routing infrastructure (layout + guards) stays eager.
const LandingPage = lazy(() =>
  import("@/features/landing/LandingPage").then((m) => ({ default: m.LandingPage })),
);
const LoginPage = lazy(() =>
  import("@/features/auth/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const ChangePasswordPage = lazy(() =>
  import("@/features/auth/ChangePasswordPage").then((m) => ({
    default: m.ChangePasswordPage,
  })),
);
const DashboardPage = lazy(() =>
  import("@/features/dashboard/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);
const CategoriesPage = lazy(() =>
  import("@/features/inventory/CategoriesPage").then((m) => ({
    default: m.CategoriesPage,
  })),
);
const ProductsPage = lazy(() =>
  import("@/features/inventory/ProductsPage").then((m) => ({
    default: m.ProductsPage,
  })),
);
const StockPage = lazy(() =>
  import("@/features/inventory/StockPage").then((m) => ({ default: m.StockPage })),
);
const PromotionsPage = lazy(() =>
  import("@/features/inventory/PromotionsPage").then((m) => ({
    default: m.PromotionsPage,
  })),
);
const CajaPage = lazy(() =>
  import("@/features/caja/CajaPage").then((m) => ({ default: m.CajaPage })),
);
const CustomersPage = lazy(() =>
  import("@/features/customers/CustomersPage").then((m) => ({
    default: m.CustomersPage,
  })),
);
const SalesPage = lazy(() =>
  import("@/features/sales/SalesPage").then((m) => ({
    default: m.SalesPage,
  })),
);
const ReservationsPage = lazy(() =>
  import("@/features/reservations/ReservationsPage").then((m) => ({
    default: m.ReservationsPage,
  })),
);
const TablesPage = lazy(() =>
  import("@/features/reservations/TablesPage").then((m) => ({
    default: m.TablesPage,
  })),
);
const CalendarPage = lazy(() =>
  import("@/features/reservations/CalendarPage").then((m) => ({
    default: m.CalendarPage,
  })),
);
const PurchasesPage = lazy(() =>
  import("@/features/purchases/PurchasesPage").then((m) => ({
    default: m.PurchasesPage,
  })),
);
const WorkersPage = lazy(() =>
  import("@/features/workers/WorkersPage").then((m) => ({ default: m.WorkersPage })),
);
const AccountingPage = lazy(() =>
  import("@/features/accounting/AccountingPage").then((m) => ({
    default: m.AccountingPage,
  })),
);
const AppearancePage = lazy(() =>
  import("@/features/settings/AppearancePage").then((m) => ({
    default: m.AppearancePage,
  })),
);
const SettingsPage = lazy(() =>
  import("@/features/settings/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  })),
);
const ProfilePage = lazy(() =>
  import("@/features/profile/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);
const NotFoundPage = lazy(() =>
  import("@/features/errors/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);
const TerminosPage = lazy(() =>
  import("@/features/legal/TerminosPage").then((m) => ({ default: m.TerminosPage })),
);
const PrivacidadPage = lazy(() =>
  import("@/features/legal/PrivacidadPage").then((m) => ({
    default: m.PrivacidadPage,
  })),
);
const CookiesPage = lazy(() =>
  import("@/features/legal/CookiesPage").then((m) => ({
    default: m.CookiesPage,
  })),
);
const PostulacionPage = lazy(() =>
  import("@/features/jobs/PostulacionPage").then((m) => ({
    default: m.PostulacionPage,
  })),
);
const ApplicationsPage = lazy(() =>
  import("@/features/jobs/ApplicationsPage").then((m) => ({
    default: m.ApplicationsPage,
  })),
);
const PositionsPage = lazy(() =>
  import("@/features/jobs/PositionsPage").then((m) => ({
    default: m.PositionsPage,
  })),
);

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <ScrollToTop />
      <Routes>
        {/* Public route */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/terminos" element={<TerminosPage />} />
        <Route path="/privacidad" element={<PrivacidadPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/trabaja-con-nosotros" element={<PostulacionPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/change-password" element={<ChangePasswordPage />} />

          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route element={<RoleRoute module="inventory" />}>
              <Route path="/inventory/categories" element={<CategoriesPage />} />
              <Route path="/inventory/products" element={<ProductsPage />} />
              <Route path="/inventory/stock" element={<StockPage />} />
              <Route path="/inventory/promotions" element={<PromotionsPage />} />
            </Route>

            <Route element={<RoleRoute module="caja" />}>
              <Route path="/caja" element={<CajaPage />} />
              <Route path="/reservations" element={<ReservationsPage />} />
              <Route path="/reservations/calendar" element={<CalendarPage />} />
            </Route>

            {/* Customers — admin/gerente only (personal data) */}
            <Route element={<AdminRoute />}>
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/purchases" element={<PurchasesPage />} />
              <Route path="/reservations/tables" element={<TablesPage />} />
            </Route>

            <Route element={<RoleRoute module="workers" />}>
              <Route path="/workers" element={<WorkersPage />} />
              <Route
                path="/workers/applications"
                element={<ApplicationsPage />}
              />
              <Route
                path="/workers/positions"
                element={<PositionsPage />}
              />
            </Route>

            <Route element={<RoleRoute module="accounting" />}>
              <Route path="/accounting" element={<AccountingPage />} />
            </Route>

            <Route element={<RoleRoute module="settings" />}>
              <Route path="/settings/appearance" element={<AppearancePage />} />
              <Route path="/settings/general" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
