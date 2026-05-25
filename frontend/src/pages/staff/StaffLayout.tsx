import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/shared/layout/Sidebar';
import { Topbar } from '@/components/shared/layout/Topbar';
import { useSocket } from '@/hooks/useSocket';
import { ROUTES } from '@/router/routes';

const navItems = [
  { label: 'Dashboard', to: ROUTES.STAFF.DASHBOARD, icon: 'dashboard' },
  { label: 'Atanan Şikayetler', to: ROUTES.STAFF.COMPLAINTS, icon: 'assignment' },
];

export function StaffLayout() {
  useSocket();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar title="CRM" items={navItems} />
      <div className="flex-1 flex flex-col min-w-0 md:ml-[280px]">
        <Topbar title="Personel Portalı" subtitle="Atanan şikayetlerinizi yönetin" />
        <main className="flex-1 overflow-auto p-md">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
