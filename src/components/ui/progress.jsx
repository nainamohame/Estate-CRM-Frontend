import { cn } from '../../lib/cn';

const TONES = {
  brand: 'bg-linear-to-r from-brand-500 to-brand-600',
  success: 'bg-linear-to-r from-success-500 to-success-600',
  warning: 'bg-linear-to-r from-warning-500 to-warning-600',
  danger: 'bg-linear-to-r from-danger-500 to-danger-600',
  accent: 'bg-linear-to-r from-accent-400 to-accent-600',
};

const SIZES = { xs: 'h-1', sm: 'h-1.5', md: 'h-2', lg: 'h-2.5' };

export function Progress({ value = 0, max = 100, tone = 'brand', size = 'md', className, trackClassName }) {
  const pct = Math.min(100, Math.max(0, (value / (max || 1)) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
      className={cn(
        'w-full overflow-hidden rounded-full bg-neutral-200/70 ring-1 ring-inset ring-neutral-900/5',
        SIZES[size],
        trackClassName,
        className
      )}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500 ease-out', TONES[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
