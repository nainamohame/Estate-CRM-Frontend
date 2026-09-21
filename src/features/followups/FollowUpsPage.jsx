import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/patterns/PageHeader';
import { Tabs } from '../../components/ui/tabs';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar } from '../../components/ui/avatar';
import { DateText } from '../../components/patterns/DateText';
import { EmptyState, LoadingState, ErrorState } from '../../components/patterns/EmptyState';
import { ConfirmDialog } from '../../components/patterns/ConfirmDialog';
import { IconCheck, IconClock, IconArrowRight, IconPhone } from '../../components/ui/icons';
import { useFilters } from '../../hooks/useFilters';
import { useAuth } from '../auth/useAuth';
import { useFollowUps, useUpdateFollowUp } from './hooks';
import { cn } from '../../lib/cn';

const SCOPES = [
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'completed', label: 'Completed' },
];

export function FollowUpsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { filters, setFilter } = useFilters({ scope: 'overdue' });
  const scope = filters.scope ?? 'overdue';
  const { data, isLoading, isError, error, refetch } = useFollowUps({ scope });
  const updateFollowUp = useUpdateFollowUp();
  const [completing, setCompleting] = useState(null);

  return (
    <div>
      <PageHeader
        title="Follow-ups"
        icon={<IconClock size={19} />}
        description="Stay on top of every commitment made to a lead."
      />

      <Tabs
        className="mb-5"
        value={scope}
        onChange={(v) => setFilter('scope', v)}
        tabs={SCOPES.map((s) => ({
          ...s,
          count: s.value === scope && data ? data.length : undefined,
        }))}
      />

      {isLoading ? (
        <LoadingState label="Loading follow-ups…" />
      ) : isError ? (
        <ErrorState description={error.message} onRetry={refetch} />
      ) : !data.length ? (
        <Card padding="none">
          <EmptyState
            icon={<IconCheck size={24} />}
            title={scope === 'overdue' ? "You're all caught up" : 'Nothing here'}
            description={
              scope === 'overdue'
                ? 'No follow-ups have slipped past their committed date.'
                : 'No follow-ups match this view right now.'
            }
          />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {data.map((f, i) => {
            const overdue = f.status === 'pending' && new Date(f.dueAt) < new Date();
            return (
              <Card
                key={f.id}
                padding="none"
                className={cn(
                  'relative overflow-hidden animate-slide-up transition-shadow hover:shadow-sm',
                  overdue && 'border-danger-200'
                )}
                style={{ animationDelay: `${Math.min(i, 10) * 25}ms` }}
              >
                {/* Urgency rail down the left edge. */}
                <span
                  className={cn(
                    'absolute inset-y-0 left-0 w-1',
                    overdue ? 'bg-danger-500' : f.status === 'done' ? 'bg-success-500' : 'bg-brand-400'
                  )}
                />

                <div className="flex flex-wrap items-center justify-between gap-4 py-3.5 pl-5 pr-4">
                  <button
                    onClick={() => navigate(`/leads/${f.leadId}`)}
                    className="flex items-center gap-3 min-w-0 text-left group"
                  >
                    <Avatar name={f.leadName} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-fg truncate transition-colors group-hover:text-brand-700">
                        {f.leadName}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-fg-subtle">
                        <IconPhone size={11} />
                        {f.leadPhone}
                      </p>
                    </div>
                  </button>

                  {f.note && (
                    <p className="hidden lg:block flex-1 min-w-0 truncate text-sm text-fg-muted">{f.note}</p>
                  )}

                  <div className="flex items-center gap-3 ml-auto">
                    {user?.role === 'admin' && f.assignedToName && (
                      <span className="hidden sm:flex items-center gap-1.5 text-xs text-fg-subtle">
                        <Avatar name={f.assignedToName} size="xs" />
                        {f.assignedToName}
                      </span>
                    )}

                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap',
                        overdue
                          ? 'bg-danger-50 text-danger-700 ring-danger-600/15'
                          : 'bg-surface-muted text-fg-muted ring-neutral-900/5'
                      )}
                    >
                      <IconClock size={11} />
                      <DateText value={f.dueAt} relative />
                    </span>

                    {f.status !== 'pending' && (
                      <Badge tone={f.status === 'done' ? 'success' : 'neutral'} dot>
                        {f.status === 'done' ? 'Completed' : 'Cancelled'}
                      </Badge>
                    )}

                    {f.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={<IconCheck size={13} />}
                        onClick={() => setCompleting(f)}
                      >
                        Done
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      rightIcon={<IconArrowRight size={13} />}
                      onClick={() => navigate(`/leads/${f.leadId}`)}
                    >
                      <span className="hidden sm:inline">Open</span>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(completing)}
        onClose={() => setCompleting(null)}
        title="Complete follow-up"
        description="What was the outcome of this conversation?"
        confirmLabel="Mark complete"
        loading={updateFollowUp.isPending}
        requireReason
        reasonLabel="Outcome"
        onConfirm={(outcome) =>
          updateFollowUp.mutate(
            { id: completing.id, body: { status: 'done', outcome } },
            { onSuccess: () => setCompleting(null) }
          )
        }
      />
    </div>
  );
}
