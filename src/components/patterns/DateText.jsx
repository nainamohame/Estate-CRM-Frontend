import { Tooltip } from '../ui/tooltip';
import { formatDate, formatDateTime, formatRelativeTime } from '../../lib/format';
import { cn } from '../../lib/cn';

export function DateText({ value, relative = false, overdue = false, className }) {
  if (!value) return <span className="text-fg-subtle">—</span>;

  const label = relative ? formatRelativeTime(value) : formatDate(value);

  return (
    <Tooltip content={formatDateTime(value)}>
      <span className={cn('cursor-default', overdue && 'text-danger-600 font-medium', className)}>{label}</span>
    </Tooltip>
  );
}
