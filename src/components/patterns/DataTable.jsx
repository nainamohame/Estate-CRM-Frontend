import { useIsMobile } from '../../hooks/useMediaQuery';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../ui/table';
import { SkeletonTableRows } from '../ui/skeleton';
import { ErrorState, EmptyState } from './EmptyState';
import { Pagination } from '../ui/pagination';
import { Button } from '../ui/button';
import { cn } from '../../lib/cn';

/**
 * The single table component every list page in the app uses. Its state
 * machine, in priority order:
 *   loading && no data yet -> skeleton rows (holds the layout, unlike a
 *                             centred spinner, and reads as far more finished)
 *   error                  -> ErrorState with Retry
 *   empty, filters active  -> "no results" + Clear filters
 *   empty, no filters      -> the feature's real EmptyState (icon + CTA)
 *   otherwise              -> rows, with a subtle refetch indicator on top
 *
 * Below `md` it renders `renderMobileCard` per row instead of the table
 * itself — a 9-column table scrolling sideways on a phone reads as
 * unfinished, so this is a real product decision, not a fallback.
 */
export function DataTable({
  columns,
  data,
  rowKey,
  loading = false,
  isFetching = false,
  error = null,
  onRetry,
  empty,
  hasActiveFilters = false,
  onClearFilters,
  sort,
  onSortChange,
  pagination,
  onRowClick,
  rowActions,
  renderMobileCard,
  dense = false,
}) {
  const isMobile = useIsMobile();
  const rows = data ?? [];
  const shellClass = 'rounded-xl border border-border bg-surface shadow-xs overflow-hidden';

  if (loading && !data) {
    return (
      <div className={shellClass}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((c) => (
                <TableHeaderCell key={c.key} align={c.align} hideBelow={c.hideBelow}>
                  {c.header}
                </TableHeaderCell>
              ))}
              {rowActions && <TableHeaderCell width="3rem" />}
            </TableRow>
          </TableHead>
          <TableBody>
            <SkeletonTableRows rows={6} columns={columns.length + (rowActions ? 1 : 0)} />
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <div className={shellClass}>
        <ErrorState description={error.message} onRetry={onRetry} />
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className={shellClass}>
        {hasActiveFilters ? (
          <EmptyState
            title="No results for these filters"
            description="Try adjusting or clearing your filters to widen the search."
            action={
              onClearFilters && (
                <Button variant="secondary" size="sm" onClick={onClearFilters}>
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <EmptyState {...empty} />
        )}
      </div>
    );
  }

  if (isMobile && renderMobileCard) {
    return (
      <div className="space-y-3">
        {isFetching && (
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-brand-100">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-brand-500" />
          </div>
        )}
        {rows.map((row, i) => (
          <div
            key={rowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className="animate-slide-up"
            style={{ animationDelay: `${Math.min(i, 8) * 25}ms` }}
          >
            {renderMobileCard(row)}
          </div>
        ))}
        {pagination && <Pagination {...pagination} />}
      </div>
    );
  }

  return (
    <div className={cn(shellClass, isFetching && 'opacity-70 transition-opacity')}>
      {isFetching && (
        <div className="h-0.5 w-full overflow-hidden bg-brand-100">
          <div className="h-full w-1/3 animate-pulse bg-brand-500" />
        </div>
      )}
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((c) => (
              <TableHeaderCell
                key={c.key}
                align={c.align}
                width={c.width}
                hideBelow={c.hideBelow}
                sortable={c.sortable}
                sortDirection={sort?.key === c.key ? sort.direction : undefined}
                onSort={() => onSortChange?.(c.key)}
              >
                {c.header}
              </TableHeaderCell>
            ))}
            {rowActions && <TableHeaderCell width="3rem" />}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={rowKey(row)}
              clickable={Boolean(onRowClick)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((c) => (
                <TableCell key={c.key} align={c.align} hideBelow={c.hideBelow} className={dense ? 'py-2' : undefined}>
                  {c.render ? c.render(row) : row[c.key]}
                </TableCell>
              ))}
              {rowActions && (
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  {rowActions(row)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {pagination && (
        <div className="border-t border-border bg-surface-muted/40 px-2">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
}
