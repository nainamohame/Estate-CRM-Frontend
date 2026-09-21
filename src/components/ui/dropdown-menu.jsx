import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';

/**
 * Minimal dropdown: positions a portal-rendered panel under the trigger,
 * closes on outside click or Escape. `align="end"` right-aligns the panel
 * (used for row-action kebab menus at the edge of a table).
 */
export function DropdownMenu({ trigger, align = 'start', className, children }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (triggerRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const toggle = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: align === 'end' ? rect.right + window.scrollX : rect.left + window.scrollX,
      });
    }
    setOpen((v) => !v);
  };

  return (
    <>
      <span ref={triggerRef} onClick={toggle}>
        {trigger}
      </span>
      {open &&
        coords &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            style={{ top: coords.top, left: align === 'end' ? undefined : coords.left, right: align === 'end' ? window.innerWidth - coords.left : undefined }}
            className={cn(
              'fixed z-50 min-w-[10rem] rounded-lg border border-border bg-surface py-1 shadow-lg animate-scale-in',
              className
            )}
            onClick={() => setOpen(false)}
          >
            {children}
          </div>,
          document.body
        )}
    </>
  );
}

export function DropdownItem({ danger = false, icon, className, children, ...props }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        'flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
        danger ? 'text-danger-600 hover:bg-danger-50' : 'text-fg hover:bg-surface-muted',
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 h-px bg-border" />;
}
