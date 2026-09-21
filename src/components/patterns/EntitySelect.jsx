import { useEffect, useRef, useState } from 'react';
import { Input } from '../ui/input';
import { IconSearch, IconCheck, IconX } from '../ui/icons';
import { cn } from '../../lib/cn';

/**
 * Searchable picker over a list of {id, label, description?} options. Used
 * for "choose a lead" / "choose a unit" in the booking wizard — small enough
 * (~60 lines) that a full combobox library isn't worth the dependency.
 */
export function EntitySelect({ options, value, onChange, placeholder = 'Search…', emptyLabel = 'No matches', disabled = false }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selected = options.find((o) => o.id === value);
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()) || o.description?.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    function onDocClick(e) {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  if (selected && !open) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-muted px-3 h-9">
        <div className="min-w-0">
          <p className="text-sm font-medium text-fg truncate">{selected.label}</p>
          {selected.description && <p className="text-xs text-fg-subtle truncate">{selected.description}</p>}
        </div>
        {!disabled && (
          <button type="button" onClick={() => { onChange(null); setOpen(true); }} className="shrink-0 text-fg-subtle hover:text-fg">
            <IconX size={14} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        leftIcon={<IconSearch size={14} />}
        disabled={disabled}
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-border bg-surface shadow-lg py-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-fg-subtle">{emptyLabel}</p>
          ) : (
            filtered.slice(0, 30).map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => { onChange(o.id); setQuery(''); setOpen(false); }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-surface-muted',
                  o.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'
                )}
                disabled={o.disabled}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-fg truncate">{o.label}</p>
                  {o.description && <p className="text-xs text-fg-subtle truncate">{o.description}</p>}
                </div>
                {o.id === value && <IconCheck size={14} className="text-brand-600 shrink-0" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
