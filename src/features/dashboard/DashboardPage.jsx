import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Avatar } from '../../components/ui/avatar';
import { StatCard } from '../../components/patterns/StatCard';
import { DateText } from '../../components/patterns/DateText';
import { MoneyText } from '../../components/patterns/MoneyText';
import { EmptyState, ErrorState } from '../../components/patterns/EmptyState';
import { SkeletonText } from '../../components/ui/skeleton';
import { Alert } from '../../components/ui/alert';
import { cn } from '../../lib/cn';
import {
  IconUsers,
  IconClock,
  IconAlertCircle,
  IconClipboard,
  IconDollarSign,
  IconHome,
  IconCheck,
  IconArrowRight,
  IconActivity,
  IconPhone,
  IconMail,
  IconTrendingUp,
  IconLayers,
  IconStar,
} from '../../components/ui/icons';
import { BOOKING_STATUS_LABELS } from '../../lib/constants';
import { useAuth } from '../auth/useAuth';
import { useDashboardSummary } from './hooks';
import { useConfirmBooking } from '../bookings/hooks';
import { StageFunnel } from './components/StageFunnel';
import { followUpsApi } from '../followups/api';

const ACTIVITY_TONE = {
  note: 'bg-neutral-100 text-neutral-600',
  call: 'bg-info-50 text-info-600',
  email: 'bg-purple-50 text-purple-600',
  meeting: 'bg-teal-50 text-teal-600',
  site_visit: 'bg-accent-50 text-accent-600',
  stage_change: 'bg-brand-50 text-brand-600',
  booking: 'bg-success-50 text-success-600',
  follow_up: 'bg-warning-50 text-warning-600',
  assignment: 'bg-neutral-100 text-neutral-600',
  system: 'bg-neutral-100 text-neutral-500',
};

