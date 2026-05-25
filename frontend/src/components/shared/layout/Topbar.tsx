import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationsStore } from '@/stores/notifications.store';
import { ROUTES } from '@/router/routes';
import { cn } from '@/lib/utils';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { unreadCount, notifications, markAllRead } = useNotificationsStore();
  const [showNotifs, setShowNotifs] = useState(false);

  const initials = user ? `${user.name[0]}${user.surname[0]}`.toUpperCase() : 'U';

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <header className="flex items-center justify-between px-margin w-full bg-surface-dim border-b border-outline-variant h-16 sticky top-0 z-40">
      <div>
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-background">{title}</h2>
        {subtitle && (
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs hidden md:block">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-sm text-on-surface-variant">
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) markAllRead(); }}
            className="p-xs hover:bg-surface-container-highest rounded-full transition-colors cursor-pointer active:scale-95 duration-150 relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-error text-on-error text-[10px] rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-10 w-80 bg-surface-container border border-outline-variant rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-md py-sm border-b border-outline-variant flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase">Bildirimler</span>
                <button onClick={() => setShowNotifs(false)} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                </button>
              </div>
              {notifications.length === 0 ? (
                <p className="p-md text-body-sm text-on-surface-variant text-center font-body-sm">Bildirim yok</p>
              ) : (
                notifications.slice(0, 6).map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      'px-md py-sm border-b border-outline-variant/50 last:border-0',
                      !n.read && 'bg-surface-container-low',
                    )}
                  >
                    <p className="font-body-sm text-body-sm text-on-surface">{n.message}</p>
                    <p className="font-label-md text-label-md text-on-surface-variant mt-xs">
                      {new Date(n.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="h-8 w-8 rounded-full bg-primary-container/20 grid place-items-center text-primary font-bold text-sm leading-none border border-outline-variant ml-sm">
          <span className="translate-y-[0.5px]">{initials}</span>
        </div>

        {user && (
          <div className="hidden md:flex flex-col items-start">
            <span className="font-body-sm text-body-sm text-on-surface font-medium">
              {user.name} {user.surname}
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant capitalize">{user.role}</span>
          </div>
        )}

        <button
          onClick={handleLogout}
          title="Çıkış Yap"
          className="p-xs ml-sm hover:bg-surface-container-highest hover:text-error rounded-full transition-colors cursor-pointer active:scale-95 duration-150"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
  );
}
