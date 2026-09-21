import { cn } from '../../lib/cn';

const PADDING = { none: '', sm: 'p-4', md: 'p-5' };

const TONES = {
  default: 'bg-gradient-surface border-border',
  sunken: 'bg-surface-muted border-border',
  brand: 'bg-brand-50/60 border-brand-100',
  danger: 'bg-danger-50/60 border-danger-100',
  warning: 'bg-warning-50/60 border-warning-100',
  success: 'bg-success-50/60 border-success-100',
};

/**
 * @param {object} props
 * @param {keyof TONES} [props.tone='default']
 * @param {'none'|'sm'|'md'} [props.padding='md']
 * @param {boolean} [props.hoverable]  adds the pointer lift treatment
 */
export function Card({
  as: Component = 'div',
  tone = 'default',
  padding = 'md',
  hoverable = false,
  className,
  children,
  ...props
}) {
  return (
    <Component
      className={cn(
        'rounded-xl border shadow-xs',
        TONES[tone],
        hoverable && 'lift cursor-pointer',
        PADDING[padding],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 p-5 pb-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('text-md font-semibold text-fg tracking-[-0.01em]', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-sm text-fg-muted mt-0.5', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('px-5 pb-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn('flex items-center gap-3 px-5 py-3.5 border-t border-border bg-surface-muted/50 rounded-b-xl', className)}
      {...props}
    >
      {children}
    </div>
  );
}
