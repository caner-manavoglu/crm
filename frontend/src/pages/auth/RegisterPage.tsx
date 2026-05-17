import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTES } from '@/router/routes';
import api from '@/api/axios';

const schema = z.object({
  name: z.string().min(2, 'En az 2 karakter'),
  surname: z.string().min(2, 'En az 2 karakter'),
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'En az 6 karakter'),
});

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const setTokens = useAuthStore((s) => s.setTokens);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const res = await api.post('/api/auth/register', data);
      const { accessToken, refreshToken, user } = res.data.data;
      setTokens(accessToken, refreshToken);
      setUser(user);
      navigate(ROUTES.CUSTOMER.SUBMIT);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Kayıt başarısız.');
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-on-background items-center justify-center p-margin">
      <div className="w-full max-w-md">
        <div className="bg-surface-container border border-outline-variant rounded-xl p-lg shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex flex-col gap-margin">
          <div className="flex flex-col items-center gap-base text-center">
            <div className="w-16 h-16 rounded-xl bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: '32px' }}>person_add</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-background">Kayıt Ol</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Müşteri hesabı oluşturun</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-sm">
            <div className="grid grid-cols-2 gap-sm">
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase">Ad</label>
                <input
                  {...register('name')}
                  placeholder="Adınız"
                  className="w-full bg-surface-dim border border-outline-variant rounded-lg px-sm py-[10px] font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
                {errors.name && <p className="font-label-md text-label-md text-error">{errors.name.message}</p>}
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase">Soyad</label>
                <input
                  {...register('surname')}
                  placeholder="Soyadınız"
                  className="w-full bg-surface-dim border border-outline-variant rounded-lg px-sm py-[10px] font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
                {errors.surname && <p className="font-label-md text-label-md text-error">{errors.surname.message}</p>}
              </div>
            </div>

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
                  placeholder="En az 6 karakter"
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
                  Kayıt yapılıyor...
                </span>
              ) : 'Kayıt Ol'}
            </button>
          </form>

          <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
            Hesabınız var mı?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary hover:underline font-medium">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
