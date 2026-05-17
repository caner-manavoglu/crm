import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyAssignments } from '@/hooks/queries/useAssignments';
import { ComplaintStatusBadge } from '@/components/shared/complaints/ComplaintStatusBadge';
import { PriorityBadge } from '@/components/shared/complaints/PriorityBadge';
import { ROUTES } from '@/router/routes';
import type { Assignment } from '@/types/complaint.types';

const STATUS_OPTIONS = [
  { value: '', label: 'Tümü' },
  { value: 'assigned', label: 'Atandı' },
  { value: 'in_progress', label: 'İşlemde' },
  { value: 'resolved', label: 'Çözümlendi' },
];

export function AssignedComplaintsPage() {
  const { data: assignments = [], isLoading } = useMyAssignments();
  const [statusFilter, setStatusFilter] = useState('');

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center gap-sm text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin" style={{ fontSize: '20px' }}>progress_activity</span>
        <span className="font-body-sm text-body-sm">Yükleniyor...</span>
      </div>
    );
  }

  const filtered = (assignments as Assignment[]).filter((a) =>
    !statusFilter || a.complaint?.status === statusFilter
  );

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-md flex items-center justify-between flex-wrap gap-sm">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background font-bold">Atanan Şikayetler</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
            {filtered.length} şikayet
          </p>
        </div>
        <div className="flex items-center gap-xs">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-sm py-xs rounded-lg font-label-md text-label-md transition-colors ${
                statusFilter === opt.value
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-surface-container border border-outline-variant rounded-xl flex flex-col items-center justify-center py-xl gap-sm">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '48px' }}>assignment</span>
          <p className="font-body-md text-body-md text-on-surface-variant">Şikayet bulunamadı.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-sm">
          {filtered.map((a) => (
            <Link
              key={a.id}
              to={ROUTES.STAFF.COMPLAINT_WORK(a.complaintId)}
              className="block bg-surface-container border border-outline-variant rounded-xl p-md hover:border-primary/40 transition-colors group"
            >
              <div className="flex items-start justify-between gap-md">
                <div className="min-w-0 flex-1">
                  <p className="font-body-md text-body-md text-on-surface font-medium truncate group-hover:text-primary transition-colors">
                    {a.complaint?.title}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                    {a.complaint?.category?.name} • {a.complaint?.city?.name}
                  </p>
                  <p className="font-label-md text-label-md text-on-surface-variant mt-xs flex items-center gap-xs">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>person</span>
                    {a.complaint?.customer?.name} {a.complaint?.customer?.surname}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-xs shrink-0">
                  {a.complaint && (
                    <>
                      <ComplaintStatusBadge status={a.complaint.status} />
                      <PriorityBadge priority={a.complaint.priority} />
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
