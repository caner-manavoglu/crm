import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  Gauge,
  Plus,
  Search,
  SortAsc,
  Timer,
} from 'lucide-react';
import { useMyAssignments } from '@/hooks/queries/useAssignments';
import { useMyAvailability, useToggleAvailability } from '@/hooks/queries/useStaffAvailability';
import { ComplaintStatusBadge } from '@/components/shared/complaints/ComplaintStatusBadge';
import { PriorityBadge } from '@/components/shared/complaints/PriorityBadge';
import { ROUTES } from '@/router/routes';
import type { Assignment } from '@/types/complaint.types';

const STATUS_OPTIONS = [
  { label: 'Tüm Durumlar', value: 'all' },
  { label: 'Beklemede', value: 'pending' },
  { label: 'Atandı', value: 'assigned' },
  { label: 'İşlemde', value: 'in_progress' },
  { label: 'Çözüldü', value: 'resolved' },
  { label: 'Kapalı', value: 'closed' },
] as const;

export function StaffDashboardPage() {
  const navigate = useNavigate();
  const { data: assignments = [] } = useMyAssignments();
  const { data: availability } = useMyAvailability();
  const toggleAvailability = useToggleAvailability();
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]['value']>('all');
  const [search, setSearch] = useState('');

  const list = assignments as Assignment[];

  const filteredAssignments = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();
    return list.filter((item) => {
      const complaint = item.complaint;
      if (!complaint) return false;
      if (statusFilter !== 'all' && complaint.status !== statusFilter) return false;
      if (!normalizedQuery) return true;
      return (
        complaint.title.toLowerCase().includes(normalizedQuery)
        || complaint.customer?.name.toLowerCase().includes(normalizedQuery)
        || complaint.customer?.surname.toLowerCase().includes(normalizedQuery)
        || complaint.category?.name.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [list, search, statusFilter]);

  const stats = {
    total: list.length,
    active: list.filter((item) => ['assigned', 'in_progress'].includes(item.complaint?.status ?? '')).length,
    resolvedWeekly: list.filter((item) => ['resolved', 'closed'].includes(item.complaint?.status ?? '')).length,
    inProgress: list.filter((item) => item.complaint?.status === 'in_progress').length,
  };

  const loadPct = availability ? Math.min((availability.currentLoad / availability.maxCapacity) * 100, 100) : 0;

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-md flex flex-col gap-sm md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Personel Atama Panosu</h2>
          <p className="mt-xs font-body-md text-body-md text-on-surface-variant">
            Günlük operasyonel görev atamaları ve personel durum takibi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-sm">
          <button className="inline-flex h-12 items-center gap-xs rounded-lg border border-outline-variant bg-surface-container px-md font-label-md text-label-md text-on-surface transition-colors hover:border-primary/40">
            <Download size={16} />
            Rapor İndir
          </button>
          <Link
            to={ROUTES.STAFF.COMPLAINTS}
            className="inline-flex h-12 items-center gap-xs rounded-lg bg-primary px-md font-label-md text-label-md text-on-primary transition-colors hover:opacity-90"
          >
            <Plus size={16} />
            Yeni Görev
          </Link>
          <button
            onClick={() => toggleAvailability.mutate()}
            disabled={toggleAvailability.isPending}
            className={`inline-flex h-12 items-center gap-xs rounded-lg border px-md font-label-md text-label-md transition-colors ${
              availability?.isAvailable
                ? 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/20'
                : 'border-error/40 bg-error/10 text-error hover:bg-error/20'
            }`}
          >
            {availability?.isAvailable ? 'Müsait' : 'Müsait Değil'}
          </button>
        </div>
      </div>

      <div className="mb-md grid grid-cols-1 gap-md md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-outline-variant bg-surface-container p-md">
          <div className="mb-sm flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase text-on-surface-variant">Toplam Atanan</span>
            <span className="rounded-full bg-primary-container/20 p-xs text-primary"><ClipboardList size={16} /></span>
          </div>
          <p className="font-headline-xl text-headline-xl text-on-surface">{stats.total}</p>
          <p className="mt-xs font-body-sm text-body-sm text-on-surface-variant">Aktif iş gücü görünümü</p>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-container p-md">
          <div className="mb-sm flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase text-on-surface-variant">Aktif Görevler</span>
            <span className="rounded-full bg-secondary/15 p-xs text-secondary"><Timer size={16} /></span>
          </div>
          <p className="font-headline-xl text-headline-xl text-on-surface">{stats.active}</p>
          <p className="mt-xs font-body-sm text-body-sm text-on-surface-variant">{stats.inProgress} acil bekleyen</p>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-container p-md">
          <div className="mb-sm flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase text-on-surface-variant">Bu Hafta Tamamlanan</span>
            <span className="rounded-full bg-[#22C55E]/15 p-xs text-[#B1E5D5]"><CheckCircle2 size={16} /></span>
          </div>
          <p className="font-headline-xl text-headline-xl text-on-surface">{stats.resolvedWeekly}</p>
          <p className="mt-xs font-body-sm text-body-sm text-on-surface-variant">Çözüm ve kapanış kayıtları</p>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-container p-md">
          <div className="mb-sm flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase text-on-surface-variant">Kapasite Kullanımı</span>
            <span className="text-on-surface-variant"><Gauge size={16} /></span>
          </div>
          <p className="font-headline-xl text-headline-xl text-on-surface">{Math.round(loadPct)}%</p>
          <p className="mb-sm font-body-sm text-body-sm text-on-surface-variant">
            {availability?.currentLoad ?? 0}/{availability?.maxCapacity ?? 0} görev
          </p>
          <div className="h-2 w-full rounded-full bg-surface-dim">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${loadPct}%` }} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container">
        <div className="border-b border-outline-variant bg-surface-container-low p-md">
          <div className="flex flex-col gap-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-sm">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as (typeof STATUS_OPTIONS)[number]['value'])}
                  className="appearance-none rounded-lg border border-outline-variant bg-surface-dim px-sm py-[8px] pr-xl font-body-sm text-body-sm text-on-surface outline-none transition-colors focus:border-primary"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <button className="inline-flex items-center gap-xs rounded-lg border border-outline-variant bg-surface-dim px-sm py-[8px] font-body-sm text-body-sm text-on-surface">
                <CalendarDays size={14} />
                Son 7 Gün
              </button>
            </div>

            <div className="flex w-full items-center gap-sm lg:w-auto">
              <div className="relative w-full lg:w-[320px]">
                <Search size={16} className="pointer-events-none absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Görev veya müşteri ara..."
                  className="w-full rounded-lg border border-outline-variant bg-surface-dim py-[8px] pl-9 pr-sm font-body-sm text-body-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary"
                />
              </div>
              <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant bg-surface-dim text-on-surface-variant transition-colors hover:text-on-surface">
                <SortAsc size={15} />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-lowest">
                <th className="px-md py-sm font-label-md text-label-md uppercase text-on-surface-variant">Müşteri / Görev</th>
                <th className="px-md py-sm font-label-md text-label-md uppercase text-on-surface-variant">Kategori</th>
                <th className="px-md py-sm font-label-md text-label-md uppercase text-on-surface-variant">Öncelik</th>
                <th className="px-md py-sm font-label-md text-label-md uppercase text-on-surface-variant">Durum</th>
                <th className="px-md py-sm font-label-md text-label-md uppercase text-on-surface-variant">Atama Tarihi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-md py-lg text-center font-body-sm text-body-sm text-on-surface-variant">
                    Uygun atama bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((assignment) => {
                  const complaint = assignment.complaint;
                  if (!complaint) return null;
                  const initials = `${complaint.customer?.name?.[0] ?? 'M'}${complaint.customer?.surname?.[0] ?? 'K'}`.toUpperCase();
                  return (
                    <tr
                      key={assignment.id}
                      className="cursor-pointer transition-colors hover:bg-surface-container-highest/50"
                      onClick={() => navigate(ROUTES.STAFF.COMPLAINT_WORK(complaint.id))}
                    >
                      <td className="px-md py-sm">
                        <div className="flex items-center gap-sm">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container/20 text-xs font-bold text-primary">
                            {initials}
                          </div>
                          <div>
                            <p className="font-body-md text-body-md text-on-surface">{complaint.customer?.name} {complaint.customer?.surname}</p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">{complaint.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-md py-sm font-body-sm text-body-sm text-on-surface-variant">{complaint.category?.name}</td>
                      <td className="px-md py-sm">{complaint.priority && <PriorityBadge priority={complaint.priority} />}</td>
                      <td className="px-md py-sm">{complaint.status && <ComplaintStatusBadge status={complaint.status} />}</td>
                      <td className="px-md py-sm font-body-sm text-body-sm text-on-surface-variant">
                        {new Date(assignment.assignedAt).toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low px-md py-sm">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Toplam {filteredAssignments.length} kayıttan ilk {Math.min(filteredAssignments.length, 20)} satır gösteriliyor.
          </span>
          <Link
            to={ROUTES.STAFF.COMPLAINTS}
            className="font-label-md text-label-md text-primary transition-colors hover:text-on-surface"
          >
            Tümünü Gör
          </Link>
        </div>
      </div>
    </div>
  );
}
