import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { cn } from '../../../lib/cn';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Avatar } from '../../../components/ui/avatar';
import { MoneyText } from '../../../components/patterns/MoneyText';
import { IconX, IconHome, IconMaximize, IconLayers } from '../../../components/ui/icons';
import { UNIT_TYPE_LABELS, AVAILABILITY_LABELS } from '../../../lib/constants';
import { useAuth } from '../../auth/useAuth';
import { useSetListingStatus } from '../hooks';

const AVAILABILITY_TONE = { available: 'success', held: 'warning', booked: 'danger', blocked: 'neutral' };

/** A right-side drawer rather than a page — a unit is a quick lookup, not a destination. */
export function UnitDrawer({ open, onClose, unit, onBook }) {
  const trapRef = useFocusTrap(open);
  const { user } = useAuth();
  const setListingStatus = useSetListingStatus();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open || !unit) return null;

  const canBook = unit.availability === 'available';
  const isLocked = unit.availability === 'held' || unit.availability === 'booked';

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-[2px] animate-in" onClick={onClose} />

      <div
        ref={trapRef}
        className="relative w-full max-w-md h-full bg-surface shadow-2xl flex flex-col animate-slide-left"
      >
        {/* Header band, tinted by the project gradient. */}
        <div className="relative bg-linear-to-br from-brand-800 to-brand-900 px-6 pt-5 pb-6">
          <div className="absolute inset-0 bg-grid opacity-[0.07]" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-brand-100/80 truncate">
                {unit.projectName} · {unit.buildingName}
              </p>
              <h2 className="text-2xl font-semibold text-white tracking-[-0.02em] mt-0.5">{unit.unitNumber}</h2>
              <Badge tone={AVAILABILITY_TONE[unit.availability]} size="md" dot className="mt-3 shadow-xs">
                {AVAILABILITY_LABELS[unit.availability]}
              </Badge>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/80 ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/20 hover:text-white"
            >
              <IconX size={17} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Headline price */}
          <div className="rounded-xl border border-border bg-surface-muted/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-subtle">List price</p>
            <p className="text-2xl font-semibold text-fg mt-1 tabular-nums">
              <MoneyText value={unit.price} compact={false} />
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field icon={<IconHome size={14} />} label="Type">
              {UNIT_TYPE_LABELS[unit.unitType]}
            </Field>
            <Field icon={<IconLayers size={14} />} label="Floor">
              {unit.floor ?? '—'}
            </Field>
            <Field icon={<IconMaximize size={14} />} label="Carpet area">
              {unit.carpetAreaSqft ? `${unit.carpetAreaSqft} sq.ft` : '—'}
            </Field>
            <Field label="Facing">{unit.facing ?? '—'}</Field>
          </div>

          {unit.bookingLeadName && (
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-subtle mb-2.5">Booked for</p>
              <div className="flex items-center gap-2.5">
                <Avatar name={unit.bookingLeadName} size="sm" />
                <span className="text-sm font-medium text-fg truncate">{unit.bookingLeadName}</span>
              </div>
            </div>
          )}

          {unit.notes && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-fg-subtle mb-1.5">Notes</p>
              <p className="text-sm text-fg leading-relaxed">{unit.notes}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-border bg-surface-muted/60">
          {user?.role === 'admin' && !isLocked && (
            <Button
              variant="secondary"
              onClick={() =>
                setListingStatus.mutate({
                  id: unit.id,
                  listingStatus: unit.listingStatus === 'blocked' ? 'available' : 'blocked',
                })
              }
              loading={setListingStatus.isPending}
            >
              {unit.listingStatus === 'blocked' ? 'Unblock' : 'Block unit'}
            </Button>
          )}
          {canBook ? (
            <Button fullWidth leftIcon={<IconHome size={15} />} onClick={() => onBook(unit)}>
              Book this unit
            </Button>
          ) : (
            <p className="text-sm text-fg-subtle">
              {isLocked ? 'This unit already has an active booking.' : 'This unit is withheld from sale.'}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function Field({ icon, label, children }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="flex items-center gap-1.5 text-xs text-fg-subtle">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium text-fg mt-1">{children}</p>
    </div>
  );
}
