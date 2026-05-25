import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/shared/layout/Sidebar';
import { Topbar } from '@/components/shared/layout/Topbar';
import { useSocket } from '@/hooks/useSocket';
import { ROUTES } from '@/router/routes';

const navItems = [
  { label: 'Dashboard', to: ROUTES.ADMIN.DASHBOARD, icon: 'dashboard' },
  {
    label: 'Şikayetler',
    icon: 'inbox',
    children: [
      { label: 'Tüm Şikayetler', to: ROUTES.ADMIN.COMPLAINTS, icon: 'list_alt' },
      { label: 'Şikayet Havuzu', to: ROUTES.ADMIN.COMPLAINT_POOL, icon: 'pending_actions' },
    ],
  },
  { label: 'Personel', to: ROUTES.ADMIN.STAFF, icon: 'group' },
  { label: 'Departmanlar', to: ROUTES.ADMIN.DEPARTMENTS, icon: 'corporate_fare' },
  { label: 'Kategoriler', to: ROUTES.ADMIN.CATEGORIES, icon: 'category' },
  { label: 'Şehirler', to: ROUTES.ADMIN.CITIES, icon: 'location_city' },
  { label: 'Çözüm Süreçleri', to: ROUTES.ADMIN.RESOLUTION_PROCESSES, icon: 'checklist' },
  { label: 'Analitik', to: ROUTES.ADMIN.ANALYTICS, icon: 'bar_chart' },
];

export function AdminLayout() {
  useSocket();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar title="CRM" items={navItems} />
      <div className="flex-1 flex flex-col min-w-0 md:ml-[280px]">
        <Topbar title="Admin Paneli" subtitle="CRM yönetim merkezi" />
        <main className="flex-1 overflow-auto p-md">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
