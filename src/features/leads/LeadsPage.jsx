import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/patterns/PageHeader';
import { DataTable } from '../../components/patterns/DataTable';
import { KanbanBoard } from '../../components/patterns/KanbanBoard';
import { FilterBar } from '../../components/patterns/FilterBar';
import { SearchInput } from '../../components/patterns/SearchInput';
import { StageBadge } from '../../components/patterns/StageBadge';
import { DateText } from '../../components/patterns/DateText';
import { MoneyText } from '../../components/patterns/MoneyText';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { Tabs } from '../../components/ui/tabs';
import { Avatar } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { LoadingState, ErrorState } from '../../components/patterns/EmptyState';
import { IconPlus, IconLayoutGrid, IconList, IconUsers, IconClock, IconMapPin } from '../../components/ui/icons';
import { useFilters } from '../../hooks/useFilters';
import { useLeads, useLeadsBoard, useChangeLeadStage } from './hooks';
import { useAssignableUsers } from '../team/hooks';
import { useProjects } from '../properties/hooks';
import { useAuth } from '../auth/useAuth';
import { LEAD_STAGES, STAGE_LABELS, LEAD_SOURCES, SOURCE_LABELS } from '../../lib/constants';
import { LeadFormModal } from './components/LeadFormModal';
import { useDisclosure } from '../../hooks/useDisclosure';
import { cn } from '../../lib/cn';

