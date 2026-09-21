import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { StageBadge } from '../../components/patterns/StageBadge';
import { StageStepper } from '../../components/patterns/StageStepper';
import { MoneyText } from '../../components/patterns/MoneyText';
import { DateText } from '../../components/patterns/DateText';
import { LoadingState, ErrorState } from '../../components/patterns/EmptyState';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs } from '../../components/ui/tabs';
import { Select } from '../../components/ui/select';
import { Avatar } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { ConfirmDialog } from '../../components/patterns/ConfirmDialog';
import {
  IconPhone,
  IconMail,
  IconEdit,
  IconHome,
  IconChevronLeft,
  IconChevronRight,
  IconUser,
  IconTarget,
  IconFileText,
} from '../../components/ui/icons';
import { SOURCE_LABELS, UNIT_TYPE_LABELS } from '../../lib/constants';
import { useLead, useChangeLeadStage, useUpdateLead } from './hooks';
import { useAssignableUsers } from '../team/hooks';
import { useAuth } from '../auth/useAuth';
import { useDisclosure } from '../../hooks/useDisclosure';
import { LeadFormModal } from './components/LeadFormModal';
import { LeadTimeline } from './components/LeadTimeline';
import { LeadFollowUps } from './components/LeadFollowUps';
import { LeadBookings } from './components/LeadBookings';

