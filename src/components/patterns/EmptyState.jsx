import { IconInbox, IconAlertCircle, IconRefreshCw } from '../ui/icons';
import { Button } from '../ui/button';
import { cn } from '../../lib/cn';

/**
 * The icon sits in a layered halo (two concentric rings fading outward)
 * rather than a bare circle — an empty screen is mostly negative space, so
 * the one element on it has to carry some weight.
 */
export function EmptyState({ icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-14 px-4', className)}>
      <div className="relative mb-4 flex h-14 w-14 items-center justify-center">
        <span className="absolute -inset-2.5 rounded-full bg-brand-500/5" />
        <span className="absolute -inset-1 rounded-full bg-brand-500/5" />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-surface to-surface-muted text-fg-subtle ring-1 ring-inset ring-border shadow-xs">
          {icon ?? <IconInbox size={24} />}
        </span>
      </div>
      <p className="text-md font-semibold text-fg">{title}</p>
      {description && <p className="text-sm text-fg-muted mt-1.5 max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-4">
      <div className="relative mb-4 flex h-14 w-14 items-center justify-center">
        <span className="absolute -inset-2.5 rounded-full bg-danger-500/5" />
        <span className="absolute -inset-1 rounded-full bg-danger-500/8" />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-danger-50 text-danger-600 ring-1 ring-inset ring-danger-200">
          <IconAlertCircle size={24} />
        </span>
      </div>
      <p className="text-md font-semibold text-fg">{title}</p>
      {description && <p className="text-sm text-fg-muted mt-1.5 max-w-sm leading-relaxed">{description}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry} leftIcon={<IconRefreshCw size={14} />}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-fg-muted">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-brand-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
