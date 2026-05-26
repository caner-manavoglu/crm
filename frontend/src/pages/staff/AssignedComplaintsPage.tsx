import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useMyAssignments } from '@/hooks/queries/useAssignments';
import { ComplaintStatusBadge } from '@/components/shared/complaints/ComplaintStatusBadge';
import { PriorityBadge } from '@/components/shared/complaints/PriorityBadge';
import { ROUTES } from '@/router/routes';
import { PaginationControls } from '@/components/shared/PaginationControls';
import type { Assignment } from '@/types/complaint.types';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tümü' },
  { value: 'assigned', label: 'Atandı' },
  { value: 'in_progress', label: 'İşlemde' },
  { value: 'resolved', label: 'Çözüldü' },
  { value: 'closed', label: 'Kapalı' },
] as const;

export function AssignedComplaintsPage() {
  const { data: assignments = [], isLoading } = useMyAssignments();
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]['value']>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 8;

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (assignments as Assignment[]).filter((assignment) => {
      const complaint = assignment.complaint;
      if (!complaint) return false;
      if (statusFilter !== 'all' && complaint.status !== statusFilter) return false;
      if (!query) return true;
      return (
        complaint.title.toLowerCase().includes(query)
        || complaint.customer?.name.toLowerCase().includes(query)
        || complaint.customer?.surname.toLowerCase().includes(query)
        || complaint.category?.name.toLowerCase().includes(query)
      );
    });
  }, [assignments, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedAssignments = filteredAssignments.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <span className="font-body-sm text-body-sm text-on-surface-variant">Atamalar yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-md flex flex-col gap-sm md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Atanan Şikayetler</h2>
          <p className="mt-xs font-body-sm text-body-sm text-on-surface-variant">Üzerinizdeki aktif ve geçmiş görevler</p>
        </div>

        <div className="relative w-full md:w-[320px]">
          <Search size={16} className="pointer-events-none absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Başlık veya müşteri ara..."
            className="h-10 w-full rounded-lg border border-outline-variant bg-surface-dim pl-9 pr-sm font-body-sm text-body-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="mb-md flex flex-wrap gap-xs">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              setStatusFilter(option.value);
              setPage(1);
            }}
            className={`rounded-full border px-sm py-[6px] font-label-md text-label-md transition-colors ${
              statusFilter === option.value
                ? 'border-primary bg-primary-container text-on-primary-container'
                : 'border-outline-variant text-on-surface-variant hover:border-primary/40 hover:text-on-surface'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filteredAssignments.length === 0 ? (
        <div className="rounded-xl border border-outline-variant bg-surface-container p-xl text-center">
          <p className="font-body-md text-body-md text-on-surface">Kriterlere uygun görev bulunamadı.</p>
          <p className="mt-xs font-body-sm text-body-sm text-on-surface-variant">Filtre veya arama metnini değiştirin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-md lg:grid-cols-2">
          {pagedAssignments.map((assignment) => {
            const complaint = assignment.complaint;
            if (!complaint) return null;
            return (
              <Link
                key={assignment.id}
                to={ROUTES.STAFF.COMPLAINT_WORK(assignment.complaintId)}
                className="group block rounded-xl border border-outline-variant bg-surface-container p-md transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-sm">
                  <div className="min-w-0">
                    <p className="font-headline-md text-headline-md text-on-surface transition-colors group-hover:text-primary">
                      {complaint.title}
                    </p>
                    <p className="mt-xs font-body-sm text-body-sm text-on-surface-variant">
                      {complaint.customer?.name} {complaint.customer?.surname}
                    </p>
                  </div>
                  <PriorityBadge priority={complaint.priority} />
                </div>

                <div className="mt-sm flex flex-wrap items-center gap-xs">
                  <ComplaintStatusBadge status={complaint.status} />
                  <span className="rounded-full border border-outline-variant bg-surface-dim px-sm py-[2px] font-label-md text-label-md text-on-surface-variant">
                    {complaint.category?.name}
                  </span>
                  <span className="rounded-full border border-outline-variant bg-surface-dim px-sm py-[2px] font-label-md text-label-md text-on-surface-variant">
                    {complaint.city?.name}
                  </span>
                </div>

                <p className="mt-sm border-t border-outline-variant/50 pt-sm font-body-sm text-body-sm text-on-surface-variant">
                  Atama: {new Date(assignment.assignedAt).toLocaleString('tr-TR')}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      {!isLoading && filteredAssignments.length > 0 && (
        <PaginationControls
          page={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={filteredAssignments.length}
          pageSize={PAGE_SIZE}
          currentItemCount={pagedAssignments.length}
        />
      )}
    </div>
  );
}
