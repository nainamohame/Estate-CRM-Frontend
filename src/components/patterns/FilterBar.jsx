import { useState } from 'react';
import { Button } from '../ui/button';
import { Modal } from '../ui/modal';
import { Badge } from '../ui/badge';
import { IconFilter, IconX } from '../ui/icons';
import { useIsMobile } from '../../hooks/useMediaQuery';

/**
 * Inline controls on desktop; on mobile they collapse into a single
 * "Filters" button that opens a sheet, so a filter row doesn't eat the whole
 * viewport width on a phone. `chips` renders each active filter as a
 * removable pill above the row.
 */
export function FilterBar({ children, chips = [], onClearAll, className }) {
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const activeCount = chips.length;

  return (
    <div className={className}>
      {isMobile ? (
        <Button variant="secondary" size="sm" onClick={() => setSheetOpen(true)} leftIcon={<IconFilter size={14} />}>
          Filters {activeCount > 0 && `(${activeCount})`}
        </Button>
      ) : (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      )}

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {chips.map((chip) => (
            <Badge key={chip.key} tone="brand" className="pr-1">
              {chip.label}
              <button onClick={chip.onRemove} className="ml-0.5 hover:opacity-70" aria-label={`Remove ${chip.label} filter`}>
                <IconX size={11} />
              </button>
            </Badge>
          ))}
          {onClearAll && (
            <button onClick={onClearAll} className="text-xs text-fg-subtle hover:text-fg underline underline-offset-2">
              Clear all
            </button>
          )}
        </div>
      )}

      <Modal open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filters" size="sm">
        <div className="flex flex-col gap-3">{children}</div>
      </Modal>
    </div>
  );
}
