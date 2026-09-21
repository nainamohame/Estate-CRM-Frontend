import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/patterns/PageHeader';
import { DataTable } from '../../components/patterns/DataTable';
import { FilterBar } from '../../components/patterns/FilterBar';
import { StatCard } from '../../components/patterns/StatCard';
import { MoneyText } from '../../components/patterns/MoneyText';
import { DateText } from '../../components/patterns/DateText';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { Avatar } from '../../components/ui/avatar';
import { Card } from '../../components/ui/card';
import { ConfirmDialog } from '../../components/patterns/ConfirmDialog';
import {
  IconPlus,
  IconClipboard,
  IconDollarSign,
  IconCheck,
  IconClock,
  IconHome,
} from '../../components/ui/icons';
import { useFilters } from '../../hooks/useFilters';
import { useDisclosure } from '../../hooks/useDisclosure';
import { useAuth } from '../auth/useAuth';
import { useAssignableUsers } from '../team/hooks';
import { useProjects } from '../properties/hooks';
import { useBookings, useConfirmBooking, useCancelBooking } from './hooks';
import { BOOKING_STATUS_LABELS } from '../../lib/constants';
import { BookingWizard } from './components/BookingWizard';

const STATUS_TONE = { pending: 'warning', confirmed: 'success', cancelled: 'neutral' };

