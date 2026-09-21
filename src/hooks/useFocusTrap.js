import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Traps Tab focus within the referenced element while `active` is true, and
 * restores focus to whatever was focused before opening. Used by Modal and
 * DropdownMenu so keyboard users never land on content behind an overlay.
 */
export function useFocusTrap(active) {
  const ref = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!active) return;
    previouslyFocused.current = document.activeElement;

    const node = ref.current;
    const focusables = () => Array.from(node?.querySelectorAll(FOCUSABLE) ?? []);

    const first = focusables()[0];
    (first ?? node)?.focus();

    function onKeyDown(e) {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [active]);

  return ref;
}
