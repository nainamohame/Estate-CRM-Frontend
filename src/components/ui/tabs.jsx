import { cn } from '../../lib/cn';

/**
 * `underline` for page-level sections, `pill` for compact toggles (the
 * table/board switch). The pill variant's active chip carries a real
 * surface + shadow so the choice reads as a physical switch position.
 */
export function Tabs({ tabs, value, onChange, variant = 'underline', className }) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center',
        variant === 'underline'
          ? 'gap-6 border-b border-border'
          : 'gap-1 rounded-lg bg-surface-sunken p-1 w-fit ring-1 ring-inset ring-neutral-900/5',
        className
      )}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              'inline-flex items-center gap-1.5 text-sm font-medium transition-all duration-150 focus-ring rounded-md',
              variant === 'underline'
                ? cn(
                    'pb-3 border-b-2 -mb-px',
                    active
                      ? 'border-brand-600 text-brand-700'
                      : 'border-transparent text-fg-muted hover:text-fg hover:border-border-strong'
                  )
                : cn(
                    'px-3 py-1.5',
                    active
                      ? 'bg-surface text-fg shadow-xs ring-1 ring-inset ring-neutral-900/5'
                      : 'text-fg-muted hover:text-fg'
                  )
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 text-xs font-semibold tabular-nums transition-colors',
                  active ? 'bg-brand-100 text-brand-700' : 'bg-neutral-100 text-fg-subtle'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
