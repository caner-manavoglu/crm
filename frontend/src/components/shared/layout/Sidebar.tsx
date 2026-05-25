import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTES } from '@/router/routes';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: string | LucideIcon;
}

interface SidebarProps {
  title: string;
  items: NavItem[];
}

export function Sidebar({ title, items }: SidebarProps) {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const initials = user ? `${user.name[0]}${user.surname[0]}`.toUpperCase() : 'U';

  return (
    <aside className="fixed left-0 top-0 h-full hidden w-[280px] shrink-0 border-r border-outline-variant bg-surface-container text-on-surface md:flex md:flex-col z-30">
      <div className="border-b border-outline-variant px-md py-md flex items-center gap-sm">
        <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: '18px' }}>support_agent</span>
        </div>
        <div>
          <span className="font-body-md text-body-md font-semibold text-primary">{title}</span>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase">Müşteri Yönetimi</p>
        </div>
      </div>

      <nav className="flex-1 p-sm overflow-y-auto">
        <div className="flex flex-col gap-xs">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-sm rounded-xl px-sm py-xs font-body-sm text-body-sm transition-colors',
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high',
                )
              }
            >
              {typeof item.icon === 'string' ? (
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
              ) : (
                <item.icon size={18} />
              )}
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-outline-variant p-sm">
        <div className="flex items-center gap-sm px-sm py-xs mb-xs">
          <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold text-xs border border-outline-variant shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            {user ? (
              <>
                <p className="font-body-sm text-body-sm text-on-surface font-medium truncate">
                  {user.name} {user.surname}
                </p>
                <p className="font-label-md text-label-md text-on-surface-variant capitalize">{user.role}</p>
              </>
            ) : (
              <>
                <p className="font-body-sm text-body-sm text-on-surface font-medium truncate">Misafir Kullanıcı</p>
                <p className="font-label-md text-label-md text-on-surface-variant">Public Portal</p>
              </>
            )}
          </div>
        </div>
        {user ? (
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-sm rounded-xl px-sm py-xs font-body-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-error"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
            Çıkış Yap
          </button>
        ) : (
          <button
            onClick={() => navigate(ROUTES.LOGIN)}
            className="flex w-full items-center gap-sm rounded-xl px-sm py-xs font-body-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>login</span>
            Panel Girişi
          </button>
        )}
      </div>
    </aside>
  );
}
