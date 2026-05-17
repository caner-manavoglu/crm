import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/router/ProtectedRoute';
import { ROUTES } from '@/router/routes';
import { queryClient } from '@/lib/query-client';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { CustomerLayout } from '@/pages/customer/CustomerLayout';
import { SubmitComplaintPage } from '@/pages/customer/SubmitComplaintPage';
import { MyComplaintsPage } from '@/pages/customer/MyComplaintsPage';
import { ComplaintDetailPage } from '@/pages/customer/ComplaintDetailPage';
import { StaffLayout } from '@/pages/staff/StaffLayout';
import { StaffDashboardPage } from '@/pages/staff/StaffDashboardPage';
import { useAuthStore } from '@/stores/auth.store';

function RoleHomeRedirect() {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to={ROUTES.CUSTOMER.SUBMIT} replace />;
  if (user.role === 'customer') return <Navigate to={ROUTES.CUSTOMER.SUBMIT} replace />;
  if (user.role === 'staff') return <Navigate to={ROUTES.STAFF.DASHBOARD} replace />;
  return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />;
}

function AdminPlaceholderPage() {
  return (
    <div className="min-h-screen bg-[#10131A] p-8 text-[#E1E2EC]">
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#424754] bg-[#1D2027] p-8">
        <h1 className="text-2xl font-semibold">Admin Paneli</h1>
        <p className="mt-2 text-sm text-[#C2C6D6]">
          Admin ekranları bir sonraki adımda stitch tasarımına göre entegre edilecek.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleHomeRedirect />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

          <Route path={ROUTES.CUSTOMER.HOME} element={<CustomerLayout />}>
            <Route index element={<Navigate to={ROUTES.CUSTOMER.SUBMIT} replace />} />
            <Route path="submit" element={<SubmitComplaintPage />} />
            <Route path="complaints" element={<MyComplaintsPage />} />
            <Route path="complaints/:id" element={<ComplaintDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
            <Route path={ROUTES.STAFF.HOME} element={<StaffLayout />}>
              <Route index element={<Navigate to={ROUTES.STAFF.DASHBOARD} replace />} />
              <Route path="dashboard" element={<StaffDashboardPage />} />
              <Route path="complaints" element={<StaffDashboardPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path={ROUTES.ADMIN.HOME} element={<AdminPlaceholderPage />} />
            <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminPlaceholderPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