export function LeadsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { filters, setFilter, clearFilters } = useFilters({ view: 'table' });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pendingStageMove, setPendingStageMove] = useState(null);

  const { data: assignable } = useAssignableUsers();
  const { data: projects } = useProjects();
  const changeStage = useChangeLeadStage(pendingStageMove?.lead.id);

  const isBoard = filters.view === 'board';
  const queryFilters = useMemo(() => {
    const { view, ...rest } = filters;
    return { ...rest, page: rest.page ? Number(rest.page) : 1 };
  }, [filters]);

  const listQuery = useLeads(queryFilters);
  const boardQuery = useLeadsBoard(queryFilters);

  const hasActiveFilters = Boolean(
    filters.q || filters.stage || filters.source || filters.assignedTo || filters.projectId || filters.followUp
  );

  const handleMoveStage = (lead, stage) => {
    if (stage === 'lost') {
      // A reason is mandatory for "lost" — send them to the detail page where
      // the full stage-change flow (with reason field) lives.
      navigate(`/leads/${lead.id}?moveTo=lost`);
      return;
    }
    setPendingStageMove({ lead, stage });
    changeStage.mutate({ stage }, { onSettled: () => setPendingStageMove(null) });
  };

  const columns = [
    {
      key: 'fullName',
      header: 'Lead',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={row.fullName} size="sm" />
          <div className="min-w-0">
            <p className="font-medium text-fg truncate">{row.fullName}</p>
            <p className="text-xs text-fg-subtle truncate">{row.phone}</p>
          </div>
        </div>
      ),
    },
    { key: 'stage', header: 'Stage', sortable: true, render: (row) => <StageBadge stage={row.stage} /> },
    {
      key: 'source',
      header: 'Source',
      hideBelow: 'md',
      render: (row) => <span className="text-fg-muted">{SOURCE_LABELS[row.source]}</span>,
    },
    {
      key: 'budget',
      header: 'Budget',
      align: 'right',
      hideBelow: 'lg',
      render: (row) =>
        row.budgetMax ? <MoneyText value={row.budgetMax} className="font-medium" /> : <span className="text-fg-subtle">—</span>,
    },
    {
      key: 'project',
      header: 'Project',
      hideBelow: 'lg',
      render: (row) =>
        row.interestedProjectName ? (
          <span className="flex items-center gap-1.5 text-fg-muted truncate">
            <IconMapPin size={12} className="shrink-0 opacity-60" />
            {row.interestedProjectName}
          </span>
        ) : (
          <span className="text-fg-subtle">—</span>
        ),
    },
    ...(user?.role === 'admin'
      ? [
          {
            key: 'assignedTo',
            header: 'Agent',
            hideBelow: 'md',
            render: (row) =>
              row.assignedToName ? (
                <span className="flex items-center gap-2 min-w-0">
                  <Avatar name={row.assignedToName} size="xs" />
                  <span className="text-fg-muted truncate">{row.assignedToName}</span>
                </span>
              ) : (
                <Badge tone="warning">Unassigned</Badge>
              ),
          },
        ]
      : []),
    {
      key: 'nextFollowUpAt',
      header: 'Next follow-up',
      sortable: true,
      render: (row) => {
        if (!row.nextFollowUpAt) return <span className="text-fg-subtle">—</span>;
        const overdue = new Date(row.nextFollowUpAt) < new Date();
        return (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
              overdue
                ? 'bg-danger-50 text-danger-700 ring-danger-600/15'
                : 'bg-surface-muted text-fg-muted ring-neutral-900/5'
            )}
          >
            <IconClock size={11} />
            <DateText value={row.nextFollowUpAt} relative overdue={overdue} />
          </span>
        );
      },
    },
  ];

  const renderMobileCard = (row) => (
    <Card padding="sm" className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar name={row.fullName} size="sm" />
          <div className="min-w-0">
            <p className="font-medium text-fg truncate">{row.fullName}</p>
            <p className="text-xs text-fg-subtle truncate">{row.phone}</p>
          </div>
        </div>
        <StageBadge stage={row.stage} />
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5 text-xs">
        <span className="text-fg-muted truncate">{row.interestedProjectName ?? SOURCE_LABELS[row.source]}</span>
        {row.budgetMax && <MoneyText value={row.budgetMax} className="font-medium text-fg" />}
      </div>
    </Card>
  );

  return (
    <div>
      <PageHeader
        title="Leads"
        icon={<IconUsers size={19} />}
        description="Track every lead from first contact through to a booking."
        actions={
          <>
            <Tabs
              variant="pill"
              value={filters.view ?? 'table'}
              onChange={(v) => setFilter('view', v)}
              tabs={[
                {
                  value: 'table',
                  label: (
                    <span className="flex items-center gap-1.5">
                      <IconList size={14} />
                      Table
                    </span>
                  ),
                },
                {
                  value: 'board',
                  label: (
                    <span className="flex items-center gap-1.5">
                      <IconLayoutGrid size={14} />
                      Board
                    </span>
                  ),
                },
              ]}
            />
            <Button leftIcon={<IconPlus size={15} />} onClick={onOpen}>
              New Lead
            </Button>
          </>
        }
      />

      <FilterBar
        className="mb-4"
        onClearAll={hasActiveFilters ? clearFilters : undefined}
        chips={[
          filters.q && { key: 'q', label: `"${filters.q}"`, onRemove: () => setFilter('q', '') },
          filters.stage && { key: 'stage', label: STAGE_LABELS[filters.stage], onRemove: () => setFilter('stage', '') },
          filters.source && {
            key: 'source',
            label: SOURCE_LABELS[filters.source],
            onRemove: () => setFilter('source', ''),
          },
          filters.projectId && {
            key: 'project',
            label: projects?.find((p) => p.id === filters.projectId)?.name ?? 'Project',
            onRemove: () => setFilter('projectId', ''),
          },
          filters.assignedTo && {
            key: 'agent',
            label:
              filters.assignedTo === 'unassigned'
                ? 'Unassigned'
                : (assignable?.find((u) => u.id === filters.assignedTo)?.fullName ?? 'Agent'),
            onRemove: () => setFilter('assignedTo', ''),
          },
        ].filter(Boolean)}
      >
        <SearchInput
          value={filters.q ?? ''}
          onChange={(v) => setFilter('q', v)}
          placeholder="Search name or phone…"
          className="w-full sm:w-64"
        />
        <Select
          value={filters.stage ?? ''}
          onChange={(e) => setFilter('stage', e.target.value)}
          placeholder="All stages"
          className="w-full sm:w-40"
        >
          {LEAD_STAGES.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABELS[s]}
            </option>
          ))}
        </Select>
        <Select
          value={filters.source ?? ''}
          onChange={(e) => setFilter('source', e.target.value)}
          placeholder="All sources"
          className="w-full sm:w-40"
        >
          {LEAD_SOURCES.map((s) => (
            <option key={s} value={s}>
              {SOURCE_LABELS[s]}
            </option>
          ))}
        </Select>
        {user?.role === 'admin' && (
          <Select
            value={filters.assignedTo ?? ''}
            onChange={(e) => setFilter('assignedTo', e.target.value)}
            placeholder="All agents"
            className="w-full sm:w-40"
          >
            <option value="unassigned">Unassigned</option>
            {assignable?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName}
              </option>
            ))}
          </Select>
        )}
      </FilterBar>

      {isBoard ? (
        boardQuery.isLoading ? (
          <LoadingState label="Loading board…" />
        ) : boardQuery.isError ? (
          <ErrorState description={boardQuery.error.message} onRetry={boardQuery.refetch} />
        ) : (
          <KanbanBoard rows={boardQuery.data.rows} counts={boardQuery.data.counts} onMoveStage={handleMoveStage} />
        )
      ) : (
        <DataTable
          columns={columns}
          data={listQuery.data?.data}
          rowKey={(row) => row.id}
          loading={listQuery.isLoading}
          isFetching={listQuery.isFetching && !listQuery.isLoading}
          error={listQuery.error}
          onRetry={listQuery.refetch}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          renderMobileCard={renderMobileCard}
          empty={{
            icon: <IconUsers size={24} />,
            title: 'No leads yet',
            description: 'Create your first lead to start tracking your pipeline.',
            action: (
              <Button size="sm" leftIcon={<IconPlus size={14} />} onClick={onOpen}>
                New Lead
              </Button>
            ),
          }}
          onRowClick={(row) => navigate(`/leads/${row.id}`)}
          pagination={
            listQuery.data
              ? {
                  page: listQuery.data.meta.page,
                  pageSize: listQuery.data.meta.pageSize,
                  total: listQuery.data.meta.total,
                  onPageChange: (p) => setFilter('page', p),
                }
              : undefined
          }
        />
      )}

      <LeadFormModal open={isOpen} onClose={onClose} />
    </div>
  );
}
