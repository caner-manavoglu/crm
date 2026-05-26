import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ProtectedRoute } from '@/router/ProtectedRoute';
import { ROUTES } from '@/router/routes';
import { queryClient } from '@/lib/query-client';
import { LandingPage } from '@/pages/public/LandingPage';
import { TrackComplaintPage } from '@/pages/public/TrackComplaintPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { SubmitComplaintPage } from '@/pages/customer/SubmitComplaintPage';
import { StaffLayout } from '@/pages/staff/StaffLayout';
import { StaffDashboardPage } from '@/pages/staff/StaffDashboardPage';
import { AssignedComplaintsPage } from '@/pages/staff/AssignedComplaintsPage';
import { ComplaintWorkPage } from '@/pages/staff/ComplaintWorkPage';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AllComplaintsPage } from '@/pages/admin/complaints/AllComplaintsPage';
import { ComplaintPoolPage } from '@/pages/admin/complaints/ComplaintPoolPage';
import { AdminComplaintDetailPage } from '@/pages/admin/complaints/AdminComplaintDetailPage';
import { StaffManagementPage } from '@/pages/admin/StaffManagementPage';
import { DepartmentsPage } from '@/pages/admin/DepartmentsPage';
import { CategoriesPage } from '@/pages/admin/CategoriesPage';
import { CitiesPage } from '@/pages/admin/CitiesPage';
import { ResolutionProcessesPage } from '@/pages/admin/ResolutionProcessesPage';
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" theme="dark" richColors closeButton />
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.LANDING} element={<LandingPage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

          <Route path={ROUTES.CUSTOMER.SUBMIT} element={<SubmitComplaintPage />} />
          <Route path={ROUTES.TRACK} element={<TrackComplaintPage />} />

          <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
            <Route path={ROUTES.STAFF.HOME} element={<StaffLayout />}>
              <Route index element={<Navigate to={ROUTES.STAFF.DASHBOARD} replace />} />
              <Route path="dashboard" element={<StaffDashboardPage />} />
              <Route path="complaints" element={<AssignedComplaintsPage />} />
              <Route path="complaints/:id" element={<ComplaintWorkPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path={ROUTES.ADMIN.HOME} element={<AdminLayout />}>
              <Route index element={<Navigate to={ROUTES.ADMIN.DASHBOARD} replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="complaints" element={<AllComplaintsPage />} />
              <Route path="complaints/pool" element={<ComplaintPoolPage />} />
              <Route path="complaints/:id" element={<AdminComplaintDetailPage />} />
              <Route path="staff" element={<StaffManagementPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="cities" element={<CitiesPage />} />
              <Route path="resolution-processes" element={<ResolutionProcessesPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
