import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock3, FileDown, Hash, MapPin, TimerReset } from 'lucide-react';
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
      <div className="flex h-48 items-center justify-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">Talep detayları yükleniyor...</p>
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
    <div className="mx-auto w-full max-w-5xl">
      <Link
        to={ROUTES.CUSTOMER.COMPLAINTS}
        className="mb-md inline-flex items-center gap-xs font-body-sm text-body-sm text-on-surface-variant transition-colors hover:text-on-surface"
      >
        <ArrowLeft size={16} />
        Şikayetlerime Dön
      </Link>

      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container">
        <div className="border-b border-outline-variant bg-surface-container-low p-md">
          <div className="flex flex-col gap-md md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-xs flex flex-wrap items-center gap-xs text-on-surface-variant">
                <span className="inline-flex items-center gap-xs rounded-full border border-outline-variant bg-surface-dim px-sm py-[2px] font-label-md text-label-md">
                  <Hash size={12} />
                  {complaint.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="inline-flex items-center gap-xs rounded-full border border-outline-variant bg-surface-dim px-sm py-[2px] font-label-md text-label-md">
                  <Clock3 size={12} />
                  {new Date(complaint.updatedAt).toLocaleString('tr-TR')}
                </span>
              </div>

              <h2 className="font-headline-md text-headline-md text-on-surface">{complaint.title}</h2>
              <p className="mt-sm max-w-3xl font-body-sm text-body-sm text-on-surface-variant">{complaint.content}</p>
            </div>

            <div className="flex flex-wrap items-center gap-xs">
              <PriorityBadge priority={complaint.priority} />
              <ComplaintStatusBadge status={complaint.status} />
            </div>
          </div>

          <div className="mt-md grid grid-cols-1 gap-sm border-t border-outline-variant/50 pt-sm md:grid-cols-3">
            <div className="flex items-center gap-xs text-on-surface-variant">
              <TimerReset size={15} />
              <span className="font-body-sm text-body-sm">{complaint.category?.name ?? 'Kategori yok'}</span>
            </div>
            <div className="flex items-center gap-xs text-on-surface-variant">
              <MapPin size={15} />
              <span className="font-body-sm text-body-sm">{complaint.city?.name ?? 'Şehir yok'}</span>
            </div>
            <div className="flex items-center gap-xs text-on-surface-variant">
              <Clock3 size={15} />
              <span className="font-body-sm text-body-sm">{new Date(complaint.createdAt).toLocaleString('tr-TR')}</span>
            </div>
          </div>
        </div>

        <div className="p-md">
          <h3 className="mb-md font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">İlerleme Zaman Çizelgesi</h3>
          <div className="relative pl-sm">
            <div className="absolute bottom-2 left-[11px] top-2 w-[2px] bg-outline-variant" />
            {(history as ComplaintHistory[]).length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">Henüz geçmiş kaydı yok.</p>
            ) : (
              (history as ComplaintHistory[])
                .slice()
                .reverse()
                .map((item, index) => (
                  <div key={item.id} className="relative mb-md flex gap-sm last:mb-0">
                    <div className="relative z-10 mt-[2px] flex h-6 w-6 items-center justify-center rounded-full border border-primary bg-surface-dim">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div className="flex-1 rounded-lg border border-outline-variant bg-surface-dim p-sm">
                      <div className="flex flex-wrap items-center justify-between gap-xs">
                        <ComplaintStatusBadge status={item.newStatus} />
                        <p className="font-label-md text-label-md text-on-surface-variant">
                          {new Date(item.createdAt).toLocaleString('tr-TR')}
                        </p>
                      </div>
                      {item.notes && (
                        <p className="mt-xs font-body-sm text-body-sm text-on-surface">{item.notes}</p>
                      )}
                      <p className="mt-xs font-label-md text-label-md text-on-surface-variant">
                        {item.user ? `${item.user.name} ${item.user.surname}` : index === 0 ? 'Sistem' : 'Operasyon'}
                      </p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-outline-variant bg-surface-container-low px-md py-sm">
          <button className="inline-flex items-center gap-xs font-label-md text-label-md text-primary transition-colors hover:text-on-surface">
            <FileDown size={16} />
            Özet PDF İndir
          </button>
        </div>
      </div>
    </div>
  );
}
