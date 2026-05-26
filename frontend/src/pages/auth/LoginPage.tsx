import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail, Sparkles, BellRing, BarChart3, Shield } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTES } from '@/router/routes';
import heroImage from '@/assets/hero.png';

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'En az 6 karakter'),
});

type FormData = z.infer<typeof schema>;

const roleHomeMap = {
  staff: ROUTES.STAFF.DASHBOARD,
  admin: ROUTES.ADMIN.DASHBOARD,
} as const;

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      await login(data.email, data.password);
      const user = useAuthStore.getState().user;
      if (!user) return;

      if (user.role !== 'staff' && user.role !== 'admin') {
        useAuthStore.getState().logout();
        setError('Müşteri girişi kapalı. Lütfen şikayet formunu kullanın.');
        return;
      }

      navigate(roleHomeMap[user.role]);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'E-posta veya şifre hatalı.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background">
      <div className="flex min-h-screen">
        <div className="relative flex w-full items-center justify-center overflow-hidden bg-surface px-margin py-xl lg:w-1/2">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #424754 1px, transparent 1px), linear-gradient(to bottom, #424754 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative z-10 w-full max-w-[30rem] rounded-xl border border-outline-variant bg-surface-container p-lg shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="mb-lg flex items-center gap-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container text-on-primary-container shadow-[0_4px_12px_rgba(77,142,255,0.25)]">
                <Shield size={22} strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="font-headline-md text-headline-md text-on-surface">CareFlow'a Hoş Geldiniz</h1>
                <p className="mt-xs font-body-sm text-body-sm text-on-surface-variant">Devam etmek için giriş yapın.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md uppercase text-on-surface-variant">E-posta</label>
                <div className="group relative">
                  <Mail size={16} className="pointer-events-none absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary" />
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="ornek@sirket.com"
                    className="w-full rounded-lg border border-outline-variant bg-background py-[11px] pl-9 pr-sm font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/70 outline-none transition-all hover:border-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {errors.email && <p className="font-label-md text-label-md text-error">{errors.email.message}</p>}
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md uppercase text-on-surface-variant">Şifre</label>
                <div className="group relative">
                  <Lock size={16} className="pointer-events-none absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-outline-variant bg-background py-[11px] pl-9 pr-[40px] font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/70 outline-none transition-all hover:border-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-on-surface"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="font-label-md text-label-md text-error">{errors.password.message}</p>}
              </div>

              {error && (
                <div className="flex items-start gap-xs rounded-lg border border-error/30 bg-error-container/20 px-sm py-xs">
                  <p className="font-body-sm text-body-sm text-error">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-xs w-full rounded-lg bg-primary px-md py-sm font-label-md text-label-md uppercase text-on-primary shadow-[0_4px_12px_rgba(173,198,255,0.25)] transition-all hover:opacity-90 hover:shadow-[0_6px_16px_rgba(173,198,255,0.35)] active:scale-[0.99] disabled:opacity-50 disabled:shadow-none"
              >
                {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>

              <div className="mt-xs flex items-center justify-between font-label-md text-label-md">
                <button
                  type="button"
                  onClick={() => toast.info('Şifre sıfırlama yakında etkinleşecek.')}
                  className="text-on-surface-variant hover:text-primary transition-colors"
                >
                  Şifremi Unuttum
                </button>
                <Link to={ROUTES.REGISTER} className="text-primary hover:underline">
                  Hesap Oluştur
                </Link>
              </div>
            </form>

            <div className="mt-md rounded-lg border border-outline-variant/60 bg-surface-container-low p-sm">
              <p className="mb-xs font-label-md text-label-md uppercase text-on-surface-variant">Test Hesapları</p>
              <div className="space-y-xs font-body-sm text-body-sm text-on-surface">
                <p><span className="text-on-surface-variant">Admin:</span> admin@crm.com / Admin123!</p>
                <p><span className="text-on-surface-variant">Personel:</span> ahmet@crm.com / Staff123!</p>
              </div>
            </div>
          </div>

          <p className="absolute bottom-margin left-1/2 -translate-x-1/2 text-center font-label-md text-label-md text-on-surface-variant/70">
            © 2026 CareFlow CRM
          </p>
        </div>

        <div className="relative hidden border-l border-outline-variant bg-surface-container-lowest lg:block lg:w-1/2">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(to right, #424754 1px, transparent 1px), linear-gradient(to bottom, #424754 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="absolute inset-0 p-xl">
            <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-dim">
              <img src={heroImage} alt="CRM hero" className="absolute inset-0 h-full w-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
              <div className="relative mt-auto flex flex-col gap-md p-xl">
                <div className="flex flex-col gap-sm">
                  <span className="inline-flex w-fit items-center gap-xs rounded-full border border-primary/40 bg-primary-container/20 px-sm py-xs font-label-md text-label-md uppercase text-primary">
                    <Sparkles size={12} />
                    CareFlow CRM
                  </span>
                  <h2 className="font-headline-xl text-headline-xl leading-tight text-on-surface">
                    Müşteri İlişkilerinde<br />Yeni Standart
                  </h2>
                  <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
                    Şikayet süreçlerini hızlandırın, ekip iş yükünü dengeleyin ve müşteri memnuniyetini ölçülebilir hale getirin.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-sm">
                  <div className="flex flex-col gap-xs rounded-lg border border-outline-variant/50 bg-background/40 p-sm backdrop-blur-sm transition-colors hover:border-primary/40">
                    <Sparkles size={18} className="text-primary" />
                    <p className="font-label-md text-label-md uppercase text-on-surface">Akıllı Atama</p>
                  </div>
                  <div className="flex flex-col gap-xs rounded-lg border border-outline-variant/50 bg-background/40 p-sm backdrop-blur-sm transition-colors hover:border-secondary/40">
                    <BellRing size={18} className="text-secondary" />
                    <p className="font-label-md text-label-md uppercase text-on-surface">Anlık Uyarı</p>
                  </div>
                  <div className="flex flex-col gap-xs rounded-lg border border-outline-variant/50 bg-background/40 p-sm backdrop-blur-sm transition-colors hover:border-tertiary/40">
                    <BarChart3 size={18} className="text-tertiary" />
                    <p className="font-label-md text-label-md uppercase text-on-surface">Analitik</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
