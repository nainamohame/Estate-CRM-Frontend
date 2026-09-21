import { STAGE_LABELS } from '../../../lib/constants';

/**
 * Horizontal funnel: bar length is share of the largest stage, and each bar
 * carries its own stage colour so the row reads the same way a StageBadge
 * does elsewhere in the app. The percentage is of all leads, which is the
 * number a sales lead actually asks about.
 */
export function StageFunnel({ funnel }) {
  const max = Math.max(1, ...funnel.map((f) => f.count));
  const total = funnel.reduce((sum, f) => sum + f.count, 0) || 1;

  return (
    <div className="space-y-2.5">
      {funnel.map((f) => {
        const fg = `var(--color-stage-${f.stage}-fg)`;
        const pct = Math.round((f.count / total) * 100);

        return (
          <div key={f.stage} className="group flex items-center gap-3">
            <span className="w-22 shrink-0 text-xs font-medium text-fg-muted truncate">
              {STAGE_LABELS[f.stage]}
            </span>

            <div className="relative flex-1 h-6 rounded-md bg-surface-sunken overflow-hidden ring-1 ring-inset ring-neutral-900/5">
              <div
                className="h-full rounded-md transition-all duration-500 ease-out"
                style={{
                  width: `${Math.max(2, (f.count / max) * 100)}%`,
                  backgroundColor: fg,
                  opacity: 0.85,
                }}
              />
              <span className="absolute inset-y-0 right-2 flex items-center text-[0.6875rem] font-medium text-fg-subtle tabular-nums">
                {pct}%
              </span>
            </div>

            <span className="w-7 shrink-0 text-right text-sm font-semibold text-fg tabular-nums">{f.count}</span>
          </div>
        );
      })}
    </div>
  );
}
