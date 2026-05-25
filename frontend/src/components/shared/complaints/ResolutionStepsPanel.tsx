import { useState } from 'react';
import {
  useComplaintSteps,
  useCompleteStep,
  useCreateComplaintProcess,
} from '@/hooks/queries/useResolutionProcesses';
import { getApiErrorMessage } from '@/lib/api-error';
import type { ComplaintResolutionStep, ResolutionStepInput } from '@/types/resolution.types';

const inputClass = 'w-full bg-surface-dim border border-outline-variant rounded-lg px-sm py-[10px] font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors';

interface Props {
  complaintId: string;
  // true ise (admin) süreç yoksa anlık tanımlama formu gösterilir.
  canManage?: boolean;
}

export function ResolutionStepsPanel({ complaintId, canManage = false }: Props) {
  const { data: steps = [], isLoading } = useComplaintSteps(complaintId);
  const completeStep = useCompleteStep(complaintId);
  const createProcess = useCreateComplaintProcess(complaintId);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [draftSteps, setDraftSteps] = useState<ResolutionStepInput[]>([{ title: '', description: '' }]);
  const [error, setError] = useState('');

  const list = steps as ComplaintResolutionStep[];
  const total = list.length;
  const done = list.filter((s) => s.isCompleted).length;

  const toggle = (step: ComplaintResolutionStep) => {
    completeStep.mutate(
      { stepId: step.id, isCompleted: !step.isCompleted },
      { onError: (e) => alert(getApiErrorMessage(e, 'Adım güncellenemedi.')) },
    );
  };

  const setDraft = (i: number, patch: Partial<ResolutionStepInput>) =>
    setDraftSteps((d) => d.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const addDraft = () => setDraftSteps((d) => [...d, { title: '', description: '' }]);
  const removeDraft = (i: number) => setDraftSteps((d) => d.filter((_, idx) => idx !== i));

  const handleCreate = () => {
    setError('');
    const cleaned = draftSteps
      .map((s) => ({ title: s.title.trim(), description: s.description?.trim() || undefined }))
      .filter((s) => s.title);
    if (!name.trim()) return setError('Süreç adı zorunludur.');
    if (cleaned.length === 0) return setError('En az bir adım girmelisiniz.');

    createProcess.mutate(
      { name: name.trim(), steps: cleaned },
      {
        onSuccess: () => {
          setShowForm(false);
          setName('');
          setDraftSteps([{ title: '', description: '' }]);
        },
        onError: (e) => setError(getApiErrorMessage(e, 'Süreç oluşturulamadı.')),
      },
    );
  };

  return (
    <div className="bg-surface-container border border-outline-variant rounded-xl p-md">
      <div className="flex items-center justify-between mb-sm">
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase flex items-center gap-xs">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>checklist</span>
          Çözüm Adımları
        </h3>
        {total > 0 && (
          <span className="font-label-md text-label-md text-on-surface-variant">
            {done}/{total} tamamlandı
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-md">Yükleniyor...</p>
      ) : total > 0 ? (
        <>
          <div className="h-1.5 w-full rounded-full bg-surface-container-lowest mb-md">
            <div
              className="h-1.5 rounded-full bg-primary transition-all duration-500"
              style={{ width: `${total ? (done / total) * 100 : 0}%` }}
            />
          </div>
          <ol className="flex flex-col gap-xs">
            {list.map((s) => (
              <li
                key={s.id}
                className="flex items-start gap-sm rounded-lg border border-outline-variant/50 px-sm py-xs"
              >
                <button
                  onClick={() => toggle(s)}
                  disabled={completeStep.isPending}
                  className={`mt-[2px] h-5 w-5 shrink-0 rounded-full border flex items-center justify-center transition-colors ${
                    s.isCompleted
                      ? 'bg-primary border-primary text-on-primary'
                      : 'border-outline-variant text-transparent hover:border-primary'
                  }`}
                  title={s.isCompleted ? 'Geri al' : 'Tamamla'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`font-body-sm text-body-sm ${s.isCompleted ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                    {s.order}. {s.title}
                  </p>
                  {s.description && (
                    <p className="font-label-md text-label-md text-on-surface-variant mt-[2px]">{s.description}</p>
                  )}
                  {s.isCompleted && s.completedAt && (
                    <p className="font-label-md text-label-md text-on-surface-variant mt-[2px]">
                      {new Date(s.completedAt).toLocaleString('tr-TR')}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </>
      ) : canManage ? (
        showForm ? (
          <div className="flex flex-col gap-sm">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Bu kategori ve şehir için çözüm süreci tanımlayın. Bu süreç yalnızca bu kategori + şehir için geçerli olacaktır.
            </p>
            <input className={inputClass} placeholder="Süreç adı (örn. Kargo gecikmesi)" value={name} onChange={(e) => setName(e.target.value)} />
            {draftSteps.map((s, i) => (
              <div key={i} className="flex items-start gap-xs">
                <span className="mt-[10px] h-6 w-6 shrink-0 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-label-md text-label-md">{i + 1}</span>
                <div className="flex-1 flex flex-col gap-xs">
                  <input className={inputClass} placeholder={`Adım ${i + 1} başlığı`} value={s.title} onChange={(e) => setDraft(i, { title: e.target.value })} />
                  <input className={inputClass} placeholder="Açıklama (opsiyonel)" value={s.description ?? ''} onChange={(e) => setDraft(i, { description: e.target.value })} />
                </div>
                {draftSteps.length > 1 && (
                  <button onClick={() => removeDraft(i)} className="mt-[10px] text-on-surface-variant hover:text-error transition-colors" title="Adımı sil">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                  </button>
                )}
              </div>
            ))}
            <button onClick={addDraft} className="self-start flex items-center gap-xs font-label-md text-label-md text-primary hover:underline">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
              Adım Ekle
            </button>
            {error && <p className="font-label-md text-label-md text-error">{error}</p>}
            <div className="flex gap-sm mt-xs">
              <button onClick={() => { setShowForm(false); setError(''); }} className="flex-1 border border-outline-variant rounded-xl py-xs font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high transition-colors">
                İptal
              </button>
              <button onClick={handleCreate} disabled={createProcess.isPending} className="flex-1 bg-primary text-on-primary rounded-xl py-xs font-body-sm text-body-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {createProcess.isPending ? 'Kaydediliyor...' : 'Süreci Tanımla'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-sm py-md text-center">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '36px' }}>playlist_add</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Bu kategori ve şehir için tanımlı çözüm süreci yok.
            </p>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-xs bg-primary text-on-primary rounded-xl px-sm py-xs font-body-sm text-body-sm font-semibold hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
              Çözüm Süreci Tanımla
            </button>
          </div>
        )
      ) : (
        <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-md">
          Bu talep için henüz çözüm süreci tanımlanmamış.
        </p>
      )}
    </div>
  );
}
