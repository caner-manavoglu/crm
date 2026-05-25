import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight, FileSearch, Filter, Plus, Search } from 'lucide-react';
import { useMyComplaints } from '@/hooks/queries/useComplaints';
import { ROUTES } from '@/router/routes';
import { ComplaintStatusBadge } from '@/components/shared/complaints/ComplaintStatusBadge';
import { PriorityBadge } from '@/components/shared/complaints/PriorityBadge';
import type { Complaint, ComplaintStatus } from '@/types/complaint.types';

const STATUS_TABS: Array<{ value: ComplaintStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Hepsi' },
  { value: 'pending', label: 'Beklemede' },
  { value: 'assigned', label: 'Atandı' },
  { value: 'in_progress', label: 'Çözülüyor' },
  { value: 'resolved', label: 'Tamamlandı' },
  { value: 'closed', label: 'Kapatıldı' },
];

export function MyComplaintsPage() {
  const { data, isLoading } = useMyComplaints();
  const [activeStatus, setActiveStatus] = useState<ComplaintStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const complaints = useMemo(() => {
    if (Array.isArray(data)) return data as Complaint[];
    if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: unknown }).data)) {
      return (data as { data: Complaint[] }).data;
    }
    return [] as Complaint[];
  }, [data]);

  const filteredComplaints = complaints.filter((complaint) => {
    if (activeStatus !== 'all' && complaint.status !== activeStatus) return false;
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      complaint.title.toLowerCase().includes(query)
      || complaint.content.toLowerCase().includes(query)
      || complaint.category?.name.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">Şikayetler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-md flex flex-col gap-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Şikayetlerim</h2>
          <p className="mt-xs font-body-sm text-body-sm text-on-surface-variant">
            Müşteri şikayetlerinizi izleyin ve son durumunu görüntüleyin.
          </p>
        </div>
        <Link
          to={ROUTES.CUSTOMER.SUBMIT}
          className="inline-flex h-10 items-center gap-xs self-start rounded-lg bg-primary px-md font-label-md text-label-md text-on-primary transition-colors hover:opacity-90"
        >
          <Plus size={16} />
          Yeni Şikayet
        </Link>
      </div>

      <div className="mb-md rounded-xl border border-outline-variant bg-surface-container p-md">
        <div className="flex flex-col gap-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-xs">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveStatus(tab.value)}
                className={`rounded-full border px-sm py-[6px] font-label-md text-label-md transition-colors ${
                  activeStatus === tab.value
                    ? 'border-primary bg-primary-container text-on-primary-container'
                    : 'border-outline-variant text-on-surface-variant hover:border-primary/40 hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex w-full items-center gap-sm lg:w-auto">
            <button
              type="button"
              className="hidden h-10 items-center gap-xs rounded-lg border border-outline-variant bg-surface-dim px-sm text-on-surface-variant md:inline-flex"
            >
              <CalendarDays size={16} />
              Son 30 Gün
            </button>
            <div className="relative w-full lg:w-[320px]">
              <Search size={16} className="pointer-events-none absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Başlık veya kategori ara..."
                className="h-10 w-full rounded-lg border border-outline-variant bg-surface-dim pl-9 pr-sm font-body-sm text-body-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant bg-surface-dim text-on-surface-variant transition-colors hover:text-on-surface"
            >
              <Filter size={16} />
            </button>
          </div>
        </div>
      </div>

      {filteredComplaints.length === 0 ? (
        <div className="rounded-xl border border-outline-variant bg-surface-container p-xl text-center">
          <FileSearch size={36} className="mx-auto text-on-surface-variant" />
          <p className="mt-sm font-body-md text-body-md text-on-surface">Filtreye uygun şikayet bulunamadı.</p>
          <p className="mt-xs font-body-sm text-body-sm text-on-surface-variant">Durum filtresini değiştirin veya yeni kayıt oluşturun.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-md lg:grid-cols-2 xl:grid-cols-3">
          {filteredComplaints.map((complaint) => (
            <Link
              key={complaint.id}
              to={ROUTES.CUSTOMER.COMPLAINT_DETAIL(complaint.id)}
              className="group relative flex flex-col gap-sm overflow-hidden rounded-xl border border-outline-variant bg-surface-container p-md transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-sm">
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant">#{complaint.id.slice(0, 8).toUpperCase()}</p>
                  <h3 className="mt-xs line-clamp-2 font-headline-md text-headline-md text-on-surface transition-colors group-hover:text-primary">
                    {complaint.title}
                  </h3>
                </div>
                <ChevronRight size={18} className="shrink-0 text-on-surface-variant transition-colors group-hover:text-primary" />
              </div>

              <p className="line-clamp-2 font-body-sm text-body-sm text-on-surface-variant">{complaint.content}</p>

              <div className="mt-xs flex flex-wrap items-center gap-xs">
                <ComplaintStatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
              </div>

              <div className="mt-auto border-t border-outline-variant/50 pt-sm font-body-sm text-body-sm text-on-surface-variant">
                <p>{complaint.category?.name ?? 'Kategori yok'}</p>
                <p className="mt-xs">{new Date(complaint.createdAt).toLocaleString('tr-TR')}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
