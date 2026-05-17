import { Link } from 'react-router-dom';
import { useMyAssignments } from '@/hooks/queries/useAssignments';
import { useMyAvailability, useToggleAvailability } from '@/hooks/queries/useStaffAvailability';
import { ComplaintStatusBadge } from '@/components/shared/complaints/ComplaintStatusBadge';
import { PriorityBadge } from '@/components/shared/complaints/PriorityBadge';
import { ROUTES } from '@/router/routes';
import type { Assignment } from '@/types/complaint.types';

export function StaffDashboardPage() {
  const { data: assignments = [] } = useMyAssignments();
  const { data: availability } = useMyAvailability();
  const toggleAvailability = useToggleAvailability();

  const list = assignments as Assignment[];
  const stats = {
    total: list.length,
    inProgress: list.filter((a) => a.complaint?.status === 'in_progress').length,
    assigned: list.filter((a) => a.complaint?.status === 'assigned').length,
    resolved: list.filter((a) => ['resolved', 'closed'].includes(a.complaint?.status ?? '')).length,
  };

  const loadPct = availability ? (availability.currentLoad / availability.maxCapacity) * 100 : 0;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-md flex items-center justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background font-bold">Personel Paneli</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
            Atamalarınızı ve müsaitlik durumunuzu yönetin
          </p>
        </div>
        <button
          onClick={() => toggleAvailability.mutate()}
          disabled={toggleAvailability.isPending}
          className={`flex items-center gap-xs rounded-xl px-sm py-xs font-body-sm text-body-sm font-semibold transition-all active:scale-[0.98] duration-150 ${
            availability?.isAvailable
              ? 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20'
              : 'bg-error/10 text-error border border-error/30 hover:bg-error/20'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            {availability?.isAvailable ? 'check_circle' : 'cancel'}
          </span>
          {availability?.isAvailable ? 'Müsait' : 'Müsait Değil'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-sm md:grid-cols-4 mb-md">
        {[
          { label: 'Toplam', value: stats.total, icon: 'assignment', color: 'text-on-surface' },
          { label: 'İşlemde', value: stats.inProgress, icon: 'pending', color: 'text-secondary' },
          { label: 'Yeni Atanan', value: stats.assigned, icon: 'new_releases', color: 'text-primary' },
          { label: 'Çözümlendi', value: stats.resolved, icon: 'check_circle', color: 'text-tertiary' },
        ].map((s) => (
          <div key={s.label} className="bg-surface-container border border-outline-variant rounded-xl p-md">
            <div className="flex items-center justify-between mb-xs">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase">{s.label}</p>
              <span className={`material-symbols-outlined ${s.color}`} style={{ fontSize: '20px' }}>{s.icon}</span>
            </div>
            <p className={`font-headline-xl text-headline-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {availability && (
        <div className="bg-surface-container border border-outline-variant rounded-xl p-md mb-md">
          <div className="flex items-center justify-between mb-sm">
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>speed</span>
              <p className="font-body-sm text-body-sm text-on-surface font-medium">Kapasite Kullanımı</p>
            </div>
            <p className="font-label-md text-label-md text-on-surface-variant">
              <strong className="text-on-surface">{availability.currentLoad}</strong> / {availability.maxCapacity} görev
            </p>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-container-lowest">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                loadPct >= 75 ? 'bg-error' : loadPct >= 50 ? 'bg-secondary' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(loadPct, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
        <div className="px-md py-sm border-b border-outline-variant flex items-center justify-between">
          <h3 className="font-label-md text-label-md text-on-surface-variant uppercase flex items-center gap-xs">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>inbox</span>
            Son Atamalar
          </h3>
          <Link
            to={ROUTES.STAFF.COMPLAINTS}
            className="font-label-md text-label-md text-primary hover:underline"
          >
            Tümünü Gör
          </Link>
        </div>
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-xl gap-sm">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '40px' }}>inbox</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Henüz atama yok.</p>
          </div>
        ) : (
          list.slice(0, 6).map((a) => (
            <Link
              key={a.id}
              to={ROUTES.STAFF.COMPLAINT_WORK(a.complaint?.id ?? '')}
              className="flex items-center justify-between px-md py-sm border-b border-outline-variant/50 last:border-0 hover:bg-surface-container-highest/50 transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <p className="font-body-sm text-body-sm text-on-surface font-medium truncate group-hover:text-primary transition-colors">
                  {a.complaint?.title}
                </p>
                <p className="font-label-md text-label-md text-on-surface-variant mt-xs">
                  {a.complaint?.category?.name} • {a.complaint?.city?.name}
                </p>
              </div>
              <div className="flex items-center gap-xs ml-sm">
                {a.complaint && <PriorityBadge priority={a.complaint.priority} />}
                {a.complaint && <ComplaintStatusBadge status={a.complaint.status} />}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
