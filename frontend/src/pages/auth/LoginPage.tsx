import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTES } from '@/router/routes';

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
    <div className="flex min-h-screen bg-background text-on-background">
      <div className="hidden lg:flex lg:w-1/2 bg-surface-container-low border-r border-outline-variant relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(77,142,255,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(255,185,95,0.08),transparent_60%)]" />
        <div className="relative z-10 flex flex-col justify-center px-lg">
          <div className="mb-lg">
            <div className="flex items-center gap-sm mb-md">
              <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: '28px' }}>support_agent</span>
              </div>
              <div>
                <h1 className="font-headline-lg text-headline-lg text-on-background font-bold">CareFlow</h1>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Enterprise CRM</p>
              </div>
            </div>
            <h2 className="font-headline-xl text-headline-xl text-on-background mb-sm">
              Müşteri şikayetlerini<br />akıllıca yönetin
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              Otomatik atama motoru, gerçek zamanlı bildirimler ve kapsamlı raporlama ile müşteri memnuniyetini artırın.
            </p>
          </div>
          <div className="flex flex-col gap-sm">
            {[
              { icon: 'auto_awesome', text: 'Akıllı otomatik atama algoritması' },
              { icon: 'notifications_active', text: 'Gerçek zamanlı bildirimler' },
              { icon: 'bar_chart', text: 'Kapsamlı analitik & raporlama' },
            ].map((item) => (
              <div key={item.icon} className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>{item.icon}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-margin">
        <div className="w-full max-w-md">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-lg shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex flex-col gap-margin">
            <div className="flex flex-col items-center gap-base text-center">
              <div className="w-16 h-16 rounded-xl bg-primary-container flex items-center justify-center lg:hidden">
                <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: '32px' }}>support_agent</span>
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-background">Giriş Yap</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">CareFlow hesabınıza erişin</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-sm">
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase">E-posta</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '18px' }}>mail</span>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="ornek@email.com"
                    className="w-full bg-surface-dim border border-outline-variant rounded-lg pl-[40px] pr-sm py-[10px] font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  />
                </div>
                {errors.email && <p className="font-label-md text-label-md text-error">{errors.email.message}</p>}
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase">Şifre</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '18px' }}>lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="••••••••"
                    className="w-full bg-surface-dim border border-outline-variant rounded-lg pl-[40px] pr-[40px] py-[10px] font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.password && <p className="font-label-md text-label-md text-error">{errors.password.message}</p>}
              </div>

              {error && (
                <div className="flex items-center gap-xs rounded-lg border border-error/30 bg-error-container/30 px-sm py-xs">
                  <span className="material-symbols-outlined text-error" style={{ fontSize: '16px' }}>error</span>
                  <p className="font-body-sm text-body-sm text-error">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-on-primary rounded-xl py-sm px-md font-body-md text-body-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] duration-150 mt-xs"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-xs">
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>
                    Giriş yapılıyor...
                  </span>
                ) : 'Giriş Yap'}
              </button>
            </form>

            <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
              Hesabınız yok mu?{' '}
              <Link to={ROUTES.REGISTER} className="text-primary hover:underline font-medium">
                Kayıt Ol
              </Link>
            </p>

            <div className="border border-outline-variant/60 rounded-lg p-sm bg-surface-container-low">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-xs">Test Hesapları</p>
              <div className="flex flex-col gap-xs">
                <div className="flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Admin</span>
                  <span className="font-body-sm text-body-sm text-on-surface">admin@crm.com / Admin123!</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Personel</span>
                  <span className="font-body-sm text-body-sm text-on-surface">ahmet@crm.com / Staff123!</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Müşteri</span>
                  <span className="font-body-sm text-body-sm text-on-surface">musteri@crm.com / Musteri123!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
