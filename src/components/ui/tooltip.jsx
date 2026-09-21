import { useState } from 'react';
import { cn } from '../../lib/cn';

const SIDES = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
};

export function Tooltip({ content, side = 'top', children, className }) {
  const [visible, setVisible] = useState(false);

  if (!content) return children;

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs text-white shadow-md animate-in',
            SIDES[side],
            className
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
