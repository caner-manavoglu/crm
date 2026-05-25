import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  customer: ROUTES.CUSTOMER.SUBMIT,
  staff: ROUTES.STAFF.DASHBOARD,
  admin: ROUTES.ADMIN.DASHBOARD,
};

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
      if (user) navigate(roleHomeMap[user.role]);
    } catch {
      setError('E-posta veya şifre hatalı.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background">
      <div className="flex min-h-screen">
        <div className="relative flex w-full items-center justify-center overflow-hidden bg-surface px-margin py-xl lg:w-1/2">
          <div className="relative z-10 w-full max-w-[30rem] rounded-xl border border-outline-variant bg-surface-container p-lg shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="mb-md flex items-center gap-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                <Shield size={22} strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="font-headline-md text-headline-md text-on-surface">CareFlow'a Hoş Geldiniz</h1>
                <p className="mt-xs font-body-sm text-body-sm text-on-surface-variant">Devam etmek için giriş yapın.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-sm">
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface uppercase">E-posta</label>
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="ornek@sirket.com"
                    className="w-full rounded-lg border border-outline-variant bg-background py-[10px] pl-9 pr-sm font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                {errors.email && <p className="font-label-md text-label-md text-error">{errors.email.message}</p>}
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface uppercase">Şifre</label>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-outline-variant bg-background py-[10px] pl-9 pr-[40px] font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
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
                <div className="rounded-lg border border-error/30 bg-error-container/30 px-sm py-xs">
                  <p className="font-body-sm text-body-sm text-error">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-xs w-full rounded-lg bg-primary px-md py-sm font-label-md text-label-md text-on-primary transition-colors hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>

            <p className="mt-sm text-center font-body-sm text-body-sm text-on-surface-variant">
              Hesabınız yok mu?{' '}
              <Link to={ROUTES.REGISTER} className="font-medium text-primary hover:underline">
                Kayıt Ol
              </Link>
            </p>

            <div className="mt-md rounded-lg border border-outline-variant/60 bg-surface-container-low p-sm">
              <p className="mb-xs font-label-md text-label-md text-on-surface-variant uppercase">Test Hesapları</p>
              <div className="space-y-xs font-body-sm text-body-sm text-on-surface">
                <p><span className="text-on-surface-variant">Admin:</span> admin@crm.com / Admin123!</p>
                <p><span className="text-on-surface-variant">Personel:</span> ahmet@crm.com / Staff123!</p>
                <p><span className="text-on-surface-variant">Müşteri:</span> musteri@crm.com / Musteri123!</p>
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
            <div className="relative h-full overflow-hidden rounded-2xl border border-outline-variant bg-surface-dim">
              <img src={heroImage} alt="CRM hero" className="h-full w-full object-cover opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="absolute bottom-xl left-xl right-xl space-y-sm">
                <h2 className="font-headline-xl text-headline-xl text-on-surface">Müşteri İlişkilerinde Yeni Standart</h2>
                <p className="max-w-xl font-body-md text-body-md text-on-surface-variant">
                  CareFlow ile şikayet süreçlerini hızlandırın, ekip iş yükünü dengeleyin ve müşteri memnuniyetini ölçülebilir hale getirin.
                </p>
                <div className="mt-md grid grid-cols-3 gap-sm text-on-surface-variant">
                  <div className="rounded-lg border border-outline-variant/50 bg-background/35 p-sm">
                    <Sparkles size={16} className="mb-xs text-primary" />
                    <p className="font-label-md text-label-md uppercase">Akıllı Atama</p>
                  </div>
                  <div className="rounded-lg border border-outline-variant/50 bg-background/35 p-sm">
                    <BellRing size={16} className="mb-xs text-secondary" />
                    <p className="font-label-md text-label-md uppercase">Anlık Uyarı</p>
                  </div>
                  <div className="rounded-lg border border-outline-variant/50 bg-background/35 p-sm">
                    <BarChart3 size={16} className="mb-xs text-tertiary" />
                    <p className="font-label-md text-label-md uppercase">Analitik</p>
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
