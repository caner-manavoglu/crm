type ConfirmActionModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  pendingText?: string;
  variant?: 'primary' | 'danger';
  isPending?: boolean;
  errorMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmActionModal({
  isOpen,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  pendingText = 'İşleniyor...',
  variant = 'primary',
  isPending = false,
  errorMessage,
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) {
  if (!isOpen) return null;

  const confirmButtonClass = variant === 'danger'
    ? 'bg-error text-on-error'
    : 'bg-primary text-on-primary';

  const handleCancel = () => {
    if (isPending) return;
    onCancel();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-md"
      onClick={handleCancel}
      role="presentation"
    >
      <div
        className="w-full max-w-[30rem] rounded-xl border border-outline-variant bg-surface-container p-md shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-action-title"
      >
        <div className="mb-sm flex items-start justify-between gap-sm">
          <h3
            id="confirm-action-title"
            className="font-headline-md text-headline-md text-on-background"
          >
            {title}
          </h3>
          <button
            onClick={handleCancel}
            className="text-on-surface-variant transition-colors hover:text-on-surface disabled:opacity-40"
            aria-label="Kapat"
            disabled={isPending}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant">{message}</p>
        {errorMessage && <p className="mt-sm font-label-md text-label-md text-error">{errorMessage}</p>}

        <div className="mt-md flex justify-end gap-sm">
          <button
            onClick={handleCancel}
            className="rounded-xl border border-outline-variant px-md py-xs font-body-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-40"
            disabled={isPending}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`${confirmButtonClass} rounded-xl px-md py-xs font-body-sm text-body-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50`}
            disabled={isPending}
          >
            {isPending ? pendingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
