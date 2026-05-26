import { Link } from 'react-router-dom';
import { ArrowUpRight, Headset, Search, ShieldCheck } from 'lucide-react';
import { ROUTES } from '@/router/routes';

const cardClass = 'group relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-container p-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]';

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-on-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-[24rem] w-[24rem] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-[20rem] w-[20rem] rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/2 h-[18rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary-container/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-md py-xl">
        <div className="mb-xl max-w-3xl">
          <p className="mb-sm inline-flex items-center gap-xs rounded-full border border-outline-variant bg-surface-container px-sm py-xs font-label-md text-label-md text-on-surface-variant uppercase">
            CRM Platform
          </p>
          <h1 className="font-headline-xl text-headline-xl font-bold leading-tight">
            İki Adımda Başla
          </h1>
          <p className="mt-sm max-w-2xl font-body-md text-body-md text-on-surface-variant">
            Yetkili kullanıcılar panele giriş yapabilir, müşteriler ise doğrudan talep oluşturma ekranından kayıt bırakabilir.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-md md:grid-cols-3">
          <Link to={ROUTES.LOGIN} className={cardClass}>
            <div className="mb-md flex items-center justify-between">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <ShieldCheck size={24} strokeWidth={2.1} />
              </span>
              <ArrowUpRight
                size={22}
                strokeWidth={2.1}
                className="text-on-surface-variant transition-colors group-hover:text-primary"
              />
            </div>
            <h2 className="font-headline-md text-headline-md text-on-background">Yetkili Girişi</h2>
            <p className="mt-xs font-body-sm text-body-sm text-on-surface-variant">
              Admin ve personel için güvenli panel girişi.
            </p>
          </Link>

          <Link to={ROUTES.CUSTOMER.SUBMIT} className={cardClass}>
            <div className="mb-md flex items-center justify-between">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/20 text-secondary">
                <Headset size={24} strokeWidth={2.1} />
              </span>
              <ArrowUpRight
                size={22}
                strokeWidth={2.1}
                className="text-on-surface-variant transition-colors group-hover:text-secondary"
              />
            </div>
            <h2 className="font-headline-md text-headline-md text-on-background">Talep Arayüzü</h2>
            <p className="mt-xs font-body-sm text-body-sm text-on-surface-variant">
              Giriş yapmadan şikayet veya talep oluşturma ekranı.
            </p>
          </Link>

          <Link to={ROUTES.TRACK} className={cardClass}>
            <div className="mb-md flex items-center justify-between">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-tertiary/20 text-tertiary">
                <Search size={24} strokeWidth={2.1} />
              </span>
              <ArrowUpRight
                size={22}
                strokeWidth={2.1}
                className="text-on-surface-variant transition-colors group-hover:text-tertiary"
              />
            </div>
            <h2 className="font-headline-md text-headline-md text-on-background">Talep Sorgu</h2>
            <p className="mt-xs font-body-sm text-body-sm text-on-surface-variant">
              Takip kodunuz ile talebinizi ve çözüm sürecini anlık takip edin.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
