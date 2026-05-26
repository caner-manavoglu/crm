import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import {
  useAllComplaints,
  useDeleteComplaint,
  useUpdateComplaint,
  useUpdateComplaintStatus,
} from '@/hooks/queries/useComplaints';
import { useAdminAssign } from '@/hooks/queries/useAssignments';
import { useAvailableStaff } from '@/hooks/queries/useStaffAvailability';
import { useCities } from '@/hooks/queries/useCities';
import { useCategories } from '@/hooks/queries/useCategories';
import { ComplaintStatusBadge } from '@/components/shared/complaints/ComplaintStatusBadge';
import { PriorityBadge } from '@/components/shared/complaints/PriorityBadge';
import { getApiErrorMessage } from '@/lib/api-error';
import { toast } from 'sonner';
import { PaginationControls } from '@/components/shared/PaginationControls';
import type { Complaint } from '@/types/complaint.types';

const selectClass =
  'bg-surface-dim border border-outline-variant rounded-lg px-sm py-[10px] font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors';
const inputClass = selectClass + ' w-full';

type AssignModalState = { complaintId: string; departmentId?: string; cityId?: string };

type EditState = {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  categoryId: string;
  cityId: string;
};

type TransferState = { id: string; currentCityId: string; title: string };

type ConfirmState =
  | { kind: 'delete'; id: string; title: string }
  | { kind: 'close'; id: string; title: string };

type CityOption = { id: string; name: string };
type CategoryOption = { id: string; name: string; department?: { name: string } };

