import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories } from '@/hooks/queries/useCategories';
import { useCities } from '@/hooks/queries/useCities';
import { useAvailableStaff } from '@/hooks/queries/useStaffAvailability';
import { useCreateComplaint } from '@/hooks/queries/useComplaints';
import { ROUTES } from '@/router/routes';

const schema = z.object({
  title: z.string().min(5, 'En az 5 karakter'),
  content: z.string().min(10, 'En az 10 karakter'),
  categoryId: z.string().uuid('Kategori seçin'),
  cityId: z.string().uuid('Şehir seçin'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  autoAssign: z.boolean(),
  preferredStaffId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const selectClass = 'w-full bg-surface-dim border border-outline-variant rounded-lg px-sm py-[10px] font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors';
const inputClass = 'w-full bg-surface-dim border border-outline-variant rounded-lg px-sm py-[10px] font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors';
const labelClass = 'font-label-md text-label-md text-on-surface-variant uppercase';

export function SubmitComplaintPage() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState('');
  const createComplaint = useCreateComplaint();

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { autoAssign: true, priority: 'medium' },
  });

  const categoryId = watch('categoryId');
  const cityId = watch('cityId');
  const autoAssign = watch('autoAssign');

  const { data: categories = [] } = useCategories();
  const { data: cities = [] } = useCities();

  const selectedCategory = categories.find((c: { id: string }) => c.id === categoryId);
  const departmentId = selectedCategory?.departmentId;
  const departmentName = selectedCategory?.department?.name ?? '—';

  const { data: availableStaff = [] } = useAvailableStaff(departmentId, cityId);

  const onSubmit = async (data: FormData) => {
    try {
      const result = await createComplaint.mutateAsync(data);
      setSuccess(`Şikayet başarıyla oluşturuldu. (#${result.id.slice(0, 8)})`);
      setTimeout(() => navigate(ROUTES.CUSTOMER.COMPLAINT_DETAIL(result.id)), 1200);
    } catch {
      // error handled by react-query
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-md">
        <h2 className="font-headline-lg text-headline-lg text-on-background font-bold">Yeni Şikayet Oluştur</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
          Şikayetinizi detaylı şekilde girin, sistem doğru ekibe yönlendirsin.
        </p>
      </div>

      {success && (
        <div className="mb-md flex items-center gap-sm rounded-xl border border-primary/30 bg-primary/10 px-sm py-sm">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>check_circle</span>
          <p className="font-body-sm text-body-sm text-primary">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-md lg:grid-cols-3">
        <section className="space-y-md lg:col-span-2">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-md">
            <h3 className="font-headline-md text-headline-md text-on-background mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>category</span>
              Sınıflandırma
            </h3>
            <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
              <div className="flex flex-col gap-xs">
                <label className={labelClass}>Kategori</label>
                <select {...register('categoryId')} className={selectClass}>
                  <option value="">Seçin...</option>
                  {categories.map((c: { id: string; name: string; department: { name: string } }) => (
                    <option key={c.id} value={c.id}>
                      {c.department?.name} — {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="font-label-md text-label-md text-error">{errors.categoryId.message}</p>}
              </div>
              <div className="flex flex-col gap-xs">
                <label className={labelClass}>Departman (Otomatik)</label>
                <input
                  disabled
                  value={departmentName}
                  className="w-full bg-surface-container-low border border-dashed border-outline-variant rounded-lg px-sm py-[10px] font-body-sm text-body-sm text-on-surface-variant cursor-not-allowed"
                />
              </div>
            </div>
            <div className="mt-sm max-w-sm flex flex-col gap-xs">
              <label className={labelClass}>Şehir</label>
              <select {...register('cityId')} className={selectClass}>
                <option value="">Seçin...</option>
                {cities.map((c: { id: string; name: string }) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.cityId && <p className="font-label-md text-label-md text-error">{errors.cityId.message}</p>}
            </div>
          </div>

          <div className="bg-surface-container border border-outline-variant rounded-xl p-md">
            <h3 className="font-headline-md text-headline-md text-on-background mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>description</span>
              Şikayet Detayı
            </h3>
            <div className="flex flex-col gap-sm">
              <div className="flex flex-col gap-xs">
                <label className={labelClass}>Başlık</label>
                <input
                  {...register('title')}
                  className={inputClass}
                  placeholder="Şikayetinizin konusu"
                />
                {errors.title && <p className="font-label-md text-label-md text-error">{errors.title.message}</p>}
              </div>

              <div className="flex flex-col gap-xs">
                <label className={labelClass}>Açıklama</label>
                <textarea
                  {...register('content')}
                  rows={5}
                  className={`${inputClass} resize-y`}
                  placeholder="Şikayetinizi detaylı açıklayın..."
                />
                {errors.content && <p className="font-label-md text-label-md text-error">{errors.content.message}</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-md">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-md">
            <h3 className="font-headline-md text-headline-md text-on-background mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>tune</span>
              Öncelik & Atama
            </h3>
            <div className="flex flex-col gap-sm">
              <div className="flex flex-col gap-xs">
                <label className={labelClass}>Öncelik</label>
                <select {...register('priority')} className={selectClass}>
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                </select>
              </div>

              <label className="flex cursor-pointer items-center gap-sm p-sm rounded-lg border border-outline-variant/50 hover:bg-surface-container-high transition-colors">
                <input
                  type="checkbox"
                  {...register('autoAssign')}
                  className="w-4 h-4 rounded border-outline-variant accent-primary"
                />
                <div>
                  <p className="font-body-sm text-body-sm text-on-surface font-medium">Otomatik Atama</p>
                  <p className="font-label-md text-label-md text-on-surface-variant">Sistem en uygun personeli seçer</p>
                </div>
              </label>

              {!autoAssign && availableStaff.length > 0 && (
                <div className="flex flex-col gap-xs">
                  <label className={labelClass}>Personel Seç (Opsiyonel)</label>
                  <select
                    onChange={(e) => setValue('preferredStaffId', e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Seçin...</option>
                    {availableStaff.map((s: { staffId: string; currentLoad: number; maxCapacity: number; staff: { name: string; surname: string } }) => (
                      <option key={s.staffId} value={s.staffId} disabled={s.currentLoad >= s.maxCapacity}>
                        {s.staff?.name} {s.staff?.surname} ({s.currentLoad}/{s.maxCapacity})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!autoAssign && cityId && departmentId && availableStaff.length === 0 && (
                <div className="flex items-start gap-xs rounded-lg border border-secondary/30 bg-secondary/10 px-sm py-xs">
                  <span className="material-symbols-outlined text-secondary mt-[2px]" style={{ fontSize: '16px' }}>info</span>
                  <p className="font-body-sm text-body-sm text-secondary">Seçilen kriterlere göre müsait personel yok. Şikayet havuza alınacak.</p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || createComplaint.isPending}
            className="w-full bg-primary text-on-primary rounded-xl py-sm px-md font-body-md text-body-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] duration-150 flex items-center justify-center gap-xs"
          >
            {isSubmitting || createComplaint.isPending ? (
              <>
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>
                Gönderiliyor...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
                Şikayet Gönder
              </>
            )}
          </button>
        </section>
      </form>
    </div>
  );
}
