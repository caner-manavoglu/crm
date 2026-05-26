import { useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateRating, useRating } from '@/hooks/queries/useRatings';
import { getApiErrorMessage } from '@/lib/api-error';

type Props = {
  complaintId: string;
  status: string;
  isOwner: boolean;
};

export function RatingCard({ complaintId, status, isOwner }: Props) {
  const { data: existing, isLoading } = useRating(complaintId);
  const create = useCreateRating(complaintId);

  const [hover, setHover] = useState(0);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');

  const canRate = isOwner && (status === 'resolved' || status === 'closed');

  if (isLoading) return null;

  if (existing) {
    return (
      <div className="rounded-xl border border-tertiary/40 bg-tertiary/10 p-md">
        <h3 className="mb-sm font-headline-md text-headline-md text-on-surface">
          Değerlendirmeniz
        </h3>
        <div className="flex items-center gap-xs">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={22}
              className={i < existing.score ? 'fill-tertiary text-tertiary' : 'text-on-surface-variant/40'}
            />
          ))}
          <span className="ml-xs font-body-md text-body-md font-semibold text-on-surface">
            {existing.score}/5
          </span>
        </div>
        {existing.comment && (
          <p className="mt-sm whitespace-pre-line font-body-sm text-body-sm text-on-surface">
            “{existing.comment}”
          </p>
        )}
        <p className="mt-xs font-label-md text-label-md text-on-surface-variant">
          {new Date(existing.createdAt).toLocaleString('tr-TR')}
        </p>
      </div>
    );
  }

  if (!canRate) return null;

  const submit = async () => {
    if (score < 1) {
      toast.error('Lütfen yıldız seçin.');
      return;
    }
    try {
      await create.mutateAsync({ score, comment: comment.trim() || undefined });
      toast.success('Değerlendirmeniz için teşekkürler!');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Puanlama gönderilemedi.'));
    }
  };

  return (
    <div className="rounded-xl border border-primary/40 bg-primary/10 p-md">
      <h3 className="font-headline-md text-headline-md text-on-surface">
        Hizmetimizi Değerlendirin
      </h3>
      <p className="mt-xs font-body-sm text-body-sm text-on-surface-variant">
        Talebinizin çözüm sürecini puanlayın. Geri bildirimleriniz hizmetimizi iyileştirmemize yardımcı olur.
      </p>

      <div className="mt-md flex items-center gap-xs">
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1;
          const active = (hover || score) >= value;
          return (
            <button
              type="button"
              key={value}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setScore(value)}
              aria-label={`${value} yıldız`}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={28}
                className={
                  active ? 'fill-primary text-primary' : 'text-on-surface-variant/50'
                }
              />
            </button>
          );
        })}
        {score > 0 && (
          <span className="ml-sm font-body-sm text-body-sm text-on-surface">
            {score}/5
          </span>
        )}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Yorumunuz (opsiyonel)"
        maxLength={1000}
        className="mt-sm w-full resize-none rounded-lg border border-outline-variant bg-surface-dim px-sm py-xs font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />

      <button
        type="button"
        onClick={submit}
        disabled={create.isPending || score < 1}
        className="mt-sm inline-flex items-center gap-xs rounded-lg bg-primary px-md py-sm font-label-md text-label-md font-semibold uppercase text-on-primary hover:opacity-90 disabled:opacity-50"
      >
        {create.isPending && <Loader2 size={14} className="animate-spin" />}
        Değerlendirmeyi Gönder
      </button>
    </div>
  );
}
