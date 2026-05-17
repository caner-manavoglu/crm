import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useComplaint, useComplaintHistory, useUpdateComplaintStatus } from '@/hooks/queries/useComplaints';
import { useAssignmentByComplaint, useTransferComplaint } from '@/hooks/queries/useAssignments';
import { useAvailableStaff } from '@/hooks/queries/useStaffAvailability';
import { ComplaintStatusBadge } from '@/components/shared/complaints/ComplaintStatusBadge';
import { PriorityBadge } from '@/components/shared/complaints/PriorityBadge';
import { ROUTES } from '@/router/routes';
import type { ComplaintHistory } from '@/types/complaint.types';

const nextStatus: Record<string, string> = {
  assigned: 'in_progress',
  in_progress: 'resolved',
  resolved: 'closed',
};

const nextStatusLabel: Record<string, string> = {
  assigned: 'İşleme Al',
  in_progress: 'Çözüldü Olarak İşaretle',
  resolved: 'Kapat',
};

const selectClass = 'w-full bg-surface-dim border border-outline-variant rounded-lg px-sm py-[10px] font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors';
const inputClass = 'w-full bg-surface-dim border border-outline-variant rounded-lg px-sm py-[10px] font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors';

export function ComplaintWorkPage() {
  const { id } = useParams<{ id: string }>();
  const { data: complaint, isLoading } = useComplaint(id!);
  const { data: history = [] } = useComplaintHistory(id!);
  const { data: assignment } = useAssignmentByComplaint(id!);
  const updateStatus = useUpdateComplaintStatus();
  const transferComplaint = useTransferComplaint();

  const [notes, setNotes] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [transferReason, setTransferReason] = useState('');

  const { data: availableStaff = [] } = useAvailableStaff(
    complaint?.category?.departmentId,
    complaint?.cityId,
  );

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center gap-sm text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin" style={{ fontSize: '20px' }}>progress_activity</span>
        <span className="font-body-sm text-body-sm">Yükleniyor...</span>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="font-body-md text-body-md text-on-surface-variant">Şikayet bulunamadı.</p>
      </div>
    );
  }

  const canProgress = complaint.status in nextStatus;

  const handleStatusUpdate = () => {
    const next = nextStatus[complaint.status];
    if (next) updateStatus.mutate({ id: complaint.id, status: next, notes });
  };

  const handleTransfer = () => {
    if (!assignment || !selectedStaff) return;
    transferComplaint.mutate({ id: assignment.id, toStaffId: selectedStaff, reason: transferReason });
    setShowTransfer(false);
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        to={ROUTES.STAFF.COMPLAINTS}
        className="mb-md flex items-center gap-xs font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
        Şikayetlere Dön
      </Link>

      <div className="bg-surface-container border border-outline-variant rounded-xl p-md mb-md">
        <div className="flex items-start justify-between gap-md mb-md">
          <h2 className="font-headline-md text-headline-md text-on-background font-bold">{complaint.title}</h2>
          <div className="flex items-center gap-xs shrink-0">
            <PriorityBadge priority={complaint.priority} />
            <ComplaintStatusBadge status={complaint.status} />
          </div>
        </div>
        <p className="font-body-md text-body-md text-on-surface leading-relaxed">{complaint.content}</p>
        <div className="mt-md pt-sm border-t border-outline-variant/50 grid grid-cols-1 gap-sm md:grid-cols-3">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '16px' }}>category</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              <strong className="text-on-surface font-medium">{complaint.category?.name}</strong>
            </span>
          </div>
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '16px' }}>location_on</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              <strong className="text-on-surface font-medium">{complaint.city?.name}</strong>
            </span>
          </div>
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '16px' }}>person</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              <strong className="text-on-surface font-medium">
                {complaint.customer?.name} {complaint.customer?.surname}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {canProgress && (
        <div className="bg-surface-container border border-outline-variant rounded-xl p-md mb-md">
          <h3 className="font-label-md text-label-md text-on-surface-variant uppercase mb-sm flex items-center gap-xs">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit_note</span>
            İşlem
          </h3>
          <div className="flex flex-col gap-sm">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Not ekleyin (opsiyonel)..."
              rows={2}
              className={`${inputClass} resize-none`}
            />
            <div className="flex gap-sm">
              <button
                onClick={handleStatusUpdate}
                disabled={updateStatus.isPending}
                className="flex-1 flex items-center justify-center gap-xs bg-primary text-on-primary rounded-xl py-xs px-sm font-body-sm text-body-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 active:scale-[0.98] duration-150"
              >
                {updateStatus.isPending ? (
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                )}
                {nextStatusLabel[complaint.status]}
              </button>
              <button
                onClick={() => setShowTransfer(!showTransfer)}
                className="flex items-center gap-xs border border-outline-variant rounded-xl py-xs px-sm font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>swap_horiz</span>
                Transfer Et
              </button>
            </div>
          </div>
        </div>
      )}

      {showTransfer && (
        <div className="bg-surface-container border border-secondary/30 rounded-xl p-md mb-md">
          <h3 className="font-label-md text-label-md text-on-surface-variant uppercase mb-sm flex items-center gap-xs">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '16px' }}>swap_horiz</span>
            Transfer
          </h3>
          <div className="flex flex-col gap-sm">
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className={selectClass}
            >
              <option value="">Personel seçin...</option>
              {(availableStaff as { staffId: string; currentLoad: number; maxCapacity: number; staff: { name: string; surname: string } }[]).map((s) => (
                <option key={s.staffId} value={s.staffId} disabled={s.currentLoad >= s.maxCapacity}>
                  {s.staff?.name} {s.staff?.surname} ({s.currentLoad}/{s.maxCapacity})
                </option>
              ))}
            </select>
            <input
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              placeholder="Transfer nedeni..."
              className={inputClass}
            />
            <button
              onClick={handleTransfer}
              disabled={!selectedStaff || transferComplaint.isPending}
              className="flex items-center justify-center gap-xs bg-secondary text-on-secondary rounded-xl py-xs px-sm font-body-sm text-body-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
              Transfer Onayla
            </button>
          </div>
        </div>
      )}

      <div className="bg-surface-container border border-outline-variant rounded-xl p-md">
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase mb-md flex items-center gap-xs">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>history</span>
          Geçmiş
        </h3>
        <div className="flex flex-col gap-xs">
          {(history as ComplaintHistory[]).length === 0 ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-md">Henüz geçmiş yok.</p>
          ) : (
            (history as ComplaintHistory[]).map((h, i) => (
              <div key={h.id} className="flex gap-sm">
                <div className="flex flex-col items-center">
                  <div className="mt-[6px] h-3 w-3 rounded-full bg-primary shrink-0" />
                  {i < history.length - 1 && <div className="mt-xs w-[2px] flex-1 bg-outline-variant" />}
                </div>
                <div className="pb-sm flex-1">
                  <ComplaintStatusBadge status={h.newStatus} />
                  {h.notes && (
                    <p className="mt-xs bg-surface-container-high rounded-lg px-sm py-xs font-body-sm text-body-sm text-on-surface">
                      {h.notes}
                    </p>
                  )}
                  <p className="mt-xs font-label-md text-label-md text-on-surface-variant">
                    {new Date(h.createdAt).toLocaleString('tr-TR')}
                    {h.user && ` • ${h.user.name} ${h.user.surname}`}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
