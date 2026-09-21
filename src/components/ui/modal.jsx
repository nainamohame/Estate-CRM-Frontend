import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { IconX } from './icons';
import { Button } from './button';

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-4xl',
};

/**
 * Hand-rolled accessible dialog: focus trap, Escape to close, scroll lock,
 * rendered in a portal. This is the one place worth building from scratch
 * rather than skipping — accessibility is easy to get wrong here, and a
 * modal is used constantly throughout the app (forms, the booking wizard,
 * confirmations).
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  size = 'md',
  footer,
  dismissible = true,
  hideClose = false,
  children,
}) {
  const trapRef = useFocusTrap(open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && dismissible) onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose, dismissible]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-[2px] animate-in"
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={cn(
          'relative w-full rounded-2xl bg-surface shadow-2xl ring-1 ring-neutral-900/5 animate-scale-in',
          'max-h-[90vh] flex flex-col',
          SIZES[size]
        )}
      >
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-border">
            <div className="flex items-start gap-3 min-w-0">
              {icon && (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-600/10">
                  {icon}
                </span>
              )}
              <div className="min-w-0">
                {title && (
                  <h2 id="modal-title" className="text-lg font-semibold text-fg tracking-[-0.01em]">
                    {title}
                  </h2>
                )}
                {description && <p className="text-sm text-fg-muted mt-0.5">{description}</p>}
              </div>
            </div>
            {!hideClose && (
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close" className="-mr-2 -mt-1">
                <IconX size={18} />
              </Button>
            )}
          </div>
        )}
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface-muted/60 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
