import { Routes, Route } from 'react-router-dom';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { StoreListPage } from '@/pages/stores/StoreListPage';
import { StoreFormPage } from '@/pages/stores/StoreFormPage';
import { StoreSettingsPage } from '@/pages/stores/StoreSettingsPage';
import { StaffListPage } from '@/pages/staff/StaffListPage';
import { CategoryListPage } from '@/pages/catalog/CategoryListPage';
import { ProductListPage } from '@/pages/catalog/ProductListPage';
import { ProductFormPage } from '@/pages/catalog/ProductFormPage';
import { OrderListPage } from '@/pages/orders/OrderListPage';
import { OrderDetailPage } from '@/pages/orders/OrderDetailPage';
import { CourierListPage } from '@/pages/couriers/CourierListPage';
import { WorkingHoursPage } from '@/pages/settings/WorkingHoursPage';
import { AuditLogPage } from '@/pages/audit/AuditLogPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AuthGuard />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/stores" element={<StoreListPage />} />
          <Route path="/stores/new" element={<StoreFormPage />} />
          <Route path="/stores/:storeId/edit" element={<StoreFormPage />} />
          <Route path="/stores/:storeId/settings" element={<StoreSettingsPage />} />
          <Route path="/staff" element={<StaffListPage />} />
          <Route path="/categories" element={<CategoryListPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/:productId/edit" element={<ProductFormPage />} />
          <Route path="/orders" element={<OrderListPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/couriers" element={<CourierListPage />} />
          <Route path="/settings/working-hours" element={<WorkingHoursPage />} />
          <Route path="/audit" element={<AuditLogPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
