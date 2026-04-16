import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/guards/AuthGuard';
import { CourierLayout } from './components/layout/CourierLayout';
import LoginPage from './pages/LoginPage';
import ActiveOrdersPage from './pages/ActiveOrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import DeliveredOrdersPage from './pages/DeliveredOrdersPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <AuthGuard>
            <CourierLayout />
          </AuthGuard>
        }
      >
        <Route path="/" element={<ActiveOrdersPage />} />
        <Route path="/order/:orderId" element={<OrderDetailPage />} />
        <Route path="/delivered" element={<DeliveredOrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
