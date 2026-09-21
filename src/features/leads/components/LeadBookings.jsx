import { Badge } from '../../../components/ui/badge';
import { MoneyText } from '../../../components/patterns/MoneyText';
import { DateText } from '../../../components/patterns/DateText';
import { EmptyState, LoadingState } from '../../../components/patterns/EmptyState';
import { IconClipboard } from '../../../components/ui/icons';
import { useBookings } from '../../bookings/hooks';
import { BOOKING_STATUS_LABELS } from '../../../lib/constants';

const STATUS_TONE = { pending: 'warning', confirmed: 'success', cancelled: 'neutral' };

export function LeadBookings({ leadId }) {
  const { data, isLoading, error } = useBookings({ leadId, pageSize: 20 });
  const rows = data?.data ?? [];

  if (isLoading) return <LoadingState label="Loading bookings…" />;
  if (error) return <p className="text-sm text-danger-600">{error.message}</p>;
  if (!rows.length) {
    return <EmptyState icon={<IconClipboard size={20} />} title="No bookings" description="Bookings made for this lead will appear here." />;
  }

  return (
    <div className="space-y-3">
      {rows.map((b) => (
        <div key={b.id} className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-fg">
              {b.unitNumber} · {b.buildingName}, {b.projectName}
            </p>
            <Badge tone={STATUS_TONE[b.status]}>{BOOKING_STATUS_LABELS[b.status]}</Badge>
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-sm text-fg-muted">
            <span>
              <MoneyText value={b.agreedPrice} />
            </span>
            <span>
              <DateText value={b.bookingDate} />
            </span>
            <span className="font-mono text-xs">{b.bookingCode}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