const RANK_STYLE = [
  'bg-linear-to-br from-accent-300 to-accent-500 text-white ring-accent-500/30',
  'bg-linear-to-br from-neutral-300 to-neutral-400 text-white ring-neutral-500/30',
  'bg-linear-to-br from-accent-600 to-accent-700 text-white ring-accent-700/30',
];

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useDashboardSummary();
  const confirmBooking = useConfirmBooking();

  if (isError) return <ErrorState description={error.message} onRetry={refetch} />;

  const isAdmin = user?.role === 'admin';
  const totalLeads = isLoading ? 0 : data.funnel.reduce((s, f) => s + f.count, 0);
  const openLeads = isLoading
    ? 0
    : data.funnel.filter((f) => f.stage !== 'booked' && f.stage !== 'lost').reduce((s, f) => s + f.count, 0);
  const bookedLeads = isLoading ? 0 : (data.funnel.find((f) => f.stage === 'booked')?.count ?? 0);
  const conversion = totalLeads ? Math.round((bookedLeads / totalLeads) * 100) : 0;
  const topValue = isLoading || !isAdmin ? 0 : Math.max(1, ...(data.leaderboard?.map((a) => Number(a.value)) ?? [1]));

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="space-y-6">
      {/* ---- Greeting ----------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-fg-subtle">{today}</p>
          <h1 className="text-2xl font-semibold text-fg mt-1 tracking-[-0.02em]">
            Welcome back, {user?.fullName?.split(' ')[0]}
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            Here's what's happening {isAdmin ? 'across your team' : 'with your leads'} today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate('/leads')} rightIcon={<IconArrowRight size={14} />}>
            View pipeline
          </Button>
          <Button size="sm" onClick={() => navigate('/bookings?action=new')}>
            New booking
          </Button>
        </div>
      </div>

      {isAdmin && !isLoading && data.unassignedLeads > 0 && (
        <Alert
          variant="warning"
          title={`${data.unassignedLeads} lead${data.unassignedLeads > 1 ? 's are' : ' is'} unassigned`}
          description="These leads have no sales agent yet and may go stale."
          action={
            <Button size="sm" variant="secondary" onClick={() => navigate('/leads?assignedTo=unassigned')}>
              Assign now
            </Button>
          }
        />
      )}

      {/* ---- Headline metrics --------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={isAdmin ? 'Open leads' : 'My open leads'}
          value={isLoading ? undefined : openLeads}
          icon={<IconUsers size={18} />}
          hint={isLoading ? undefined : `of ${totalLeads} total`}
          loading={isLoading}
          onClick={() => navigate('/leads')}
        />
        <StatCard
          label="Due today"
          value={isLoading ? undefined : data.followUps.today}
          icon={<IconClock size={18} />}
          tone="warning"
          hint={isLoading ? undefined : `${data.followUps.week} this week`}
          loading={isLoading}
          onClick={() => navigate('/follow-ups?scope=today')}
        />
        <StatCard
          label="Overdue"
          value={isLoading ? undefined : data.followUps.overdue}
          icon={<IconAlertCircle size={18} />}
          tone="danger"
          hint={isLoading ? undefined : data.followUps.overdue ? 'needs attention' : 'all caught up'}
          loading={isLoading}
          onClick={() => navigate('/follow-ups?scope=overdue')}
        />
        <StatCard
          label={isAdmin ? 'Bookings this month' : 'My bookings'}
          value={isLoading ? undefined : isAdmin ? data.bookings.thisMonth : data.bookings.total}
          icon={<IconClipboard size={18} />}
          tone="success"
          hint={isLoading ? undefined : `${conversion}% conversion`}
          loading={isLoading}
          onClick={() => navigate('/bookings')}
        />
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            label="Total booking value"
            value={isLoading ? undefined : <MoneyText value={data.bookings.pipelineValue} />}
            icon={<IconDollarSign size={18} />}
            tone="accent"
            hint={isLoading ? undefined : `${data.bookings.total} bookings all time`}
            loading={isLoading}
            onClick={() => navigate('/bookings')}
          />
          <StatCard
            label="Available units"
            value={isLoading ? undefined : `${data.inventory.available} / ${data.inventory.total}`}
            icon={<IconHome size={18} />}
            tone="brand"
            hint={
              isLoading
                ? undefined
                : `${Math.round((data.inventory.available / (data.inventory.total || 1)) * 100)}% of inventory free`
            }
            loading={isLoading}
            onClick={() => navigate('/properties')}
          />
        </div>
      )}

      {/* ---- Main grid ----------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="none">
            <CardHeader>
              <div>
                <CardTitle>{isAdmin ? "Today's follow-ups" : 'My follow-ups today'}</CardTitle>
                <p className="text-sm text-fg-muted mt-0.5">Calls and visits committed for today.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/follow-ups?scope=today')}>
                View all
              </Button>
            </CardHeader>
            <CardContent>
              <FollowUpList scope="today" navigate={navigate} loading={isLoading} />
            </CardContent>
          </Card>

          <Card padding="none" tone={isLoading ? 'default' : undefined}>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Overdue follow-ups
                  {!isLoading && data.followUps.overdue > 0 && (
                    <Badge tone="danger" dot>
                      {data.followUps.overdue}
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-fg-muted mt-0.5">Past their committed date — chase these first.</p>
              </div>
            </CardHeader>
            <CardContent>
              <FollowUpList scope="overdue" navigate={navigate} loading={isLoading} tone="danger" />
            </CardContent>
          </Card>

          {isAdmin && !isLoading && (
            <Card padding="none">
              <CardHeader>
                <div>
                  <CardTitle>Recent bookings</CardTitle>
                  <p className="text-sm text-fg-muted mt-0.5">Latest units taken off the market.</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/bookings')}>
                  View all
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                {data.recentBookings.length === 0 ? (
                  <EmptyState title="No bookings yet" description="Bookings will appear here as your team closes." />
                ) : (
                  <ul className="divide-y divide-border">
                    {data.recentBookings.map((b) => (
                      <li key={b.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-sunken text-xs font-semibold text-fg-muted ring-1 ring-inset ring-border">
                            {b.unitNumber.split('-')[0]}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-fg truncate">
                              {b.unitNumber} · {b.projectName}
                            </p>
                            <p className="text-xs text-fg-subtle truncate">
                              {b.leadName} · {b.agentName ?? 'Unassigned'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <MoneyText value={b.agreedPrice} className="text-sm font-medium" />
                          <Badge
                            tone={b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'neutral'}
                            dot
                          >
                            {BOOKING_STATUS_LABELS[b.status]}
                          </Badge>
                          {b.status === 'pending' && (
                            <Button
                              size="xs"
                              variant="secondary"
                              leftIcon={<IconCheck size={12} />}
                              onClick={() => confirmBooking.mutate(b.id)}
                            >
                              Confirm
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ---- Right rail --------------------------------------------------- */}
        <div className="space-y-6">
          <Card padding="none">
            <CardHeader>
              <div>
                <CardTitle>{isAdmin ? 'Team pipeline' : 'My pipeline'}</CardTitle>
                <p className="text-sm text-fg-muted mt-0.5">{totalLeads} leads by stage</p>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-600/10">
                <IconLayers size={15} />
              </span>
            </CardHeader>
            <CardContent>{isLoading ? <SkeletonText lines={7} /> : <StageFunnel funnel={data.funnel} />}</CardContent>
          </Card>

          {isAdmin && !isLoading && (
            <Card padding="none">
              <CardHeader>
                <div>
                  <CardTitle>Agent leaderboard</CardTitle>
                  <p className="text-sm text-fg-muted mt-0.5">By booked value</p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-600 ring-1 ring-inset ring-accent-600/10">
                  <IconStar size={15} />
                </span>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.leaderboard.map((a, i) => (
                  <div key={a.id}>
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold ring-1 ring-inset',
                          RANK_STYLE[i] ?? 'bg-neutral-100 text-fg-subtle ring-neutral-900/10'
                        )}
                      >
                        {i + 1}
                      </span>
                      <Avatar name={a.fullName} size="xs" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-fg truncate">{a.fullName}</p>
                      </div>
                      <MoneyText value={a.value} className="text-sm font-semibold shrink-0" />
                    </div>
                    <div className="mt-2 ml-7.5">
                      <Progress
                        value={Number(a.value)}
                        max={topValue}
                        size="xs"
                        tone={i === 0 ? 'accent' : 'brand'}
                      />
                      <p className="mt-1.5 text-xs text-fg-subtle">
                        {a.openLeads} open · {a.bookings} booked · {a.conversionRate}% conversion
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {isAdmin && !isLoading && (
            <Card padding="none">
              <CardHeader>
                <div>
                  <CardTitle>Inventory by project</CardTitle>
                  <p className="text-sm text-fg-muted mt-0.5">Units still available</p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-50 text-success-600 ring-1 ring-inset ring-success-600/10">
                  <IconHome size={15} />
                </span>
              </CardHeader>
              <CardContent className="space-y-3.5">
                {data.projectInventory.map((p) => {
                  const pct = Math.round((p.availableUnits / (p.totalUnits || 1)) * 100);
                  return (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/properties/${p.id}`)}
                      className="block w-full text-left group"
                    >
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-fg truncate transition-colors group-hover:text-brand-700">{p.name}</span>
                        <span className="text-xs text-fg-subtle shrink-0 tabular-nums ml-2">
                          {p.availableUnits}/{p.totalUnits}
                        </span>
                      </div>
                      <Progress
                        value={p.availableUnits}
                        max={p.totalUnits || 1}
                        size="sm"
                        tone={pct < 20 ? 'danger' : pct < 50 ? 'warning' : 'success'}
                      />
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {!isLoading && (
            <Card padding="none">
              <CardHeader>
                <div>
                  <CardTitle>Recent activity</CardTitle>
                  <p className="text-sm text-fg-muted mt-0.5">Across your leads</p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-info-50 text-info-600 ring-1 ring-inset ring-info-600/10">
                  <IconActivity size={15} />
                </span>
              </CardHeader>
              <CardContent>
                {data.recentActivity.length === 0 ? (
                  <p className="text-sm text-fg-subtle">No recent activity.</p>
                ) : (
                  <ol className="relative space-y-3.5">
                    {/* Vertical rail connecting the feed dots. */}
                    <span className="absolute left-3.5 top-2 bottom-2 w-px bg-border" aria-hidden="true" />
                    {data.recentActivity.map((a) => (
                      <li key={a.id} className="relative flex gap-3">
                        <span
                          className={cn(
                            'relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2 ring-surface',
                            ACTIVITY_TONE[a.type] ?? ACTIVITY_TONE.system
                          )}
                        >
                          <ActivityGlyph type={a.type} />
                        </span>
                        <button
                          onClick={() => navigate(`/leads/${a.leadId}`)}
                          className="min-w-0 flex-1 text-left group -mt-0.5"
                        >
                          <p className="text-sm text-fg truncate transition-colors group-hover:text-brand-700">
                            <span className="font-medium">{a.leadName}</span>
                          </p>
                          <p className="text-xs text-fg-muted truncate">{a.body ?? a.type}</p>
                          <p className="text-xs text-fg-subtle mt-0.5">
                            {a.userName ?? 'System'} · <DateText value={a.createdAt} relative />
                          </p>
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityGlyph({ type }) {
  const size = 12;
  if (type === 'call') return <IconPhone size={size} />;
  if (type === 'email') return <IconMail size={size} />;
  if (type === 'meeting') return <IconUsers size={size} />;
  if (type === 'site_visit') return <IconHome size={size} />;
  if (type === 'stage_change') return <IconTrendingUp size={size} />;
  if (type === 'booking') return <IconClipboard size={size} />;
  if (type === 'follow_up') return <IconClock size={size} />;
  return <IconActivity size={size} />;
}

/**
 * Reuses the follow-ups list endpoint the Follow-ups page already calls, so
 * the dashboard needs no bespoke API shape of its own.
 */
function FollowUpList({ scope, navigate, loading, tone }) {
  const { data, isLoading } = useQuery({
    queryKey: ['follow-ups', { scope }],
    queryFn: () => followUpsApi.list({ scope }),
  });

  if (loading || isLoading) return <SkeletonText lines={3} />;

  if (!data?.length) {
    return (
      <EmptyState
        icon={<IconCheck size={22} />}
        title={scope === 'overdue' ? "You're all caught up" : 'Nothing due today'}
        description={
          scope === 'overdue' ? 'No follow-ups have slipped past their date.' : 'No follow-ups are scheduled for today.'
        }
        className="py-8"
      />
    );
  }

  return (
    <div>
      <ul className="divide-y divide-border">
        {data.slice(0, 5).map((f) => (
          <li key={f.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
            <button
              onClick={() => navigate(`/leads/${f.leadId}`)}
              className="flex items-center gap-2.5 min-w-0 text-left group"
            >
              <Avatar name={f.leadName} size="xs" />
              <span className="min-w-0">
                <span className="block text-sm text-fg truncate transition-colors group-hover:text-brand-700">
                  {f.leadName}
                </span>
                {f.note && <span className="block text-xs text-fg-subtle truncate">{f.note}</span>}
              </span>
            </button>
            <span
              className={cn(
                'shrink-0 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
                tone === 'danger'
                  ? 'bg-danger-50 text-danger-700 ring-danger-600/15'
                  : 'bg-surface-muted text-fg-muted ring-neutral-900/5'
              )}
            >
              <DateText value={f.dueAt} relative />
            </span>
          </li>
        ))}
      </ul>
      {data.length > 5 && (
        <Button
          variant="link"
          size="sm"
          className="mt-3"
          rightIcon={<IconArrowRight size={12} />}
          onClick={() => navigate(`/follow-ups?scope=${scope}`)}
        >
          View all {data.length}
        </Button>
      )}
    </div>
  );
}
