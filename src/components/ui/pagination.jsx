import { Button } from './button';
import { IconChevronLeft, IconChevronRight } from './icons';

export function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="flex items-center justify-between gap-4 px-1 py-3">
      <p className="text-sm text-fg-muted">
        {total === 0 ? 'No results' : `Showing ${start}–${end} of ${total}`}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <IconChevronLeft size={16} />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        <span className="text-sm text-fg-muted tabular-nums px-1">
          {page} / {totalPages}
        </span>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <span className="hidden sm:inline">Next</span>
          <IconChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
