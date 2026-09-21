import { Avatar } from '../ui/avatar';

export function UserPill({ name, size = 'xs' }) {
  if (!name) {
    return <span className="text-sm text-fg-subtle italic">Unassigned</span>;
  }
  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      <Avatar name={name} size={size} />
      <span className="text-sm text-fg truncate">{name}</span>
    </span>
  );
}
