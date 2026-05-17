import { useAllComplaints } from '@/hooks/queries/useComplaints';
import { useAdminAssign } from '@/hooks/queries/useAssignments';
import { useAvailableStaff } from '@/hooks/queries/useStaffAvailability';
import { PriorityBadge } from '@/components/shared/complaints/PriorityBadge';
import { useState } from 'react';
import type { Complaint } from '@/types/complaint.types';

export function ComplaintPoolPage() {
  const { data, isLoading } = useAllComplaints({ status: 'pending' });
  const adminAssign = useAdminAssign();
  const [assignModal, setAssignModal] = useState<{ complaintId: string; departmentId?: string; cityId?: string } | null>(null);
  const [selectedStaff, setSelectedStaff] = useState('');

  const { data: availableStaff = [] } = useAvailableStaff(assignModal?.departmentId, assignModal?.cityId);

  const complaints: Complaint[] = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Atanmamış Şikayetler</h2>
          <p className="text-sm text-gray-500 mt-1">{data?.meta?.total ?? 0} şikayet bekliyor</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-gray-500">Yükleniyor...</div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white border rounded-xl">
          Havuzda bekleyen şikayet yok.
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <div key={c.id} className="bg-white border rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{c.title}</p>
                <p className="text-sm text-gray-500 mt-1">{c.category?.department?.name} → {c.category?.name}</p>
                <p className="text-sm text-gray-500">{c.city?.name}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleDateString('tr-TR')}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <PriorityBadge priority={c.priority} />
                <button
                  onClick={() => setAssignModal({
                    complaintId: c.id,
                    departmentId: c.category?.departmentId,
                    cityId: c.cityId,
                  })}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
                >
                  Ata
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {assignModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-900 mb-4">Personel Ata</h3>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
            >
              <option value="">Personel seçin...</option>
              {(availableStaff as { staffId: string; currentLoad: number; maxCapacity: number; staff: { name: string; surname: string } }[]).map((s) => (
                <option key={s.staffId} value={s.staffId} disabled={s.currentLoad >= s.maxCapacity}>
                  {s.staff?.name} {s.staff?.surname} ({s.currentLoad}/{s.maxCapacity})
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={() => setAssignModal(null)} className="flex-1 border rounded-lg py-2 text-sm text-gray-600">İptal</button>
              <button
                onClick={() => {
                  if (assignModal && selectedStaff) {
                    adminAssign.mutate({ complaintId: assignModal.complaintId, staffId: selectedStaff });
                    setAssignModal(null);
                    setSelectedStaff('');
                  }
                }}
                disabled={!selectedStaff}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
              >Ata</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
