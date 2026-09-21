import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

export const Textarea = forwardRef(function Textarea(
  { invalid = false, className, rows = 3, maxLength, value, ...props },
  ref
) {
  return (
    <div className="relative">
      <textarea
        ref={ref}
        rows={rows}
        maxLength={maxLength}
        value={value}
        aria-invalid={invalid || undefined}
        className={cn(
          'w-full rounded-lg border bg-surface shadow-xs px-3 py-2 text-sm resize-y outline-none',
          'transition-[box-shadow,border-color] duration-150 placeholder:text-fg-subtle',
          invalid
            ? 'border-danger-400 focus:ring-4 focus:ring-danger-500/15 focus:border-danger-500'
            : 'border-border hover:border-border-strong focus:ring-4 focus:ring-brand-500/15 focus:border-brand-400',
          'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-surface-muted',
          maxLength && 'pb-6',
          className
        )}
        {...props}
      />
      {maxLength && typeof value === 'string' && (
        <span className="absolute bottom-2 right-2.5 text-xs text-fg-subtle tabular-nums">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
});
