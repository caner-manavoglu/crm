import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/shared/layout/Sidebar';
import { Topbar } from '@/components/shared/layout/Topbar';
import { useSocket } from '@/hooks/useSocket';
import { ROUTES } from '@/router/routes';

const navItems = [
  { label: 'Şikayet Oluştur', to: ROUTES.CUSTOMER.SUBMIT, icon: 'add_circle' },
  { label: 'Şikayetlerim', to: ROUTES.CUSTOMER.COMPLAINTS, icon: 'inbox' },
];

export function CustomerLayout() {
  useSocket();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar title="CareFlow" items={navItems} />
      <div className="flex-1 flex flex-col min-w-0 md:ml-[280px]">
        <Topbar title="Müşteri Portalı" subtitle="Şikayetlerinizi takip edin" />
        <main className="flex-1 overflow-auto p-md">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
