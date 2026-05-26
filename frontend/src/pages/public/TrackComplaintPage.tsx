import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Radio,
  Search,
  Tag,
  XCircle,
} from 'lucide-react';
import { complaintsApi } from '@/api/endpoints/complaints.api';
import { getSocket } from '@/api/socket';
import { getApiErrorMessage } from '@/lib/api-error';
import { ROUTES } from '@/router/routes';
import { AttachmentPanel } from '@/components/shared/complaints/AttachmentPanel';

type TrackStep = {
  id: string;
  order: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  completedAt: string | null;
};

type TrackHistory = {
  oldStatus: string | null;
  newStatus: string;
  notes: string | null;
  createdAt: string;
};

type TrackResult = {
  trackingCode: string;
  title: string;
  content: string;
  address: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string } | null;
  department: { id: string; name: string } | null;
  city: { id: string; name: string } | null;
  steps: TrackStep[];
  history: TrackHistory[];
  rating: { score: number; comment: string | null; createdAt: string } | null;
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Beklemede',
  assigned: 'Atandı',
  in_progress: 'İşlemde',
  resolved: 'Çözüldü',
  closed: 'Kapatıldı',
};

const STATUS_TONE: Record<string, string> = {
  pending: 'border-secondary/40 bg-secondary/10 text-secondary',
  assigned: 'border-primary/40 bg-primary/10 text-primary',
  in_progress: 'border-primary/60 bg-primary/15 text-primary',
  resolved: 'border-tertiary/40 bg-tertiary/10 text-tertiary',
  closed: 'border-outline-variant bg-surface-container text-on-surface-variant',
};

const PRIORITY_LABEL: Record<string, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
};

