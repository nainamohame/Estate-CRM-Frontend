import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { FormField } from '../../../components/patterns/FormField';
import { EmptyState } from '../../../components/patterns/EmptyState';
import { DateText } from '../../../components/patterns/DateText';
import { IconCheck, IconClock } from '../../../components/ui/icons';
import { useCreateFollowUp, useLeadFollowUps } from '../hooks';
import { useUpdateFollowUp } from '../../followups/hooks';
import { ConfirmDialog } from '../../../components/patterns/ConfirmDialog';
import { useDisclosure } from '../../../hooks/useDisclosure';

function toLocalInputValue(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function LeadFollowUps({ leadId }) {
  const { data: followUps, isLoading, isError, error } = useLeadFollowUps(leadId);
  const createFollowUp = useCreateFollowUp(leadId);
  const updateFollowUp = useUpdateFollowUp();
  const [dueAt, setDueAt] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 4, 0, 0, 0);
    return toLocalInputValue(d);
  });
  const [note, setNote] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [completing, setCompleting] = useState(null);

  const handleSchedule = (e) => {
    e.preventDefault();
    createFollowUp.mutate({ dueAt: new Date(dueAt).toISOString(), note: note.trim() || undefined }, { onSuccess: () => setNote('') });
  };

  const handleComplete = (outcome) => {
    updateFollowUp.mutate(
      { id: completing.id, body: { status: 'done', outcome } },
      { onSuccess: () => { setCompleting(null); onClose(); } }
    );
  };

  const pending = followUps?.filter((f) => f.status === 'pending') ?? [];
  const past = followUps?.filter((f) => f.status !== 'pending') ?? [];

  return (
    <div>
      <form onSubmit={handleSchedule} className="mb-5 rounded-lg border border-border p-3 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
          <FormField label="Follow-up date & time" htmlFor="dueAt">
            <Input id="dueAt" type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          </FormField>
          <Button type="submit" loading={createFollowUp.isPending}>
            Schedule
          </Button>
        </div>
        <Textarea rows={2} placeholder="What's this follow-up about? (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      </form>

      {isLoading ? (
        <p className="text-sm text-fg-muted">Loading follow-ups…</p>
      ) : isError ? (
        <p className="text-sm text-danger-600">{error.message}</p>
      ) : !followUps.length ? (
        <EmptyState icon={<IconClock size={20} />} title="No follow-ups scheduled" description="Schedule one above to keep this lead moving." />
      ) : (
        <div className="space-y-5">
          {pending.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-fg-subtle uppercase">Pending</p>
              {pending.map((f) => {
                const overdue = new Date(f.dueAt) < new Date();
                return (
                  <div key={f.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <DateText value={f.dueAt} overdue={overdue} className="text-sm font-medium" />
                        {overdue && <Badge tone="danger">Overdue</Badge>}
                      </div>
                      {f.note && <p className="text-sm text-fg-muted mt-0.5 truncate">{f.note}</p>}
                    </div>
                    <Button size="sm" variant="secondary" leftIcon={<IconCheck size={14} />} onClick={() => { setCompleting(f); onOpen(); }}>
                      Complete
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-fg-subtle uppercase">History</p>
              {past.map((f) => (
                <div key={f.id} className="rounded-lg border border-border p-3 opacity-80">
                  <div className="flex items-center gap-2">
                    <DateText value={f.dueAt} />
                    <Badge tone={f.status === 'done' ? 'success' : 'neutral'}>{f.status === 'done' ? 'Completed' : 'Cancelled'}</Badge>
                  </div>
                  {f.outcome && <p className="text-sm text-fg-muted mt-0.5">{f.outcome}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={isOpen}
        onClose={() => { onClose(); setCompleting(null); }}
        title="Complete follow-up"
        description="What was the outcome of this follow-up?"
        confirmLabel="Mark complete"
        loading={updateFollowUp.isPending}
        onConfirm={handleComplete}
        requireReason
        reasonLabel="Outcome"
      />
    </div>
  );
}
