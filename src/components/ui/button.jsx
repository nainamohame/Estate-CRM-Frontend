import { forwardRef } from 'react';
import { cn } from '../../lib/cn';
import { Spinner } from './spinner';

/**
 * Filled variants use a vertical gradient plus a 1px inset white highlight
 * along the top edge and a shadow tinted with their own hue. Those three
 * details together are what make a button read as a lit, physical control
 * rather than a flat rectangle of color.
 */
const VARIANTS = {
  primary:
    'bg-gradient-brand text-white shadow-brand highlight-top hover:bg-gradient-brand-hover hover:shadow-brand-lg active:translate-y-px',
  secondary:
    'bg-gradient-surface text-fg border border-border shadow-xs hover:border-border-strong hover:bg-surface-muted active:translate-y-px',
  outline:
    'border border-brand-200 bg-brand-50/40 text-brand-700 hover:bg-brand-50 hover:border-brand-300 active:translate-y-px',
  ghost: 'text-fg-muted hover:bg-surface-muted hover:text-fg',
  danger:
    'bg-gradient-danger text-white shadow-danger highlight-top hover:brightness-110 focus-visible:ring-danger-500/25 active:translate-y-px',
  success:
    'bg-gradient-success text-white shadow-success highlight-top hover:brightness-110 focus-visible:ring-success-500/25 active:translate-y-px',
  link: 'text-brand-700 underline-offset-4 hover:underline hover:text-brand-800 h-auto p-0 shadow-none',
};

const SIZES = {
  xs: 'h-7 px-2 text-xs gap-1 rounded-md',
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-md',
  md: 'h-9 px-3.5 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-md gap-2 rounded-lg',
  icon: 'h-9 w-9 p-0 rounded-lg',
};

/**
 * The flagship reusable primitive. Every button in the app goes through
 * this component so hover/focus/loading/disabled states are consistent.
 *
 * @param {object} props
 * @param {keyof VARIANTS} [props.variant='primary']
 * @param {keyof SIZES} [props.size='md']
 * @param {boolean} [props.loading]   shows a spinner, keeps the button's width
 * @param {boolean} [props.fullWidth]
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 * @param {React.ElementType} [props.as='button']  render as another element/component (e.g. Link)
 */
export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    disabled = false,
    leftIcon,
    rightIcon,
    as: Component = 'button',
    className,
    children,
    type = 'button',
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;
  const isFilled = variant === 'primary' || variant === 'danger' || variant === 'success';

  return (
    <Component
      ref={ref}
      type={Component === 'button' ? type : undefined}
      disabled={Component === 'button' ? isDisabled : undefined}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      className={cn(
        'relative inline-flex items-center justify-center whitespace-nowrap font-medium',
        'transition-[background,box-shadow,border-color,filter,transform] duration-150 select-none focus-ring',
        'disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
        '[&_svg]:shrink-0',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size={size === 'lg' ? 'md' : 'sm'} className={isFilled ? 'text-white' : undefined} />
        </span>
      )}
      {/* Invisible rather than removed, so the button doesn't resize mid-click. */}
      <span className={cn('inline-flex items-center gap-2', loading && 'invisible')}>
        {leftIcon}
        {children}
        {rightIcon}
      </span>
    </Component>
  );
});
