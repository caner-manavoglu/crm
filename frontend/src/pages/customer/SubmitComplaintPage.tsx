import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  FileText,
  Info,
  Layers,
  Loader2,
  Send,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react';
import { useCategories } from '@/hooks/queries/useCategories';
import { useCities } from '@/hooks/queries/useCities';
import { useAvailableStaff } from '@/hooks/queries/useStaffAvailability';
import { useCreateComplaint } from '@/hooks/queries/useComplaints';
import { getApiErrorMessage } from '@/lib/api-error';
import { ROUTES } from '@/router/routes';
import { useAuthStore } from '@/stores/auth.store';

const schema = z.object({
  customerName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  customerSurname: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
  customerEmail: z.string().email('Geçerli bir e-posta girin'),
  customerPhone: z.string().optional(),
  title: z.string().min(5, 'En az 5 karakter'),
  content: z.string().min(10, 'En az 10 karakter'),
  categoryId: z.string().uuid('Kategori seçin'),
  cityId: z.string().uuid('Şehir seçin'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  autoAssign: z.boolean(),
  preferredStaffId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type CategoryOption = {
  id: string;
  name: string;
  departmentId: string;
  department?: { name: string };
};

type CityOption = {
  id: string;
  name: string;
};

type StaffOption = {
  staffId: string;
  currentLoad: number;
  maxCapacity: number;
  staff?: { name: string; surname: string };
};

const selectClass = 'w-full rounded-lg border border-outline-variant bg-surface-dim px-sm py-[10px] font-body-sm text-body-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary';
const inputClass = 'w-full rounded-lg border border-outline-variant bg-surface-dim px-sm py-[10px] font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary';
const labelClass = 'font-label-md text-label-md text-on-surface-variant uppercase';

export function SubmitComplaintPage() {
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [success, setSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');
  const createComplaint = useCreateComplaint();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: authUser?.name ?? '',
      customerSurname: authUser?.surname ?? '',
      customerEmail: authUser?.email ?? '',
      customerPhone: authUser?.phone ?? '',
      autoAssign: true,
      priority: 'medium',
    },
  });

  const categoryId = watch('categoryId');
  const cityId = watch('cityId');
  const autoAssign = watch('autoAssign');

  const { data: categories = [] } = useCategories();
  const { data: cities = [] } = useCities();

  const selectedCategory = (categories as CategoryOption[]).find((c) => c.id === categoryId);
  const departmentId = selectedCategory?.departmentId;
  const departmentName = selectedCategory?.department?.name ?? '—';

  const { data: availableStaff = [] } = useAvailableStaff(departmentId, cityId);

  const onSubmit = async (formData: FormData) => {
    setSubmitError('');
    setSuccess('');

    try {
      const result = await createComplaint.mutateAsync(formData);
      const ticketNo = result.id.slice(0, 8).toUpperCase();

      if (isAuthenticated && authUser?.role === 'customer') {
        setSuccess(`Şikayet başarıyla oluşturuldu. (#${ticketNo})`);
        setTimeout(() => navigate(ROUTES.CUSTOMER.COMPLAINT_DETAIL(result.id)), 1200);
        return;
      }

      setSuccess(`Talebiniz alındı. Takip numaranız: #${ticketNo}`);
      reset({
        customerName: formData.customerName,
        customerSurname: formData.customerSurname,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        title: '',
        content: '',
        categoryId: '',
        cityId: '',
        priority: 'medium',
        autoAssign: true,
        preferredStaffId: '',
      });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Talep oluşturulamadı.'));
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background">
      <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface-dim">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-md">
          <Link to={ROUTES.LANDING} className="flex items-center gap-xs text-on-surface-variant transition-colors hover:text-on-surface">
            <ArrowLeft size={16} />
            <span className="font-body-sm text-body-sm">Ana Sayfa</span>
          </Link>
          <p className="font-headline-md text-headline-md text-primary">CareFlow</p>
          <Link to={ROUTES.LOGIN} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface">
            Yetkili Girişi
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-md py-lg">
        <div className="mb-lg">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Yeni Şikayet Oluştur</h2>
          <p className="mt-xs font-body-md text-body-md text-on-surface-variant">
            Bilgilerinizi girin, talebiniz doğru ekip ve departmana otomatik yönlendirilsin.
          </p>
        </div>

        {success && (
          <div className="mb-md flex items-center gap-sm rounded-xl border border-primary/30 bg-primary/10 px-sm py-sm text-primary">
            <CheckCircle2 size={18} />
            <p className="font-body-sm text-body-sm">{success}</p>
          </div>
        )}

        {submitError && (
          <div className="mb-md rounded-xl border border-error/30 bg-error-container/30 px-sm py-sm text-error">
            <p className="font-body-sm text-body-sm">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-md lg:grid-cols-3">
          <section className="space-y-md lg:col-span-2">
            <div className="rounded-xl border border-outline-variant bg-surface-container p-md transition-colors hover:border-primary/40">
              <h3 className="mb-md flex items-center gap-xs border-b border-outline-variant/50 pb-xs font-headline-md text-headline-md text-on-surface">
                <UserRound size={18} className="text-primary" />
                İletişim Bilgileri
              </h3>
              <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
                <div className="flex flex-col gap-xs">
                  <label className={labelClass}>Ad</label>
                  <input {...register('customerName')} className={inputClass} placeholder="Adınız" />
                  {errors.customerName && <p className="font-label-md text-label-md text-error">{errors.customerName.message}</p>}
                </div>
                <div className="flex flex-col gap-xs">
                  <label className={labelClass}>Soyad</label>
                  <input {...register('customerSurname')} className={inputClass} placeholder="Soyadınız" />
                  {errors.customerSurname && <p className="font-label-md text-label-md text-error">{errors.customerSurname.message}</p>}
                </div>
              </div>
              <div className="mt-sm grid grid-cols-1 gap-sm md:grid-cols-2">
                <div className="flex flex-col gap-xs">
                  <label className={labelClass}>E-posta</label>
                  <input type="email" {...register('customerEmail')} className={inputClass} placeholder="ornek@email.com" />
                  {errors.customerEmail && <p className="font-label-md text-label-md text-error">{errors.customerEmail.message}</p>}
                </div>
                <div className="flex flex-col gap-xs">
                  <label className={labelClass}>Telefon (Opsiyonel)</label>
                  <input {...register('customerPhone')} className={inputClass} placeholder="05xx xxx xx xx" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-outline-variant bg-surface-container p-md transition-colors hover:border-primary/40">
              <h3 className="mb-md flex items-center gap-xs border-b border-outline-variant/50 pb-xs font-headline-md text-headline-md text-on-surface">
                <Layers size={18} className="text-primary" />
                Sınıflandırma
              </h3>
              <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
                <div className="flex flex-col gap-xs">
                  <label className={labelClass}>Kategori</label>
                  <select {...register('categoryId')} className={selectClass}>
                    <option value="">Seçin...</option>
                    {(categories as CategoryOption[]).map((c) => (
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
                    className="w-full cursor-not-allowed rounded-lg border border-dashed border-outline-variant bg-surface-container-low px-sm py-[10px] font-body-sm text-body-sm text-on-surface-variant"
                  />
                </div>
              </div>
              <div className="mt-sm max-w-[20rem] flex flex-col gap-xs">
                <label className={labelClass}>Şehir</label>
                <select {...register('cityId')} className={selectClass}>
                  <option value="">Seçin...</option>
                  {(cities as CityOption[]).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.cityId && <p className="font-label-md text-label-md text-error">{errors.cityId.message}</p>}
              </div>
            </div>

            <div className="rounded-xl border border-outline-variant bg-surface-container p-md transition-colors hover:border-primary/40">
              <h3 className="mb-md flex items-center gap-xs border-b border-outline-variant/50 pb-xs font-headline-md text-headline-md text-on-surface">
                <FileText size={18} className="text-primary" />
                Şikayet Detayı
              </h3>
              <div className="flex flex-col gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className={labelClass}>Başlık</label>
                  <input {...register('title')} className={inputClass} placeholder="Şikayetinizin konusu" />
                  {errors.title && <p className="font-label-md text-label-md text-error">{errors.title.message}</p>}
                </div>
                <div className="flex flex-col gap-xs">
                  <label className={labelClass}>Açıklama</label>
                  <textarea
                    {...register('content')}
                    rows={6}
                    className={`${inputClass} resize-y`}
                    placeholder="Şikayetinizi detaylı şekilde anlatın..."
                  />
                  {errors.content && <p className="font-label-md text-label-md text-error">{errors.content.message}</p>}
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-md">
            <div className="rounded-xl border border-outline-variant bg-surface-container p-md transition-colors hover:border-primary/40">
              <h3 className="mb-md flex items-center gap-xs border-b border-outline-variant/50 pb-xs font-headline-md text-headline-md text-on-surface">
                <SlidersHorizontal size={18} className="text-primary" />
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

                <label className="flex cursor-pointer items-center gap-sm rounded-lg border border-outline-variant/50 p-sm transition-colors hover:bg-surface-container-high">
                  <input type="checkbox" {...register('autoAssign')} className="h-4 w-4 accent-primary" />
                  <div>
                    <p className="font-body-sm text-body-sm text-on-surface">Otomatik Atama</p>
                    <p className="font-label-md text-label-md text-on-surface-variant">Sistem en uygun personeli seçer</p>
                  </div>
                </label>

                {!autoAssign && availableStaff.length > 0 && (
                  <div className="flex flex-col gap-xs">
                    <label className={labelClass}>Personel Seç (Opsiyonel)</label>
                    <select onChange={(e) => setValue('preferredStaffId', e.target.value)} className={selectClass}>
                      <option value="">Seçin...</option>
                      {(availableStaff as StaffOption[]).map((s) => (
                        <option key={s.staffId} value={s.staffId} disabled={s.currentLoad >= s.maxCapacity}>
                          {s.staff?.name} {s.staff?.surname} ({s.currentLoad}/{s.maxCapacity})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {!autoAssign && cityId && departmentId && availableStaff.length === 0 && (
                  <div className="flex items-start gap-xs rounded-lg border border-secondary/30 bg-secondary/10 px-sm py-xs text-secondary">
                    <Info size={16} className="mt-[1px]" />
                    <p className="font-body-sm text-body-sm">Bu kriterlere uygun müsait personel yok. Talep havuza düşecek.</p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || createComplaint.isPending}
              className="flex w-full items-center justify-center gap-xs rounded-lg bg-primary px-md py-sm font-body-md text-body-md font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting || createComplaint.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Şikayet Gönder
                </>
              )}
            </button>

            <div className="rounded-lg border border-outline-variant bg-surface-container-low p-sm text-on-surface-variant">
              <p className="mb-xs flex items-center gap-xs font-label-md text-label-md uppercase">
                <BadgeCheck size={14} className="text-primary" />
                Bilgilendirme
              </p>
              <p className="font-body-sm text-body-sm">
                Talebiniz alındıktan sonra takip kodu üretilir ve kayıtlı e-posta adresinize bildirim gönderilir.
              </p>
            </div>
          </section>
        </form>
      </main>
    </div>
  );
}
