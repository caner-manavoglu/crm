import { useState } from 'react';
import { useCities, useCreateCity, useUpdateCity, useDeleteCity } from '@/hooks/queries/useCities';
import { ConfirmActionModal } from '@/components/shared/modals/ConfirmActionModal';
import { getApiErrorMessage } from '@/lib/api-error';
import type { City } from '@/types/user.types';

const inputClass = 'w-full bg-surface-dim border border-outline-variant rounded-lg px-sm py-[10px] font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors';

export function CitiesPage() {
  const { data: cities = [], isLoading } = useCities();
  const createCity = useCreateCity();
  const updateCity = useUpdateCity();
  const deleteCity = useDeleteCity();

  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [createError, setCreateError] = useState('');

  const [editing, setEditing] = useState<City | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editError, setEditError] = useState('');
  const [cityToDeactivate, setCityToDeactivate] = useState<City | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const list = (cities as City[]).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = () => {
    if (!name.trim() || !code.trim()) {
      setCreateError('Şehir adı ve kodu zorunludur.');
      return;
    }

    setCreateError('');
    createCity.mutate(
      { name: name.trim(), code: code.trim() },
      {
        onSuccess: () => {
          setName('');
          setCode('');
        },
        onError: (error) => {
          setCreateError(getApiErrorMessage(error, 'Şehir oluşturulamadı.'));
        },
      },
    );
  };

  const openEditModal = (city: City) => {
    setEditError('');
    setEditing(city);
    setEditName(city.name);
    setEditCode(city.code);
  };

  const closeEditModal = () => {
    setEditing(null);
    setEditName('');
    setEditCode('');
    setEditError('');
  };

  const openDeactivateModal = (city: City) => {
    setDeleteError('');
    setCityToDeactivate(city);
  };

  const closeDeactivateModal = () => {
    if (deleteCity.isPending) return;
    setDeleteError('');
    setCityToDeactivate(null);
  };

  const handleUpdate = () => {
    if (!editing) return;

    if (!editName.trim() || !editCode.trim()) {
      setEditError('Şehir adı ve kodu zorunludur.');
      return;
    }

    setEditError('');
    updateCity.mutate(
      {
        id: editing.id,
        data: {
          name: editName.trim(),
          code: editCode.trim(),
        },
      },
      {
        onSuccess: closeEditModal,
        onError: (error) => {
          setEditError(getApiErrorMessage(error, 'Şehir güncellenemedi.'));
        },
      },
    );
  };

  const handleDeactivate = () => {
    if (!cityToDeactivate) return;

    setDeleteError('');
    deleteCity.mutate(cityToDeactivate.id, {
      onSuccess: () => {
        setCityToDeactivate(null);
      },
      onError: (error) => {
        setDeleteError(getApiErrorMessage(error, 'Şehir pasife alınamadı.'));
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-md flex items-center justify-between flex-wrap gap-sm">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background font-bold">Şehirler</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{list.length} şehir</p>
        </div>
        <div className="relative max-w-[260px] w-full">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '18px' }}>search</span>
          <input
            className={`${inputClass} pl-9`}
            placeholder="Şehir ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-surface-container border border-outline-variant rounded-xl p-md mb-md">
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase mb-sm flex items-center gap-xs">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
          Yeni Şehir
        </h3>
        <div className="flex flex-col gap-sm md:flex-row">
          <input className={inputClass} placeholder="Şehir adı" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={inputClass} placeholder="Şehir kodu" value={code} onChange={(e) => setCode(e.target.value)} />
          <button
            onClick={handleCreate}
            disabled={!name.trim() || !code.trim() || createCity.isPending}
            className="shrink-0 flex items-center justify-center gap-xs bg-primary text-on-primary rounded-xl px-md py-xs font-body-sm text-body-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            Ekle
          </button>
        </div>
        {createError && <p className="font-label-md text-label-md text-error mt-sm">{createError}</p>}
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center gap-sm text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin" style={{ fontSize: '20px' }}>progress_activity</span>
          <span className="font-body-sm text-body-sm">Yükleniyor...</span>
        </div>
      ) : list.length === 0 ? (
        <div className="bg-surface-container border border-outline-variant rounded-xl flex flex-col items-center justify-center py-xl gap-sm">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '48px' }}>location_city</span>
          <p className="font-body-md text-body-md text-on-surface-variant">Şehir bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-sm sm:grid-cols-3 lg:grid-cols-4">
          {list.map((c) => (
            <div key={c.id} className="bg-surface-container border border-outline-variant rounded-xl p-md">
              <div className="flex items-start justify-between gap-xs">
                <div className="h-10 w-10 rounded-lg bg-primary-container/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>location_city</span>
                </div>
                <div className="flex gap-xs">
                  <button
                    onClick={() => openEditModal(c)}
                    className="text-on-surface-variant hover:text-primary transition-colors"
                    title="Düzenle"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                  </button>
                  <button
                    onClick={() => openDeactivateModal(c)}
                    className="text-on-surface-variant hover:text-error transition-colors"
                    title="Pasife al"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                  </button>
                </div>
              </div>
              <div className="min-w-0 mt-sm">
                <p className="font-body-sm text-body-sm text-on-surface font-medium truncate">{c.name}</p>
                {c.code && <p className="font-label-md text-label-md text-on-surface-variant">{c.code}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-md">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-md w-full max-w-[28rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-md">
              <h3 className="font-headline-md text-headline-md text-on-background">Şehir Düzenle</h3>
              <button onClick={closeEditModal} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>
            <div className="flex flex-col gap-sm">
              <input className={inputClass} placeholder="Şehir adı" value={editName} onChange={(e) => setEditName(e.target.value)} />
              <input className={inputClass} placeholder="Şehir kodu" value={editCode} onChange={(e) => setEditCode(e.target.value)} />
              {editError && <p className="font-label-md text-label-md text-error">{editError}</p>}
              <div className="flex gap-sm mt-xs">
                <button onClick={closeEditModal} className="flex-1 border border-outline-variant rounded-xl py-xs font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high transition-colors">
                  İptal
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updateCity.isPending}
                  className="flex-1 bg-primary text-on-primary rounded-xl py-xs font-body-sm text-body-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {updateCity.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmActionModal
        isOpen={!!cityToDeactivate}
        title="Şehri Pasife Al"
        message={cityToDeactivate ? `"${cityToDeactivate.name}" pasife alınsın mı?` : ''}
        confirmText="Pasife Al"
        pendingText="Pasife Alınıyor..."
        variant="danger"
        isPending={deleteCity.isPending}
        errorMessage={deleteError}
        onConfirm={handleDeactivate}
        onCancel={closeDeactivateModal}
      />
    </div>
  );
}
