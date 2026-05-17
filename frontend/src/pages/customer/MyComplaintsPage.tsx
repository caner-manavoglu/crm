import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/router/routes';

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function MyComplaintsPage() {
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = trackingId.trim();

    if (!uuidPattern.test(normalized)) {
      setError('Geçerli bir takip kodu (UUID) girin.');
      return;
    }

    setError('');
    navigate(ROUTES.CUSTOMER.COMPLAINT_DETAIL(normalized));
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-lg text-center">
        <h2 className="font-headline-lg text-headline-lg text-on-background font-bold">Şikayet Sorgula</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
          Şikayet oluşturduktan sonra aldığınız takip kodunu girerek durumunu görüntüleyin.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-surface-container border border-outline-variant rounded-xl p-lg flex flex-col gap-sm"
      >
        <label className="font-label-md text-label-md text-on-surface-variant uppercase">
          Takip Kodu
        </label>
        <div className="flex flex-col gap-sm md:flex-row">
          <input
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="örn: 4f89e5e3-5a0f-4f80-9f3a-1f7b2f28c79f"
            className="flex-1 bg-surface-dim border border-outline-variant rounded-lg px-sm py-[10px] font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
          <button
            type="submit"
            className="bg-primary text-on-primary rounded-lg px-md py-[10px] font-body-sm text-body-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Sorgula
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-xs rounded-lg border border-error/30 bg-error-container/30 px-sm py-xs">
            <span className="material-symbols-outlined text-error" style={{ fontSize: '16px' }}>
              error
            </span>
            <p className="font-body-sm text-body-sm text-error">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
}
