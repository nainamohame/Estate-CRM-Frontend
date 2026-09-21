import { cn } from '../../lib/cn';
import { initials, avatarTone } from '../../lib/format';

const SIZES = {
  xs: 'h-6 w-6 text-[0.625rem]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-md',
  xl: 'h-16 w-16 text-xl',
};

/**
 * Initials on a deterministic gradient — the same name always gets the same
 * colours, so a person is recognisable by their chip across every screen.
 */
export function Avatar({ name = '', size = 'sm', ring = false, className }) {
  return (
    <span
      title={name || undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-tight',
        'shadow-xs',
        avatarTone(name),
        SIZES[size],
        ring && 'ring-2 ring-white',
        className
      )}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarGroup({ names = [], max = 3, size = 'xs' }) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <span className="flex items-center -space-x-2">
      {shown.map((name, i) => (
        <Avatar key={i} name={name} size={size} ring />
      ))}
      {extra > 0 && (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-neutral-200 text-neutral-600 font-semibold ring-2 ring-white',
            SIZES[size]
          )}
        >
          +{extra}
        </span>
      )}
    </span>
  );
}
