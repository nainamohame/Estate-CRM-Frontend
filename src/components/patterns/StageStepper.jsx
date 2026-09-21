import { LEAD_STAGES, STAGE_LABELS } from '../../lib/constants';
import { cn } from '../../lib/cn';
import { IconCheck, IconX } from '../ui/icons';

const FORWARD_STAGES = LEAD_STAGES.filter((s) => s !== 'lost');

/**
 * Horizontal progress through the 7-stage pipeline. Completed steps stay
 * clickable (a lead can move backwards), the current step is locked, and
 * connectors fill in behind progress so the row reads as a track rather
 * than a row of loose chips.
 */
export function StageStepper({ stage, onSelect, disabled = false }) {
  const currentIndex = FORWARD_STAGES.indexOf(stage);
  const isLost = stage === 'lost';

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {FORWARD_STAGES.map((s, i) => {
        const done = !isLost && i < currentIndex;
        const active = !isLost && i === currentIndex;

        return (
          <div key={s} className="flex items-center shrink-0">
            <button
              type="button"
              disabled={disabled || active}
              onClick={() => onSelect?.(s)}
              className={cn(
                'group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap',
                'transition-all duration-150 focus-ring',
                active && 'bg-linear-to-b from-brand-500 to-brand-700 text-white shadow-brand highlight-top',
                done && 'bg-success-50 text-success-700 ring-1 ring-inset ring-success-600/20 hover:bg-success-100',
                !active && !done && 'bg-surface-muted text-fg-subtle ring-1 ring-inset ring-neutral-900/5 hover:bg-neutral-200 hover:text-fg-muted',
                disabled && 'cursor-default'
              )}
            >
              {done ? (
                <IconCheck size={12} />
              ) : (
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    active ? 'bg-white' : 'bg-current opacity-40'
                  )}
                />
              )}
              {STAGE_LABELS[s]}
            </button>

            {i < FORWARD_STAGES.length - 1 && (
              <div className={cn('h-0.5 w-4 shrink-0 rounded-full', done ? 'bg-success-200' : 'bg-border')} />
            )}
          </div>
        );
      })}

      {isLost && (
        <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-danger-50 px-3 py-1.5 text-xs font-medium text-danger-700 ring-1 ring-inset ring-danger-600/20">
          <IconX size={12} /> Lost
        </span>
      )}
    </div>
  );
}
