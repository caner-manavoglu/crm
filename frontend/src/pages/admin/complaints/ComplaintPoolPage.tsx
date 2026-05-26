import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import { useAllComplaints } from '@/hooks/queries/useComplaints';
import { useAdminAssign } from '@/hooks/queries/useAssignments';
import { useAvailableStaff } from '@/hooks/queries/useStaffAvailability';
import { PriorityBadge } from '@/components/shared/complaints/PriorityBadge';
import { PaginationControls } from '@/components/shared/PaginationControls';
import type { Complaint } from '@/types/complaint.types';

const selectClass = 'bg-surface-dim border border-outline-variant rounded-lg px-sm py-[10px] font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors';

export function ComplaintPoolPage() {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const { data, isLoading } = useAllComplaints({
    status: 'pending',
    page,
    limit: PAGE_SIZE,
  });
  const adminAssign = useAdminAssign();
  const [assignModal, setAssignModal] = useState<{ complaintId: string; departmentId?: string; cityId?: string } | null>(null);
  const [selectedStaff, setSelectedStaff] = useState('');

  const { data: availableStaff = [] } = useAvailableStaff(assignModal?.departmentId, assignModal?.cityId);

  const complaints: Complaint[] = data?.data ?? [];
  const totalPages = Math.max(1, data?.meta?.totalPages ?? 1);
  const safePage = Math.min(page, totalPages);

  const handleAssign = () => {
    if (!assignModal || !selectedStaff) return;
    adminAssign.mutate({ complaintId: assignModal.complaintId, staffId: selectedStaff });
    setAssignModal(null);
    setSelectedStaff('');
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-md flex items-center justify-between flex-wrap gap-sm">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background font-bold">Atanmamış Şikayetler</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
            {data?.meta?.total ?? 0} şikayet bekliyor
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center gap-sm text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin" style={{ fontSize: '20px' }}>progress_activity</span>
          <span className="font-body-sm text-body-sm">Yükleniyor...</span>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-surface-container border border-outline-variant rounded-xl flex flex-col items-center justify-center py-xl gap-sm">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '48px' }}>inbox</span>
          <p className="font-body-md text-body-md text-on-surface-variant">Havuzda bekleyen şikayet yok.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-sm">
          {complaints.map((c) => (
            <div key={c.id} className="bg-surface-container border border-outline-variant rounded-xl p-md flex items-start justify-between gap-md">
              <div className="min-w-0 flex-1">
                <p className="font-body-md text-body-md text-on-surface font-medium">{c.title}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                  {c.category?.department?.name} → {c.category?.name}
                </p>
                <p className="font-label-md text-label-md text-on-surface-variant mt-xs flex items-center gap-xs">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                  {c.city?.name}
                  <span className="mx-xs">•</span>
                  {new Date(c.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
              <div className="flex items-center gap-sm shrink-0">
                <PriorityBadge priority={c.priority} />
                <Link
                  to={ROUTES.ADMIN.COMPLAINT_DETAIL(c.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant bg-surface-dim text-on-surface-variant hover:text-primary transition-colors"
                  title="Detay"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
                </Link>
                <button
                  onClick={() => setAssignModal({
                    complaintId: c.id,
                    departmentId: c.category?.departmentId,
                    cityId: c.cityId,
                  })}
                  className="flex items-center gap-xs bg-primary text-on-primary rounded-lg px-sm py-xs font-label-md text-label-md font-semibold hover:opacity-90 transition-opacity active:scale-[0.98] duration-150"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>person_add</span>
                  Ata
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (
        <PaginationControls
          page={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={data?.meta?.total ?? 0}
          pageSize={data?.meta?.limit ?? PAGE_SIZE}
          currentItemCount={complaints.length}
        />
      )}

      {assignModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-md">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-md w-full max-w-[24rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-md">
              <h3 className="font-headline-md text-headline-md text-on-background">Personel Ata</h3>
              <button
                onClick={() => setAssignModal(null)}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className={`${selectClass} w-full mb-md`}
            >
              <option value="">Personel seçin...</option>
              {(availableStaff as { staffId: string; currentLoad: number; maxCapacity: number; staff: { name: string; surname: string } }[]).map((s) => (
                <option key={s.staffId} value={s.staffId} disabled={s.currentLoad >= s.maxCapacity}>
                  {s.staff?.name} {s.staff?.surname} ({s.currentLoad}/{s.maxCapacity})
                </option>
              ))}
            </select>
            <div className="flex gap-sm">
              <button
                onClick={() => setAssignModal(null)}
                className="flex-1 border border-outline-variant rounded-xl py-xs font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedStaff || adminAssign.isPending}
                className="flex-1 bg-primary text-on-primary rounded-xl py-xs font-body-sm text-body-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Ata
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
