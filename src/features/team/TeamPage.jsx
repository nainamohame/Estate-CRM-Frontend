import { useState } from 'react';
import { PageHeader } from '../../components/patterns/PageHeader';
import { DataTable } from '../../components/patterns/DataTable';
import { Avatar } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tooltip } from '../../components/ui/tooltip';
import { Progress } from '../../components/ui/progress';
import { Card } from '../../components/ui/card';
import { MoneyText } from '../../components/patterns/MoneyText';
import { ConfirmDialog } from '../../components/patterns/ConfirmDialog';
import { IconPlus, IconUsers, IconBriefcase } from '../../components/ui/icons';
import { useAuth } from '../auth/useAuth';
import { useDisclosure } from '../../hooks/useDisclosure';
import { useTeam, useSetTeamMemberActive } from './hooks';
import { TeamMemberFormModal } from './components/TeamMemberFormModal';

export function TeamPage() {
  const { user: currentUser } = useAuth();
  const { data, isLoading, isError, error, refetch } = useTeam();
  const setActive = useSetTeamMemberActive();
  const createModal = useDisclosure();
  const [deactivating, setDeactivating] = useState(null);

  const topValue = Math.max(1, ...(data?.map((u) => Number(u.bookedValue)) ?? [1]));

  const columns = [
    {
      key: 'fullName',
      header: 'Member',
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.fullName} size="md" />
          <div className="min-w-0">
            <p className="font-medium text-fg truncate">{u.fullName}</p>
            <p className="text-xs text-fg-subtle truncate">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
        <Badge tone={u.role === 'admin' ? 'brand' : 'neutral'} dot>
          {u.role === 'admin' ? 'Administrator' : 'Sales'}
        </Badge>
      ),
    },
    {
      key: 'openLeads',
      header: 'Open leads',
      align: 'right',
      hideBelow: 'md',
      render: (u) => (
        <span className="font-medium text-fg">
          {u.openLeads}
          <span className="text-fg-subtle font-normal"> / {u.totalLeads}</span>
        </span>
      ),
    },
    {
      key: 'bookings',
      header: 'Bookings',
      align: 'right',
      hideBelow: 'md',
      render: (u) => <span className="font-medium text-fg">{u.bookings}</span>,
    },
    {
      key: 'bookedValue',
      header: 'Booked value',
      hideBelow: 'lg',
      width: '12rem',
      render: (u) => (
        <div>
          <MoneyText value={u.bookedValue} className="font-semibold" />
          <Progress
            value={Number(u.bookedValue)}
            max={topValue}
            size="xs"
            tone={Number(u.bookedValue) === topValue && topValue > 1 ? 'accent' : 'brand'}
            className="mt-1.5"
          />
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (u) => (
        <Badge tone={u.isActive ? 'success' : 'neutral'} dot>
          {u.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (u) => {
        const isSelf = u.id === currentUser.id;
        const button = (
          <Button
            size="sm"
            variant={u.isActive ? 'secondary' : 'primary'}
            disabled={isSelf && u.isActive}
            onClick={() => (u.isActive ? setDeactivating(u) : setActive.mutate({ id: u.id, isActive: true }))}
          >
            {u.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        );
        return isSelf && u.isActive ? (
          <Tooltip content="You cannot deactivate your own account">{button}</Tooltip>
        ) : (
          button
        );
      },
    },
  ];

  const renderMobileCard = (u) => (
    <Card padding="sm" className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar name={u.fullName} size="sm" />
          <div className="min-w-0">
            <p className="font-medium text-fg truncate">{u.fullName}</p>
            <p className="text-xs text-fg-subtle truncate">{u.email}</p>
          </div>
        </div>
        <Badge tone={u.isActive ? 'success' : 'neutral'} dot>
          {u.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>
      <div className="flex items-center justify-between border-t border-border pt-2.5 text-xs text-fg-muted">
        <span>
          {u.openLeads} open · {u.bookings} booked
        </span>
        <MoneyText value={u.bookedValue} className="font-semibold text-fg" />
      </div>
    </Card>
  );

  return (
    <div>
      <PageHeader
        title="Team"
        icon={<IconBriefcase size={19} />}
        description="Manage sales team members, their access and workload."
        actions={
          <Button leftIcon={<IconPlus size={15} />} onClick={createModal.onOpen}>
            Add Member
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data}
        rowKey={(row) => row.id}
        loading={isLoading}
        error={isError ? error : null}
        onRetry={refetch}
        renderMobileCard={renderMobileCard}
        empty={{
          icon: <IconUsers size={24} />,
          title: 'No team members',
          description: 'Add your first sales team member to start assigning leads.',
        }}
      />

      <TeamMemberFormModal open={createModal.isOpen} onClose={createModal.onClose} />

      <ConfirmDialog
        open={Boolean(deactivating)}
        onClose={() => setDeactivating(null)}
        title="Deactivate account"
        description={`${deactivating?.fullName} will no longer be able to sign in. Their leads and bookings stay intact.`}
        confirmLabel="Deactivate"
        tone="danger"
        loading={setActive.isPending}
        onConfirm={() =>
          setActive.mutate({ id: deactivating.id, isActive: false }, { onSuccess: () => setDeactivating(null) })
        }
      />
    </div>
  );
}
