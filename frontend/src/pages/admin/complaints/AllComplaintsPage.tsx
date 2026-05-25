import { useState } from 'react';
import { useAllComplaints } from '@/hooks/queries/useComplaints';
import { useAdminAssign } from '@/hooks/queries/useAssignments';
import { useAvailableStaff } from '@/hooks/queries/useStaffAvailability';
import { ComplaintStatusBadge } from '@/components/shared/complaints/ComplaintStatusBadge';
import { PriorityBadge } from '@/components/shared/complaints/PriorityBadge';
import type { Complaint } from '@/types/complaint.types';

const selectClass = 'bg-surface-dim border border-outline-variant rounded-lg px-sm py-[10px] font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors';

type AssignModalState = { complaintId: string; departmentId?: string; cityId?: string };

export function AllComplaintsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [assignModal, setAssignModal] = useState<AssignModalState | null>(null);
  const [selectedStaff, setSelectedStaff] = useState('');

  const { data, isLoading } = useAllComplaints(statusFilter ? { status: statusFilter } : undefined);
  const adminAssign = useAdminAssign();
  const { data: availableStaff = [] } = useAvailableStaff(assignModal?.departmentId, assignModal?.cityId);

  const complaints: Complaint[] = data?.data ?? [];

  const handleAssign = () => {
    if (!assignModal || !selectedStaff) return;
    adminAssign.mutate({ complaintId: assignModal.complaintId, staffId: selectedStaff });
    setAssignModal(null);
    setSelectedStaff('');
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-md flex items-center justify-between flex-wrap gap-sm">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background font-bold">Tüm Şikayetler</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
            {data?.meta?.total ?? 0} şikayet
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={selectClass}
        >
          <option value="">Tüm Durumlar</option>
          <option value="pending">Beklemede</option>
          <option value="assigned">Atandı</option>
          <option value="in_progress">İşlemde</option>
          <option value="resolved">Çözüldü</option>
          <option value="closed">Kapatıldı</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center gap-sm text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin" style={{ fontSize: '20px' }}>progress_activity</span>
          <span className="font-body-sm text-body-sm">Yükleniyor...</span>
        </div>
      ) : (
        <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant">
                <th className="px-md py-sm text-left font-label-md text-label-md text-on-surface-variant uppercase">Başlık</th>
                <th className="px-md py-sm text-left font-label-md text-label-md text-on-surface-variant uppercase hidden md:table-cell">Kategori</th>
                <th className="px-md py-sm text-left font-label-md text-label-md text-on-surface-variant uppercase hidden md:table-cell">Şehir</th>
                <th className="px-md py-sm text-left font-label-md text-label-md text-on-surface-variant uppercase">Öncelik</th>
                <th className="px-md py-sm text-left font-label-md text-label-md text-on-surface-variant uppercase">Durum</th>
                <th className="px-md py-sm text-left font-label-md text-label-md text-on-surface-variant uppercase">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-md py-xl text-center font-body-sm text-body-sm text-on-surface-variant">
                    Şikayet bulunamadı.
                  </td>
                </tr>
              ) : complaints.map((c) => (
                <tr key={c.id} className="hover:bg-surface-container-highest/50 transition-colors">
                  <td className="px-md py-sm">
                    <p className="font-body-sm text-body-sm text-on-surface font-medium max-w-xs truncate">{c.title}</p>
                    <p className="font-label-md text-label-md text-on-surface-variant mt-xs">
                      {new Date(c.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </td>
                  <td className="px-md py-sm font-body-sm text-body-sm text-on-surface-variant hidden md:table-cell">
                    {c.category?.name}
                  </td>
                  <td className="px-md py-sm font-body-sm text-body-sm text-on-surface-variant hidden md:table-cell">
                    {c.city?.name}
                  </td>
                  <td className="px-md py-sm"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-md py-sm"><ComplaintStatusBadge status={c.status} /></td>
                  <td className="px-md py-sm">
                    {c.status === 'pending' && (
                      <button
                        onClick={() => setAssignModal({
                          complaintId: c.id,
                          departmentId: c.category?.departmentId,
                          cityId: c.cityId,
                        })}
                        className="flex items-center gap-xs font-label-md text-label-md text-primary hover:underline"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>person_add</span>
                        Ata
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
