import { forwardRef } from 'react';
import { cn } from '../../lib/cn';
import { IconCheck } from './icons';

export const Checkbox = forwardRef(function Checkbox({ className, label, ...props }, ref) {
  return (
    <label className={cn('inline-flex items-center gap-2 cursor-pointer select-none', props.disabled && 'opacity-50 cursor-not-allowed')}>
      <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
        <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
        <span
          className={cn(
            'h-4 w-4 rounded border border-border-strong bg-surface transition-colors',
            'peer-checked:bg-brand-600 peer-checked:border-brand-600',
            'peer-focus-visible:ring-4 peer-focus-visible:ring-brand-500/20',
            className
          )}
        />
        <IconCheck size={11} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
      </span>
      {label && <span className="text-sm text-fg">{label}</span>}
    </label>
  );
});
