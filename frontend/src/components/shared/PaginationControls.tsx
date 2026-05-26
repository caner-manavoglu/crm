interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  currentItemCount?: number;
}

function getPageWindow(page: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (page <= 4) return [1, 2, 3, 4, 5];
  if (page >= totalPages - 3) {
    return [
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [page - 2, page - 1, page, page + 1, page + 2];
}

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 10,
  currentItemCount,
}: PaginationControlsProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(page, 1), safeTotalPages);

  if (safeTotalPages <= 1 && totalItems === undefined) {
    return null;
  }

  const pageWindow = getPageWindow(safePage, safeTotalPages);
  const showLeftDots = pageWindow.length > 0 && pageWindow[0] > 1;
  const showRightDots =
    pageWindow.length > 0 && pageWindow[pageWindow.length - 1] < safeTotalPages;

  const showSummary = typeof totalItems === 'number';
  const start =
    showSummary && totalItems > 0 ? (safePage - 1) * pageSize + 1 : 0;
  const derivedCount =
    typeof currentItemCount === 'number'
      ? currentItemCount
      : showSummary
        ? Math.min(pageSize, Math.max(totalItems - (safePage - 1) * pageSize, 0))
        : 0;
  const end = showSummary ? Math.max(start + derivedCount - 1, 0) : 0;

  return (
    <div className="mt-md flex flex-col gap-sm rounded-xl border border-outline-variant bg-surface-container px-md py-sm md:flex-row md:items-center md:justify-between">
      <div className="font-body-sm text-body-sm text-on-surface-variant">
        {showSummary
          ? `${totalItems} kayıttan ${start}-${end} arası gösteriliyor`
          : `Sayfa ${safePage} / ${safeTotalPages}`}
      </div>

      <div className="flex items-center gap-xs self-end md:self-auto">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="rounded-lg border border-outline-variant bg-surface-dim px-sm py-xs font-label-md text-label-md text-on-surface-variant transition-colors hover:border-primary/40 hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-50"
        >
          Önceki
        </button>

        {showLeftDots && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="h-9 min-w-9 rounded-lg border border-outline-variant bg-surface-dim px-xs font-label-md text-label-md text-on-surface-variant transition-colors hover:border-primary/40 hover:text-on-surface"
            >
              1
            </button>
            <span className="px-xs text-on-surface-variant">…</span>
          </>
        )}

        {pageWindow.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`h-9 min-w-9 rounded-lg border px-xs font-label-md text-label-md transition-colors ${
              p === safePage
                ? 'border-primary bg-primary-container text-on-primary-container'
                : 'border-outline-variant bg-surface-dim text-on-surface-variant hover:border-primary/40 hover:text-on-surface'
            }`}
          >
            {p}
          </button>
        ))}

        {showRightDots && (
          <>
            <span className="px-xs text-on-surface-variant">…</span>
            <button
              type="button"
              onClick={() => onPageChange(safeTotalPages)}
              className="h-9 min-w-9 rounded-lg border border-outline-variant bg-surface-dim px-xs font-label-md text-label-md text-on-surface-variant transition-colors hover:border-primary/40 hover:text-on-surface"
            >
              {safeTotalPages}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= safeTotalPages}
          className="rounded-lg border border-outline-variant bg-surface-dim px-sm py-xs font-label-md text-label-md text-on-surface-variant transition-colors hover:border-primary/40 hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sonraki
        </button>
      </div>
    </div>
  );
}
