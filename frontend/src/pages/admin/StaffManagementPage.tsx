import { useState } from 'react';
import { ConfirmActionModal } from '@/components/shared/modals/ConfirmActionModal';
import { useUsers, useCreateUser, useDeleteUser, useUpdateUser } from '@/hooks/queries/useUsers';
import { useDepartments } from '@/hooks/queries/useDepartments';
import { useCities } from '@/hooks/queries/useCities';
import { getApiErrorMessage } from '@/lib/api-error';
import type { User, Department, City } from '@/types/user.types';

const inputClass = 'w-full bg-surface-dim border border-outline-variant rounded-lg px-sm py-[10px] font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors';
const selectClass = inputClass;

const emptyCreateForm = {
  name: '',
  surname: '',
  email: '',
  password: '',
  phone: '',
  departmentId: '',
  cityId: '',
};

const emptyEditForm = {
  name: '',
  surname: '',
  email: '',
  phone: '',
  departmentId: '',
  cityId: '',
  isActive: true,
};

export function StaffManagementPage() {
  const { data: staff = [], isLoading } = useUsers('staff');
  const { data: departments = [] } = useDepartments();
  const { data: cities = [] } = useCities();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [createError, setCreateError] = useState('');

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [editError, setEditError] = useState('');
  const [staffToDeactivate, setStaffToDeactivate] = useState<User | null>(null);
  const [deactivateError, setDeactivateError] = useState('');

  const list = staff as User[];

  const openEditModal = (user: User) => {
    setEditError('');
    setEditingUser(user);
    setEditForm({
      name: user.name,
      surname: user.surname,
      email: user.email,
      phone: user.phone ?? '',
      departmentId: user.departmentId ?? '',
      cityId: user.cityId ?? '',
      isActive: user.isActive,
    });
  };

  const closeCreateModal = () => {
    setShowCreateForm(false);
    setCreateError('');
    setCreateForm(emptyCreateForm);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditError('');
    setEditForm(emptyEditForm);
  };

  const handleCreate = () => {
    setCreateError('');

    if (!createForm.name.trim() || !createForm.surname.trim() || !createForm.email.trim() || createForm.password.length < 6) {
      setCreateError('Ad, soyad, e-posta ve en az 6 karakterli şifre zorunludur.');
      return;
    }

    createUser.mutate(
      {
        name: createForm.name.trim(),
        surname: createForm.surname.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: 'staff',
        phone: createForm.phone.trim() || undefined,
        departmentId: createForm.departmentId || undefined,
        cityId: createForm.cityId || undefined,
      },
      {
        onSuccess: closeCreateModal,
        onError: (error) => {
          setCreateError(getApiErrorMessage(error, 'Personel oluşturulamadı.'));
        },
      },
    );
  };

  const handleUpdate = () => {
    if (!editingUser) return;

    setEditError('');

    if (!editForm.name.trim() || !editForm.surname.trim() || !editForm.email.trim()) {
      setEditError('Ad, soyad ve e-posta zorunludur.');
      return;
    }

    updateUser.mutate(
      {
        id: editingUser.id,
        data: {
          name: editForm.name.trim(),
          surname: editForm.surname.trim(),
          email: editForm.email.trim(),
          phone: editForm.phone.trim() || undefined,
          departmentId: editForm.departmentId || undefined,
          cityId: editForm.cityId || undefined,
          isActive: editForm.isActive,
        },
      },
      {
        onSuccess: closeEditModal,
        onError: (error) => {
          setEditError(getApiErrorMessage(error, 'Personel güncellenemedi.'));
        },
      },
    );
  };

  const openDeactivateModal = (user: User) => {
    setDeactivateError('');
    setStaffToDeactivate(user);
  };

  const closeDeactivateModal = () => {
    if (deleteUser.isPending) return;
    setDeactivateError('');
    setStaffToDeactivate(null);
  };

  const handleDeactivate = () => {
    if (!staffToDeactivate) return;

    setDeactivateError('');
    deleteUser.mutate(staffToDeactivate.id, {
      onSuccess: () => {
        setStaffToDeactivate(null);
      },
      onError: (error) => {
        setDeactivateError(getApiErrorMessage(error, 'Personel pasife alınamadı.'));
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-md flex items-center justify-between flex-wrap gap-sm">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background font-bold">Personel</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{list.length} personel</p>
        </div>
        <button
          onClick={() => {
            setCreateError('');
            setShowCreateForm(true);
          }}
          className="flex items-center gap-xs bg-primary text-on-primary rounded-xl px-sm py-xs font-body-sm text-body-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.98] duration-150"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
          Yeni Personel
        </button>
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
                <th className="px-md py-sm text-left font-label-md text-label-md text-on-surface-variant uppercase">Personel</th>
                <th className="px-md py-sm text-left font-label-md text-label-md text-on-surface-variant uppercase hidden md:table-cell">Departman</th>
                <th className="px-md py-sm text-left font-label-md text-label-md text-on-surface-variant uppercase hidden md:table-cell">Şehir</th>
                <th className="px-md py-sm text-left font-label-md text-label-md text-on-surface-variant uppercase">Durum</th>
                <th className="px-md py-sm text-right font-label-md text-label-md text-on-surface-variant uppercase">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-md py-xl text-center font-body-sm text-body-sm text-on-surface-variant">
                    Henüz personel yok.
                  </td>
                </tr>
              ) : list.map((u) => (
                <tr key={u.id} className="hover:bg-surface-container-highest/50 transition-colors">
                  <td className="px-md py-sm">
                    <p className="font-body-sm text-body-sm text-on-surface font-medium">{u.name} {u.surname}</p>
                    <p className="font-label-md text-label-md text-on-surface-variant mt-xs">{u.email}</p>
                  </td>
                  <td className="px-md py-sm font-body-sm text-body-sm text-on-surface-variant hidden md:table-cell">
                    {u.department?.name ?? '—'}
                  </td>
                  <td className="px-md py-sm font-body-sm text-body-sm text-on-surface-variant hidden md:table-cell">
                    {u.city?.name ?? '—'}
                  </td>
                  <td className="px-md py-sm">
                    <span className={`inline-flex items-center gap-xs rounded-full px-sm py-[2px] font-label-md text-label-md ${
                      u.isActive ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'
                    }`}>
                      {u.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-md py-sm">
                    <div className="flex justify-end gap-xs">
                      <button
                        onClick={() => openEditModal(u)}
                        className="text-on-surface-variant hover:text-primary transition-colors"
                        title="Düzenle"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                      </button>
                      <button
                        onClick={() => openDeactivateModal(u)}
                        className="text-on-surface-variant hover:text-error transition-colors"
                        title="Pasife al"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_off</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-md">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-md w-full max-w-[28rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-md">
              <h3 className="font-headline-md text-headline-md text-on-background">Yeni Personel</h3>
              <button onClick={closeCreateModal} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>
            <div className="flex flex-col gap-sm">
              <div className="grid grid-cols-2 gap-sm">
                <input className={inputClass} placeholder="Ad" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
                <input className={inputClass} placeholder="Soyad" value={createForm.surname} onChange={(e) => setCreateForm({ ...createForm, surname: e.target.value })} />
              </div>
              <input className={inputClass} type="email" placeholder="E-posta" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
              <input className={inputClass} type="password" placeholder="Şifre (min. 6 karakter)" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
              <input className={inputClass} placeholder="Telefon (opsiyonel)" value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} />
              <select className={selectClass} value={createForm.departmentId} onChange={(e) => setCreateForm({ ...createForm, departmentId: e.target.value })}>
                <option value="">Departman seçin (opsiyonel)</option>
                {(departments as Department[]).map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <select className={selectClass} value={createForm.cityId} onChange={(e) => setCreateForm({ ...createForm, cityId: e.target.value })}>
                <option value="">Şehir seçin (opsiyonel)</option>
                {(cities as City[]).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {createError && <p className="font-label-md text-label-md text-error">{createError}</p>}
              <div className="flex gap-sm mt-xs">
                <button onClick={closeCreateModal} className="flex-1 border border-outline-variant rounded-xl py-xs font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high transition-colors">
                  İptal
                </button>
                <button
                  onClick={handleCreate}
                  disabled={createUser.isPending}
                  className="flex-1 bg-primary text-on-primary rounded-xl py-xs font-body-sm text-body-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {createUser.isPending ? 'Kaydediliyor...' : 'Oluştur'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-md">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-md w-full max-w-[28rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-md">
              <h3 className="font-headline-md text-headline-md text-on-background">Personel Düzenle</h3>
              <button onClick={closeEditModal} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>
            <div className="flex flex-col gap-sm">
              <div className="grid grid-cols-2 gap-sm">
                <input className={inputClass} placeholder="Ad" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                <input className={inputClass} placeholder="Soyad" value={editForm.surname} onChange={(e) => setEditForm({ ...editForm, surname: e.target.value })} />
              </div>
              <input className={inputClass} type="email" placeholder="E-posta" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              <input className={inputClass} placeholder="Telefon (opsiyonel)" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              <select className={selectClass} value={editForm.departmentId} onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value })}>
                <option value="">Departman seçin (opsiyonel)</option>
                {(departments as Department[]).map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <select className={selectClass} value={editForm.cityId} onChange={(e) => setEditForm({ ...editForm, cityId: e.target.value })}>
                <option value="">Şehir seçin (opsiyonel)</option>
                {(cities as City[]).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <label className="flex items-center gap-xs font-body-sm text-body-sm text-on-surface">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                />
                Aktif kullanıcı
              </label>
              {editError && <p className="font-label-md text-label-md text-error">{editError}</p>}
              <div className="flex gap-sm mt-xs">
                <button onClick={closeEditModal} className="flex-1 border border-outline-variant rounded-xl py-xs font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high transition-colors">
                  İptal
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updateUser.isPending}
                  className="flex-1 bg-primary text-on-primary rounded-xl py-xs font-body-sm text-body-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {updateUser.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmActionModal
        isOpen={!!staffToDeactivate}
        title="Personeli Pasife Al"
        message={staffToDeactivate ? `${staffToDeactivate.name} ${staffToDeactivate.surname} pasife alınsın mı?` : ''}
        confirmText="Pasife Al"
        pendingText="Pasife Alınıyor..."
        variant="danger"
        isPending={deleteUser.isPending}
        errorMessage={deactivateError}
        onConfirm={handleDeactivate}
        onCancel={closeDeactivateModal}
      />
    </div>
  );
}