export function BookingsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, setFilter, clearFilters } = useFilters({});
  const wizard = useDisclosure();
  const [cancelling, setCancelling] = useState(null);

  const { data: assignable } = useAssignableUsers();
  const { data: projects } = useProjects();
  const confirmBooking = useConfirmBooking();
  const cancelBooking = useCancelBooking();

  useEffect(() => {
    if (searchParams.get('action') === 'new') wizard.onOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeWizard = () => {
    wizard.onClose();
    const next = new URLSearchParams(searchParams);
    next.delete('action');
    next.delete('unitId');
    next.delete('leadId');
    setSearchParams(next, { replace: true });
  };

  const queryFilters = useMemo(() => ({ ...filters, page: filters.page ? Number(filters.page) : 1 }), [filters]);
  const bookingsQuery = useBookings(queryFilters);
  const hasActiveFilters = Boolean(filters.status || filters.agentId || filters.projectId);

  const totals = bookingsQuery.data?.data?.reduce(
    (acc, b) => {
      if (b.status !== 'cancelled') acc.value += Number(b.agreedPrice);
      if (b.status === 'confirmed') acc.confirmed++;
      if (b.status === 'pending') acc.pending++;
      return acc;
    },
    { value: 0, confirmed: 0, pending: 0 }
  );

  const columns = [
    {
      key: 'bookingCode',
      header: 'Booking',
      render: (b) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-600/10">
            <IconHome size={14} />
          </span>
          <div className="min-w-0">
            <p className="font-medium text-fg">{b.unitNumber}</p>
            <p className="font-mono text-[0.6875rem] text-fg-subtle">{b.bookingCode}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'project',
      header: 'Project',
      hideBelow: 'md',
      render: (b) => (
        <div className="min-w-0">
          <p className="text-fg truncate">{b.projectName}</p>
          <p className="text-xs text-fg-subtle truncate">{b.buildingName}</p>
        </div>
      ),
    },
    {
      key: 'leadName',
      header: 'Customer',
      render: (b) => (
        <span className="flex items-center gap-2 min-w-0">
          <Avatar name={b.leadName} size="xs" />
          <span className="truncate">{b.leadName}</span>
        </span>
      ),
    },
    ...(user?.role === 'admin'
      ? [
          {
            key: 'agentName',
            header: 'Agent',
            hideBelow: 'lg',
            render: (b) =>
              b.agentName ? (
                <span className="flex items-center gap-2 min-w-0">
                  <Avatar name={b.agentName} size="xs" />
                  <span className="text-fg-muted truncate">{b.agentName}</span>
                </span>
              ) : (
                <span className="text-fg-subtle">—</span>
              ),
          },
        ]
      : []),
    {
      key: 'agreedPrice',
      header: 'Agreed price',
      align: 'right',
      render: (b) => {
        const discount = b.listPrice ? Math.round((1 - b.agreedPrice / b.listPrice) * 1000) / 10 : 0;
        return (
          <div>
            <MoneyText value={b.agreedPrice} className="font-semibold" />
            {discount > 0 && <p className="text-xs text-success-600 mt-0.5">{discount}% off list</p>}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (b) => (
        <Badge tone={STATUS_TONE[b.status]} dot>
          {BOOKING_STATUS_LABELS[b.status]}
        </Badge>
      ),
    },
    {
      key: 'bookingDate',
      header: 'Date',
      hideBelow: 'md',
      render: (b) => <DateText value={b.bookingDate} className="text-fg-muted" />,
    },
    ...(user?.role === 'admin'
      ? [
          {
            key: 'actions',
            header: '',
            align: 'right',
            render: (b) => (
              <div className="flex items-center justify-end gap-2">
                {b.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<IconCheck size={13} />}
                    onClick={() => confirmBooking.mutate(b.id)}
                  >
                    Confirm
                  </Button>
                )}
                {b.status !== 'cancelled' && (
                  <Button size="sm" variant="ghost" onClick={() => setCancelling(b)}>
                    Cancel
                  </Button>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  const renderMobileCard = (b) => (
    <Card padding="sm" className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-fg truncate">
            {b.unitNumber} · {b.projectName}
          </p>
          <p className="font-mono text-[0.6875rem] text-fg-subtle">{b.bookingCode}</p>
        </div>
        <Badge tone={STATUS_TONE[b.status]} dot>
          {BOOKING_STATUS_LABELS[b.status]}
        </Badge>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5 text-sm">
        <span className="flex items-center gap-2 min-w-0">
          <Avatar name={b.leadName} size="xs" />
          <span className="truncate text-fg-muted">{b.leadName}</span>
        </span>
        <MoneyText value={b.agreedPrice} className="font-semibold" />
      </div>
    </Card>
  );

  return (
    <div>
      <PageHeader
        title="Bookings"
        icon={<IconClipboard size={19} />}
        description="Every unit booked, confirmed or cancelled."
        actions={
          <Button leftIcon={<IconPlus size={15} />} onClick={wizard.onOpen}>
            New Booking
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Value on this page"
          value={<MoneyText value={totals?.value ?? 0} />}
          icon={<IconDollarSign size={18} />}
          tone="accent"
          loading={bookingsQuery.isLoading}
        />
        <StatCard
          label="Confirmed"
          value={totals?.confirmed ?? 0}
          icon={<IconCheck size={18} />}
          tone="success"
          loading={bookingsQuery.isLoading}
        />
        <StatCard
          label="Pending confirmation"
          value={totals?.pending ?? 0}
          icon={<IconClock size={18} />}
          tone="warning"
          loading={bookingsQuery.isLoading}
        />
      </div>

      <FilterBar className="mb-4" onClearAll={hasActiveFilters ? clearFilters : undefined}>
        <Select
          value={filters.status ?? ''}
          onChange={(e) => setFilter('status', e.target.value)}
          placeholder="All statuses"
          className="w-full sm:w-40"
        >
          {Object.entries(BOOKING_STATUS_LABELS).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </Select>
        {user?.role === 'admin' && (
          <Select
            value={filters.agentId ?? ''}
            onChange={(e) => setFilter('agentId', e.target.value)}
            placeholder="All agents"
            className="w-full sm:w-40"
          >
            {assignable?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName}
              </option>
            ))}
          </Select>
        )}
        <Select
          value={filters.projectId ?? ''}
          onChange={(e) => setFilter('projectId', e.target.value)}
          placeholder="All projects"
          className="w-full sm:w-44"
        >
          {projects?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </FilterBar>

      <DataTable
        columns={columns}
        data={bookingsQuery.data?.data}
        rowKey={(row) => row.id}
        loading={bookingsQuery.isLoading}
        isFetching={bookingsQuery.isFetching && !bookingsQuery.isLoading}
        error={bookingsQuery.error}
        onRetry={bookingsQuery.refetch}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        renderMobileCard={renderMobileCard}
        empty={{
          icon: <IconClipboard size={24} />,
          title: 'No bookings yet',
          description: 'Book a unit for a lead and it will show up here.',
          action: (
            <Button size="sm" leftIcon={<IconPlus size={14} />} onClick={wizard.onOpen}>
              New Booking
            </Button>
          ),
        }}
        pagination={
          bookingsQuery.data
            ? {
                page: bookingsQuery.data.meta.page,
                pageSize: bookingsQuery.data.meta.pageSize,
                total: bookingsQuery.data.meta.total,
                onPageChange: (p) => setFilter('page', p),
              }
            : undefined
        }
      />

      <BookingWizard
        open={wizard.isOpen}
        onClose={closeWizard}
        initialUnitId={searchParams.get('unitId')}
        initialLeadId={searchParams.get('leadId')}
      />

      <ConfirmDialog
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        title="Cancel booking"
        description="This frees the unit for other agents immediately. Please record why."
        confirmLabel="Cancel booking"
        tone="danger"
        requireReason
        loading={cancelBooking.isPending}
        onConfirm={(reason) =>
          cancelBooking.mutate({ id: cancelling.id, reason }, { onSuccess: () => setCancelling(null) })
        }
      />
    </div>
  );
}
