import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import type { UserRole } from '@/types/user.types';
import { ROUTES } from './routes';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

const roleHomeMap: Record<UserRole, string> = {
  customer: ROUTES.CUSTOMER.HOME,
  staff: ROUTES.STAFF.DASHBOARD,
  admin: ROUTES.ADMIN.DASHBOARD,
};

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={roleHomeMap[user.role]} replace />;
  }

  return <Outlet />;
}
