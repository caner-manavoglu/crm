import { useMemo, useState } from 'react';
import {
  useResolutionProcesses,
  useCreateResolutionProcess,
  useUpdateResolutionProcess,
  useDeleteResolutionProcess,
} from '@/hooks/queries/useResolutionProcesses';
import { useCategories } from '@/hooks/queries/useCategories';
import { useCities } from '@/hooks/queries/useCities';
import { getApiErrorMessage } from '@/lib/api-error';
import { PaginationControls } from '@/components/shared/PaginationControls';
import type { Category, City } from '@/types/user.types';
import type { ResolutionProcess, ResolutionStepInput } from '@/types/resolution.types';

const inputClass = 'w-full bg-surface-dim border border-outline-variant rounded-lg px-sm py-[10px] font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors';
const selectClass = inputClass;

interface FormState {
  id?: string;
  name: string;
  categoryId: string;
  appliesToAllCities: boolean;
  cityIds: string[];
  steps: ResolutionStepInput[];
}

const emptyForm: FormState = {
  name: '',
  categoryId: '',
  appliesToAllCities: false,
  cityIds: [],
  steps: [{ title: '', description: '' }],
};

export function ResolutionProcessesPage() {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const { data: processes = [], isLoading } = useResolutionProcesses(
    categoryFilter ? { categoryId: categoryFilter } : undefined,
  );
  const { data: categories = [] } = useCategories();
  const { data: cities = [] } = useCities();

  const createProcess = useCreateResolutionProcess();
  const updateProcess = useUpdateResolutionProcess();
  const deleteProcess = useDeleteResolutionProcess();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState('');

  const list = processes as ResolutionProcess[];
  const cats = categories as Category[];
  const cityList = cities as City[];
  const PAGE_SIZE = 6;
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedList = list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const isEdit = !!form.id;
  const saving = createProcess.isPending || updateProcess.isPending;

  const cityById = useMemo(() => {
    const map = new Map<string, City>();
    cityList.forEach((c) => map.set(c.id, c));
    return map;
  }, [cityList]);

  const openCreate = () => {
    setError('');
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p: ResolutionProcess) => {
    setError('');
    setForm({
      id: p.id,
      name: p.name,
      categoryId: p.categoryId,
      appliesToAllCities: p.appliesToAllCities,
      cityIds: p.cities.map((c) => c.id),
      steps: p.steps.length
        ? p.steps.map((s) => ({ title: s.title, description: s.description ?? '' }))
        : [{ title: '', description: '' }],
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setError('');
    setForm(emptyForm);
  };

  const setStep = (i: number, patch: Partial<ResolutionStepInput>) =>
    setForm((f) => ({ ...f, steps: f.steps.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }));
  const addStep = () => setForm((f) => ({ ...f, steps: [...f.steps, { title: '', description: '' }] }));
  const removeStep = (i: number) =>
    setForm((f) => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));

  const addCity = (id: string) => {
    if (!id) return;
    setForm((f) => (f.cityIds.includes(id) ? f : { ...f, cityIds: [...f.cityIds, id] }));
  };
  const removeCity = (id: string) =>
    setForm((f) => ({ ...f, cityIds: f.cityIds.filter((c) => c !== id) }));

  const handleSave = () => {
    setError('');
    const steps = form.steps
      .map((s) => ({ title: s.title.trim(), description: s.description?.trim() || undefined }))
      .filter((s) => s.title);

    if (!form.name.trim()) return setError('Süreç adı zorunludur.');
    if (!form.categoryId) return setError('Kategori seçmelisiniz.');
    if (!form.appliesToAllCities && form.cityIds.length === 0)
      return setError('En az bir şehir seçin veya "Tüm şehirler"i işaretleyin.');
    if (steps.length === 0) return setError('En az bir adım girmelisiniz.');

    if (isEdit) {
      updateProcess.mutate(
        {
          id: form.id!,
          data: {
            name: form.name.trim(),
            appliesToAllCities: form.appliesToAllCities,
            cityIds: form.appliesToAllCities ? undefined : form.cityIds,
            steps,
          },
        },
        { onSuccess: closeForm, onError: (e) => setError(getApiErrorMessage(e, 'Süreç güncellenemedi.')) },
      );
    } else {
      createProcess.mutate(
        {
          name: form.name.trim(),
          categoryId: form.categoryId,
          appliesToAllCities: form.appliesToAllCities,
          cityIds: form.appliesToAllCities ? undefined : form.cityIds,
          steps,
        },
        { onSuccess: closeForm, onError: (e) => setError(getApiErrorMessage(e, 'Süreç oluşturulamadı.')) },
      );
    }
  };

  const availableCities = cityList.filter((c) => !form.cityIds.includes(c.id));

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-md flex items-center justify-between flex-wrap gap-sm">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background font-bold">Çözüm Süreçleri</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{list.length} süreç</p>
        </div>
        <div className="flex items-center gap-sm">
          <select
            className={`${selectClass} max-w-[220px]`}
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tüm Kategoriler</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={openCreate}
            className="shrink-0 flex items-center gap-xs bg-primary text-on-primary rounded-xl px-sm py-xs font-body-sm text-body-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.98] duration-150"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            Yeni Süreç
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center gap-sm text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin" style={{ fontSize: '20px' }}>progress_activity</span>
          <span className="font-body-sm text-body-sm">Yükleniyor...</span>
        </div>
      ) : list.length === 0 ? (
        <div className="bg-surface-container border border-outline-variant rounded-xl flex flex-col items-center justify-center py-xl gap-sm">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '48px' }}>checklist</span>
          <p className="font-body-md text-body-md text-on-surface-variant">Henüz çözüm süreci yok.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-sm">
          {pagedList.map((p) => (
            <div key={p.id} className="bg-surface-container border border-outline-variant rounded-xl p-md">
              <div className="flex items-start justify-between gap-md">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-xs flex-wrap">
                    <p className="font-body-md text-body-md text-on-surface font-medium">{p.name}</p>
                    <span className="font-label-md text-label-md text-on-surface-variant">• {p.category?.name}</span>
                    <span className="rounded-full bg-surface-container-high px-sm py-[2px] font-label-md text-label-md text-on-surface-variant">
                      {p.steps.length} adım
                    </span>
                  </div>
                  <div className="mt-xs flex items-center gap-xs flex-wrap">
                    {p.appliesToAllCities ? (
                      <span className="inline-flex items-center gap-xs rounded-full bg-primary/10 px-sm py-[2px] font-label-md text-label-md text-primary">
                        <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>public</span>
                        Tüm şehirler
                      </span>
                    ) : (
                      p.cities.map((c) => (
                        <span key={c.id} className="rounded-full bg-surface-container-high px-sm py-[2px] font-label-md text-label-md text-on-surface-variant">
                          {c.name}
                        </span>
                      ))
                    )}
                  </div>
                  <ol className="mt-sm flex flex-col gap-xs">
                    {p.steps.map((s) => (
                      <li key={s.id} className="flex items-start gap-xs font-body-sm text-body-sm text-on-surface-variant">
                        <span className="mt-[1px] h-5 w-5 shrink-0 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-label-md text-label-md">
                          {s.order}
                        </span>
                        <span>{s.title}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="flex gap-xs shrink-0">
                  <button onClick={() => openEdit(p)} className="text-on-surface-variant hover:text-primary transition-colors" title="Düzenle">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`"${p.name}" silinsin mi?`)) {
                        deleteProcess.mutate(p.id, {
                          onError: (e) => alert(getApiErrorMessage(e, 'Süreç silinemedi.')),
                        });
                      }
                    }}
                    className="text-on-surface-variant hover:text-error transition-colors"
                    title="Sil"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && list.length > 0 && (
        <PaginationControls
          page={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={list.length}
          pageSize={PAGE_SIZE}
          currentItemCount={pagedList.length}
        />
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-md">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-md w-full max-w-[34rem] max-h-[90vh] overflow-y-auto shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-md">
              <h3 className="font-headline-md text-headline-md text-on-background">
                {isEdit ? 'Süreç Düzenle' : 'Yeni Çözüm Süreci'}
              </h3>
              <button onClick={closeForm} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div className="flex flex-col gap-sm">
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase">Süreç Adı</label>
                <input className={inputClass} placeholder="Örn. Kargo gecikmesi süreci" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase">Kategori</label>
                <select
                  className={selectClass}
                  value={form.categoryId}
                  disabled={isEdit}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  <option value="">Seçin...</option>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>{c.department?.name ? `${c.department.name} — ${c.name}` : c.name}</option>
                  ))}
                </select>
              </div>

              <label className="flex cursor-pointer items-center gap-sm p-sm rounded-lg border border-outline-variant/50 hover:bg-surface-container-high transition-colors">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary"
                  checked={form.appliesToAllCities}
                  onChange={(e) => setForm({ ...form, appliesToAllCities: e.target.checked })}
                />
                <div>
                  <p className="font-body-sm text-body-sm text-on-surface font-medium">Tüm şehirler için geçerli</p>
                  <p className="font-label-md text-label-md text-on-surface-variant">İşaretlenirse şehir seçimi gerekmez</p>
                </div>
              </label>

              {!form.appliesToAllCities && (
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase">Şehirler</label>
                  <select className={selectClass} value="" onChange={(e) => { addCity(e.target.value); e.target.value = ''; }}>
                    <option value="">Şehir ekle...</option>
                    {availableCities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {form.cityIds.length > 0 && (
                    <div className="flex flex-wrap gap-xs mt-xs">
                      {form.cityIds.map((id) => (
                        <span key={id} className="inline-flex items-center gap-xs rounded-full bg-surface-container-high px-sm py-[2px] font-label-md text-label-md text-on-surface">
                          {cityById.get(id)?.name ?? id}
                          <button onClick={() => removeCity(id)} className="hover:text-error">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-xs">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase">Adımlar</label>
                  <button onClick={addStep} className="flex items-center gap-xs font-label-md text-label-md text-primary hover:underline">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
                    Adım Ekle
                  </button>
                </div>
                {form.steps.map((s, i) => (
                  <div key={i} className="flex items-start gap-xs">
                    <span className="mt-[10px] h-6 w-6 shrink-0 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-label-md text-label-md">{i + 1}</span>
                    <div className="flex-1 flex flex-col gap-xs">
                      <input className={inputClass} placeholder={`Adım ${i + 1} başlığı`} value={s.title} onChange={(e) => setStep(i, { title: e.target.value })} />
                      <input className={inputClass} placeholder="Açıklama (opsiyonel)" value={s.description ?? ''} onChange={(e) => setStep(i, { description: e.target.value })} />
                    </div>
                    {form.steps.length > 1 && (
                      <button onClick={() => removeStep(i)} className="mt-[10px] text-on-surface-variant hover:text-error transition-colors" title="Adımı sil">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {error && <p className="font-label-md text-label-md text-error">{error}</p>}

              <div className="flex gap-sm mt-xs">
                <button onClick={closeForm} className="flex-1 border border-outline-variant rounded-xl py-xs font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high transition-colors">
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-primary text-on-primary rounded-xl py-xs font-body-sm text-body-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? 'Kaydediliyor...' : isEdit ? 'Kaydet' : 'Oluştur'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