export function AllComplaintsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [assignModal, setAssignModal] = useState<AssignModalState | null>(null);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [edit, setEdit] = useState<EditState | null>(null);
  const [transfer, setTransfer] = useState<TransferState | null>(null);
  const [transferCityId, setTransferCityId] = useState('');
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [page, setPage] = useState(1);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const PAGE_SIZE = 10;

  // Search input'u 350ms debounce.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading } = useAllComplaints({
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(priorityFilter ? { priority: priorityFilter } : {}),
    ...(cityFilter ? { cityId: cityFilter } : {}),
    ...(fromDate ? { fromDate } : {}),
    ...(toDate ? { toDate } : {}),
    ...(search ? { q: search } : {}),
    page,
    limit: PAGE_SIZE,
  });
  const adminAssign = useAdminAssign();
  const updateComplaint = useUpdateComplaint();
  const deleteComplaint = useDeleteComplaint();
  const updateStatus = useUpdateComplaintStatus();
  const { data: availableStaff = [] } = useAvailableStaff(assignModal?.departmentId, assignModal?.cityId);
  const { data: cities = [] } = useCities();
  const { data: categories = [] } = useCategories();

  const complaints: Complaint[] = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = Math.max(1, meta?.totalPages ?? 1);
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (!openMenuId) return;
    const handleMouse = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handleMouse);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleMouse);
      document.removeEventListener('keydown', handleKey);
    };
  }, [openMenuId]);

  // Açık modal'ı Esc ile kapat.
  useEffect(() => {
    if (!edit && !transfer && !confirm && !assignModal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (edit) setEdit(null);
      else if (transfer) {
        setTransfer(null);
        setTransferCityId('');
      } else if (confirm) setConfirm(null);
      else if (assignModal) {
        setAssignModal(null);
        setSelectedStaff('');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [edit, transfer, confirm, assignModal]);

  const handleAssign = () => {
    if (!assignModal || !selectedStaff) return;
    adminAssign.mutate({ complaintId: assignModal.complaintId, staffId: selectedStaff });
    setAssignModal(null);
    setSelectedStaff('');
  };

  const openEdit = (c: Complaint) => {
    setEdit({
      id: c.id,
      title: c.title,
      content: c.content,
      priority: c.priority,
      categoryId: c.categoryId ?? '',
      cityId: c.cityId ?? '',
    });
    setOpenMenuId(null);
  };

  const submitEdit = async () => {
    if (!edit) return;
    try {
      await updateComplaint.mutateAsync({
        id: edit.id,
        data: {
          title: edit.title,
          content: edit.content,
          priority: edit.priority,
          categoryId: edit.categoryId || undefined,
          // cityId değişikliği transfer akışına ait, edit'te göndermiyoruz.
        },
      });
      setEdit(null);
      toast.success('Talep güncellendi.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Güncelleme başarısız.'));
    }
  };

  const submitTransfer = async () => {
    if (!transfer || !transferCityId || transferCityId === transfer.currentCityId) return;
    try {
      await updateComplaint.mutateAsync({ id: transfer.id, data: { cityId: transferCityId } });
      setTransfer(null);
      setTransferCityId('');
      toast.success('Talep yeni şehre yönlendirildi.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Yönlendirme başarısız.'));
    }
  };

  const submitConfirm = async () => {
    if (!confirm) return;
    try {
      if (confirm.kind === 'delete') {
        await deleteComplaint.mutateAsync(confirm.id);
        toast.success('Talep silindi.');
      } else {
        await updateStatus.mutateAsync({
          id: confirm.id,
          status: 'closed',
          notes: 'Talep admin tarafından kapatıldı.',
        });
        toast.success('Talep kapatıldı.');
      }
      setConfirm(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'İşlem başarısız.'));
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-md flex flex-col gap-sm">
        <div className="flex items-center justify-between flex-wrap gap-sm">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-background font-bold">Tüm Şikayetler</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
              {data?.meta?.total ?? 0} şikayet
            </p>
          </div>
          {(statusFilter || priorityFilter || cityFilter || fromDate || toDate || search) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('');
                setPriorityFilter('');
                setCityFilter('');
                setFromDate('');
                setToDate('');
                setSearchInput('');
                setSearch('');
                setPage(1);
              }}
              className="inline-flex items-center gap-xs rounded-lg border border-outline-variant px-sm py-xs font-label-md text-label-md text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>filter_alt_off</span>
              Filtreleri Temizle
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-6">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Başlık, içerik, takip kodu..."
            aria-label="Şikayet arama"
            className={selectClass + ' lg:col-span-2'}
          />
          <select
            value={statusFilter}
            aria-label="Durum filtresi"
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">Tüm Durumlar</option>
            <option value="pending">Beklemede</option>
            <option value="assigned">Atandı</option>
            <option value="in_progress">İşlemde</option>
            <option value="resolved">Çözüldü</option>
            <option value="closed">Kapatıldı</option>
          </select>
          <select
            value={priorityFilter}
            aria-label="Öncelik filtresi"
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">Tüm Öncelikler</option>
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
          </select>
          <select
            value={cityFilter}
            aria-label="Şehir filtresi"
            onChange={(e) => {
              setCityFilter(e.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">Tüm Şehirler</option>
            {(cities as CityOption[]).map((city) => (
              <option key={city.id} value={city.id}>{city.name}</option>
            ))}
          </select>
          <div className="flex gap-xs">
            <input
              type="date"
              value={fromDate}
              aria-label="Başlangıç tarihi"
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              className={selectClass + ' min-w-0 flex-1'}
            />
            <input
              type="date"
              value={toDate}
              aria-label="Bitiş tarihi"
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              className={selectClass + ' min-w-0 flex-1'}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center gap-sm text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin" style={{ fontSize: '20px' }}>progress_activity</span>
          <span className="font-body-sm text-body-sm">Yükleniyor...</span>
        </div>
      ) : (
        <div className="bg-surface-container border border-outline-variant rounded-xl overflow-visible">
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
              ) : complaints.map((c) => {
                const isClosed = c.status === 'closed';
                return (
                <tr key={c.id} className="hover:bg-surface-container-highest/50 transition-colors">
                  <td className="px-md py-sm">
                    <Link to={ROUTES.ADMIN.COMPLAINT_DETAIL(c.id)} className="font-body-sm text-body-sm text-on-surface font-medium block hover:text-primary transition-colors">{c.title}</Link>
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
                    <div className="flex items-center gap-md">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                          className="flex items-center gap-xs font-label-md text-label-md text-primary hover:text-primary/80 transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                          Detay
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_drop_down</span>
                        </button>

                        {openMenuId === c.id && (
                          <div
                            ref={menuRef}
                            role="menu"
                            className="absolute right-0 z-50 mt-xs w-56 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-high shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
                          >
                            <div className="border-b border-outline-variant/60 px-sm py-xs">
                              <p className="font-label-md text-label-md uppercase text-on-surface-variant">İşlemler</p>
                            </div>
                            <Link
                              to={ROUTES.ADMIN.COMPLAINT_DETAIL(c.id)}
                              className="flex items-center gap-sm px-sm py-xs font-body-sm text-body-sm text-on-surface transition-colors hover:bg-surface-container-highest"
                              onClick={() => setOpenMenuId(null)}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                              Detayı Aç
                            </Link>
                            <button
                              type="button"
                              onClick={() => openEdit(c)}
                              disabled={isClosed}
                              className="flex w-full items-center gap-sm px-sm py-xs font-body-sm text-body-sm text-on-surface transition-colors hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                              Talebi Düzenle
                            </button>
                            <button
                              type="button"
                              onClick={() => {

                                setTransfer({ id: c.id, currentCityId: c.cityId, title: c.title });
                                setTransferCityId('');
                                setOpenMenuId(null);
                              }}
                              disabled={isClosed}
                              className="flex w-full items-center gap-sm px-sm py-xs font-body-sm text-body-sm text-on-surface transition-colors hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>swap_horiz</span>
                              Şehre Yönlendir
                            </button>
                            <button
                              type="button"
                              onClick={() => {

                                setConfirm({ kind: 'close', id: c.id, title: c.title });
                                setOpenMenuId(null);
                              }}
                              disabled={isClosed}
                              className="flex w-full items-center gap-sm px-sm py-xs font-body-sm text-body-sm text-on-surface transition-colors hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>task_alt</span>
                              Talebi Kapat
                            </button>
                            <div className="border-t border-outline-variant/60" />
                            <button
                              type="button"
                              onClick={() => {

                                setConfirm({ kind: 'delete', id: c.id, title: c.title });
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center gap-sm px-sm py-xs font-body-sm text-body-sm text-error transition-colors hover:bg-error-container/40"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                              Talebi Sil
                            </button>
                          </div>
                        )}
                      </div>

                      {c.status === 'pending' && (
                        <button
                          onClick={() => setAssignModal({
                            complaintId: c.id,
                            departmentId: c.category?.departmentId,
                            cityId: c.cityId,
                          })}
                          className="flex items-center gap-xs font-label-md text-label-md text-primary hover:underline transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                          Ata
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && (
        <PaginationControls
          page={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={meta?.total ?? 0}
          pageSize={meta?.limit ?? PAGE_SIZE}
          currentItemCount={complaints.length}
        />
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

      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-md">
          <div className="w-full max-w-[32rem] rounded-xl border border-outline-variant bg-surface-container p-md shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="mb-md flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md text-on-background">Talebi Düzenle</h3>
              <button onClick={() => setEdit(null)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div className="flex flex-col gap-sm">
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md uppercase text-on-surface-variant">Başlık</label>
                <input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} className={inputClass} />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md uppercase text-on-surface-variant">Açıklama</label>
                <textarea
                  value={edit.content}
                  onChange={(e) => setEdit({ ...edit, content: e.target.value })}
                  rows={5}
                  className={inputClass + ' resize-y'}
                />
              </div>
              <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-label-md uppercase text-on-surface-variant">Öncelik</label>
                  <select
                    value={edit.priority}
                    onChange={(e) => setEdit({ ...edit, priority: e.target.value as EditState['priority'] })}
                    className={inputClass}
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                  </select>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-label-md uppercase text-on-surface-variant">Kategori</label>
                  <select
                    value={edit.categoryId}
                    onChange={(e) => setEdit({ ...edit, categoryId: e.target.value })}
                    className={inputClass}
                  >
                    {(categories as CategoryOption[]).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.department?.name ? `${cat.department.name} — ` : ''}{cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant">
                Şehir değişikliği için işlem menüsünden "Şehre Yönlendir"'i kullanın.
              </p>
            </div>

            <div className="mt-md flex gap-sm">
              <button
                onClick={() => setEdit(null)}
                className="flex-1 rounded-xl border border-outline-variant py-xs font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high"
              >
                İptal
              </button>
              <button
                onClick={submitEdit}
                disabled={updateComplaint.isPending}
                className="flex-1 rounded-xl bg-primary py-xs font-body-sm text-body-sm font-semibold text-on-primary hover:opacity-90 disabled:opacity-50"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {transfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-md">
          <div className="w-full max-w-[26rem] rounded-xl border border-outline-variant bg-surface-container p-md shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="mb-md flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md text-on-background">Şehre Yönlendir</h3>
              <button onClick={() => setTransfer(null)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>
            <p className="mb-sm font-body-sm text-body-sm text-on-surface-variant">
              "<span className="text-on-surface">{transfer.title}</span>" talebi seçilen şehre yönlendirilecek.
              Mevcut atama serbest bırakılarak talep havuza alınır.
            </p>
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md uppercase text-on-surface-variant">Yeni Şehir</label>
              <select
                value={transferCityId}
                onChange={(e) => setTransferCityId(e.target.value)}
                className={inputClass}
              >
                <option value="">Seçin...</option>
                {(cities as CityOption[]).map((city) => (
                  <option key={city.id} value={city.id} disabled={city.id === transfer.currentCityId}>
                    {city.name}{city.id === transfer.currentCityId ? ' (Mevcut)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-md flex gap-sm">
              <button
                onClick={() => setTransfer(null)}
                className="flex-1 rounded-xl border border-outline-variant py-xs font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high"
              >
                İptal
              </button>
              <button
                onClick={submitTransfer}
                disabled={!transferCityId || transferCityId === transfer.currentCityId || updateComplaint.isPending}
                className="flex-1 rounded-xl bg-primary py-xs font-body-sm text-body-sm font-semibold text-on-primary hover:opacity-90 disabled:opacity-50"
              >
                Yönlendir
              </button>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-md">
          <div className="w-full max-w-[24rem] rounded-xl border border-outline-variant bg-surface-container p-md shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="mb-sm flex items-center gap-sm">
              <span
                className={
                  'material-symbols-outlined ' +
                  (confirm.kind === 'delete' ? 'text-error' : 'text-primary')
                }
                style={{ fontSize: '24px' }}
              >
                {confirm.kind === 'delete' ? 'warning' : 'task_alt'}
              </span>
              <h3 className="font-headline-md text-headline-md text-on-background">
                {confirm.kind === 'delete' ? 'Talebi Sil' : 'Talebi Kapat'}
              </h3>
            </div>
            <p className="mb-md font-body-sm text-body-sm text-on-surface-variant">
              {confirm.kind === 'delete'
                ? `"${confirm.title}" talebi kalıcı olarak silinecek. Bu işlem geri alınamaz.`
                : `"${confirm.title}" talebi "Kapatıldı" olarak işaretlenecek.`}
            </p>
            <div className="flex gap-sm">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 rounded-xl border border-outline-variant py-xs font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high"
              >
                İptal
              </button>
              <button
                onClick={submitConfirm}
                disabled={deleteComplaint.isPending || updateStatus.isPending}
                className={
                  'flex-1 rounded-xl py-xs font-body-sm text-body-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 ' +
                  (confirm.kind === 'delete'
                    ? 'bg-error text-on-error'
                    : 'bg-primary text-on-primary')
                }
              >
                {confirm.kind === 'delete' ? 'Sil' : 'Kapat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
