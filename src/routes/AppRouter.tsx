import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminLayout } from '@/components/shared/AdminLayout'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { ProductsPage } from '@/features/products/ProductsPage'
import { WorkersPage } from '@/features/workers/WorkersPage'
import { AccountingPage } from '@/features/accounting/AccountingPage'
import { SettingsPage } from '@/features/settings/SettingsPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/workers" element={<WorkersPage />} />
        <Route path="/accounting" element={<AccountingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}