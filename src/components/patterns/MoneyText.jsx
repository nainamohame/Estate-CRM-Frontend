import { Tooltip } from '../ui/tooltip';
import { formatMoney, formatFullMoney } from '../../lib/format';
import { cn } from '../../lib/cn';

/** Indian compact currency (₹1.25 Cr) with the exact figure in a tooltip. */
export function MoneyText({ value, compact = true, className }) {
  if (value === null || value === undefined) return <span className="text-fg-subtle">—</span>;
  const display = formatMoney(value, { compact });
  const full = formatFullMoney(value);

  if (!compact || display === full) {
    return <span className={cn('tabular-nums', className)}>{display}</span>;
  }

  return (
    <Tooltip content={full}>
      <span className={cn('tabular-nums cursor-default border-b border-dotted border-fg-subtle/40', className)}>{display}</span>
    </Tooltip>
  );
}
