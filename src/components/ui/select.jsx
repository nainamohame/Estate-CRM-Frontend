import { forwardRef } from 'react';
import { cn } from '../../lib/cn';
import { IconChevronDown } from './icons';

const SIZES = { sm: 'h-8 text-sm pl-2.5 pr-7', md: 'h-9 text-sm pl-3 pr-8', lg: 'h-11 text-md pl-3.5 pr-9' };

/**
 * A styled NATIVE <select>, deliberately — not a custom listbox. A custom
 * combobox costs 45+ minutes for marginal visual gain and loses free
 * keyboard/mobile/screen-reader behaviour the native control already has.
 */
export const Select = forwardRef(function Select(
  { size = 'md', invalid = false, placeholder, children, className, disabled, value, ...props },
  ref
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        disabled={disabled}
        value={value}
        aria-invalid={invalid || undefined}
        className={cn(
          'w-full appearance-none rounded-lg border bg-surface shadow-xs outline-none cursor-pointer',
          'transition-[box-shadow,border-color] duration-150',
          invalid ? 'border-danger-400' : 'border-border',
          !disabled &&
            'hover:border-border-strong focus:ring-4 focus:ring-brand-500/15 focus:border-brand-400',
          disabled && 'opacity-60 cursor-not-allowed bg-surface-muted shadow-none',
          (value === '' || value === undefined) && placeholder && 'text-fg-subtle',
          SIZES[size],
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled={props.required}>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <IconChevronDown
        size={16}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-subtle"
      />
    </div>
  );
});
