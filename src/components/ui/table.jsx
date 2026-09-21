import { cn } from '../../lib/cn';
import { IconChevronDown } from './icons';

const HIDE_BELOW = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell' };

export function Table({ className, children, ...props }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full border-collapse text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ sticky = false, className, children, ...props }) {
  return (
    <thead
      className={cn(
        'bg-gradient-header border-b border-border',
        sticky && 'sticky top-0 z-10',
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }) {
  return (
    <tbody className={cn('divide-y divide-border', className)} {...props}>
      {children}
    </tbody>
  );
}

/**
 * A clickable row gets a tinted hover plus a brand-coloured left edge drawn
 * with an inset box-shadow, so the row you are pointing at is unmistakable
 * in a dense table without shifting any layout.
 */
export function TableRow({ clickable = false, className, children, ...props }) {
  return (
    <tr
      className={cn(
        'transition-colors duration-100',
        clickable &&
          'cursor-pointer hover:bg-brand-50/50 hover:[box-shadow:inset_3px_0_0_0_var(--color-brand-500)]',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHeaderCell({
  align = 'left',
  width,
  sortable = false,
  sortDirection,
  onSort,
  hideBelow,
  className,
  children,
}) {
  return (
    <th
      style={width ? { width } : undefined}
      className={cn(
        'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-fg-subtle whitespace-nowrap',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        hideBelow && HIDE_BELOW[hideBelow],
        className
      )}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onSort}
          className={cn(
            'group inline-flex items-center gap-1 rounded transition-colors hover:text-fg focus-ring',
            align === 'right' && 'flex-row-reverse'
          )}
        >
          {children}
          <IconChevronDown
            size={12}
            className={cn(
              'transition-all',
              sortDirection === 'asc' && 'rotate-180',
              sortDirection ? 'text-brand-600 opacity-100' : 'opacity-0 group-hover:opacity-40'
            )}
          />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export function TableCell({ align = 'left', numeric = false, hideBelow, className, children, ...props }) {
  return (
    <td
      className={cn(
        'px-4 py-3 align-middle text-fg',
        (numeric || align === 'right') && 'text-right tabular-nums',
        align === 'center' && 'text-center',
        hideBelow && HIDE_BELOW[hideBelow],
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}
