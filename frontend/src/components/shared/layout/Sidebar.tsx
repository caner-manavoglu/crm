import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTES } from '@/router/routes';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Building2,
  CalendarCheck2,
  ChevronDown,
  ClipboardCheck,
  Headset,
  Inbox,
  List,
  ListChecks,
  LogIn,
  LogOut,
  MapPin,
  PlusCircle,
  Settings,
  ShieldCheck,
  Tag,
  Users,
  LayoutDashboard,
} from 'lucide-react';

export interface NavItem {
  label: string;
  to?: string; // saf açılır gruplarda yol olmaz
  icon: string | LucideIcon;
  children?: NavItem[];
}

interface SidebarProps {
  title: string;
  items: NavItem[];
}

const navItemBase = 'flex items-center gap-sm rounded-xl px-sm py-xs font-body-sm text-body-sm transition-colors';
const navItemActive = 'bg-primary-container text-on-primary-container font-semibold';
const navItemIdle = 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high';

const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  assignment: ClipboardCheck,
  assignment_late: ClipboardCheck,
  add_circle: PlusCircle,
  inbox: Inbox,
  list_alt: List,
  pending_actions: CalendarCheck2,
  group: Users,
  corporate_fare: Building2,
  category: Tag,
  location_city: MapPin,
  checklist: ListChecks,
  bar_chart: BarChart3,
  settings: Settings,
  admin_panel_settings: ShieldCheck,
  logout: LogOut,
  login: LogIn,
};

function NavIcon({ icon }: { icon: NavItem['icon'] }) {
  if (typeof icon === 'string') {
    const Icon = iconMap[icon] ?? Headset;
    return <Icon size={18} strokeWidth={2.1} />;
  }
  const Icon = icon;
  return <Icon size={18} />;
}

function NavLeaf({ item, nested = false }: { item: NavItem; nested?: boolean }) {
  return (
    <NavLink
      to={item.to ?? '#'}
      end={nested}
      className={({ isActive }) => cn(navItemBase, nested && 'py-[6px]', isActive ? navItemActive : navItemIdle)}
    >
      <NavIcon icon={item.icon} />
      {item.label}
    </NavLink>
  );
}

function NavGroup({ item }: { item: NavItem }) {
  const location = useLocation();

  const childActive = !!item.children?.some(
    (c) => c.to && (location.pathname === c.to || location.pathname.startsWith(`${c.to}/`)),
  );

  // Saf açılır menü: tıklayınca yönlendirme yapmaz, yalnızca aç/kapa yapar.
  // Varsayılan olarak alt sayfa aktifken açık gelir; kullanıcı manuel kapatabilir/açabilir.
  const [override, setOverride] = useState<boolean | null>(null);
  const expanded = override ?? childActive;

  // Kapalıyken ve bu bölümün içindeyken parent tam mavi (aktif) görünür;
  // açıkken aktif olan alt seçenek vurgulandığı için parent hafif kalır.
  const parentClass = childActive
    ? expanded
      ? 'bg-surface-container-high text-on-surface font-medium'
      : navItemActive
    : navItemIdle;

  return (
    <div className="flex flex-col gap-xs">
      <button
        type="button"
        onClick={() => setOverride(!expanded)}
        className={cn(navItemBase, 'w-full justify-between', parentClass)}
      >
        <span className="flex items-center gap-sm">
          <NavIcon icon={item.icon} />
          {item.label}
        </span>
        <span
          className="transition-transform duration-200"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
        >
          <ChevronDown size={16} strokeWidth={2.1} />
        </span>
      </button>

      {expanded && item.children && (
        <div className="ml-md flex flex-col gap-xs border-l border-outline-variant pl-sm">
          {item.children.map((child) => (
            <NavLeaf key={child.to} item={child} nested />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ title, items }: SidebarProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const quickActionTarget = user?.role === 'admin'
    ? ROUTES.ADMIN.COMPLAINTS
    : user?.role === 'staff'
      ? ROUTES.STAFF.COMPLAINTS
      : ROUTES.CUSTOMER.SUBMIT;

  return (
    <aside className="fixed left-0 top-0 h-full hidden w-[280px] shrink-0 border-r border-outline-variant bg-surface-container text-on-surface md:flex md:flex-col z-30">
      <div className="border-b border-outline-variant px-md py-md flex items-center gap-sm">
        <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
          <Headset size={18} strokeWidth={2.2} className="text-on-primary-container" />
        </div>
        <div>
          <span className="font-body-md text-body-md font-semibold text-primary">{title}</span>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase">Müşteri Yönetimi</p>
        </div>
      </div>

      <div className="px-sm pt-sm">
        <button
          onClick={() => navigate(quickActionTarget)}
          className="flex w-full items-center justify-center gap-xs rounded-xl bg-primary px-sm py-sm font-label-md text-label-md text-on-primary transition-opacity hover:opacity-90"
        >
          <PlusCircle size={16} strokeWidth={2.2} />
          Yeni Şikayet
        </button>
      </div>

      <nav className="flex-1 p-sm overflow-y-auto">
        <div className="flex flex-col gap-xs">
          {items.map((item) =>
            item.children && item.children.length > 0 ? (
              <NavGroup key={item.label} item={item} />
            ) : (
              <NavLeaf key={item.to ?? item.label} item={item} />
            ),
          )}
        </div>
      </nav>
    </aside>
  );
}
