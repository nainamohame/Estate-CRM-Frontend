import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Sparkline } from '../ui/sparkline';
import { cn } from '../../lib/cn';
import { IconTrendingUp, IconTrendingDown, IconArrowUpRight } from '../ui/icons';

/** Gradient chips rather than flat tints — the icon is the card's anchor. */
const TONES = {
  brand: { chip: 'bg-linear-to-br from-brand-500 to-brand-700 text-white', accent: 'from-brand-500/60' },
  success: { chip: 'bg-linear-to-br from-success-500 to-success-700 text-white', accent: 'from-success-500/60' },
  warning: { chip: 'bg-linear-to-br from-warning-500 to-warning-700 text-white', accent: 'from-warning-500/60' },
  danger: { chip: 'bg-linear-to-br from-danger-500 to-danger-700 text-white', accent: 'from-danger-500/60' },
  accent: { chip: 'bg-linear-to-br from-accent-400 to-accent-600 text-white', accent: 'from-accent-500/60' },
  neutral: { chip: 'bg-linear-to-br from-neutral-400 to-neutral-600 text-white', accent: 'from-neutral-400/60' },
};

/**
 * @param {object} props
 * @param {string} props.label
 * @param {React.ReactNode} props.value
 * @param {React.ReactNode} [props.icon]
 * @param {keyof TONES} [props.tone='brand']
 * @param {string} [props.delta]     e.g. "+12%" — sign drives colour and arrow
 * @param {string} [props.hint]      small caption next to the delta
 * @param {number[]} [props.trend]   optional sparkline series
 * @param {boolean} [props.loading]
 * @param {() => void} [props.onClick]  makes the whole tile a drill-down target
 */
export function StatCard({ label, value, icon, tone = 'brand', delta, hint, trend, loading, onClick }) {
  const { chip, accent } = TONES[tone] ?? TONES.brand;
  const isNegative = typeof delta === 'string' && delta.trim().startsWith('-');
  const TrendIcon = isNegative ? IconTrendingDown : IconTrendingUp;

  return (
    <Card
      as={onClick ? 'button' : 'div'}
      onClick={onClick}
      padding="none"
      className={cn('group relative overflow-hidden text-left w-full', onClick && 'lift cursor-pointer')}
    >
      {/* Hairline of colour along the top edge, brightening on hover. */}
      <span
        className={cn(
          'absolute inset-x-0 top-0 h-0.5 bg-linear-to-r to-transparent opacity-70 transition-opacity',
          accent,
          onClick && 'group-hover:opacity-100'
        )}
      />

      <div className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-fg-muted truncate">{label}</p>

          {loading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <p className="text-3xl font-semibold text-fg mt-1.5 tabular-nums tracking-[-0.02em]">{value}</p>
          )}

          {!loading && (delta || hint) && (
            <div className="flex items-center gap-1.5 mt-2.5 text-xs">
              {delta && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold ring-1 ring-inset',
                    isNegative
                      ? 'bg-danger-50 text-danger-700 ring-danger-600/20'
                      : 'bg-success-50 text-success-700 ring-success-600/20'
                  )}
                >
                  <TrendIcon size={11} />
                  {delta}
                </span>
              )}
              {hint && <span className="text-fg-subtle truncate">{hint}</span>}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          {icon && (
            <span
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ring-1 ring-inset ring-white/20',
                chip
              )}
            >
              {icon}
            </span>
          )}
          {!loading && trend?.length > 1 && <Sparkline data={trend} tone={tone} width={72} height={24} />}
        </div>
      </div>

      {onClick && (
        <IconArrowUpRight
          size={14}
          className="absolute bottom-3 right-3 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100"
        />
      )}
    </Card>
  );
}
