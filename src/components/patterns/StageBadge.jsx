import { STAGE_LABELS } from '../../lib/constants';
import { cn } from '../../lib/cn';

/**
 * Single source of truth for how a lead stage is presented, everywhere.
 * Colours come from the stage tokens; the ring and dot are derived from the
 * same foreground colour via color-mix so a new stage needs only its two
 * tokens defined, not a hand-picked ring shade.
 */
export function StageBadge({ stage, size = 'sm', dot = true, className }) {
  const fg = `var(--color-stage-${stage}-fg)`;
  const bg = `var(--color-stage-${stage}-bg)`;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1',
        className
      )}
      style={{
        color: fg,
        backgroundColor: bg,
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${fg} 22%, transparent)`,
      }}
    >
      {dot && (
        <span
          className={cn('rounded-full', size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2')}
          style={{ backgroundColor: fg, opacity: 0.85 }}
        />
      )}
      {STAGE_LABELS[stage] ?? stage}
    </span>
  );
}
