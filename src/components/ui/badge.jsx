import { cn } from '../../lib/cn';

/**
 * Every tone carries a 1px inset ring in its own hue. Without it a pale
 * tinted pill dissolves into a white card; with it the badge keeps a crisp
 * edge at any size.
 */
const TONES = {
  neutral: 'bg-neutral-100 text-neutral-700 ring-neutral-500/15',
  brand: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  success: 'bg-success-50 text-success-700 ring-success-600/20',
  warning: 'bg-warning-50 text-warning-700 ring-warning-600/20',
  danger: 'bg-danger-50 text-danger-700 ring-danger-600/20',
  info: 'bg-info-50 text-info-700 ring-info-600/20',
  accent: 'bg-accent-50 text-accent-700 ring-accent-600/25',
  purple: 'bg-purple-50 text-purple-700 ring-purple-600/20',
};

const DOT_TONES = {
  neutral: 'bg-neutral-500',
  brand: 'bg-brand-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-info-500',
  accent: 'bg-accent-500',
  purple: 'bg-purple-500',
};

const SIZES = { sm: 'text-xs px-2 py-0.5 gap-1.5', md: 'text-xs px-2.5 py-1 gap-1.5' };

export function Badge({ tone = 'neutral', size = 'sm', dot = false, icon, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium whitespace-nowrap ring-1 ring-inset',
        TONES[tone],
        SIZES[size],
        className
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', DOT_TONES[tone])} />}
      {icon}
      {children}
    </span>
  );
}
