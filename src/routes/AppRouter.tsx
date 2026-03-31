import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/shared/AdminLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { LoginPage } from "@/features/auth/LoginPage";
import { ChangePasswordPage } from "@/features/auth/ChangePasswordPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { CategoriesPage } from "@/features/categories/CategoriesPage";
import { ProductsPage } from "@/features/products/ProductsPage";
import { WorkersPage } from "@/features/workers/WorkersPage";
import { AccountingPage } from "@/features/accounting/AccountingPage";
import { SettingsPage } from "@/features/settings/SettingsPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/workers" element={<WorkersPage />} />
          <Route path="/accounting" element={<AccountingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
