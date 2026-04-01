import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/shared/AdminLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RoleRoute } from "@/routes/RoleRoute";
import { LoginPage } from "@/features/auth/LoginPage";
import { ChangePasswordPage } from "@/features/auth/ChangePasswordPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { CategoriesPage } from "@/features/inventory/CategoriesPage";
import { ProductsPage } from "@/features/inventory/ProductsPage";
import { StockPage } from "@/features/inventory/StockPage";
import { PromotionsPage } from "@/features/inventory/PromotionsPage";
import { CajaPage } from "@/features/caja/CajaPage";
import { WorkersPage } from "@/features/workers/WorkersPage";
import { AccountingPage } from "@/features/accounting/AccountingPage";
import { AppearancePage } from "@/features/settings/AppearancePage";
import { SettingsPage } from "@/features/settings/SettingsPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/change-password" element={<ChangePasswordPage />} />

        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route element={<RoleRoute module="inventory" />}>
            <Route path="/inventory/categories" element={<CategoriesPage />} />
            <Route path="/inventory/products" element={<ProductsPage />} />
            <Route path="/inventory/stock" element={<StockPage />} />
            <Route path="/inventory/promotions" element={<PromotionsPage />} />
          </Route>

          <Route element={<RoleRoute module="caja" />}>
            <Route path="/caja" element={<CajaPage />} />
          </Route>

          <Route element={<RoleRoute module="workers" />}>
            <Route path="/workers" element={<WorkersPage />} />
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

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