function formatDate(value: string | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

export function TrackComplaintPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = (searchParams.get('code') ?? '').toUpperCase();

  const [code, setCode] = useState(initialCode);
  const [data, setData] = useState<TrackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);

  const normalizedCode = useMemo(() => code.trim().toUpperCase(), [code]);

  const fetchTracking = async (rawCode: string) => {
    const value = rawCode.trim().toUpperCase();
    if (!value) {
      setError('Lütfen takip kodunu girin.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await complaintsApi.trackByCode(value);
      setData(result);
      setSearchParams({ code: value });
    } catch (err) {
      setData(null);
      setError(getApiErrorMessage(err, 'Talep bulunamadı.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      void fetchTracking(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live updates: join the track:<code> room and refetch on any event.
  useEffect(() => {
    if (!data?.trackingCode) return;
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const subscribe = () => {
      socket.emit('track:subscribe', { code: data.trackingCode }, (ack: { ok?: boolean }) => {
        setLive(!!ack?.ok);
      });
    };

    if (socket.connected) {
      subscribe();
    } else {
      socket.once('connect', subscribe);
    }

    const handleUpdate = () => {
      void fetchTracking(data.trackingCode);
    };
    socket.on('track:updated', handleUpdate);

    return () => {
      socket.emit('track:unsubscribe', { code: data.trackingCode });
      socket.off('track:updated', handleUpdate);
      setLive(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.trackingCode]);

  const status = data?.status ?? '';
  const statusTone = STATUS_TONE[status] ?? STATUS_TONE.pending;

  return (
    <div className="min-h-screen bg-background text-on-background">
      <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface-dim">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-md">
          <Link to={ROUTES.LANDING} className="flex items-center gap-xs text-on-surface-variant transition-colors hover:text-on-surface">
            <ArrowLeft size={16} />
            <span className="font-body-sm text-body-sm">Ana Sayfa</span>
          </Link>
          <p className="font-headline-md text-headline-md text-primary">CareFlow</p>
          <Link to={ROUTES.CUSTOMER.SUBMIT} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface">
            Yeni Talep
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-md py-lg">
        <div className="mb-lg">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Talep Sorgu</h2>
          <p className="mt-xs font-body-md text-body-md text-on-surface-variant">
            Talep oluştururken aldığınız takip kodunu girerek talebinizin durumunu ve çözüm sürecini anlık olarak görüntüleyin.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void fetchTracking(normalizedCode);
          }}
          className="mb-md flex flex-col gap-sm rounded-2xl border border-outline-variant bg-surface-container p-md sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label className="font-label-md text-label-md uppercase text-on-surface-variant">Takip Kodu</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ÖRN: CRM-AB12CD"
              className="mt-xs w-full rounded-lg border border-outline-variant bg-surface-dim px-sm py-[10px] font-body-sm text-body-sm tracking-wider text-on-surface placeholder:text-on-surface-variant outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-[44px] items-center justify-center gap-xs rounded-lg bg-primary px-md font-body-md text-body-md font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Sorgula
          </button>
        </form>

        {error && (
          <div className="mb-md flex items-center gap-sm rounded-xl border border-error/40 bg-error-container/30 px-sm py-sm text-error">
            <XCircle size={18} />
            <p className="font-body-sm text-body-sm">{error}</p>
          </div>
        )}

        {data && (
          <div className="space-y-md">
            <section className="rounded-2xl border border-outline-variant bg-surface-container p-md">
              <div className="mb-md flex flex-wrap items-center justify-between gap-sm border-b border-outline-variant/50 pb-sm">
                <div>
                  <p className="font-label-md text-label-md uppercase text-on-surface-variant">
                    Takip Kodu: <span className="font-semibold tracking-wider text-primary">{data.trackingCode}</span>
                  </p>
                  <h3 className="mt-xs font-headline-md text-headline-md text-on-surface">{data.title}</h3>
                </div>
                <div className="flex items-center gap-sm">
                  {live && (
                    <span className="inline-flex items-center gap-xs rounded-full border border-tertiary/40 bg-tertiary/10 px-sm py-xs font-label-md text-label-md uppercase text-tertiary">
                      <Radio size={12} className="animate-pulse" /> Canlı
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-xs rounded-full border px-sm py-xs font-label-md text-label-md uppercase ${statusTone}`}>
                    {STATUS_LABEL[status] ?? status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
                <div className="flex items-start gap-sm">
                  <Tag size={16} className="mt-[2px] text-on-surface-variant" />
                  <div>
                    <p className="font-label-md text-label-md uppercase text-on-surface-variant">Kategori / Departman</p>
                    <p className="font-body-sm text-body-sm text-on-surface">
                      {data.category?.name ?? '—'}
                      {data.department?.name ? ` • ${data.department.name}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-sm">
                  <MapPin size={16} className="mt-[2px] text-on-surface-variant" />
                  <div>
                    <p className="font-label-md text-label-md uppercase text-on-surface-variant">Şehir</p>
                    <p className="font-body-sm text-body-sm text-on-surface">{data.city?.name ?? '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-sm">
                  <Clock size={16} className="mt-[2px] text-on-surface-variant" />
                  <div>
                    <p className="font-label-md text-label-md uppercase text-on-surface-variant">Oluşturuldu</p>
                    <p className="font-body-sm text-body-sm text-on-surface">{formatDate(data.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-sm">
                  <Clock size={16} className="mt-[2px] text-on-surface-variant" />
                  <div>
                    <p className="font-label-md text-label-md uppercase text-on-surface-variant">Son Güncelleme</p>
                    <p className="font-body-sm text-body-sm text-on-surface">{formatDate(data.updatedAt)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-md rounded-lg border border-outline-variant/60 bg-surface-container-low p-sm">
                <p className="mb-xs flex items-center gap-xs font-label-md text-label-md uppercase text-on-surface-variant">
                  <FileText size={14} /> Açıklama
                </p>
                <p className="whitespace-pre-line font-body-sm text-body-sm text-on-surface">{data.content}</p>
              </div>

              <div className="mt-sm rounded-lg border border-outline-variant/60 bg-surface-container-low p-sm">
                <p className="mb-xs flex items-center gap-xs font-label-md text-label-md uppercase text-on-surface-variant">
                  <MapPin size={14} /> Açık Adres
                </p>
                <p className="font-body-sm text-body-sm text-on-surface">{data.address}</p>
              </div>

              <div className="mt-sm font-label-md text-label-md text-on-surface-variant">
                Öncelik: <span className="text-on-surface">{PRIORITY_LABEL[data.priority] ?? data.priority}</span>
              </div>
            </section>

            <section className="rounded-2xl border border-outline-variant bg-surface-container p-md">
              <h3 className="mb-md font-headline-md text-headline-md text-on-surface">Çözüm Süreci</h3>
              {data.steps.length === 0 ? (
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Bu talep için tanımlı bir çözüm süreci bulunmuyor. Durum güncellemeleri aşağıdaki geçmişte yer alır.
                </p>
              ) : (
                <ol className="space-y-sm">
                  {data.steps.map((step, idx) => {
                    const completed = step.isCompleted;
                    const nextIdx = data.steps.findIndex((s) => !s.isCompleted);
                    const isCurrent = !completed && idx === nextIdx;
                    return (
                      <li
                        key={step.id}
                        className={`flex items-start gap-sm rounded-lg border p-sm transition-colors ${
                          completed
                            ? 'border-tertiary/40 bg-tertiary/5'
                            : isCurrent
                              ? 'border-primary/50 bg-primary/5'
                              : 'border-outline-variant bg-surface-container-low'
                        }`}
                      >
                        <span className="mt-[2px]">
                          {completed ? (
                            <CheckCircle2 size={20} className="text-tertiary" />
                          ) : isCurrent ? (
                            <Loader2 size={20} className="animate-spin text-primary" />
                          ) : (
                            <Circle size={20} className="text-on-surface-variant" />
                          )}
                        </span>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-xs">
                            <p className="font-body-md text-body-md font-semibold text-on-surface">
                              {step.order}. {step.title}
                            </p>
                            {completed && (
                              <span className="font-label-md text-label-md text-on-surface-variant">
                                {formatDate(step.completedAt)}
                              </span>
                            )}
                          </div>
                          {step.description && (
                            <p className="mt-xs font-body-sm text-body-sm text-on-surface-variant">{step.description}</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>

            <AttachmentPanel mode="track" trackingCode={data.trackingCode} />

            {data.rating && (
              <section className="rounded-2xl border border-tertiary/40 bg-tertiary/10 p-md">
                <h3 className="mb-sm font-headline-md text-headline-md text-on-surface">Müşteri Değerlendirmesi</h3>
                <div className="flex items-center gap-xs">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={
                        'material-symbols-outlined ' +
                        (i < data.rating!.score ? 'text-tertiary' : 'text-on-surface-variant/40')
                      }
                      style={{ fontSize: '24px' }}
                    >
                      star
                    </span>
                  ))}
                  <span className="ml-xs font-body-md text-body-md font-semibold text-on-surface">
                    {data.rating.score}/5
                  </span>
                </div>
                {data.rating.comment && (
                  <p className="mt-sm whitespace-pre-line font-body-sm text-body-sm text-on-surface">
                    “{data.rating.comment}”
                  </p>
                )}
                <p className="mt-xs font-label-md text-label-md text-on-surface-variant">
                  {formatDate(data.rating.createdAt)}
                </p>
              </section>
            )}

            <section className="rounded-2xl border border-outline-variant bg-surface-container p-md">
              <h3 className="mb-md font-headline-md text-headline-md text-on-surface">Durum Geçmişi</h3>
              {data.history.length === 0 ? (
                <p className="font-body-sm text-body-sm text-on-surface-variant">Henüz hareket yok.</p>
              ) : (
                <ul className="space-y-sm">
                  {data.history.map((h, idx) => (
                    <li key={idx} className="flex items-start gap-sm border-b border-outline-variant/40 pb-sm last:border-0 last:pb-0">
                      <Clock size={14} className="mt-[3px] text-on-surface-variant" />
                      <div className="flex-1">
                        <p className="font-body-sm text-body-sm text-on-surface">
                          {h.oldStatus ? (
                            <>
                              <span className="text-on-surface-variant">{STATUS_LABEL[h.oldStatus] ?? h.oldStatus}</span>
                              {' → '}
                            </>
                          ) : null}
                          <span className="font-semibold text-primary">{STATUS_LABEL[h.newStatus] ?? h.newStatus}</span>
                        </p>
                        {h.notes && (
                          <p className="mt-xs font-body-sm text-body-sm text-on-surface-variant">{h.notes}</p>
                        )}
                      </div>
                      <span className="font-label-md text-label-md text-on-surface-variant">{formatDate(h.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