export function LeadDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState('timeline');

  const { data: lead, isLoading, isError, error, refetch } = useLead(id);
  const { data: assignable } = useAssignableUsers();
  const changeStage = useChangeLeadStage(id);
  const updateLead = useUpdateLead(id);

  const editModal = useDisclosure();
  const lostModal = useDisclosure(searchParams.get('moveTo') === 'lost');

  if (isLoading) return <LoadingState label="Loading lead…" />;
  if (isError) return <ErrorState description={error.message} onRetry={refetch} />;

  const canBook = lead.stage !== 'booked' && lead.stage !== 'lost';

  return (
    <div className="space-y-6">
      {/* ---- Breadcrumb --------------------------------------------------- */}
      <nav className="flex items-center gap-1.5 text-sm text-fg-subtle">
        <button onClick={() => navigate('/leads')} className="hover:text-brand-700 transition-colors">
          Leads
        </button>
        <IconChevronRight size={12} className="opacity-60" />
        <span className="text-fg-muted font-medium truncate">{lead.fullName}</span>
      </nav>

      {/* ---- Hero --------------------------------------------------------- */}
      <Card padding="none" className="overflow-hidden">
        <div className="relative bg-linear-to-br from-brand-900 via-brand-800 to-brand-700 px-6 py-6">
          <div className="absolute inset-0 bg-grid opacity-[0.07]" />
          <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
            <div className="flex items-start gap-4 min-w-0">
              <button
                onClick={() => navigate('/leads')}
                aria-label="Back to leads"
                className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/80 ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/15 hover:text-white"
              >
                <IconChevronLeft size={18} />
              </button>
              <Avatar name={lead.fullName} size="lg" className="ring-2 ring-white/20" />
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-white truncate tracking-[-0.02em]">{lead.fullName}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StageBadge stage={lead.stage} size="md" />
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-brand-50 ring-1 ring-inset ring-white/15">
                    {SOURCE_LABELS[lead.source]}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-1.5 text-sm text-brand-100 transition-colors hover:text-white"
                  >
                    <IconPhone size={14} /> {lead.phone}
                  </a>
                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}`}
                      className="flex items-center gap-1.5 text-sm text-brand-100 transition-colors hover:text-white"
                    >
                      <IconMail size={14} /> {lead.email}
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {canBook && (
                <Button
                  variant="secondary"
                  leftIcon={<IconHome size={15} />}
                  onClick={() => navigate(`/bookings?leadId=${lead.id}&action=new`)}
                >
                  Book a unit
                </Button>
              )}
              <Button leftIcon={<IconEdit size={15} />} onClick={editModal.onOpen}>
                Edit
              </Button>
            </div>
          </div>
        </div>

        {/* Stage progression sits on the hero's base, straddling the fold. */}
        <div className="px-6 py-4 bg-surface border-t border-border">
          <StageStepper
            stage={lead.stage}
            onSelect={(stage) => (stage === 'lost' ? lostModal.onOpen() : changeStage.mutate({ stage }))}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ---- Left rail ---------------------------------------------------- */}
        <div className="lg:col-span-1 space-y-5">
          <Card padding="none">
            <CardHeader>
              <CardTitle>Requirement</CardTitle>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-600/10">
                <IconTarget size={15} />
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row label="Budget">
                {lead.budgetMin || lead.budgetMax ? (
                  <span className="font-medium">
                    <MoneyText value={lead.budgetMin} /> – <MoneyText value={lead.budgetMax} />
                  </span>
                ) : (
                  '—'
                )}
              </Row>
              <Row label="Unit type">
                {lead.preferredUnitType ? (
                  <Badge tone="brand">{UNIT_TYPE_LABELS[lead.preferredUnitType]}</Badge>
                ) : (
                  '—'
                )}
              </Row>
              <Row label="Project">{lead.interestedProjectName ?? '—'}</Row>
              <Row label="Created">
                <DateText value={lead.createdAt} />
              </Row>
              <Row label="Last activity">
                <DateText value={lead.lastActivityAt} relative />
              </Row>

              {lead.lostReason && (
                <div className="rounded-lg bg-danger-50 p-3 ring-1 ring-inset ring-danger-600/10">
                  <p className="text-xs font-semibold uppercase tracking-wide text-danger-700">Lost reason</p>
                  <p className="text-sm text-danger-700/90 mt-1">{lead.lostReason}</p>
                </div>
              )}

              {lead.requirement && (
                <div className="pt-3 border-t border-border">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-fg-subtle mb-1.5">
                    <IconFileText size={12} />
                    Notes
                  </p>
                  <p className="text-sm text-fg leading-relaxed whitespace-pre-wrap">{lead.requirement}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card padding="none">
            <CardHeader>
              <CardTitle>Owner</CardTitle>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-600 ring-1 ring-inset ring-accent-600/10">
                <IconUser size={15} />
              </span>
            </CardHeader>
            <CardContent>
              {user?.role === 'admin' ? (
                <>
                  <Select
                    value={lead.assignedTo ?? ''}
                    onChange={(e) => updateLead.mutate({ assignedTo: e.target.value || null })}
                    placeholder="Unassigned"
                  >
                    {assignable?.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName}
                      </option>
                    ))}
                  </Select>
                  <p className="mt-2 text-xs text-fg-subtle">Only administrators can reassign a lead.</p>
                </>
              ) : lead.assignedToName ? (
                <div className="flex items-center gap-3">
                  <Avatar name={lead.assignedToName} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-fg truncate">{lead.assignedToName}</p>
                    <p className="text-xs text-fg-subtle">Sales employee</p>
                  </div>
                </div>
              ) : (
                <Badge tone="warning">Unassigned</Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ---- Activity panel ------------------------------------------------ */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="px-5 pt-4">
              <Tabs
                value={tab}
                onChange={setTab}
                tabs={[
                  { value: 'timeline', label: 'Timeline' },
                  { value: 'followups', label: 'Follow-ups' },
                  { value: 'bookings', label: 'Bookings' },
                ]}
              />
            </div>
            <div className="p-5">
              {tab === 'timeline' && <LeadTimeline leadId={id} />}
              {tab === 'followups' && <LeadFollowUps leadId={id} />}
              {tab === 'bookings' && <LeadBookings leadId={id} />}
            </div>
          </Card>
        </div>
      </div>

      <LeadFormModal open={editModal.isOpen} onClose={editModal.onClose} lead={lead} />

      <ConfirmDialog
        open={lostModal.isOpen}
        onClose={lostModal.onClose}
        title="Mark lead as lost"
        description="Why is this lead being marked lost? This helps the team learn from it."
        confirmLabel="Mark as lost"
        tone="danger"
        loading={changeStage.isPending}
        requireReason
        reasonLabel="Reason"
        onConfirm={(reason) =>
          changeStage.mutate({ stage: 'lost', lostReason: reason }, { onSuccess: lostModal.onClose })
        }
      />
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-fg-subtle shrink-0">{label}</span>
      <span className="text-fg text-right min-w-0">{children}</span>
    </div>
  );
}
