import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

const SIZES = { sm: 'h-8 text-sm px-2.5', md: 'h-9 text-sm px-3', lg: 'h-11 text-md px-3.5' };

/**
 * @param {object} props
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.invalid]
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 * @param {string} [props.prefix]  e.g. "₹"
 * @param {string} [props.suffix]  e.g. "sq.ft"
 */
export const Input = forwardRef(function Input(
  { size = 'md', invalid = false, leftIcon, rightIcon, prefix, suffix, className, disabled, ...props },
  ref
) {
  return (
    <div
      className={cn(
        'flex items-center rounded-lg border bg-surface shadow-xs transition-[box-shadow,border-color] duration-150',
        invalid ? 'border-danger-400' : 'border-border',
        !disabled &&
          (invalid
            ? 'focus-within:ring-4 focus-within:ring-danger-500/15 focus-within:border-danger-500'
            : 'hover:border-border-strong focus-within:ring-4 focus-within:ring-brand-500/15 focus-within:border-brand-400'),
        disabled && 'opacity-60 bg-surface-muted shadow-none',
        SIZES[size],
        className
      )}
    >
      {(leftIcon || prefix) && (
        <span className="flex items-center gap-1 text-fg-subtle mr-1.5 shrink-0">
          {leftIcon}
          {prefix && <span className="text-sm font-medium">{prefix}</span>}
        </span>
      )}
      <input
        ref={ref}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className="w-full min-w-0 bg-transparent outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed"
        {...props}
      />
      {(rightIcon || suffix) && (
        <span className="flex items-center gap-1 text-fg-subtle ml-1.5 shrink-0">
          {suffix && <span className="text-sm">{suffix}</span>}
          {rightIcon}
        </span>
      )}
    </div>
  );
});
