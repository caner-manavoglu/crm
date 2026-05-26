import { useState } from 'react';
import { ConfirmActionModal } from '@/components/shared/modals/ConfirmActionModal';
import {
  useDepartments,
  useCreateDepartment,
  useDeleteDepartment,
  useUpdateDepartment,
} from '@/hooks/queries/useDepartments';
import { getApiErrorMessage } from '@/lib/api-error';
import { PaginationControls } from '@/components/shared/PaginationControls';
import type { Department } from '@/types/user.types';

const inputClass = 'w-full bg-surface-dim border border-outline-variant rounded-lg px-sm py-[10px] font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors';

export function DepartmentsPage() {
  const { data: departments = [], isLoading } = useDepartments();
  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();
  const deleteDept = useDeleteDepartment();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createError, setCreateError] = useState('');

  const [editing, setEditing] = useState<Department | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editError, setEditError] = useState('');
  const [departmentToDeactivate, setDepartmentToDeactivate] = useState<Department | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 8;

  const list = departments as Department[];
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedList = list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleCreate = () => {
    if (!name.trim()) {
      setCreateError('Departman adı zorunludur.');
      return;
    }

    setCreateError('');
    createDept.mutate(
      { name: name.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => {
          setName('');
          setDescription('');
        },
        onError: (error) => {
          setCreateError(getApiErrorMessage(error, 'Departman oluşturulamadı.'));
        },
      },
    );
  };

  const openEditModal = (department: Department) => {
    setEditError('');
    setEditing(department);
    setEditName(department.name);
    setEditDescription(department.description ?? '');
  };

  const closeEditModal = () => {
    setEditing(null);
    setEditError('');
    setEditName('');
    setEditDescription('');
  };

  const openDeactivateModal = (department: Department) => {
    setDeleteError('');
    setDepartmentToDeactivate(department);
  };

  const closeDeactivateModal = () => {
    if (deleteDept.isPending) return;
    setDeleteError('');
    setDepartmentToDeactivate(null);
  };

  const handleUpdate = () => {
    if (!editing) return;

    if (!editName.trim()) {
      setEditError('Departman adı zorunludur.');
      return;
    }

    setEditError('');
    updateDept.mutate(
      {
        id: editing.id,
        data: {
          name: editName.trim(),
          description: editDescription.trim() || undefined,
        },
      },
      {
        onSuccess: closeEditModal,
        onError: (error) => {
          setEditError(getApiErrorMessage(error, 'Departman güncellenemedi.'));
        },
      },
    );
  };

  const handleDeactivate = () => {
    if (!departmentToDeactivate) return;

    setDeleteError('');
    deleteDept.mutate(departmentToDeactivate.id, {
      onSuccess: () => {
        setDepartmentToDeactivate(null);
      },
      onError: (error) => {
        setDeleteError(getApiErrorMessage(error, 'Departman pasife alınamadı.'));
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-md">
        <h2 className="font-headline-lg text-headline-lg text-on-background font-bold">Departmanlar</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{list.length} departman</p>
      </div>

      <div className="bg-surface-container border border-outline-variant rounded-xl p-md mb-md">
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase mb-sm flex items-center gap-xs">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
          Yeni Departman
        </h3>
        <div className="flex flex-col gap-sm md:flex-row">
          <input className={inputClass} placeholder="Departman adı" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={inputClass} placeholder="Açıklama (opsiyonel)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <button
            onClick={handleCreate}
            disabled={!name.trim() || createDept.isPending}
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
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '48px' }}>corporate_fare</span>
          <p className="font-body-md text-body-md text-on-surface-variant">Henüz departman yok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
          {pagedList.map((d) => (
            <div key={d.id} className="bg-surface-container border border-outline-variant rounded-xl p-md flex items-start justify-between gap-sm">
              <div className="min-w-0">
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>corporate_fare</span>
                  <p className="font-body-md text-body-md text-on-surface font-medium truncate">{d.name}</p>
                </div>
                {d.description && (
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{d.description}</p>
                )}
              </div>
              <div className="flex gap-xs shrink-0">
                <button
                  onClick={() => openEditModal(d)}
                  className="text-on-surface-variant hover:text-primary transition-colors"
                  title="Düzenle"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                </button>
                <button
                  onClick={() => openDeactivateModal(d)}
                  className="text-on-surface-variant hover:text-error transition-colors"
                  title="Pasife al"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                </button>
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

      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-md">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-md w-full max-w-[28rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-md">
              <h3 className="font-headline-md text-headline-md text-on-background">Departman Düzenle</h3>
              <button onClick={closeEditModal} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>
            <div className="flex flex-col gap-sm">
              <input className={inputClass} placeholder="Departman adı" value={editName} onChange={(e) => setEditName(e.target.value)} />
              <input className={inputClass} placeholder="Açıklama (opsiyonel)" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              {editError && <p className="font-label-md text-label-md text-error">{editError}</p>}
              <div className="flex gap-sm mt-xs">
                <button onClick={closeEditModal} className="flex-1 border border-outline-variant rounded-xl py-xs font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high transition-colors">
                  İptal
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updateDept.isPending}
                  className="flex-1 bg-primary text-on-primary rounded-xl py-xs font-body-sm text-body-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {updateDept.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmActionModal
        isOpen={!!departmentToDeactivate}
        title="Departmanı Pasife Al"
        message={departmentToDeactivate ? `"${departmentToDeactivate.name}" pasife alınsın mı?` : ''}
        confirmText="Pasife Al"
        pendingText="Pasife Alınıyor..."
        variant="danger"
        isPending={deleteDept.isPending}
        errorMessage={deleteError}
        onConfirm={handleDeactivate}
        onCancel={closeDeactivateModal}
      />
    </div>
  );
}
