import { useParams, Link } from 'react-router-dom';
import { useComplaint, useComplaintHistory } from '@/hooks/queries/useComplaints';
import { ComplaintStatusBadge } from '@/components/shared/complaints/ComplaintStatusBadge';
import { PriorityBadge } from '@/components/shared/complaints/PriorityBadge';
import { ROUTES } from '@/router/routes';
import type { ComplaintHistory } from '@/types/complaint.types';

export function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: complaint, isLoading } = useComplaint(id!);
  const { data: history = [] } = useComplaintHistory(id!);

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

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Link
        to={ROUTES.CUSTOMER.COMPLAINTS}
        className="mb-md flex items-center gap-xs font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
        Şikayetlerime Dön
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
              Kategori: <strong className="text-on-surface font-medium">{complaint.category?.name}</strong>
            </span>
          </div>
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '16px' }}>location_on</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Şehir: <strong className="text-on-surface font-medium">{complaint.city?.name}</strong>
            </span>
          </div>
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '16px' }}>schedule</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Tarih: <strong className="text-on-surface font-medium">{new Date(complaint.createdAt).toLocaleDateString('tr-TR')}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="bg-surface-container border border-outline-variant rounded-xl p-md">
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase mb-md flex items-center gap-xs">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>history</span>
          Şikayet Geçmişi
        </h3>
        <div className="flex flex-col gap-xs">
          {(history as ComplaintHistory[]).length === 0 ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-md">
              Henüz geçmiş yok.
            </p>
          ) : (
            (history as ComplaintHistory[]).map((h, i) => (
              <div key={h.id} className="flex gap-sm">
                <div className="flex flex-col items-center">
                  <div className="mt-[6px] h-3 w-3 rounded-full bg-primary shrink-0" />
                  {i < history.length - 1 && <div className="mt-xs w-[2px] flex-1 bg-outline-variant" />}
                </div>
                <div className="pb-sm flex-1">
                  <div className="flex items-center gap-xs mb-xs">
                    <ComplaintStatusBadge status={h.newStatus} />
                  </div>
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
